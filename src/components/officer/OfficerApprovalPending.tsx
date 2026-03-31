'use client'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Clock, CheckCircle, Loader2 } from 'lucide-react'

interface OfficerApprovalPendingProps {
  name: string
  email: string
  onApproved?: () => void
}

export default function OfficerApprovalPending({
  name,
  email,
  onApproved,
}: OfficerApprovalPendingProps) {
  const [isChecking, setIsChecking] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={32} className="text-amber-400" />
        </div>
        <h2 className="text-white font-['Rajdhani'] font-bold text-2xl tracking-wide mb-3">
          Awaiting Approval
        </h2>
        <p className="text-slate-400 text-sm font-['Rajdhani'] leading-relaxed">
          Hi <span className="text-white font-semibold">{name}</span>, your account
          is under review by the admin. This typically takes 24 hours.
        </p>
      </motion.div>
    </div>
  )
}