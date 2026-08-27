import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, ArrowRight, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';
import { AuthService, isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginProps {
  onClose: () => void;
  onSuccess: (role: string) => void;
}

const ROLES = [
  'CEO',
  'Designer',
  'Financial Manager',
  'Marketing Director',
  'Web Manager',
  'Video Producer',
  'Support Manager'
];

export function AdminLogin({ onClose, onSuccess }: AdminLoginProps) {
  const [selectedRole, setSelectedRole] = useState('CEO');
  const [password, setPassword] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredRoles = ROLES.filter(r => 
    r.toLowerCase().includes(selectedRole.toLowerCase())
  );

  const isRoleValid = ROLES.includes(selectedRole);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!isRoleValid) {
      setError('Please select a valid crew role.');
      return;
    }

    setLoading(true);
    setError('');

    const finalRole = selectedRole;

    const lockedRoles = JSON.parse(localStorage.getItem('gigspace_locked_roles') || '[]');
    if (lockedRoles.includes(finalRole) || localStorage.getItem('gigspace_global_lock') === 'true') {
      setError('Access restricted by Studio Security.');
      setLoading(false);
      return;
    }

    try {
      const res = await AuthService.login(finalRole, password);
      if (res.success && res.role) {
        onSuccess(res.role);
      } else {
        setError(res.error || 'Invalid credentials. Please check your password.');
      }
    } catch (err: any) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none"
    >
      <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-r from-[#FF5E00]/20 via-[#F72585]/15 to-[#38BDF8]/20 blur-md pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="relative w-full max-w-[390px] bg-[#14151B]/95 border border-white/15 rounded-[24px] shadow-2xl overflow-visible p-5 sm:p-6 backdrop-blur-xl"
      >
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-t-[24px]" />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-[#FF5E00]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">GigSpace Crew Auth</h3>
              <p className="text-[10px] text-gray-400">
                {isSupabaseConfigured ? 'Connected to Supabase' : 'Active Studio Mode'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5 relative z-10">
          <div className="relative">
            <label className="block text-[11px] text-gray-400 font-normal mb-1">Select Role</label>
            <div className="relative">
              <input 
                ref={inputRef}
                type="text" 
                value={selectedRole}
                onChange={e => {
                  setSelectedRole(e.target.value);
                  setShowSuggestions(true);
                  setError('');
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type or select role..."
                className="w-full bg-[#101115] border border-white/[0.08] focus:border-white/30 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <AnimatePresence>
              {showSuggestions && filteredRoles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-30 w-full mt-1 bg-[#1A1B22] border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto"
                >
                  {filteredRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b last:border-b-0 border-white/5 flex items-center justify-between"
                    >
                      <span>{role}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {role === 'CEO' ? 'Full Access' : role === 'Designer' ? 'Creative Suite' : 'Manager'}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isRoleValid && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] text-gray-400 font-normal mb-1">Access Password</label>
                  <span className="text-[10px] text-gray-500">Default: {selectedRole === 'CEO' ? 'colline' : 'design123'}</span>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full bg-[#101115] border border-white/[0.08] focus:border-white/30 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#202128] hover:bg-[#282932] text-xs font-medium text-white/80 hover:text-white transition-colors"
            >
              Cancel
            </button>

            {isRoleValid && (
              <button 
                type="submit" 
                disabled={loading || !password}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#219EBC] hover:opacity-90 active:scale-95 text-xs font-bold text-white transition-all disabled:opacity-50 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
