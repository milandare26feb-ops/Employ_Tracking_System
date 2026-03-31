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
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [passSaved, setPassSaved] = useState(false)
  const [tab, setTab] = useState<'profile' | 'security'>('profile')

  const handlePassChange = () => {
    if (newPass.length < 6 || newPass !== confPass) return
    setPassSaved(true)
    setNewPass('')
    setConfPass('')
    setTimeout(() => setPassSaved(false), 2500)
  }

  const avatarChar = name.charAt(0).toUpperCase()

  return (
    <>
      {/* Trigger button — fixed bottom-right */}
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
                {companyName && (
                  <p className="text-slate-600 text-[10px] mt-0.5">
                    {companyName}
                  </p>
                )}
              </div>
            </div>

            {/* Status badge (officer only) */}
            {status && (
              <div className="px-5 py-3 border-b border-[#1e2d4a]">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-['Rajdhani'] font-bold tracking-wide ${
                    status === 'approved'
                      ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                      : status === 'pending'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  {status === 'approved' ? (
                    <CheckCircle size={11} />
                  ) : (
                    <Clock size={11} />
                  )}
                  {status === 'approved'
                    ? 'APPROVED'
                    : status === 'pending'
                      ? 'PENDING APPROVAL'
                      : 'REJECTED'}
                </div>
              </div>
            )}

            {/* Check In / Out */}
            {onCheckInOut && (
              <div className="px-5 py-3 border-b border-[#1e2d4a] flex items-center justify-between">
                <span className="text-slate-400 text-sm font-['Rajdhani'] font-semibold">
                  Work Status
                </span>
                <div className="flex rounded-xl overflow-hidden border border-[#1e2d4a]">
                  <button
                    onClick={() => onCheckInOut('in')}
                    className={`px-3 py-1.5 text-xs font-['Rajdhani'] font-bold transition-colors ${
                      checkInStatus === 'in'
                        ? 'bg-teal-500 text-[#0a0f1e]'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    CHECK IN
                  </button>
                  <button
                    onClick={() => onCheckInOut('out')}
                    className={`px-3 py-1.5 text-xs font-['Rajdhani'] font-bold transition-colors ${
                      checkInStatus === 'out'
                        ? 'bg-red-500/80 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    CHECK OUT
                  </button>
                </div>
              </div>
            )}

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

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === 'profile' && (
                <div className="space-y-3">
                  <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl px-4 py-3">
                    <label className="text-slate-500 text-[10px] uppercase tracking-widest font-['Rajdhani'] block mb-1.5">
                      Full Name
                    </label>
                    <input
                      defaultValue={name}
                      className="w-full bg-transparent text-white text-sm font-['Rajdhani'] focus:outline-none"
                    />
                  </div>
                  <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl px-4 py-3">
                    <label className="text-slate-500 text-[10px] uppercase tracking-widest font-['Rajdhani'] block mb-1.5">
                      Email
                    </label>
                    <input
                      defaultValue={email}
                      type="email"
                      className="w-full bg-transparent text-slate-400 text-sm font-['Rajdhani'] focus:outline-none"
                    />
                  </div>
                  <button className="w-full py-3 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-400 rounded-2xl text-xs font-['Rajdhani'] font-bold tracking-widest transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={13} /> SAVE CHANGES
                  </button>
                </div>
              )}

              {tab === 'security' && (
                <div className="space-y-3">
                  <p className="text-slate-500 text-[11px] font-['Rajdhani'] uppercase tracking-wider">
                    Change Password
                  </p>

                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="New password"
                      className="w-full bg-[#0d1425] border border-[#1e2d4a] rounded-xl px-4 pr-10 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none focus:border-teal-500/50"
                    />
                    <button
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfPass ? 'text' : 'password'}
                      value={confPass}
                      onChange={(e) => setConfPass(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-[#0d1425] border border-[#1e2d4a] rounded-xl px-4 pr-10 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none focus:border-teal-500/50"
                    />
                    <button
                      onClick={() => setShowConfPass(!showConfPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>

                  {confPass && newPass !== confPass && (
                    <p className="text-red-400 text-xs font-['Rajdhani']">
                      Passwords do not match
                    </p>
                  )}

                  <button
                    onClick={handlePassChange}
                    disabled={newPass.length < 6 || newPass !== confPass}
                    className="w-full py-3 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 disabled:opacity-40 text-teal-400 rounded-2xl text-xs font-['Rajdhani'] font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    {passSaved ? (
                      <>
                        <CheckCircle size={13} /> SAVED!
                      </>
                    ) : (
                      <>
                        <Lock size={13} /> UPDATE PASSWORD
                      </>
                    )}
                  </button>
                </div>
              )}
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
