'use client'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  MapPin,
  Navigation,
  Battery,
  Wifi,
  Clock,
  Activity,
  AlertTriangle,
  Eye,
  RotateCcw,
  TrendingUp,
} from 'lucide-react'
import type { OfficerMarker } from './LiveMap'

interface OfficerInfoPanelProps {
  officer: OfficerMarker | null
  onClose: () => void
  onTrackingToggle: (id: string, enabled: boolean) => void
}

export default function OfficerInfoPanel({
  officer,
  onClose,
  onTrackingToggle,
}: OfficerInfoPanelProps) {
  return (
    <AnimatePresence>
      {officer && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[520px] bg-[#0d1425]/95 backdrop-blur-xl border border-[#1e2d4a] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
        >
          {/* Gradient Header */}
          <div className="relative p-4 bg-gradient-to-r from-teal-500/10 to-blue-500/5 border-b border-[#1e2d4a]">
            {/* [CONTENT TRUNCATED FOR BREVITY] */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}