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

  const validate = (): boolean => {
    const e: Partial<Record<keyof RegistrationForm, string>> = {}
    if (!form.name.trim() || form.name.trim().split(' ').length < 2)
      e.name = 'Full name (first + last) required'
    if (!form.email.includes('@') || !form.email.includes('.'))
      e.email = 'Valid email address required'
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

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-5">
        <h1 className="font-['Rajdhani'] font-bold text-white text-xl tracking-wide">
          CREATE ACCOUNT
        </h1>
      </div>
    </div>
  )
}