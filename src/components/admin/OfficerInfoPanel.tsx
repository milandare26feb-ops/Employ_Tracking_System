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
            <div className="flex items-start gap-4">
              {/* Face Photo */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-16 h-16 rounded-2xl border-2 overflow-hidden ${
                    officer.status === 'online'
                      ? 'border-teal-400 shadow-[0_0_20px_rgba(0,212,170,0.3)]'
                      : officer.status === 'idle'
                        ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'border-slate-600'
                  }`}
                >
                  {officer.facePhoto ? (
                    <img
                      src={officer.facePhoto}
                      className="w-full h-full object-cover"
                      alt={officer.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-900/50 to-blue-900/50">
                      <span className="font-['Rajdhani'] font-bold text-2xl text-teal-400">
                        {officer.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0d1425] flex items-center justify-center ${
                    officer.status === 'online'
                      ? 'bg-teal-400'
                      : officer.status === 'idle'
                        ? 'bg-amber-400'
                        : 'bg-slate-600'
                  }`}
                >
                  {officer.status === 'online' ? (
                    <Activity size={10} className="text-[#0a0f1e]" />
                  ) : officer.status === 'idle' ? (
                    <Clock size={10} className="text-[#0a0f1e]" />
                  ) : (
                    <Wifi size={10} className="text-slate-900" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-['Rajdhani'] font-bold text-lg leading-none">
                    {officer.name}
                  </h3>
                  <span
                    className={`text-[10px] font-['JetBrains_Mono'] font-semibold px-2 py-0.5 rounded-full ${
                      officer.status === 'online'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : officer.status === 'idle'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}
                  >
                    {officer.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
                  <MapPin size={11} className="text-teal-500" />
                  <span className="font-['JetBrains_Mono'] text-[11px]">
                    {officer.lat.toFixed(5)}, {officer.lng.toFixed(5)}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] truncate">
                  {officer.address || 'Location updating...'}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-0 border-b border-[#1e2d4a]">
            {[
              {
                label: 'Speed',
                value: `${officer.speed.toFixed(1)}`,
                unit: 'km/h',
                icon: Navigation,
                color: '#00d4aa',
              },
              {
                label: 'Battery',
                value: `${officer.battery}`,
                unit: '%',
                icon: Battery,
                color:
                  officer.battery > 50
                    ? '#00d4aa'
                    : officer.battery > 20
                      ? '#f59e0b'
                      : '#ef4444',
              },
              {
                label: 'Last Sync',
                value: officer.lastSeen,
                unit: '',
                icon: Clock,
                color: '#60a5fa',
              },
              {
                label: 'Signal',
                value: 'Strong',
                unit: '',
                icon: Activity,
                color: '#00d4aa',
              },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`p-3 flex flex-col items-center ${i < 3 ? 'border-r border-[#1e2d4a]' : ''}`}
                >
                  <Icon
                    size={14}
                    style={{ color: stat.color }}
                    className="mb-1"
                  />
                  <span
                    className="font-['JetBrains_Mono'] font-bold text-sm"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-slate-600 text-[9px] font-['Rajdhani']">
                      {stat.unit}
                    </span>
                  )}
                  <span className="text-slate-500 text-[10px] mt-0.5 font-['Rajdhani']">
                    {stat.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Today's Activity */}
          <div className="px-4 py-3 border-b border-[#1e2d4a]">
            <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-widest mb-2">
              Today's Activity
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Distance',
                  value: `${(Math.random() * 30 + 5).toFixed(1)} km`,
                  color: '#8b5cf6',
                },
                {
                  label: 'Active Time',
                  value: `${Math.floor(Math.random() * 6 + 2)}h ${Math.floor(Math.random() * 60)}m`,
                  color: '#00d4aa',
                },
                {
                  label: 'Stops',
                  value: `${Math.floor(Math.random() * 8 + 2)}`,
                  color: '#f59e0b',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#0a0f1e] rounded-xl p-2.5 text-center"
                >
                  <p
                    className="font-['JetBrains_Mono'] font-bold text-sm"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                  <p className="text-slate-600 text-[10px] font-['Rajdhani'] mt-0.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 text-xs font-['Rajdhani'] font-semibold tracking-wide hover:bg-teal-500/20 transition-colors">
              <Eye size={12} /> TRACK LIVE
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-['Rajdhani'] font-semibold tracking-wide hover:bg-blue-500/20 transition-colors">
              <RotateCcw size={12} /> HISTORY
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-['Rajdhani'] font-semibold tracking-wide hover:bg-purple-500/20 transition-colors">
              <TrendingUp size={12} /> ANALYTICS
            </button>
            <button
              onClick={() => onTrackingToggle(officer.id, false)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-['Rajdhani'] font-semibold tracking-wide hover:bg-red-500/20 transition-colors"
            >
              <AlertTriangle size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
