const fs = require('fs');

const serverCode = `import express from "express";
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

// --- 1. INITIALIZE CLOUD SERVICES ---
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\\\n/g, '\\n'),
        })
      });
      console.log("🔥 Firebase Admin initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}
const db = admin.apps.length ? admin.firestore() : null;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;


// --- 2. LOCAL FALLBACK HELPERS ---
const getLocalDB = (file, defaultData = []) => {
  const filePath = path.join(process.cwd(), file);
  if (!fsSync.existsSync(filePath)) {
    fsSync.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
  return JSON.parse(fsSync.readFileSync(filePath, 'utf-8'));
};
const saveLocalDB = (file, data) => fsSync.writeFileSync(path.join(process.cwd(), file), JSON.stringify(data, null, 2));


// --- 3. CLOUDINARY UPLOAD HELPER ---
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


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Use memory storage for Multer so we can upload straight to Cloudinary
  const upload = multer({ storage: multer.memoryStorage() });

  // --- API: AUTH ---
  app.post("/api/auth/fast-login", (req, res) => {
    const { password } = req.body;
    const validPasswords = getLocalDB('passwords.json', { 'Designer': process.env.DESIGN_PASS || 'design123', 'CEO': process.env.CEO_PASS || 'colline' });
    for (const role of ["CEO", "Designer"]) {
      if (validPasswords[role] && validPasswords[role] === password) {
        return res.json({ success: true, role });
      }
    }
    res.status(401).json({ success: false, message: "Invalid credentials" });
  });

  app.post("/api/auth/login", (req, res) => {
    const { role, password } = req.body;
    const validPasswords = getLocalDB('passwords.json', { 'Designer': process.env.DESIGN_PASS || 'design123', 'CEO': process.env.CEO_PASS || 'colline' });
    if (validPasswords[role] && validPasswords[role] === password) {
      res.json({ success: true, role });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });


  // --- API: SETTINGS ---
  app.get("/api/settings", async (req, res) => {
    if (db) {
      const doc = await db.collection('config').doc('settings').get();
      if (doc.exists) return res.json(doc.data());
    }
    res.json(getLocalDB('settings.json', { heroTitle: "Ideas that look alive." }));
  });


  // --- API: ASSETS (Cloudinary + Firestore) ---
  app.get("/api/assets", async (req, res) => {
    if (db) {
      const snapshot = await db.collection('assets').orderBy('createdAt', 'desc').get();
      return res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
      }
    } else {
      // Fallback
      const dir = path.join(process.cwd(), 'uploads');
      if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir);
      const filename = Date.now() + '-' + req.file.originalname;
      fsSync.writeFileSync(path.join(dir, filename), req.file.buffer);
      fileUrl = '/uploads/' + filename;
    }

    const newAsset = {
      type: resourceType,
      url: fileUrl,
      title: req.body.title || 'GigSpace Asset',
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

  app.delete("/api/assets/:id", async (req, res) => {
    if (db) {
      await db.collection('assets').doc(req.params.id).delete();
    } else {
      const assets = getLocalDB('assets.json');
      saveLocalDB('assets.json', assets.filter(a => a.id !== req.params.id));
    }
    res.json({ success: true });
  });


  // --- API: PRODUCT REQUESTS (Twilio/Resend) ---
  app.post("/api/product-requests", async (req, res) => {
    const { name, email, message, assetId, assetTitle } = req.body;
    
    const newRequest = {
      name, email, message, assetId, assetTitle,
      date: new Date().toISOString(),
      status: 'pending'
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

    // Trigger Notifications (Fire & Forget)
    if (resend) {
      resend.emails.send({
        from: 'GigSpace <onboarding@resend.dev>',
        to: 'info@gigspace.com',
        subject: \`New Lead: \${name} wants \${assetTitle}\`,
        html: \`<p><strong>Name:</strong> \${name}</p><p><strong>Email:</strong> \${email}</p><p><strong>Message:</strong> \${message}</p>\`
      }).catch(console.error);
    }
    if (twilioClient) {
      twilioClient.messages.create({
        body: \`GigSpace: We received your inquiry for "\${assetTitle}". Our team will contact you shortly!\`,
        from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
        to: \`whatsapp:\${process.env.ADMIN_WHATSAPP_NUMBER || '+1234567890'}\`
      }).catch(console.error);
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


  // --- API: FLUTTERWAVE WEBHOOKS ---
  app.post("/api/webhooks/flutterwave", async (req, res) => {
    const { data } = req.body;
    
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
