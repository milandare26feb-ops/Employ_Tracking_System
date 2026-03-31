'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronRight,
  RefreshCw,
  Smartphone,
  Paperclip,
  FileText,
  X,
  Info,
} from 'lucide-react'

// ── Bangladesh phone validation ───────────────────────────────────────────
const BD_PREFIXES = ['013', '014', '015', '016', '017', '018', '019']

function validateBDPhone(phone: string): { valid: boolean; message: string } {
  const clean = phone.replace(/\D/g, '')
  if (!clean.startsWith('01'))
    return { valid: false, message: 'Must start with 01' }
  if (clean.length !== 11)
    return { valid: false, message: 'Must be exactly 11 digits' }
  const prefix = clean.slice(0, 3)
  if (!BD_PREFIXES.includes(prefix))
    return {
      valid: false,
      message: `Prefix ${prefix} not recognized (valid: 013–019)`,
    }
  return { valid: true, message: '' }
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

type Step = 'form' | 'otp' | 'done'

interface RegistrationForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  cvFile: File | null
}

interface OfficerRegistrationProps {
  onSubmit: (
    name: string,
    email: string,
    phone: string,
    password: string,
    cvFileName?: string,
  ) => void
  onBack: () => void
}

export default function OfficerRegistration({
  onSubmit,
  onBack,
}: OfficerRegistrationProps) {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cvFile: null,
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegistrationForm, string>>
  >({})
  const [showPass, setShowPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  const cvInputRef = useRef<HTMLInputElement>(null)

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpResendCooldown, setOtpResendCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<Record<keyof RegistrationForm, string>> = {}
    if (!form.name.trim() || form.name.trim().split(' ').length < 2)
      e.name = 'Full name (first + last) required'
    if (!form.email.includes('@') || !form.email.includes('.'))
      e.email = 'Valid email address required'
    // Check if email already registered
    try {
      const raw = localStorage.getItem('fieldtrack_accounts')
      const accounts = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
      if (accounts[form.email.toLowerCase()])
        e.email = 'An account with this email already exists'
    } catch {}
    const phoneCheck = validateBDPhone(form.phone)
    if (!phoneCheck.valid) e.phone = phoneCheck.message
    if (form.password.length < 8) e.password = 'Minimum 8 characters'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match'
    if (!form.cvFile) e.cvFile = 'CV/Resume is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const sendOTP = useCallback(async () => {
    const code = generateOTP()
    setGeneratedOtp(code)
    setOtpResendCooldown(60)
    console.info(`[DEV ONLY] OTP for ${form.phone}: ${code}`)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setOtpResendCooldown((s) => {
        if (s <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [form.phone])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    await sendOTP()
    setStep('otp')
  }

  const handleCVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ]
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        cvFile: 'Only PDF, DOC, DOCX, JPG, PNG allowed',
      }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cvFile: 'File must be under 5 MB' }))
      return
    }
    setForm((prev) => ({ ...prev, cvFile: file }))
    setErrors((prev) => ({ ...prev, cvFile: '' }))
  }

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[index] = val.slice(-1)
    setOtp(next)
    setOtpError('')
    if (val && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus()
  }

  const verifyOTP = async () => {
    const entered = otp.join('')
    if (entered.length < 6) {
      setOtpError('Enter the 6-digit code')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    if (entered === generatedOtp || entered === '123456') {
      setStep('done')
      setTimeout(
        () =>
          onSubmit(
            form.name,
            form.email.trim().toLowerCase(),
            form.phone,
            form.password,
            form.cvFile?.name,
          ),
        1200,
      )
    } else {
      setOtpError('Incorrect OTP. Please try again.')
    }
  }

  const update = (field: keyof RegistrationForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const phoneCheck = validateBDPhone(form.phone)

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-5">
        <button
          onClick={step === 'otp' ? () => setStep('form') : onBack}
          className="w-9 h-9 rounded-xl bg-[#0d1425] border border-[#1e2d4a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-['Rajdhani'] font-bold text-white text-xl tracking-wide">
            {step === 'form'
              ? 'CREATE ACCOUNT'
              : step === 'otp'
                ? 'VERIFY YOUR NUMBER'
                : 'ACCOUNT CREATED'}
          </h1>
          <p className="text-slate-500 text-[11px]">
            Step {step === 'form' ? '1' : step === 'otp' ? '2' : '3'} of 3 —{' '}
            {step === 'form'
              ? 'Your details & CV'
              : step === 'otp'
                ? `OTP sent to ${form.phone}`
                : 'Awaiting admin approval'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 mb-4">
        <div className="h-1 bg-[#1e2d4a] rounded-full overflow-hidden">
          <motion.div
            animate={{
              width: step === 'form' ? '33%' : step === 'otp' ? '66%' : '100%',
            }}
            transition={{ duration: 0.5 }}
            className="h-full bg-teal-500 rounded-full"
          />
        </div>
      </div>

      {/* Approval notice */}
      <div className="mx-5 mb-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-start gap-2">
        <Info size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-400/80 text-[11px] leading-relaxed font-['Rajdhani']">
          After creating your account, an admin must approve your request before
          you can sign in. You will be notified once approved.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Form ─────────────────────────────────────────── */}
        {step === 'form' && (
          <motion.form
            key="form"
            onSubmit={handleFormSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-5 space-y-3 pb-8"
          >
            <FormField
              label="Full Name"
              icon={User}
              error={errors.name}
              hint="First and last name required"
            >
              <input
                type="text"
                placeholder="Mohammad Kawsar Hossain"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full bg-transparent text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none"
              />
            </FormField>

            <FormField label="Email Address" icon={Mail} error={errors.email}>
              <input
                type="email"
                placeholder="officer@gmail.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full bg-transparent text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none"
                autoComplete="email"
              />
            </FormField>

            <FormField
              label="Bangladesh Phone Number"
              icon={Smartphone}
              error={errors.phone}
              hint="Must be 01X-XXXXXXXX format (11 digits)"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm flex-shrink-0">🇧🇩</span>
                <input
                  type="tel"
                  placeholder="01712345678"
                  value={form.phone}
                  maxLength={11}
                  onChange={(e) =>
                    update('phone', e.target.value.replace(/\D/g, ''))
                  }
                  className="flex-1 bg-transparent text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none font-['JetBrains_Mono']"
                />
                {form.phone.length === 11 && (
                  <span
                    className={`text-[10px] font-bold font-['Rajdhani'] ${phoneCheck.valid ? 'text-teal-400' : 'text-red-400'}`}
                  >
                    {phoneCheck.valid ? '✓ VALID' : '✗'}
                  </span>
                )}
              </div>
            </FormField>

            {form.phone.length >= 3 && !phoneCheck.valid && (
              <div className="px-3 py-2 bg-red-500/5 border border-red-500/15 rounded-xl flex items-start gap-2">
                <AlertTriangle
                  size={11}
                  className="text-red-400 mt-0.5 flex-shrink-0"
                />
                <p className="text-red-400/80 text-[10px] font-['Rajdhani']">
                  {phoneCheck.message}. Valid prefixes: 013–019
                </p>
              </div>
            )}

            <FormField
              label="Password"
              icon={Lock}
              error={errors.password}
              hint="Minimum 8 characters"
            >
              <div className="flex items-center gap-2">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </FormField>

            <FormField
              label="Confirm Password"
              icon={Lock}
              error={errors.confirmPassword}
            >
              <div className="flex items-center gap-2">
                <input
                  type={showConfPass ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfPass(!showConfPass)}
                  className="text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showConfPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </FormField>

            {form.password.length > 0 && (
              <div className="space-y-1 px-1">
                <div className="h-1 bg-[#1e2d4a] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${form.password.length >= 12 ? 'w-full bg-teal-500' : form.password.length >= 8 ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-red-500'}`}
                  />
                </div>
                <p
                  className={`text-[10px] font-['Rajdhani'] ${form.password.length >= 12 ? 'text-teal-400' : form.password.length >= 8 ? 'text-amber-400' : 'text-red-400'}`}
                >
                  {form.password.length >= 12
                    ? 'STRONG'
                    : form.password.length >= 8
                      ? 'MEDIUM'
                      : 'WEAK'}
                </p>
              </div>
            )}

            {/* CV Upload */}
            <div>
              <div
                className={`bg-[#0d1425] border rounded-2xl px-4 py-3 transition-colors ${errors.cvFile ? 'border-red-500/30' : 'border-[#1e2d4a] focus-within:border-teal-500/40'}`}
              >
                <label className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Paperclip size={10} /> CV / Resume (Required)
                </label>
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleCVSelect}
                />
                {form.cvFile ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-['Rajdhani'] font-semibold truncate">
                        {form.cvFile.name}
                      </p>
                      <p className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                        {(form.cvFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, cvFile: null }))
                      }
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => cvInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#2a3a5a] rounded-xl text-slate-500 hover:text-teal-400 hover:border-teal-500/40 transition-all"
                  >
                    <Paperclip size={14} />
                    <span className="text-sm font-['Rajdhani']">
                      Attach CV / Resume
                    </span>
                  </button>
                )}
              </div>
              {errors.cvFile && (
                <p className="text-red-400 text-[10px] mt-1 ml-2 font-['Rajdhani'] flex items-center gap-1">
                  <AlertTriangle size={9} /> {errors.cvFile}
                </p>
              )}
              {!errors.cvFile && (
                <p className="text-slate-600 text-[10px] mt-1 ml-2 font-['Rajdhani']">
                  PDF, DOC, DOCX or image — max 5 MB
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-teal-500 disabled:bg-teal-500/50 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.3)] mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> PROCESSING...
                </>
              ) : (
                <>
                  <ChevronRight size={16} /> SEND OTP TO MY NUMBER
                </>
              )}
            </motion.button>
          </motion.form>
        )}

        {/* ── STEP 2: OTP ──────────────────────────────────────────── */}
        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-5 pb-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Smartphone size={26} className="text-teal-400" />
              </div>
              <h2 className="text-white font-['Rajdhani'] font-bold text-lg tracking-wide mb-1">
                Enter OTP Code
              </h2>
              <p className="text-slate-500 text-[12px] font-['Rajdhani']">
                6-digit code sent to{' '}
                <span className="text-teal-400 font-['JetBrains_Mono']">
                  {form.phone}
                </span>
              </p>
              <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-300 text-[10px] font-['JetBrains_Mono']">
                  DEV MODE: Check browser console. Use <strong>123456</strong>{' '}
                  as fallback.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-['JetBrains_Mono'] font-bold bg-[#0d1425] border rounded-2xl text-white focus:outline-none transition-all ${otpError ? 'border-red-500/50 text-red-400' : digit ? 'border-teal-500/50 text-teal-400' : 'border-[#1e2d4a] focus:border-teal-500/50'}`}
                />
              ))}
            </div>

            {otpError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 justify-center mb-4"
              >
                <AlertTriangle size={12} className="text-red-400" />
                <p className="text-red-400 text-sm font-['Rajdhani']">
                  {otpError}
                </p>
              </motion.div>
            )}

            <motion.button
              onClick={verifyOTP}
              disabled={loading || otp.join('').length < 6}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-teal-500 disabled:opacity-40 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.3)] mb-4"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> VERIFYING...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> VERIFY & CREATE ACCOUNT
                </>
              )}
            </motion.button>

            <div className="text-center">
              {otpResendCooldown > 0 ? (
                <p className="text-slate-600 text-xs font-['Rajdhani']">
                  Resend in{' '}
                  <span className="text-teal-400 font-['JetBrains_Mono']">
                    {otpResendCooldown}s
                  </span>
                </p>
              ) : (
                <button
                  onClick={sendOTP}
                  className="flex items-center gap-1.5 mx-auto text-teal-400 hover:text-teal-300 text-xs font-['Rajdhani'] transition-colors"
                >
                  <RefreshCw size={11} /> Resend OTP
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Done ─────────────────────────────────────────── */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 px-5 flex flex-col items-center justify-center pb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-24 h-24 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle size={44} className="text-teal-400" />
            </motion.div>
            <h2 className="text-white font-['Rajdhani'] font-bold text-2xl tracking-wide mb-2">
              Account Created!
            </h2>
            <p className="text-slate-400 text-sm font-['Rajdhani'] text-center max-w-xs leading-relaxed">
              Your account has been created. An admin will review your request
              and CV. You'll be able to sign in once approved.
            </p>
            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl w-full max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={13} className="text-amber-400" />
                <p className="text-amber-400 text-xs font-['Rajdhani'] font-bold uppercase tracking-wider">
                  What happens next?
                </p>
              </div>
              {[
                'Admin reviews your profile & CV',
                'You receive approval notification',
                'Sign in with your email & password',
                'Complete permissions & face scan',
              ].map((s, i) => (
                <div
                  key={s}
                  className="flex items-center gap-2 mb-1.5 last:mb-0"
                >
                  <div className="w-4 h-4 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-[8px] font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-['Rajdhani']">
                    {s}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-[#0d1425] border border-[#1e2d4a] rounded-2xl w-full max-w-xs space-y-2">
              <Row label="Name" value={form.name} />
              <Row label="Email" value={form.email} />
              <Row label="Phone" value={form.phone} />
              <Row label="CV" value={form.cvFile?.name ?? 'Attached'} />
              <Row label="Status" value="⏳ Pending Admin Approval" highlight />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FormField({
  label,
  icon: Icon,
  error,
  hint,
  children,
}: {
  label: string
  icon: typeof User
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        className={`bg-[#0d1425] border rounded-2xl px-4 py-3 transition-colors ${error ? 'border-red-500/30' : 'border-[#1e2d4a] focus-within:border-teal-500/40'}`}
      >
        <label className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
          <Icon size={10} /> {label}
        </label>
        {children}
      </div>
      {error && (
        <p className="text-red-400 text-[10px] mt-1 ml-2 font-['Rajdhani'] flex items-center gap-1">
          <AlertTriangle size={9} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-slate-600 text-[10px] mt-1 ml-2 font-['Rajdhani']">
          {hint}
        </p>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-[11px] font-['Rajdhani']">
        {label}
      </span>
      <span
        className={`text-[11px] font-['Rajdhani'] font-semibold ${highlight ? 'text-amber-400' : 'text-slate-300'}`}
      >
        {value}
      </span>
    </div>
  )
}
