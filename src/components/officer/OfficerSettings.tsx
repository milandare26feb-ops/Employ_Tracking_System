'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  Mail,
  Lock,
  Upload,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Camera,
  Save,
  ChevronRight,
  MapPin,
  Activity,
  AlertTriangle,
} from 'lucide-react'

interface OfficerSettingsProps {
  officerName: string
  facePhoto?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  onBack: () => void
  onUpdatePhoto: (photo: string) => void
}

type SettingsTab = 'profile' | 'business' | 'security' | 'tracking'

export default function OfficerSettings({
  officerName,
  facePhoto,
  approvalStatus,
  onBack,
  onUpdatePhoto,
}: OfficerSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const statusConfig = {
    pending: {
      label: 'PENDING APPROVAL',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: Clock,
    },
    approved: {
      label: 'APPROVED',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      icon: CheckCircle,
    },
    rejected: {
      label: 'REJECTED',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: AlertTriangle,
    },
  }
  const cfg = statusConfig[approvalStatus]
  const StatusIcon = cfg.icon

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'tracking', label: 'Tracking Log', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-[#1e2d4a]">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#0d1425] border border-[#1e2d4a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="font-['Rajdhani'] font-bold text-white text-lg tracking-wide">
            SETTINGS
          </h1>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border}`}
        >
          <StatusIcon size={11} className={cfg.color} />
          <span
            className={`text-[10px] font-['Rajdhani'] font-bold tracking-wide ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="px-5 py-4 flex items-center gap-4 border-b border-[#1e2d4a]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl border-2 border-teal-500/30 overflow-hidden bg-[#0d1425]">
            {facePhoto ? (
              <img
                src={facePhoto}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={24} className="text-slate-600" />
              </div>
            )}
          </div>
          <label
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
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
                reader.onload = () => onUpdatePhoto(reader.result as string)
                reader.readAsDataURL(file)
              }}
            />
          </label>
        </div>
        <div>
          <p className="text-white font-['Rajdhani'] font-bold text-base">
            {officerName}
          </p>
          <p className="text-slate-500 text-[11px] font-['JetBrains_Mono'] mt-0.5">
            ID: OFF-{Math.floor(Math.random() * 9000 + 1000)}
          </p>
          <p className="text-slate-600 text-[10px] mt-0.5">
            Field Officer · Sales Team
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-[#1e2d4a] px-5 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-['Rajdhani'] font-semibold tracking-wide border-b-2 transition-all mr-1 ${
                activeTab === tab.id
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <InputField
                icon={User}
                label="Full Name"
                placeholder="Ahmad Farhan bin Rashid"
                defaultValue={officerName}
              />
              <InputField
                icon={Mail}
                label="Email Address"
                placeholder="officer@company.com"
                type="email"
              />
              <InputField
                icon={Phone}
                label="Phone Number"
                placeholder="+60 12-345-6789"
                type="tel"
              />
              <InputField
                icon={MapPin}
                label="Department / Zone"
                placeholder="Sales Team A — KL Central"
              />
              <InputField
                icon={FileText}
                label="Employee ID"
                placeholder="EMP-2024-001"
              />
              <motion.button
                onClick={handleSave}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-3.5 rounded-2xl font-['Rajdhani'] font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
                    : 'bg-teal-500 text-[#0a0f1e] shadow-[0_0_20px_rgba(0,212,170,0.3)]'
                }`}
              >
                {saved ? (
                  <>
                    <CheckCircle size={15} /> SAVED!
                  </>
                ) : (
                  <>
                    <Save size={15} /> SAVE CHANGES
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'business' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <InputField
                icon={Building}
                label="Company Name"
                placeholder="ABC Marketing Sdn Bhd"
              />
              <InputField
                icon={MapPin}
                label="Business Address"
                placeholder="123 Jalan Business Park"
              />
              <InputField
                icon={Phone}
                label="Business Phone"
                placeholder="+60 3-1234-5678"
                type="tel"
              />
              <InputField
                icon={FileText}
                label="Business Registration No."
                placeholder="1234567-H"
              />
              <UploadField
                label="Business Registration Document"
                accept=".pdf,.jpg,.png"
              />
              <UploadField label="NRIC / ID Card" accept=".jpg,.png,.pdf" />
              <UploadField label="Profile Photo" accept=".jpg,.png" />
              <motion.button
                onClick={handleSave}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 bg-teal-500 text-[#0a0f1e] rounded-2xl font-['Rajdhani'] font-bold text-sm tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.3)]"
              >
                <Upload size={15} /> SUBMIT DOCUMENTS
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-['Rajdhani'] font-semibold mb-3 uppercase tracking-wider">
                  Change Password
                </p>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Current password"
                      className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-teal-500/50 pr-9"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-teal-500/50"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
                <button className="mt-3 w-full py-2.5 bg-[#1e2d4a] border border-[#2a3d5a] rounded-xl text-slate-300 text-xs font-['Rajdhani'] font-semibold tracking-wide hover:border-teal-500/30 transition-colors flex items-center justify-center gap-2">
                  <Lock size={12} /> UPDATE PASSWORD
                </button>
              </div>

              <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-['Rajdhani'] font-semibold mb-3 uppercase tracking-wider">
                  Account Security
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: 'Two-Factor Authentication',
                      status: 'Not Set Up',
                      action: 'Setup',
                    },
                    {
                      label: 'Login Devices',
                      status: '1 device',
                      action: 'Manage',
                    },
                    {
                      label: 'Session Timeout',
                      status: '8 hours',
                      action: 'Change',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2 border-b border-[#1e2d4a] last:border-0"
                    >
                      <div>
                        <p className="text-slate-300 text-xs font-['Rajdhani']">
                          {item.label}
                        </p>
                        <p className="text-slate-600 text-[10px] font-['JetBrains_Mono']">
                          {item.status}
                        </p>
                      </div>
                      <button className="text-teal-400 text-[11px] font-['Rajdhani'] font-semibold hover:text-teal-300 transition-colors">
                        {item.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-['Rajdhani'] font-semibold mb-3 uppercase tracking-wider">
                  Today's Tracking Log
                </p>
                <div className="space-y-3">
                  {[
                    {
                      time: '09:00',
                      lat: '3.13905',
                      lng: '101.68690',
                      event: 'Tracking Started',
                      type: 'start',
                    },
                    {
                      time: '09:47',
                      lat: '3.15230',
                      lng: '101.71230',
                      event: 'Entered KL City Zone',
                      type: 'geofence',
                    },
                    {
                      time: '10:23',
                      lat: '3.12100',
                      lng: '101.66500',
                      event: 'Idle Detected (5 min)',
                      type: 'idle',
                    },
                    {
                      time: '11:15',
                      lat: '3.14500',
                      lng: '101.69500',
                      event: 'Movement Resumed',
                      type: 'move',
                    },
                    {
                      time: '13:00',
                      lat: '3.13000',
                      lng: '101.71000',
                      event: 'Lunch Break (30 min idle)',
                      type: 'idle',
                    },
                    {
                      time: '13:32',
                      lat: '3.14000',
                      lng: '101.69500',
                      event: 'Exited PJ Zone',
                      type: 'geofence',
                    },
                  ].map((log) => (
                    <div key={log.time} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          log.type === 'start'
                            ? 'bg-teal-400'
                            : log.type === 'geofence'
                              ? 'bg-amber-400'
                              : log.type === 'idle'
                                ? 'bg-orange-400'
                                : 'bg-blue-400'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-300 text-[11px] font-['Rajdhani'] font-semibold">
                            {log.event}
                          </p>
                          <span className="text-slate-600 text-[10px] font-['JetBrains_Mono']">
                            {log.time}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[10px] font-['JetBrains_Mono'] mt-0.5">
                          {log.lat}, {log.lng}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4">
                <p className="text-slate-400 text-xs font-['Rajdhani'] font-semibold mb-3 uppercase tracking-wider">
                  Geo-Boundary Alerts
                </p>
                {[
                  {
                    zone: 'KL City Centre',
                    type: 'Enter',
                    time: '09:47',
                    status: 'In Zone',
                  },
                  {
                    zone: 'Petaling Jaya',
                    type: 'Exit',
                    time: '13:32',
                    status: 'Left Zone',
                  },
                ].map((alert) => (
                  <div
                    key={`${alert.zone}-${alert.time}`}
                    className="flex items-center justify-between py-2 border-b border-[#1e2d4a] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className="text-amber-400" />
                      <div>
                        <p className="text-slate-300 text-[11px] font-['Rajdhani']">
                          {alert.zone}
                        </p>
                        <p className="text-slate-600 text-[10px]">
                          {alert.type} at {alert.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-['Rajdhani'] font-semibold px-2 py-0.5 rounded-full ${
                        alert.type === 'Enter'
                          ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                          : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function InputField({
  icon: Icon,
  label,
  placeholder,
  type = 'text',
  defaultValue,
}: {
  icon: typeof User
  label: string
  placeholder: string
  type?: string
  defaultValue?: string
}) {
  return (
    <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl px-4 py-3">
      <label className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
        <Icon size={10} />
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-transparent text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none"
      />
    </div>
  )
}

function UploadField({ label, accept }: { label: string; accept: string }) {
  return (
    <div className="bg-[#0d1425] border border-dashed border-[#2a3d5a] rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-teal-500/30 transition-colors group">
      <div className="w-9 h-9 bg-[#1e2d4a] group-hover:bg-teal-500/10 rounded-xl flex items-center justify-center transition-colors">
        <Upload
          size={15}
          className="text-slate-500 group-hover:text-teal-400 transition-colors"
        />
      </div>
      <div className="flex-1">
        <p className="text-slate-300 text-xs font-['Rajdhani'] font-semibold group-hover:text-white transition-colors">
          {label}
        </p>
        <p className="text-slate-600 text-[10px] mt-0.5 font-['JetBrains_Mono']">
          Tap to upload · {accept}
        </p>
      </div>
      <ChevronRight
        size={13}
        className="text-slate-700 group-hover:text-teal-400 transition-colors"
      />
    </div>
  )
}
