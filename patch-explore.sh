#!/bin/bash
cat << 'INNER_EOF' > /tmp/explore.patch
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <button 
              onClick={() => { setCurrentView('gallery'); window.scrollTo(0, 0); }}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest overflow-hidden transition-transform hover:scale-105 shadow-xl shadow-black/20 dark:shadow-white/10"
            >
              <span className="relative z-10 flex items-center gap-2">Enter The Gallery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 z-10 font-bold uppercase tracking-widest transition-opacity duration-300 pointer-events-none flex gap-2">Enter The Gallery <ArrowRight className="w-5 h-5" /></span>
            </button>
          </motion.div>
        </div>
      </section>
INNER_EOF

awk '
BEGIN { in_services = 0; replaced = 0 }
/^\s*<\/div>/ {
  if (in_services && !replaced) {
    # Check if next line is </section>
    getline next_line
    if (match(next_line, /^\s*<\/section>/)) {
      system("cat /tmp/explore.patch")
      replaced = 1
      next
    } else {
      print
      print next_line
      next
    }
  }
}
/id="services"/ { in_services = 1 }
{ print }
' src/App.tsx > src/App.tsx.tmp
mv src/App.tsx.tmp src/App.tsx
