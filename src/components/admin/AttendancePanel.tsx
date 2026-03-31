'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit3,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  MapPin,
} from 'lucide-react'
import type { OfficerMarker } from './LiveMap'

interface AttendanceRecord {
  officerId: string
  officerName: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'present' | 'absent' | 'late' | 'auto_absent'
  distanceKm: number
  activeMinutes: number
  locationPings: number
  adminOverride: boolean
  overrideReason: string | null
  phone?: string
}

interface AttendancePanelProps {
  officers: OfficerMarker[]
  onShowToast: (msg: string, type: 'success' | 'error' | 'warning') => void
}

function buildTodayAttendance(officers: OfficerMarker[]): AttendanceRecord[] {
  const today = new Date().toISOString().slice(0, 10)
  return officers.map((o) => ({
    officerId: o.id,
    officerName: o.name,
    date: today,
    checkIn:
      o.checkInStatus === 'in' || o.status !== 'offline'
        ? '08:' + String(Math.floor(Math.random() * 59)).padStart(2, '0')
        : null,
    checkOut:
      o.checkInStatus === 'out' && o.status === 'offline'
        ? '17:' + String(Math.floor(Math.random() * 59)).padStart(2, '0')
        : null,
    status:
      o.status === 'offline' && o.checkInStatus === 'out'
        ? 'absent'
        : o.status === 'online'
          ? 'present'
          : o.status === 'idle'
            ? 'late'
            : 'auto_absent',
    distanceKm:
      o.status !== 'offline' ? parseFloat((Math.random() * 25).toFixed(1)) : 0,
    activeMinutes:
      o.status !== 'offline' ? Math.floor(Math.random() * 300 + 60) : 0,
    locationPings:
      o.status !== 'offline' ? Math.floor(Math.random() * 500 + 100) : 0,
    adminOverride: false,
    overrideReason: null,
    phone: (o as OfficerMarker & { phone?: string }).phone,
  }))
}

const STATUS_CONFIG = {
  present: {
    label: 'Present',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    icon: CheckCircle,
  },
  absent: {
    label: 'Absent',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle,
  },
  late: {
    label: 'Late',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  auto_absent: {
    label: 'Auto-Absent',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: AlertTriangle,
  },
}

export default function AttendancePanel({
  officers,
  onShowToast,
}: AttendancePanelProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    buildTodayAttendance(officers),
  )
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'present' | 'absent' | 'late' | 'auto_absent'
  >('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [overrideStatus, setOverrideStatus] =
    useState<AttendanceRecord['status']>('present')
  const [overrideReason, setOverrideReason] = useState('')
  const [viewDate] = useState(new Date().toISOString().slice(0, 10))

  const filtered = records.filter((r) => {
    const matchName = r.officerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchName && matchStatus
  })

  const counts = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    auto_absent: records.filter((r) => r.status === 'auto_absent').length,
  }

  const handleOverride = (officerId: string) => {
    if (!overrideReason.trim()) {
      onShowToast('Reason is required for attendance override', 'error')
      return
    }
    setRecords((prev) =>
      prev.map((r) =>
        r.officerId === officerId
          ? {
              ...r,
              status: overrideStatus,
              adminOverride: true,
              overrideReason: overrideReason.trim(),
            }
          : r,
      ),
    )
    setEditingId(null)
    setOverrideReason('')
    onShowToast('Attendance record updated', 'success')
  }

  const exportCSV = () => {
    const header =
      'Name,Phone,Date,Status,Check In,Check Out,Distance (km),Active Minutes,Admin Override,Reason'
    const rows = records.map((r) =>
      [
        r.officerName,
        r.phone ?? '',
        r.date,
        r.status,
        r.checkIn ?? '',
        r.checkOut ?? '',
        r.distanceKm,
        r.activeMinutes,
        r.adminOverride,
        r.overrideReason ?? '',
      ].join(','),
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${viewDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onShowToast('Attendance exported as CSV', 'success')
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[#1e2d4a] bg-[#080e1c]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ClipboardList size={18} className="text-teal-400" />
            <div>
              <h2 className="text-white font-['Rajdhani'] font-bold text-xl tracking-wide">
                ATTENDANCE
              </h2>
              <p className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                {new Date(viewDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-400 rounded-xl text-xs font-['Rajdhani'] font-semibold tracking-wide transition-colors"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(
            (key) => {
              const cfg = STATUS_CONFIG[key]
              const Icon = cfg.icon
              return (
                <button
                  key={key}
                  onClick={() =>
                    setFilterStatus(filterStatus === key ? 'all' : key)
                  }
                  className={`rounded-2xl px-3 py-2.5 border transition-all text-left ${
                    filterStatus === key
                      ? `${cfg.bg} ${cfg.border}`
                      : 'bg-[#0d1425] border-[#1e2d4a] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={11} className={cfg.color} />
                    <span
                      className={`text-[10px] font-['Rajdhani'] uppercase tracking-wider ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p
                    className={`text-xl font-['Rajdhani'] font-bold ${cfg.color}`}
                  >
                    {counts[key]}
                  </p>
                </button>
              )
            },
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search officer..."
              className="w-full bg-[#0d1425] border border-[#1e2d4a] rounded-xl pl-9 pr-4 py-2 text-white text-sm font-['Rajdhani'] focus:outline-none focus:border-teal-500/40 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-['Rajdhani']">
            <Filter size={12} />
            <span>{filtered.length} records</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-['Rajdhani']">
            <Calendar size={12} />
            <span>{viewDate}</span>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {filtered.map((record, i) => {
            const cfg = STATUS_CONFIG[record.status]
            const StatusIcon = cfg.icon
            const isEditing = editingId === record.officerId

            return (
              <motion.div
                key={record.officerId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-[#0d1425] border rounded-2xl overflow-hidden ${
                  isEditing ? 'border-teal-500/30' : 'border-[#1e2d4a]'
                }`}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[#1e2d4a] flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-slate-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-['Rajdhani'] font-semibold text-sm truncate">
                        {record.officerName}
                      </p>
                      {record.adminOverride && (
                        <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-['Rajdhani'] font-bold">
                          ADMIN EDIT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {record.phone && (
                        <span className="text-slate-600 text-[10px] font-['JetBrains_Mono']">
                          📱 {record.phone}
                        </span>
                      )}
                      {record.checkIn && (
                        <span className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                          IN: {record.checkIn}
                        </span>
                      )}
                      {record.checkOut && (
                        <span className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                          OUT: {record.checkOut}
                        </span>
                      )}
                    </div>
                    {record.overrideReason && (
                      <p className="text-blue-400/70 text-[10px] font-['Rajdhani'] mt-0.5 italic">
                        "{record.overrideReason}"
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                    <StatPill icon={MapPin} label={`${record.distanceKm} km`} />
                    <StatPill
                      icon={Clock}
                      label={`${record.activeMinutes}min`}
                    />
                  </div>

                  {/* Status + Edit */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-['Rajdhani'] font-bold ${cfg.bg} ${cfg.border} ${cfg.color}`}
                    >
                      <StatusIcon size={10} />
                      {cfg.label}
                    </div>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null)
                        } else {
                          setEditingId(record.officerId)
                          setOverrideStatus(record.status)
                          setOverrideReason('')
                        }
                      }}
                      className="w-8 h-8 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-500 hover:text-teal-400 transition-colors"
                      title="Override attendance"
                    >
                      <Edit3 size={12} />
                    </button>
                  </div>
                </div>

                {/* Override panel */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-[#1e2d4a]"
                    >
                      <div className="px-4 pb-4 pt-3 space-y-3">
                        <p className="text-slate-400 text-[11px] font-['Rajdhani'] uppercase tracking-wider flex items-center gap-1.5">
                          <Edit3 size={10} />
                          Admin Override — Attendance Record
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {(
                            Object.keys(
                              STATUS_CONFIG,
                            ) as AttendanceRecord['status'][]
                          ).map((s) => {
                            const c = STATUS_CONFIG[s]
                            return (
                              <button
                                key={s}
                                onClick={() => setOverrideStatus(s)}
                                className={`px-3 py-1.5 rounded-xl border text-[11px] font-['Rajdhani'] font-bold transition-all ${
                                  overrideStatus === s
                                    ? `${c.bg} ${c.border} ${c.color}`
                                    : 'bg-[#0a0f1e] border-[#1e2d4a] text-slate-500'
                                }`}
                              >
                                {c.label}
                              </button>
                            )
                          })}
                        </div>
                        <div>
                          <label className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] block mb-1.5">
                            Reason (Required)
                          </label>
                          <input
                            type="text"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="e.g. Medical leave confirmed, Official duty..."
                            className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none focus:border-teal-500/50 placeholder-slate-700"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 py-2.5 bg-[#1e2d4a] border border-[#2a3a5a] text-slate-400 rounded-xl text-xs font-['Rajdhani'] font-bold tracking-wide hover:border-slate-500/50 transition-colors"
                          >
                            CANCEL
                          </button>
                          <button
                            onClick={() => handleOverride(record.officerId)}
                            disabled={!overrideReason.trim()}
                            className="flex-[2] py-2.5 bg-teal-500 disabled:opacity-40 hover:bg-teal-400 text-[#0a0f1e] rounded-xl text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle size={12} /> SAVE OVERRIDE
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600 font-['Rajdhani']">
            No records found
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({
  icon: Icon,
  label,
}: {
  icon: typeof MapPin
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={10} className="text-slate-600" />
      <span className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
        {label}
      </span>
    </div>
  )
}
