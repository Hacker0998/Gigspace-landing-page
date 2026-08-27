#!/bin/bash
cat << 'INNER_EOF' > /tmp/kanban.patch
            {/* DESIGNER KANBAN TAB */}
            {activeTab === 'Kanban' && role === 'Designer' && (
              <motion.div key="kanban" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                 <div className="mb-6">
                    <h3 className="text-2xl font-black mb-2">Design Queue & Kanban</h3>
                    <p className="text-sm text-gray-400">Interactive project pipeline. Drag and drop tasks to update statuses.</p>
                 </div>
                 
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
                   {['Backlog', 'In Progress', 'Review', 'Completed'].map((stage) => (
                     <div 
                       key={stage} 
                       className="bg-[#1A1A24]/80 backdrop-blur-md rounded-3xl p-5 border border-white/5 flex flex-col min-w-[280px]"
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => {
                         e.preventDefault();
                         const id = e.dataTransfer.getData("text/plain");
                         if(id) {
                           // Basic visual feedback for drop (a full state-driven kanban would need a tasks state)
                           const el = document.getElementById(id);
                           if(el) {
                             e.currentTarget.querySelector('.task-container')?.appendChild(el);
                           }
                         }
                       }}
                     >
                       <div className="flex items-center justify-between mb-4">
                         <h4 className="font-bold text-sm text-gray-200 uppercase tracking-widest">{stage}</h4>
                         <span className="bg-white/10 text-xs font-mono px-2 py-0.5 rounded-full">{stage === 'Backlog' ? 2 : stage === 'In Progress' ? 1 : 0}</span>
                       </div>
                       
                       <div className="task-container flex-1 space-y-3 min-h-[200px]">
                         {stage === 'Backlog' && (
                           <>
                             <div id="task-1" draggable onDragStart={e => e.dataTransfer.setData("text/plain", "task-1")} className="bg-[#121218] p-4 rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-[#A259FF]/50 transition-colors">
                               <div className="flex gap-2 mb-2">
                                 <span className="text-[10px] uppercase font-bold tracking-wider text-[#A259FF] bg-[#A259FF]/10 px-2 py-0.5 rounded">Branding</span>
                               </div>
                               <h5 className="font-bold text-sm mb-1 text-white">Create Cyberpunk Logo</h5>
                               <p className="text-xs text-gray-500">For neon nights startup...</p>
                             </div>
                             <div id="task-2" draggable onDragStart={e => e.dataTransfer.setData("text/plain", "task-2")} className="bg-[#121218] p-4 rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-[#FF5E00]/50 transition-colors">
                               <div className="flex gap-2 mb-2">
                                 <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF5E00] bg-[#FF5E00]/10 px-2 py-0.5 rounded">Video</span>
                               </div>
                               <h5 className="font-bold text-sm mb-1 text-white">Edit Urban Flow Reel</h5>
                               <p className="text-xs text-gray-500">Color grading and sound design.</p>
                             </div>
                           </>
                         )}
                         {stage === 'In Progress' && (
                           <div id="task-3" draggable onDragStart={e => e.dataTransfer.setData("text/plain", "task-3")} className="bg-[#121218] p-4 rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-[#219EBC]/50 transition-colors">
                             <div className="flex gap-2 mb-2">
                               <span className="text-[10px] uppercase font-bold tracking-wider text-[#219EBC] bg-[#219EBC]/10 px-2 py-0.5 rounded">3D</span>
                             </div>
                             <h5 className="font-bold text-sm mb-1 text-white">Spatial Product Model</h5>
                             <p className="text-xs text-gray-500">Rendering high-res glass materials.</p>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
              </motion.div>
            )}
INNER_EOF

awk '
BEGIN { in_kanban = 0; replaced = 0 }
/<\/AnimatePresence>/ {
  if (!replaced) {
    system("cat /tmp/kanban.patch")
    replaced = 1
  }
}
{ print }
' src/components/AdminDashboard.tsx > src/components/AdminDashboard.tsx.tmp
mv src/components/AdminDashboard.tsx.tmp src/components/AdminDashboard.tsx
