'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import PermissionGate from './PermissionGate'
import FaceCapture from './FaceCapture'
import OfficerHome from './OfficerHome'
import OfficerSettings from './OfficerSettings'
import OfficerRegistration from './OfficerRegistration'
import OfficerApprovalPending from './OfficerApprovalPending'
import ProfileSidebar from '../shared/ProfileSidebar'
import MessengerPanel, { type Message } from '../shared/MessengerPanel'
import {
  MessageSquare,
  Home,
  Settings,
  MapPin,
  Shield,
  UserPlus,
  LogIn,
} from 'lucide-react'

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fieldtrack_officer_session'
const ACCOUNTS_KEY = 'fieldtrack_accounts'

export interface SavedAccount {
  name: string
  email: string
  phone: string
  password: string
  facePhoto?: string
  cvFileName?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  checkInStatus: 'in' | 'out'
  permissionsGranted: boolean
  termsAccepted: boolean
  firstLoginDone: boolean
  registeredAt: string
}

interface SavedSession {
  email: string
  rememberMe: boolean
}

function loadAccounts(): Record<string, SavedAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, SavedAccount>) : {}
  } catch {
    return {}
  }
}

function saveAccounts(accounts: Record<string, SavedAccount>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {}
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as SavedSession
    if (!s.rememberMe) return null
    return s
  } catch {
    return null
  }
}

function saveSession(session: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {}
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Types ─────────────────────────────────────────────────────────────────────

type AppFlow =
  | 'loading'
  | 'landing'
  | 'register'
  | 'sign-in'
  | 'pending'
  | 'rejected'
  | 'permissions'
  | 'face-capture'
  | 'home'
  | 'settings'
  | 'messages'

const DEMO_MESSAGES: Message[] = [
  {
    id: 'dm1',
    senderId: 'admin',
    senderName: 'Main Admin',
    type: 'text',
    content: 'Welcome! Please check in when you reach your assigned zone.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    isMine: false,
  },
  {
    id: 'dm2',
    senderId: 'admin',
    senderName: 'Local Admin',
    type: 'text',
    content:
      "Today's target: Gulshan - Banani sector. Report all client visits.",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    isMine: false,
  },
]

// ── Main Component ────────────────────────────────────────────────────────────

export default function OfficerApp() {
  const [flow, setFlow] = useState<AppFlow>('loading')
  const [currentEmail, setCurrentEmail] = useState('')
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [unreadMessages, setUnreadMessages] = useState(2)

  const getAccount = (email: string): SavedAccount | null => {
    const accounts = loadAccounts()
    return accounts[email] ?? null
  }

  const updateAccount = (email: string, updates: Partial<SavedAccount>) => {
    const accounts = loadAccounts()
    if (accounts[email]) {
      accounts[email] = { ...accounts[email], ...updates }
      saveAccounts(accounts)
    }
  }

  const officer = currentEmail ? getAccount(currentEmail) : null

  // On mount: restore session
  useEffect(() => {
    const saved = loadSession()
    if (saved) {
      const account = loadAccounts()[saved.email]
      if (!account) {
        setFlow('landing')
        return
      }
      setCurrentEmail(saved.email)
      routeAccountToFlow(account, setFlow)
    } else {
      setFlow('landing')
    }
  }, [])

  const isLoggedIn =
    flow === 'home' || flow === 'settings' || flow === 'messages'

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRegisterSubmit = (
    name: string,
    email: string,
    phone: string,
    password: string,
    cvFileName?: string,
  ) => {
    const accounts = loadAccounts()
    accounts[email] = {
      name,
      email,
      phone,
      password,
      cvFileName,
      approvalStatus: 'pending',
      checkInStatus: 'out',
      permissionsGranted: false,
      termsAccepted: true,
      firstLoginDone: false,
      registeredAt: new Date().toISOString(),
    }
    saveAccounts(accounts)
    setCurrentEmail(email)
    setFlow('pending')
  }

  const handleSignIn = (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => {
    const accounts = loadAccounts()
    const account = accounts[email]

    if (!account) {
      return { error: 'No account found. Please create an account first.' }
    }
    if (account.password !== password) {
      return { error: 'Incorrect password.' }
    }
    if (account.approvalStatus === 'pending') {
      setCurrentEmail(email)
      setFlow('pending')
      return { error: null }
    }
    if (account.approvalStatus === 'rejected') {
      setCurrentEmail(email)
      setFlow('rejected')
      return { error: null }
    }
    // approved
    setCurrentEmail(email)
    if (rememberMe) saveSession({ email, rememberMe })
    routeAccountToFlow(account, setFlow)
    return { error: null }
  }

  const handlePermissionsGranted = () => {
    if (!currentEmail) return
    updateAccount(currentEmail, { permissionsGranted: true })
    setFlow('face-capture')
  }

  const handleFaceCapture = (photo: string) => {
    if (!currentEmail) return
    updateAccount(currentEmail, { facePhoto: photo, firstLoginDone: true })
    setTimeout(() => setFlow('home'), 1200)
  }

  const handleSignOut = () => {
    clearSession()
    setCurrentEmail('')
    setFlow('landing')
  }

  const handleCheckInOut = (action: 'in' | 'out') => {
    if (!currentEmail) return
    updateAccount(currentEmail, { checkInStatus: action })
    setCurrentEmail((prev) => prev) // trigger re-render
    // Force re-render by toggling a dummy state
    setMessages((m) => [...m])
  }

  const handleSendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        senderId: 'me',
        senderName: officer?.name ?? 'Officer',
        type: 'text',
        content: text,
        timestamp: new Date().toISOString(),
        isMine: true,
      },
    ])
    setUnreadMessages(0)
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (flow === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-400 rounded-full"
          />
          <p className="text-slate-500 text-sm font-['Rajdhani'] tracking-wider">
            LOADING SESSION...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen overflow-hidden bg-[#0a0f1e] relative"
      style={{
        paddingTop: 'var(--safe-top)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <AnimatePresence mode="wait">
        {/* LANDING */}
        {flow === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OfficerLanding
              onLogin={() => setFlow('sign-in')}
              onRegister={() => setFlow('register')}
            />
          </motion.div>
        )}

        {/* REGISTER */}
        {flow === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <OfficerRegistration
              onSubmit={handleRegisterSubmit}
              onBack={() => setFlow('landing')}
            />
          </motion.div>
        )}

        {/* SIGN IN */}
        {flow === 'sign-in' && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <OfficerSignIn
              onSuccess={handleSignIn}
              onBack={() => setFlow('landing')}
            />
          </motion.div>
        )}

        {/* PENDING */}
        {flow === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <OfficerApprovalPending
              name={officer?.name ?? ''}
              email={currentEmail}
              onApproved={() => {
                // Dev-only: simulate approval. In production this would come from backend.
                if (currentEmail) {
                  updateAccount(currentEmail, { approvalStatus: 'approved' })
                  const updated = getAccount(currentEmail)
                  if (updated) routeAccountToFlow(updated, setFlow)
                }
              }}
            />
          </motion.div>
        )}

        {/* REJECTED */}
        {flow === 'rejected' && (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <RejectedScreen
              name={officer?.name ?? ''}
              onBack={() => {
                setCurrentEmail('')
                setFlow('landing')
              }}
            />
          </motion.div>
        )}

        {/* PERMISSIONS */}
        {flow === 'permissions' && (
          <motion.div
            key="permissions"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <PermissionGate onAllGranted={handlePermissionsGranted} />
          </motion.div>
        )}

        {/* FACE CAPTURE */}
        {flow === 'face-capture' && (
          <motion.div
            key="face"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <FaceCapture onCapture={handleFaceCapture} />
          </motion.div>
        )}

        {/* HOME */}
        {flow === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <OfficerHome
              officerName={officer?.name ?? ''}
              officerId={currentEmail}
              facePhoto={officer?.facePhoto}
              checkInStatus={officer?.checkInStatus ?? 'out'}
              onCheckInOut={handleCheckInOut}
              onOpenSettings={() => setFlow('settings')}
            />
          </motion.div>
        )}

        {/* SETTINGS */}
        {flow === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="h-full overflow-y-auto"
          >
            <OfficerSettings
              officerName={officer?.name ?? ''}
              facePhoto={officer?.facePhoto}
              approvalStatus={officer?.approvalStatus ?? 'pending'}
              onBack={() => setFlow('home')}
              onUpdatePhoto={(photo) => {
                if (currentEmail)
                  updateAccount(currentEmail, { facePhoto: photo })
              }}
            />
          </motion.div>
        )}

        {/* MESSAGES */}
        {flow === 'messages' && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="h-full flex flex-col pb-16"
          >
            <MessengerPanel
              currentUserId="me"
              currentUserName={officer?.name ?? 'Officer'}
              currentUserPhoto={officer?.facePhoto}
              messages={messages}
              onSendText={handleSendMessage}
              onSendVoice={(blob, duration) => {
                const url = URL.createObjectURL(blob)
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `m-${Date.now()}`,
                    senderId: 'me',
                    senderName: officer?.name ?? '',
                    type: 'voice',
                    fileUrl: url,
                    duration,
                    timestamp: new Date().toISOString(),
                    isMine: true,
                  },
                ])
              }}
              onSendMedia={(file, type, geo) => {
                const url = URL.createObjectURL(file)
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `m-${Date.now()}`,
                    senderId: 'me',
                    senderName: officer?.name ?? '',
                    type,
                    fileUrl: url,
                    geoLat: geo.lat,
                    geoLng: geo.lng,
                    geoAddress: geo.address,
                    capturedAt: new Date().toISOString(),
                    timestamp: new Date().toISOString(),
                    isMine: true,
                  },
                ])
              }}
              onVoiceCall={() => {}}
              chatTitle="Team Channel"
              isGroupChat
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Nav ─────────────────────────────────────────────── */}
      {isLoggedIn && (
        <div
          className="fixed bottom-0 left-0 right-0 z-30 bg-[#080e1c] border-t border-[#1e2d4a] flex items-center px-1 gap-0"
          style={{ paddingBottom: 'var(--safe-bottom)' }}
        >
          {(
            [
              { id: 'home' as AppFlow, icon: Home, label: 'Home', badge: 0 },
              {
                id: 'messages' as AppFlow,
                icon: MessageSquare,
                label: 'Chat',
                badge: unreadMessages,
              },
              {
                id: 'settings' as AppFlow,
                icon: Settings,
                label: 'Settings',
                badge: 0,
              },
            ] as const
          ).map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => {
                setFlow(id)
                if (id === 'messages') setUnreadMessages(0)
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all relative ${
                flow === id
                  ? 'text-teal-400'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[9px] text-white font-bold">
                      {badge}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-['Rajdhani'] font-semibold tracking-wide">
                {label}
              </span>
              {flow === id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-teal-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Profile Sidebar */}
      {isLoggedIn && (
        <ProfileSidebar
          name={officer?.name ?? 'Field Officer'}
          email={currentEmail}
          role="officer"
          facePhoto={officer?.facePhoto}
          status={officer?.approvalStatus}
          checkInStatus={officer?.checkInStatus}
          onCheckInOut={handleCheckInOut}
          onSignOut={handleSignOut}
          onUpdatePhoto={(photo) => {
            if (currentEmail) updateAccount(currentEmail, { facePhoto: photo })
          }}
        />
      )}
    </div>
  )
}

// ── Routing helper ────────────────────────────────────────────────────────────
function routeAccountToFlow(
  account: SavedAccount,
  setFlow: (f: AppFlow) => void,
) {
  if (account.approvalStatus === 'pending') {
    setFlow('pending')
    return
  }
  if (account.approvalStatus === 'rejected') {
    setFlow('rejected')
    return
  }
  if (!account.permissionsGranted) {
    setFlow('permissions')
    return
  }
  if (!account.firstLoginDone) {
    setFlow('face-capture')
    return
  }
  setFlow('home')
}

// ── Rejected Screen ───────────────────────────────────────────────────────────
function RejectedScreen({
  name,
  onBack,
}: {
  name: string
  onBack: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield size={32} className="text-red-400" />
        </div>
        <h2 className="text-white font-['Rajdhani'] font-bold text-2xl tracking-wide mb-3">
          Access Denied
        </h2>
        <p className="text-slate-400 text-sm font-['Rajdhani'] leading-relaxed mb-2">
          Hi <span className="text-white font-semibold">{name}</span>, your
          access request was not approved by the admin.
        </p>
        <p className="text-slate-600 text-xs font-['Rajdhani'] mb-8">
          Please contact your supervisor or submit a new request with updated
          information.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="w-full py-4 bg-[#0d1425] border border-[#1e2d4a] hover:border-teal-500/30 text-slate-300 font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all"
        >
          ← BACK TO HOME
        </motion.button>
      </motion.div>
    </div>
  )
}

// ── Officer Landing ───────────────────────────────────────────────────────────
function OfficerLanding({
  onLogin,
  onRegister,
}: {
  onLogin: () => void
  onRegister: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
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
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-blue-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(0,212,170,0)',
                '0 0 40px 0 rgba(0,212,170,0.1)',
                '0 0 0 0 rgba(0,212,170,0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <MapPin size={32} className="text-teal-400" />
          </motion.div>
          <h1 className="font-['Rajdhani'] font-bold text-3xl text-white tracking-widest mb-1">
            FIELDTRACK
          </h1>
          <p className="text-slate-500 text-xs tracking-widest font-['Rajdhani']">
            OFFICER MOBILE APP — BANGLADESH
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-400/70 text-[11px] font-['JetBrains_Mono']">
              REAL-TIME TRACKING ENABLED
            </span>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-8 bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4">
          <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-widest mb-3">
            How It Works
          </p>
          {[
            {
              step: '1',
              text: 'Create your account with CV',
              color: '#00d4aa',
            },
            { step: '2', text: 'Wait for admin approval', color: '#f59e0b' },
            { step: '3', text: 'Log in after approval', color: '#60a5fa' },
            { step: '4', text: 'Start tracking & reporting', color: '#8b5cf6' },
          ].map((s) => (
            <div
              key={s.step}
              className="flex items-center gap-3 mb-2 last:mb-0"
            >
              <div
                className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                style={{ borderColor: s.color, color: s.color }}
              >
                {s.step}
              </div>
              <p className="text-slate-400 text-xs font-['Rajdhani']">
                {s.text}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <motion.button
            onClick={onRegister}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(0,212,170,0.3)] flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> CREATE ACCOUNT
          </motion.button>
          <motion.button
            onClick={onLogin}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-[#0d1425] border border-[#1e2d4a] hover:border-teal-500/30 text-slate-300 hover:text-white font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> SIGN IN
          </motion.button>
        </div>

        <div className="mt-4 p-3 bg-[#0d1425] border border-[#1e2d4a] rounded-2xl flex items-center gap-2">
          <Shield size={12} className="text-amber-400 flex-shrink-0" />
          <p className="text-slate-500 text-[10px] font-['Rajdhani']">
            Admin-approved accounts only. BD phone number required. CV must be
            submitted.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ── Officer Sign In ───────────────────────────────────────────────────────────

function OfficerSignIn({
  onSuccess,
  onBack,
}: {
  onSuccess: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => { error: string | null }
  onBack: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    if (password.length < 4) {
      setError('Password too short')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const result = onSuccess(email.trim().toLowerCase(), password, rememberMe)
    setLoading(false)
    if (result.error) setError(result.error)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors font-['Rajdhani'] text-sm"
        >
          ← Back
        </button>
        <div className="mb-8">
          <h2 className="text-white font-['Rajdhani'] font-bold text-2xl tracking-wide mb-1">
            Sign In
          </h2>
          <p className="text-slate-500 text-sm font-['Rajdhani']">
            Enter your registered email and password
          </p>
        </div>

        {/* Notice about create account flow */}
        <div className="mb-4 p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl">
          <p className="text-blue-300/80 text-[11px] font-['Rajdhani'] leading-relaxed">
            <span className="font-bold">New here?</span> You must first create
            an account and wait for admin approval before you can sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#0d1425] border border-[#1e2d4a] focus-within:border-teal-500/40 rounded-2xl px-4 py-3 transition-colors">
            <label className="text-slate-500 text-[10px] uppercase tracking-widest font-['Rajdhani'] block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@gmail.com"
              className="w-full bg-transparent text-white font-['Rajdhani'] text-base focus:outline-none"
              autoComplete="email"
            />
          </div>

          <div className="bg-[#0d1425] border border-[#1e2d4a] focus-within:border-teal-500/40 rounded-2xl px-4 py-3 transition-colors">
            <label className="text-slate-500 text-[10px] uppercase tracking-widest font-['Rajdhani'] block mb-1.5">
              Password
            </label>
            <div className="flex items-center">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-white font-['Rajdhani'] text-sm focus:outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-slate-600 hover:text-slate-400"
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <p className="text-red-300 text-sm font-['Rajdhani']">{error}</p>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${rememberMe ? 'bg-teal-500 border-teal-500' : 'border-[#2a3d5a]'}`}
            >
              {rememberMe && (
                <span className="text-[#0a0f1e] text-xs font-bold">✓</span>
              )}
            </div>
            <span className="text-slate-400 text-sm font-['Rajdhani']">
              Stay signed in
            </span>
          </label>

          <motion.button
            type="submit"
            disabled={loading || !email || !password}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all disabled:opacity-40 shadow-[0_0_30px_rgba(0,212,170,0.3)]"
          >
            {loading ? 'VERIFYING...' : 'SIGN IN'}
          </motion.button>
        </form>

        <p className="text-center text-slate-600 text-xs font-['Rajdhani'] mt-6">
          Don't have an account?{' '}
          <button
            onClick={onBack}
            className="text-teal-400 hover:text-teal-300 font-bold transition-colors"
          >
            Create one →
          </button>
        </p>
      </motion.div>
    </div>
  )
}
