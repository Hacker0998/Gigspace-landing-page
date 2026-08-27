const fs = require('fs');

let serverCode = `import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fsSync from "fs";
import { v2 as cloudinary } from 'cloudinary';
import { Resend } from 'resend';
import twilio from 'twilio';
import admin from 'firebase-admin';

import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin (Only if env vars are present)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n'),
      })
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
} else {
  console.log("Firebase Admin skipped. Missing credentials in .env. Falling back to local storage temporarily if needed (or failing).");
}

const db = admin.apps.length ? admin.firestore() : null;

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory storage for multer (since we upload to cloudinary)
  const upload = multer({ storage: multer.memoryStorage() });

  // Cloudinary upload helper
  const uploadToCloudinary = (fileBuffer, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: 'gigspace' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });
  };

  // --- MOCK LOCAL DB HELPERS (Fallback if Firebase is not setup) ---
  const getLocalDB = (file, defaultData = []) => {
    const filePath = path.join(process.cwd(), file);
    if (!fsSync.existsSync(filePath)) {
      fsSync.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
    return JSON.parse(fsSync.readFileSync(filePath, 'utf-8'));
  };
  const saveLocalDB = (file, data) => fsSync.writeFileSync(path.join(process.cwd(), file), JSON.stringify(data, null, 2));

  // --- API: ASSETS ---
  app.get("/api/assets", async (req, res) => {
    if (db) {
      const snapshot = await db.collection('assets').orderBy('createdAt', 'desc').get();
      const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(assets);
    }
    res.json(getLocalDB('assets.json'));
  });

  app.post("/api/upload", upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    let fileUrl = '';
    let resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, resourceType);
        fileUrl = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ success: false, message: 'Upload failed' });
      }
    } else {
      // Fallback local save for preview environment
      const dir = path.join(process.cwd(), 'uploads');
      if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir);
      const filename = Date.now() + '-' + req.file.originalname;
      fsSync.writeFileSync(path.join(dir, filename), req.file.buffer);
      fileUrl = '/uploads/' + filename;
    }

    const newAsset = {
      type: resourceType,
      url: fileUrl,
      title: req.body.title || 'Untitled Asset',
      description: req.body.description || '',
      createdAt: new Date().toISOString()
    };

    if (db) {
      const docRef = await db.collection('assets').add(newAsset);
      newAsset.id = docRef.id;
    } else {
      const assets = getLocalDB('assets.json');
      newAsset.id = Date.now().toString();
      assets.unshift(newAsset);
      saveLocalDB('assets.json', assets);
    }
    
    res.json({ success: true, asset: newAsset });
  });

  // --- API: PRODUCT REQUESTS (WITH NOTIFICATIONS) ---
  app.post("/api/product-requests", async (req, res) => {
    const { name, email, message, assetId, assetTitle } = req.body;
    
    const newRequest = {
      name, email, message, assetId, assetTitle,
      date: new Date().toISOString(),
      status: 'new'
    };

    if (db) {
      const docRef = await db.collection('productRequests').add(newRequest);
      newRequest.id = docRef.id;
    } else {
      const requests = getLocalDB('product-requests.json');
      newRequest.id = Date.now().toString();
      requests.unshift(newRequest);
      saveLocalDB('product-requests.json', requests);
    }

    // Trigger Notifications
    try {
      if (resend) {
        await resend.emails.send({
          from: 'GigSpace <onboarding@resend.dev>', // Use verified domain in prod
          to: 'info@gigspace.com',
          subject: \`New Product Inquiry: \${assetTitle}\`,
          html: \`<p><strong>Name:</strong> \${name}</p><p><strong>Email:</strong> \${email}</p><p><strong>Message:</strong> \${message}</p>\`
        });
      }
      if (twilioClient) {
        await twilioClient.messages.create({
          body: \`GigSpace: We received your inquiry for "\${assetTitle}". Our team will contact you shortly!\`,
          from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
          to: \`whatsapp:\${process.env.ADMIN_WHATSAPP_NUMBER || '+1234567890'}\` // Replace with user's number in prod
        });
      }
    } catch (notifyErr) {
      console.error("Notification error (safe to ignore in dev):", notifyErr);
    }

    res.json({ success: true, request: newRequest });
  });
  
  app.get("/api/product-requests", async (req, res) => {
    if (db) {
      const snapshot = await db.collection('productRequests').orderBy('date', 'desc').get();
      return res.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    res.json(getLocalDB('product-requests.json'));
  });

  // --- API: WEBHOOKS (FLUTTERWAVE) ---
  app.post("/api/webhooks/flutterwave", async (req, res) => {
    // In production, verify the webhook signature here
    const { data } = req.body;
    console.log("Received Flutterwave webhook:", data);
    
    if (data && data.status === 'successful') {
      const paymentRecord = {
        tx_ref: data.tx_ref,
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customer.email,
        date: new Date().toISOString()
      };
      
      if (db) {
        await db.collection('transactions').add(paymentRecord);
      } else {
        const txs = getLocalDB('transactions.json');
        txs.unshift(paymentRecord);
        saveLocalDB('transactions.json', txs);
      }
    }
    res.status(200).end();
  });

  // Serve uploads if local fallback is used
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on port \${PORT}\`);
  });
}
startServer();
`;

fs.writeFileSync('server.ts', serverCode);
