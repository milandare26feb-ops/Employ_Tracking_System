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

  // Tracking handlers
  const handleUpdate = useCallback((update: TrackingUpdate) => {
    setTracking(update)
    setLastSync(new Date())
  }, [])

  const handleAlert = useCallback((alert: TrackingAlert) => {
    setAlerts((prev) => [alert, ...prev.slice(0, 9)])
  }, [])

  return (
    <div
      className="h-full flex flex-col bg-[#0a0f1e] overflow-hidden"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      {/* Header placeholder */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-[#1e2d4a] flex-shrink-0">
        <p className="text-white font-['Rajdhani'] font-bold text-base tracking-wide truncate">
          {officerName || 'Field Officer'}
        </p>
      </div>
    </div>
  )
}