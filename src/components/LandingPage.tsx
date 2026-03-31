'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  MapPin,
  Shield,
  Activity,
  Users,
  Zap,
  Eye,
  Bell,
  ChevronRight,
  Lock,
  Globe,
  Wifi,
  Navigation,
  BarChart3,
  Camera,
  Clock,
  AlertTriangle,
} from 'lucide-react'

interface LandingPageProps {
  onEnterAdmin: () => void
  onEnterOfficer: () => void
}

export default function LandingPage({
  onEnterAdmin,
  onEnterOfficer,
}: LandingPageProps) {
  const [hovered, setHovered] = useState<'admin' | 'officer' | null>(null)

  return (
    <div className="min-h-screen h-full bg-[#0a0f1e] overflow-y-auto overflow-x-hidden relative">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#00d4aa 1px, transparent 1px), linear-gradient(90deg, #00d4aa 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,212,170,0.4)]">
            <MapPin size={14} className="text-[#0a0f1e]" />
          </div>
          <div>
            <span className="font-['Rajdhani'] font-bold text-white text-base sm:text-lg tracking-widest">
              FIELDTRACK
            </span>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-teal-500/60 text-[9px] font-['JetBrains_Mono'] tracking-widest hidden sm:block">
                SYSTEM OPERATIONAL
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-500/5 border border-teal-500/10 rounded-full">
            <Wifi size={10} className="text-teal-400" />
            <span className="text-teal-400 text-[10px] font-['JetBrains_Mono']">
              REALTIME
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <Globe size={10} className="text-slate-400" />
            <span className="text-slate-400 text-[10px] font-['Rajdhani']">
              v2.0.0
            </span>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 sm:px-8 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-5">
            <Zap size={11} className="text-teal-400" />
            <span className="text-teal-400 text-[10px] sm:text-xs font-['Rajdhani'] font-semibold tracking-widest">
              REAL-TIME MARKETING OFFICER TRACKING SYSTEM
            </span>
          </div>
          <h1
            className="font-['Rajdhani'] font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(1.6rem, 6vw, 3.8rem)' }}
          >
            KNOW WHERE YOUR TEAM IS
            <br />
            <span className="text-teal-400">AT ALL TIMES</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8 font-['Inter'] font-light px-4">
            Dual-interface system. Admins get a full-screen live command center.
            Officers get a mobile PWA with GPS tracking, face verification &
            geo-fence alerts.
          </p>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-center flex-wrap gap-5 sm:gap-8 mb-10 sm:mb-14"
        >
          {[
            { value: '5s', label: 'Update Interval', color: '#00d4aa' },
            { value: '24/7', label: 'Background GPS', color: '#60a5fa' },
            { value: '∞', label: 'Officers Supported', color: '#8b5cf6' },
            { value: '100%', label: 'Offline Ready', color: '#f59e0b' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="font-['JetBrains_Mono'] font-bold text-xl sm:text-2xl mb-0.5"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Portal Cards ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch max-w-2xl mx-auto px-2"
        >
          {/* Admin Portal */}
          <motion.div
            className="flex-1 cursor-pointer"
            onHoverStart={() => setHovered('admin')}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div
              onClick={onEnterAdmin}
              className={`h-full bg-[#0d1425] border rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all duration-300 text-left relative overflow-hidden flex flex-col ${hovered === 'admin' ? 'border-teal-500/40 shadow-[0_20px_60px_rgba(0,212,170,0.1)]' : 'border-[#1e2d4a]'}`}
            >
              <AnimatePresence>
                {hovered === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-teal-500/10 border border-teal-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield size={22} className="text-teal-400" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-teal-500/10 border border-teal-500/15 rounded-full">
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                      <span className="text-teal-400 text-[9px] sm:text-[10px] font-['Rajdhani'] font-bold tracking-widest">
                        ADMIN CONSOLE
                      </span>
                    </div>
                    <h3 className="font-['Rajdhani'] font-bold text-white text-base sm:text-xl tracking-wide mt-0.5">
                      Command Dashboard
                    </h3>
                  </div>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed font-['Inter'] font-light">
                  Full-screen live map with real-time officer tracking, approval
                  workflows, geo-fence management, and analytics.
                </p>
                <div className="space-y-2 mb-5 flex-1">
                  {[
                    { icon: Eye, text: 'Live map with face-photo markers' },
                    { icon: Users, text: 'Officer management & approvals' },
                    { icon: Bell, text: 'Real-time geo-fence alerts' },
                    { icon: BarChart3, text: 'Analytics & daily reports' },
                  ].map((f) => {
                    const Icon = f.icon
                    return (
                      <div key={f.text} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-teal-500/10 rounded-md flex items-center justify-center flex-shrink-0">
                          <Icon size={10} className="text-teal-400" />
                        </div>
                        <p className="text-slate-400 text-xs font-['Inter']">
                          {f.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <button className="w-full py-3 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-[#0a0f1e] font-['Rajdhani'] font-bold text-sm tracking-widest rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.3)]">
                  ENTER ADMIN DASHBOARD <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Officer Portal */}
          <motion.div
            className="flex-1 cursor-pointer"
            onHoverStart={() => setHovered('officer')}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div
              onClick={onEnterOfficer}
              className={`h-full bg-[#0d1425] border rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all duration-300 text-left relative overflow-hidden flex flex-col ${hovered === 'officer' ? 'border-blue-500/40 shadow-[0_20px_60px_rgba(96,165,250,0.08)]' : 'border-[#1e2d4a]'}`}
            >
              <AnimatePresence>
                {hovered === 'officer' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Navigation size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/15 rounded-full">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-400 text-[9px] sm:text-[10px] font-['Rajdhani'] font-bold tracking-widest">
                        OFFICER APP (PWA)
                      </span>
                    </div>
                    <h3 className="font-['Rajdhani'] font-bold text-white text-base sm:text-xl tracking-wide mt-0.5">
                      Field Officer App
                    </h3>
                  </div>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed font-['Inter'] font-light">
                  Mobile-first PWA with background GPS tracking, face identity
                  capture, and real-time status reporting.
                </p>
                <div className="space-y-2 mb-5 flex-1">
                  {[
                    { icon: Camera, text: 'Face capture & identity verify' },
                    {
                      icon: MapPin,
                      text: 'Continuous GPS background tracking',
                    },
                    { icon: AlertTriangle, text: 'Geo-fence boundary alerts' },
                    { icon: Clock, text: 'Approval-gated system access' },
                  ].map((f) => {
                    const Icon = f.icon
                    return (
                      <div key={f.text} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-blue-500/10 rounded-md flex items-center justify-center flex-shrink-0">
                          <Icon size={10} className="text-blue-400" />
                        </div>
                        <p className="text-slate-400 text-xs font-['Inter']">
                          {f.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-['Rajdhani'] font-bold text-sm tracking-widest rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2">
                  OPEN OFFICER APP <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Feature Strip ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 border-t border-white/5 px-4 sm:px-8 py-8 sm:py-10"
      >
        <p className="text-center text-slate-600 text-[10px] font-['Rajdhani'] tracking-widest uppercase mb-5">
          System Capabilities
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {[
            {
              icon: MapPin,
              title: 'Live GPS Tracking',
              desc: '5-second real-time updates with location history trails',
              color: '#00d4aa',
            },
            {
              icon: Camera,
              title: 'Face Verification',
              desc: 'Mandatory live front-camera selfie with face detection',
              color: '#60a5fa',
            },
            {
              icon: Shield,
              title: 'Geo-Fencing',
              desc: 'Custom boundary zones with instant violation alerts',
              color: '#8b5cf6',
            },
            {
              icon: Activity,
              title: 'Multi-Company',
              desc: 'Main Admin → Local Admin → Officer hierarchy',
              color: '#f59e0b',
            },
            {
              icon: Lock,
              title: 'Check In / Out',
              desc: 'Duty tracking with timestamped location logging',
              color: '#f97316',
            },
            {
              icon: Zap,
              title: 'In-App Messaging',
              desc: 'Text, voice, camera-only photo/video with GPS watermark',
              color: '#ec4899',
            },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-[#0d1425]/50 border border-white/5 rounded-xl sm:rounded-2xl"
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: f.color + '15',
                    border: `1px solid ${f.color}25`,
                  }}
                >
                  <Icon size={13} style={{ color: f.color }} />
                </div>
                <div>
                  <p className="text-white text-xs font-['Rajdhani'] font-bold mb-0.5">
                    {f.title}
                  </p>
                  <p className="text-slate-600 text-[10px] leading-relaxed hidden sm:block">
                    {f.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/5 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-slate-700 text-[10px] font-['JetBrains_Mono']">
          FIELDTRACK © {new Date().getFullYear()} — Marketing Officer Monitoring
          System
        </span>
        <div className="flex items-center gap-3">
          <span className="text-slate-700 text-[10px] font-['JetBrains_Mono']">
            Enterprise Grade · Offline Ready
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-500/5 border border-teal-500/10 rounded-full">
            <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-500/60 text-[10px] font-['JetBrains_Mono']">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
