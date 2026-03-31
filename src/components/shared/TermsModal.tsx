'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Shield, CheckCircle, X } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  userName: string
  onAccept: () => void
  onDecline: () => void
}

export default function TermsModal({
  isOpen,
  userName,
  onAccept,
  onDecline,
}: TermsModalProps) {
  const [ticked, setTicked] = useState(false)
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-md mx-4 bg-[#0d1425] border border-[#1e2d4a] rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#1e2d4a] flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <Shield size={18} className="text-teal-400" />
        </div>
        <div>
          <h2 className="text-white font-['Rajdhani'] font-bold tracking-wide">
            Terms & Conditions
          </h2>
          <p className="text-slate-500 text-xs font-['Rajdhani']">
            Hello {userName} — please read before continuing
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 max-h-72 overflow-y-auto">
        <div className="space-y-3 text-slate-400 text-[12px] font-['Rajdhani'] leading-relaxed">
          <p className="font-bold text-slate-300 text-sm">
            FieldTrack Officer Terms of Service
          </p>
          <p>
            By using this application, you agree to the following terms and
            conditions. Please read them carefully.
          </p>
          <p className="font-semibold text-slate-300">1. Location Tracking</p>
          <p>
            You consent to continuous real-time GPS location tracking while you
            are logged in as an active officer. Your location data is shared
            with your designated admin and management team.
          </p>
          <p className="font-semibold text-slate-300">
            2. Face Capture & Identity
          </p>
          <p>
            You consent to having your face photo captured and stored upon first
            login. This image is used for identity verification on admin
            dashboards and map markers.
          </p>
          <p className="font-semibold text-slate-300">3. Device Permissions</p>
          <p>
            You agree to grant camera, microphone, and location access to this
            application. Denying any required permission will block system
            access.
          </p>
          <p className="font-semibold text-slate-300">4. Data Usage</p>
          <p>
            Your location history, activity logs, and metadata are stored for up
            to 24 hours for operational monitoring and reporting purposes.
          </p>
          <p className="font-semibold text-slate-300">5. Background Tracking</p>
          <p>
            You acknowledge that location tracking may continue in the
            background even when the app is minimized, subject to device
            permissions.
          </p>
          <p className="font-semibold text-slate-300">6. Account Access</p>
          <p>
            Your account access is subject to admin approval. The admin reserves
            the right to revoke access at any time.
          </p>
          <p className="font-semibold text-slate-300">7. Code of Conduct</p>
          <p>
            You agree to use this application responsibly and in accordance with
            your organization's policies. Any misuse may result in immediate
            account suspension.
          </p>
        </div>
      </div>

      {/* Checkbox */}
      <div className="px-6 py-4 border-t border-[#1e2d4a]">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setTicked(!ticked)}
            className={`w-5 h-5 mt-0.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
              ticked
                ? 'bg-teal-500 border-teal-500'
                : 'border-[#2a3d5a] group-hover:border-teal-500/50'
            }`}
          >
            {ticked && <CheckCircle size={12} className="text-[#0a0f1e]" />}
          </div>
          <span className="text-slate-400 text-xs font-['Rajdhani'] leading-relaxed">
            I have read, understood, and agree to the Terms & Conditions and
            Privacy Policy of FieldTrack.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onDecline}
          className="flex-1 py-3 bg-[#1e2d4a] border border-[#2a3d5a] hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-2xl text-xs font-['Rajdhani'] font-bold tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <X size={12} /> DECLINE
        </button>
        <motion.button
          onClick={onAccept}
          disabled={!ticked}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-3 bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-teal-400 text-[#0a0f1e] rounded-2xl text-xs font-['Rajdhani'] font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.3)]"
        >
          <CheckCircle size={12} /> ACCEPT & CONTINUE
        </motion.button>
      </div>
    </motion.div>
  )
}