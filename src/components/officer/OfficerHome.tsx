'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  MapPin,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Clock,
  CheckCircle,
  Navigation,
  AlertTriangle,
  Shield,
  Activity,
  Zap,
  RefreshCw,
  Info,
} from 'lucide-react'
import {
  LocationTracker,
  type TrackingUpdate,
  type TrackingAlert,
} from '../../lib/locationTracker'
import { offlineQueue } from '../../lib/offlineQueue'

interface OfficerHomeProps {
  officerName: string
  officerId?: string
  facePhoto?: string
  checkInStatus: 'in' | 'out'
  onCheckInOut: (action: 'in' | 'out') => void
  onOpenSettings: () => void
}

export default function OfficerHome({
  officerName,
  officerId = 'demo-officer',
  facePhoto,
  checkInStatus,
  onCheckInOut,
}: OfficerHomeProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [tracking, setTracking] = useState<TrackingUpdate | null>(null)
  const [alerts, setAlerts] = useState<TrackingAlert[]>([])
  const [pendingSync, setPendingSync] = useState(0)
  const [now, setNow] = useState(new Date())
  const [trackingActive, setTrackingActive] = useState(false)
  const trackerRef = useRef<LocationTracker | null>(null)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Network status
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Offline queue count polling
  useEffect(() => {
    const poll = setInterval(async () => {
      const { pending } = await offlineQueue.getCount()
      setPendingSync(pending)
    }, 5000)
    return () => clearInterval(poll)
  }, [])

  // ── Tracking handlers ──────────────────────────────────────────────────
  const handleUpdate = useCallback((update: TrackingUpdate) => {
    setTracking(update)
    setLastSync(new Date())
  }, [])

  const handleAlert = useCallback((alert: TrackingAlert) => {
    setAlerts((prev) => [alert, ...prev.slice(0, 9)])
  }, [])

  const startTracking = useCallback(async () => {
    if (trackerRef.current?.running) return
    const tracker = new LocationTracker(officerId, handleUpdate, handleAlert)
    trackerRef.current = tracker
    await tracker.start()
    setTrackingActive(true)
  }, [officerId, handleUpdate, handleAlert])

  const stopTracking = useCallback(() => {
    trackerRef.current?.stop()
    setTrackingActive(false)
  }, [])

  useEffect(() => {
    if (checkInStatus === 'in') {
      void startTracking()
    } else {
      stopTracking()
    }
    return () => {
      trackerRef.current?.stop()
    }
  }, [checkInStatus, startTracking, stopTracking])

  // ── Check In / Out ─────────────────────────────────────────────────────
  const handleCheckIn = () => {
    onCheckInOut('in')
    void startTracking()
  }

  const handleCheckOut = () => {
    onCheckInOut('out')
    stopTracking()
  }

  // ── Battery color ─────────────────────────────────────────────────────
  const batteryLevel = tracking?.battery ?? null
  const batteryColor =
    batteryLevel === null
      ? '#64748b'
      : batteryLevel > 50
        ? '#00d4aa'
        : batteryLevel > 20
          ? '#f59e0b'
          : '#ef4444'

  const initials = officerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="h-full flex flex-col bg-[#0a0f1e] overflow-hidden"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-[#1e2d4a] flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl border-2 border-teal-500/30 overflow-hidden bg-[#0d1425] flex items-center justify-center flex-shrink-0">
          {facePhoto ? (
            <img
              src={facePhoto}
              className="w-full h-full object-cover"
              alt=""
            />
          ) : (
            <span className="text-teal-400 font-['Rajdhani'] font-bold text-lg">
              {initials}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-['Rajdhani'] font-bold text-base tracking-wide truncate">
            {officerName || 'Field Officer'}
          </p>
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-teal-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span
              className={`text-[10px] font-['JetBrains_Mono'] ${
                isOnline ? 'text-teal-400/70' : 'text-red-400/70'
              }`}
            >
              {isOnline ? 'CONNECTED' : 'OFFLINE MODE'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-['JetBrains_Mono'] text-base font-bold">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-slate-600 text-[10px] font-['JetBrains_Mono']">
            {now.toLocaleDateString('en-BD', {
              day: '2-digit',
              month: 'short',
            })}
          </p>
        </div>
      </div>

      {/* ── Scrollable Body ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-24">
        {/* ── BIG Status Card ─────────────────────────────────────── */}
        <motion.div
          animate={{
            borderColor:
              checkInStatus === 'in'
                ? trackingActive
                  ? [
                      'rgba(0,212,170,0.2)',
                      'rgba(0,212,170,0.5)',
                      'rgba(0,212,170,0.2)',
                    ]
                  : 'rgba(0,212,170,0.2)'
                : 'rgba(30,45,74,1)',
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="relative overflow-hidden rounded-3xl border bg-[#0d1425] p-6 text-center"
        >
          {/* Glow */}
          {checkInStatus === 'in' && trackingActive && (
            <div className="absolute inset-0 bg-teal-500/3 pointer-events-none" />
          )}

          <motion.div
            animate={
              checkInStatus === 'in' && trackingActive
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(0,212,170,0)',
                      '0 0 60px 0 rgba(0,212,170,0.15)',
                      '0 0 0 0 rgba(0,212,170,0)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 3, repeat: Infinity }}
            className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mx-auto mb-4 ${
              checkInStatus === 'in' && trackingActive
                ? 'bg-teal-500/10 border-teal-500/50'
                : checkInStatus === 'in'
                  ? 'bg-teal-500/5 border-teal-500/30'
                  : 'bg-[#1e2d4a] border-[#2a3d5a]'
            }`}
          >
            {checkInStatus === 'in' && trackingActive ? (
              <Navigation size={36} className="text-teal-400" />
            ) : checkInStatus === 'in' ? (
              <Activity size={36} className="text-teal-400/60" />
            ) : (
              <MapPin size={36} className="text-slate-600" />
            )}
          </motion.div>

          <h2
            className={`font-['Rajdhani'] font-bold text-2xl tracking-widest mb-1 ${
              checkInStatus === 'in' && trackingActive
                ? 'text-teal-400'
                : checkInStatus === 'in'
                  ? 'text-teal-400/70'
                  : 'text-slate-500'
            }`}
          >
            {checkInStatus === 'in' && trackingActive
              ? 'TRACKING ACTIVE'
              : checkInStatus === 'in'
                ? 'CHECKED IN'
                : 'NOT CHECKED IN'}
          </h2>
          <p className="text-slate-500 text-[12px] font-['Rajdhani']">
            {checkInStatus === 'in' && trackingActive
              ? 'Your location is being shared in real-time'
              : checkInStatus === 'in'
                ? 'Awaiting GPS signal...'
                : 'Press CHECK IN to start your shift'}
          </p>

          {/* Live coords */}
          {tracking && checkInStatus === 'in' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-teal-400/70 text-[10px] font-['JetBrains_Mono']">
                {tracking.lat.toFixed(5)}, {tracking.lng.toFixed(5)}
              </span>
              {tracking.isMock && (
                <span className="text-red-400 text-[10px] font-['Rajdhani'] font-bold">
                  ⚠ MOCK DETECTED
                </span>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* ── Check In / Out Button ─────────────────────────────── */}
        <div className="flex gap-3">
          {checkInStatus !== 'in' ? (
            <motion.button
              onClick={handleCheckIn}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-4 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(0,212,170,0.35)] flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> CHECK IN
            </motion.button>
          ) : (
            <motion.button
              onClick={handleCheckOut}
              whileTap={{ scale: 0.96 }}
              className="flex-1 py-4 bg-red-500/80 hover:bg-red-500 text-white font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Shield size={18} /> CHECK OUT
            </motion.button>
          )}
        </div>

        {/* ── Stats Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Network */}
          <StatCard
            label={isOnline ? 'Online' : 'Offline'}
            value={isOnline ? 'Connected' : 'No Signal'}
            icon={isOnline ? Wifi : WifiOff}
            color={isOnline ? '#00d4aa' : '#ef4444'}
            sub={pendingSync > 0 ? `${pendingSync} pings queued` : 'All synced'}
          />
          {/* Battery */}
          <StatCard
            label="Battery"
            value={batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}
            icon={
              batteryLevel !== null && batteryLevel < 20 ? BatteryLow : Battery
            }
            color={batteryColor}
            sub={
              batteryLevel !== null && batteryLevel < 20
                ? 'Please charge!'
                : 'Normal'
            }
          />
          {/* Accuracy */}
          <StatCard
            label="GPS Accuracy"
            value={
              tracking ? `±${Math.round(tracking.accuracy)}m` : 'Waiting...'
            }
            icon={Navigation}
            color="#60a5fa"
            sub={
              tracking?.accuracy
                ? tracking.accuracy < 10
                  ? 'High accuracy'
                  : tracking.accuracy < 50
                    ? 'Medium'
                    : 'Low accuracy'
                : '—'
            }
          />
          {/* Last Sync */}
          <StatCard
            label="Last Sync"
            value={
              lastSync
                ? lastSync.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : '—'
            }
            icon={Clock}
            color="#f59e0b"
            sub={pendingSync > 0 ? 'Offline data queued' : 'Up to date'}
          />
        </div>

        {/* Offline banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 flex items-start gap-3"
            >
              <WifiOff
                size={16}
                className="text-amber-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-amber-300 text-sm font-['Rajdhani'] font-bold">
                  OFFLINE MODE ACTIVE
                </p>
                <p className="text-amber-400/70 text-[11px] font-['Rajdhani'] mt-0.5">
                  GPS coordinates are being saved locally. They will
                  automatically sync to the server when internet is restored.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mock location warning */}
        <AnimatePresence>
          {tracking?.isMock && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-start gap-3"
            >
              <AlertTriangle
                size={16}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-red-300 text-sm font-['Rajdhani'] font-bold">
                  MOCK LOCATION DETECTED
                </p>
                <p className="text-red-400/70 text-[11px] font-['Rajdhani'] mt-0.5">
                  Suspicious GPS data detected. This violation has been logged
                  and reported to your admin.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pending Sync Indicator ──────────────────────────── */}
        {pendingSync > 0 && (
          <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={14} className="text-amber-400 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-amber-300 text-sm font-['Rajdhani'] font-semibold">
                {pendingSync} Location Pings Queued
              </p>
              <p className="text-slate-500 text-[11px] font-['Rajdhani']">
                Will sync automatically when connected
              </p>
            </div>
          </div>
        )}

        {/* ── Recent Alerts ─────────────────────────────────── */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-teal-400" />
              <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wider">
                System Alerts
              </p>
            </div>
            {alerts.slice(0, 3).map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  alert.type === 'mock_location'
                    ? 'bg-red-500/10 border-red-500/20'
                    : alert.type === 'battery_low'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-[#0d1425] border-[#1e2d4a]'
                }`}
              >
                <Info
                  size={13}
                  className={
                    alert.type === 'mock_location'
                      ? 'text-red-400'
                      : alert.type === 'battery_low'
                        ? 'text-amber-400'
                        : 'text-slate-500'
                  }
                />
                <p className="text-slate-300 text-[11px] font-['Rajdhani'] flex-1">
                  {alert.message}
                </p>
                <span className="text-slate-600 text-[9px] font-['JetBrains_Mono'] flex-shrink-0">
                  {new Date(alert.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Speed if moving */}
        {tracking && tracking.speed !== null && tracking.speed > 1 && (
          <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation size={14} className="text-teal-400" />
              <span className="text-slate-400 text-sm font-['Rajdhani']">
                Current Speed
              </span>
            </div>
            <span className="text-teal-400 font-['JetBrains_Mono'] font-bold text-sm">
              {(tracking.speed * 3.6).toFixed(1)} km/h
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Reusable Stat Card ────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: string
  icon: typeof MapPin
  color: string
  sub?: string
}) {
  return (
    <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color }} />
        <span className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className="text-white font-['Rajdhani'] font-bold text-lg"
        style={{ color }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-slate-600 text-[10px] font-['Rajdhani'] mt-0.5">
          {sub}
        </p>
      )}
    </div>
  )
}
