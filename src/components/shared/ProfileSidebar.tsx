'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  User,
  LogOut,
  Lock,
  Camera,
  Shield,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  X,
} from 'lucide-react'

interface ProfileSidebarProps {
  name: string
  email: string
  role: 'main_admin' | 'local_admin' | 'officer'
  facePhoto?: string
  status?: 'pending' | 'approved' | 'rejected'
  checkInStatus?: 'in' | 'out'
  companyName?: string
  onSignOut: () => void
  onCheckInOut?: (action: 'in' | 'out') => void
  onUpdatePhoto?: (photo: string) => void
}

const ROLE_LABEL: Record<string, string> = {
  main_admin: 'MAIN ADMIN',
  local_admin: 'LOCAL ADMIN',
  officer: 'FIELD OFFICER',
}

export default function ProfileSidebar({
  name,
  email,
  role,
  facePhoto,
  status,
  checkInStatus,
  companyName,
  onSignOut,
  onCheckInOut,
  onUpdatePhoto,
}: ProfileSidebarProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'profile' | 'security'>('profile')

  const avatarChar = name.charAt(0).toUpperCase()

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-xl bg-[#0d1425] border border-[#1e2d4a] hover:border-teal-500/40 flex items-center justify-center overflow-hidden shadow-xl transition-colors group"
        title="My Profile"
      >
        {facePhoto ? (
          <img src={facePhoto} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="text-teal-400 font-['Rajdhani'] font-bold text-sm">
            {avatarChar}
          </span>
        )}
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-80 bg-[#080e1c] border-l border-[#1e2d4a] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d4a]">
              <span className="text-white font-['Rajdhani'] font-bold tracking-wide">
                MY PROFILE
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Avatar & info */}
            <div className="px-5 py-5 border-b border-[#1e2d4a] flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl border-2 border-teal-500/30 overflow-hidden bg-[#0d1425] flex items-center justify-center">
                  {facePhoto ? (
                    <img
                      src={facePhoto}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span className="text-teal-400 font-['Rajdhani'] font-bold text-2xl">
                      {avatarChar}
                    </span>
                  )}
                </div>
                {onUpdatePhoto && (
                  <label
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer shadow-md"
                    title="Change photo"
                  >
                    <Camera size={10} className="text-[#0a0f1e]" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () =>
                          onUpdatePhoto(reader.result as string)
                        reader.readAsDataURL(file)
                      }}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-['Rajdhani'] font-bold truncate">
                  {name}
                </p>
                <p className="text-slate-500 text-[11px] font-['JetBrains_Mono'] truncate">
                  {email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Shield size={10} className="text-teal-400" />
                  <span className="text-teal-400 text-[10px] font-['Rajdhani'] font-semibold tracking-wider">
                    {ROLE_LABEL[role]}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#1e2d4a]">
              {(['profile', 'security'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-xs font-['Rajdhani'] font-semibold tracking-wide uppercase transition-colors border-b-2 ${
                    tab === t
                      ? 'border-teal-400 text-teal-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t === 'profile' ? (
                    <User size={11} className="inline mr-1" />
                  ) : (
                    <Lock size={11} className="inline mr-1" />
                  )}
                  {t}
                </button>
              ))}
            </div>

            {/* Sign Out */}
            <div className="p-4 border-t border-[#1e2d4a]">
              <button
                onClick={onSignOut}
                className="w-full py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-2xl text-xs font-['Rajdhani'] font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={13} /> SIGN OUT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}