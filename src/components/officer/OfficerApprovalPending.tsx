'use client'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Clock, CheckCircle, Mail, RefreshCw, Shield } from 'lucide-react'

interface OfficerApprovalPendingProps {
  name: string
  email: string
  onApproved: () => void
}

export default function OfficerApprovalPending({
  name,
  email,
  onApproved,
}: OfficerApprovalPendingProps) {
  const [elapsed, setElapsed] = useState(0)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60)
    const s = elapsed % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  const handleCheckStatus = async () => {
    setChecking(true)
    await new Promise((r) => setTimeout(r, 1000))
    setChecking(false)
    // Simulate approval for demo
    onApproved()
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        {/* Animated waiting indicator */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-500/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-amber-500/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
          />
          <div className="absolute inset-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock size={28} className="text-amber-400" />
          </div>
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <h2 className="font-['Rajdhani'] font-bold text-white text-2xl tracking-wide mb-2">
          AWAITING APPROVAL
        </h2>
        <p className="text-amber-400 text-sm font-['Rajdhani'] font-semibold mb-1">
          Pending Admin Review
        </p>
        <p className="text-slate-500 text-xs leading-relaxed mb-6">
          Your registration has been submitted. The admin will review and
          approve your access shortly.
        </p>

        {/* Info Card */}
        <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4 text-left mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-['Rajdhani'] uppercase tracking-wider">
              Submitted As
            </span>
            <span className="text-white text-xs font-['Rajdhani'] font-semibold">
              {name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-['Rajdhani'] uppercase tracking-wider">
              Email
            </span>
            <span className="text-slate-300 text-xs font-['JetBrains_Mono']">
              {email || 'officer@company.com'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-['Rajdhani'] uppercase tracking-wider">
              Status
            </span>
            <span className="text-amber-400 text-[11px] font-['JetBrains_Mono'] font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              PENDING
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-['Rajdhani'] uppercase tracking-wider">
              Waiting
            </span>
            <span className="text-blue-400 text-[11px] font-['JetBrains_Mono']">
              {formatElapsed()}
            </span>
          </div>
        </div>

        {/* Email Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl mb-5 text-left">
          <Mail size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-400/80 text-[11px] leading-relaxed font-['Rajdhani']">
            You will receive an email notification once your account is approved
            or rejected.
          </p>
        </div>

        {/* Check Status Button */}
        <motion.button
          onClick={handleCheckStatus}
          disabled={checking}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 bg-[#0d1425] border border-[#1e2d4a] hover:border-teal-500/30 text-slate-300 hover:text-white font-['Rajdhani'] font-bold text-sm tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 mb-3"
        >
          <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
          {checking ? 'CHECKING...' : 'CHECK APPROVAL STATUS'}
        </motion.button>

        {/* DEMO SHORTCUT — removes in prod */}
        <motion.button
          onClick={onApproved}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-['Rajdhani'] font-bold text-xs tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={13} /> DEMO: SIMULATE APPROVAL
        </motion.button>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <Shield size={10} className="text-slate-700" />
          <p className="text-slate-700 text-[10px] font-['Rajdhani'] tracking-wide">
            SECURE ACCESS CONTROL SYSTEM
          </p>
        </div>
      </motion.div>
    </div>
  )
}
