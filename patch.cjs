const fs = require('fs');
let code = fs.readFileSync('src/components/GalleryView.tsx', 'utf8');

// We need to add state for the request modal
code = code.replace(
  "const [analyzingId, setAnalyzingId] = useState<string | null>(null);",
  "const [analyzingId, setAnalyzingId] = useState<string | null>(null);\n  const [requestAssetId, setRequestAssetId] = useState<string | null>(null);\n  const [requestForm, setRequestForm] = useState({ name: '', email: '', message: '' });\n  const [isSubmitting, setIsSubmitting] = useState(false);\n  const [submitSuccess, setSubmitSuccess] = useState(false);\n\n  const handleRequestSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setIsSubmitting(true);\n    try {\n      const asset = displayAssets.find(a => a.id === requestAssetId);\n      await fetch('/api/product-requests', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ ...requestForm, assetId: requestAssetId, assetTitle: asset?.title || 'Unknown' })\n      });\n      setSubmitSuccess(true);\n      setTimeout(() => {\n        setRequestAssetId(null);\n        setSubmitSuccess(false);\n        setRequestForm({ name: '', email: '', message: '' });\n      }, 2000);\n    } catch (err) {\n      console.error(err);\n    } finally {\n      setIsSubmitting(false);\n    }\n  };"
);

// Add the button to the hover overlay
code = code.replace(
  "</p>\n                  </motion.div>\n                )}\n              </AnimatePresence>",
  "</p>\n                    <button \n                      onClick={(e) => { e.stopPropagation(); setRequestAssetId(asset.id); }}\n                      className=\"mt-6 px-6 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#FF5E00] hover:text-white transition-colors\"\n                    >\n                      Inquire About Asset\n                    </button>\n                  </motion.div>\n                )}\n              </AnimatePresence>"
);

// Add the modal at the bottom of the main component
const modalHTML = `
      {/* Request Modal */}
      <AnimatePresence>
        {requestAssetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => !isSubmitting && !submitSuccess && setRequestAssetId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-[#1A1A24] rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-white/10"
            >
              {submitSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#FF5E00]/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-[#FF5E00]" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Request Sent!</h3>
                  <p className="text-gray-500">Our team will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-black">Inquire</h3>
                    <button type="button" onClick={() => setRequestAssetId(null)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold">&times;</button>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name</label>
                    <input required type="text" value={requestForm.name} onChange={e => setRequestForm({...requestForm, name: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 ring-[#FF5E00]/50" placeholder="Your Name" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                    <input required type="email" value={requestForm.email} onChange={e => setRequestForm({...requestForm, email: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 ring-[#FF5E00]/50" placeholder="hello@example.com" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                    <textarea required value={requestForm.message} onChange={e => setRequestForm({...requestForm, message: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 ring-[#FF5E00]/50 h-32 resize-none" placeholder="I'm interested in this piece..."></textarea>
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="mt-4 w-full py-4 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white font-bold tracking-wide shadow-xl hover:opacity-90 disabled:opacity-50 transition-all">
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace(
  "</main>",
  `</main>\n\n${modalHTML}`
);

fs.writeFileSync('src/components/GalleryView.tsx', code);
