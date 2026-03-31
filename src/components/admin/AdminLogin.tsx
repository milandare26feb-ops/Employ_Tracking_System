'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { MapPin, Eye, EyeOff, Shield } from 'lucide-react'

const ADMIN_EMAIL = 'kawsarhossain31des@gmail.com'
const ADMIN_PASS = '1125678'

interface AdminLoginProps {
  onSuccess: () => void
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      sessionStorage.setItem('adminAuth', 'true')
      sessionStorage.setItem('adminEmail', email)
      onSuccess()
    } else {
      setError('Invalid admin credentials. Access denied.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/4 rounded-full blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(#1e2d4a 1px, transparent 1px), linear-gradient(90deg, #1e2d4a 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-blue-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-5 relative"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(0,212,170,0)',
                '0 0 50px 0 rgba(0,212,170,0.15)',
                '0 0 0 0 rgba(0,212,170,0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <MapPin size={32} className="text-teal-400" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <Shield size={9} className="text-white" />
            </div>
          </motion.div>
          <h1 className="font-['Rajdhani'] font-bold text-3xl text-white tracking-widest mb-1">
            FIELDTRACK
          </h1>
          <p className="text-slate-500 text-xs tracking-widest font-['Rajdhani']">
            ADMIN CONTROL CENTER
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-400/70 text-[11px] font-['JetBrains_Mono']">
              SUPER ADMIN ACCESS ONLY
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-500 font-['Rajdhani'] uppercase tracking-wider block mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fieldtrack.com"
                autoComplete="email"
                className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-3 text-white font-['Rajdhani'] text-sm focus:border-teal-500/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-['Rajdhani'] uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 pr-12 py-3 text-white font-['Rajdhani'] text-sm focus:border-teal-500/50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
              >
                <p className="text-red-300 text-sm font-['Rajdhani']">
                  {error}
                </p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 mt-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(0,212,170,0.3)]"
            >
              {loading ? 'VERIFYING...' : 'ADMIN LOGIN'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-slate-700 text-[10px] font-['JetBrains_Mono'] mt-6">
          Unauthorized access is strictly prohibited
        </p>
      </motion.div>
    </div>
  )
}
