'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  MapPin,
  Camera,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Lock,
} from 'lucide-react'

interface Permission {
  id: string
  title: string
  description: string
  icon: typeof MapPin
  status: 'pending' | 'granted' | 'denied' | 'requesting'
  required: boolean
}

interface PermissionGateProps {
  onAllGranted: () => void
}

const INITIAL_PERMISSIONS: Permission[] = [
  {
    id: 'location',
    title: 'Location Access',
    description: 'Always allow precise GPS location for real-time tracking',
    icon: MapPin,
    status: 'pending',
    required: true,
  },
  {
    id: 'camera',
    title: 'Camera Access',
    description: 'Required for identity verification face capture',
    icon: Camera,
    status: 'pending',
    required: true,
  },
  {
    id: 'notifications',
    title: 'Push Notifications',
    description: 'Receive admin alerts and geo-fence boundary notifications',
    icon: Bell,
    status: 'pending',
    required: false,
  },
]

export default function PermissionGate({ onAllGranted }: PermissionGateProps) {
  const [permissions, setPermissions] =
    useState<Permission[]>(INITIAL_PERMISSIONS)
  const [blockMessage, setBlockMessage] = useState<string | null>(null)

  const updatePermission = (id: string, status: Permission['status']) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    )
  }

  const requestPermission = useCallback(async (permission: Permission) => {
    updatePermission(permission.id, 'requesting')

    try {
      if (permission.id === 'location') {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => reject(new Error('denied')),
            { timeout: 8000 },
          )
        })
        updatePermission(permission.id, 'granted')
      } else if (permission.id === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        stream.getTracks().forEach((t) => t.stop())
        updatePermission(permission.id, 'granted')
      } else if (permission.id === 'notifications') {
        if ('Notification' in window) {
          const result = await Notification.requestPermission()
          updatePermission(
            permission.id,
            result === 'granted' ? 'granted' : 'denied',
          )
        } else {
          updatePermission(permission.id, 'granted')
        }
      }
    } catch {
      updatePermission(permission.id, 'denied')
      if (permission.required) {
        setBlockMessage(
          `${permission.title} is required to use this system. Please enable it in your browser settings.`,
        )
      }
    }
  }, [])

  const requestAll = useCallback(async () => {
    setBlockMessage(null)
    for (const p of permissions.filter((p) => p.status === 'pending')) {
      await requestPermission(p)
      await new Promise((r) => setTimeout(r, 400))
    }
  }, [permissions, requestPermission])

  const allRequired = permissions.filter((p) => p.required)
  const allRequiredGranted = allRequired.every((p) => p.status === 'granted')

  const handleContinue = () => {
    if (allRequiredGranted) {
      onAllGranted()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(0,212,170,0)',
                '0 0 0 20px rgba(0,212,170,0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield size={28} className="text-teal-400" />
          </motion.div>
          <h1 className="font-['Rajdhani'] font-bold text-white text-2xl tracking-wide mb-2">
            PERMISSIONS REQUIRED
          </h1>
          <p className="text-slate-500 text-xs leading-relaxed">
            To maintain system integrity, the following permissions must be
            granted before accessing the Field Officer app.
          </p>
        </div>

        {/* Permission Cards */}
        <div className="space-y-3 mb-6">
          {permissions.map((permission, index) => {
            const Icon = permission.icon
            const statusConfig = {
              pending: {
                color: 'text-slate-500',
                bg: 'bg-slate-700/20',
                border: 'border-slate-700/30',
                icon: null,
              },
              requesting: {
                color: 'text-teal-400',
                bg: 'bg-teal-500/10',
                border: 'border-teal-500/20',
                icon: Loader2,
              },
              granted: {
                color: 'text-teal-400',
                bg: 'bg-teal-500/10',
                border: 'border-teal-500/20',
                icon: CheckCircle,
              },
              denied: {
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                icon: XCircle,
              },
            }
            const cfg = statusConfig[permission.status]
            const StatusIcon = cfg.icon

            return (
              <motion.div
                key={permission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-3 p-4 bg-[#0d1425] border rounded-2xl transition-all ${cfg.border} ${
                  permission.status === 'denied' ? 'border-red-500/30' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.border}`}
                >
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-['Rajdhani'] font-semibold">
                      {permission.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {permission.required && (
                        <span className="text-[10px] text-red-400/70 font-['Rajdhani'] font-semibold">
                          REQUIRED
                        </span>
                      )}
                      {StatusIcon && (
                        <StatusIcon
                          size={14}
                          className={`${cfg.color} ${permission.status === 'requesting' ? 'animate-spin' : ''}`}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    {permission.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Block Message */}
        <AnimatePresence>
          {blockMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2"
            >
              <AlertTriangle
                size={14}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-red-400 text-[11px] leading-relaxed">
                {blockMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        {!allRequiredGranted ? (
          <motion.button
            onClick={requestAll}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,212,170,0.3)]"
          >
            <Lock size={16} />
            GRANT PERMISSIONS
          </motion.button>
        ) : (
          <motion.button
            onClick={handleContinue}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,212,170,0.3)]"
          >
            <ChevronRight size={16} />
            CONTINUE TO VERIFICATION
          </motion.button>
        )}

        {/* Notice */}
        <p className="text-center text-slate-700 text-[10px] mt-4 leading-relaxed font-['Rajdhani']">
          MANDATORY PERMISSIONS — Access to this system requires all required
          permissions to be granted. This policy is enforced by your
          organization.
        </p>
      </motion.div>
    </div>
  )
}
