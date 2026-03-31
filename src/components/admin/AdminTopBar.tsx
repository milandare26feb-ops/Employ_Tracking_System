'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Bell,
  Shield,
  Users,
  Activity,
  Wifi,
  ChevronDown,
  LogOut,
  Settings,
  User,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react'
import type { AnalyticsSummary } from './OfficerSidebar'

interface AdminTopBarProps {
  analytics: AnalyticsSummary
  pendingCount: number
  alerts: Alert[]
  onClearAlerts: () => void
}

export interface Alert {
  id: string
  type: 'geofence' | 'inactivity' | 'approval' | 'system'
  message: string
  officer?: string
  time: string
  read: boolean
}

export default function AdminTopBar({
  analytics,
  pendingCount,
  alerts,
  onClearAlerts,
}: AdminTopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const unreadAlerts = alerts.filter((a) => !a.read).length

  const alertIcons = {
    geofence: {
      icon: MapPin,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    inactivity: {
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    approval: {
      icon: CheckCircle,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
    system: {
      icon: Zap,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
  }

  return (
    <div className="h-14 bg-[#080e1c] border-b border-[#1e2d4a] flex items-center px-5 gap-4 relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-4">
        <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
          <MapPin size={14} className="text-[#0a0f1e]" />
        </div>
        <div>
          <div className="font-['Rajdhani'] font-bold text-white text-sm tracking-wider leading-none">
            FIELDTRACK
          </div>
          <div className="font-['JetBrains_Mono'] text-[9px] text-teal-500/60 tracking-widest leading-none mt-0.5">
            ADMIN CONSOLE v2.0
          </div>
        </div>
      </div>

      {/* Live Status Indicator */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/5 border border-teal-500/15 rounded-full">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-teal-400 text-[11px] font-['JetBrains_Mono'] font-semibold">
            LIVE
          </span>
        </div>
        <div className="w-px h-3 bg-teal-500/20" />
        <span className="text-slate-400 text-[11px] font-['JetBrains_Mono']">
          5s interval
        </span>
      </div>

      {/* Quick Stats Bar */}
      <div className="flex items-center gap-1 flex-1">
        {[
          {
            label: 'TOTAL',
            value: analytics.totalOfficers,
            color: '#60a5fa',
            icon: Users,
          },
          {
            label: 'ACTIVE',
            value: analytics.activeNow,
            color: '#00d4aa',
            icon: Activity,
          },
          {
            label: 'IDLE',
            value: analytics.idleCount,
            color: '#f59e0b',
            icon: Clock,
          },
          {
            label: 'OFFLINE',
            value: analytics.offlineCount,
            color: '#6b7280',
            icon: WifiOff,
          },
          {
            label: 'PENDING',
            value: pendingCount,
            color: '#f97316',
            icon: AlertTriangle,
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1425] border border-[#1e2d4a] rounded-lg"
            >
              <Icon size={11} style={{ color: stat.color }} />
              <span
                className="font-['JetBrains_Mono'] font-bold text-sm"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
              <span className="text-slate-600 text-[10px] font-['Rajdhani'] tracking-wider">
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0d1425] border border-[#1e2d4a] rounded-lg">
        <Wifi size={11} className="text-teal-400" />
        <span className="text-teal-400 text-[11px] font-['JetBrains_Mono']">
          CONNECTED
        </span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications)
            setShowProfile(false)
          }}
          className="relative w-8 h-8 rounded-lg bg-[#0d1425] border border-[#1e2d4a] flex items-center justify-center text-slate-400 hover:text-white hover:border-teal-500/30 transition-all"
        >
          <Bell size={14} />
          {unreadAlerts > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            >
              {unreadAlerts}
            </motion.span>
          )}
        </button>
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-10 w-80 bg-[#0d1425] border border-[#1e2d4a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              <div className="p-3 border-b border-[#1e2d4a] flex items-center justify-between">
                <span className="text-white font-['Rajdhani'] font-semibold text-sm tracking-wide">
                  ALERTS
                </span>
                <button
                  onClick={onClearAlerts}
                  className="text-slate-500 text-[11px] hover:text-teal-400 transition-colors font-['Rajdhani']"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-600 text-xs font-['Rajdhani']">
                    No alerts
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const cfg = alertIcons[alert.type]
                    const Icon = cfg.icon
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-3 p-3 border-b border-[#1e2d4a]/50 hover:bg-white/[0.02] transition-colors ${!alert.read ? 'bg-white/[0.01]' : ''}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                        >
                          <Icon size={12} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-[11px] leading-snug">
                            {alert.message}
                          </p>
                          {alert.officer && (
                            <p className="text-slate-500 text-[10px] mt-0.5 font-['JetBrains_Mono']">
                              {alert.officer}
                            </p>
                          )}
                          <p className="text-slate-600 text-[10px] mt-0.5 font-['JetBrains_Mono']">
                            {alert.time}
                          </p>
                        </div>
                        {!alert.read && (
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Profile */}
      <div className="relative">
        <button
          onClick={() => {
            setShowProfile(!showProfile)
            setShowNotifications(false)
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0d1425] border border-[#1e2d4a] hover:border-teal-500/30 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <Shield size={11} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white text-[11px] font-['Rajdhani'] font-semibold leading-none">
              Super Admin
            </p>
          </div>
          <ChevronDown
            size={11}
            className={`text-slate-500 transition-transform ${showProfile ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-10 w-48 bg-[#0d1425] border border-[#1e2d4a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {[
                { icon: User, label: 'Profile Settings' },
                { icon: Settings, label: 'System Config' },
                { icon: Shield, label: 'Security' },
                { icon: LogOut, label: 'Sign Out', danger: true },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-['Rajdhani'] font-medium hover:bg-white/5 transition-colors ${item.danger ? 'text-red-400 hover:text-red-300' : 'text-slate-300 hover:text-white'}`}
                  >
                    <Icon size={13} />
                    {item.label}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function WifiOff({ size, className }: { size: number; className?: string }) {
  return <Wifi size={size} className={className} style={{ opacity: 0.4 }} />
}
