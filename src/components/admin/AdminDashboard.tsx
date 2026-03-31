'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import LiveMap, { type OfficerMarker, type GeoFence } from './LiveMap'
import OfficerSidebar, {
  type PendingApproval,
  type AnalyticsSummary,
} from './OfficerSidebar'
import AdminTopBar, { type Alert } from './AdminTopBar'
import TeamsCompaniesPanel, {
  type Company,
  type Team,
  type LocalAdmin,
} from './TeamsCompaniesPanel'
import ProfileSidebar from '../shared/ProfileSidebar'
import MessengerPanel, { type Message } from '../shared/MessengerPanel'
import AdminLogin from './AdminLogin'
import AttendancePanel from './AttendancePanel'
import {
  AlertTriangle,
  MapPin,
  MessageSquare,
  Building2,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  BarChart3,
  ClipboardList,
  Volume2,
  VolumeX,
  LayoutDashboard,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  ArrowRight,
  Menu,
  X,
  FileText,
  Trash2,
  Download,
  Battery,
  Eye,
  Target,
} from 'lucide-react'

// ── Demo data ─────────────────────────────────────────────────────────────────

function generateOfficers(): OfficerMarker[] {
  const names = [
    'Ahmad Farhan',
    'Nurul Hana',
    'Rizwan Malik',
    'Siti Zara',
    'Kevin Lim',
    'Priya Nair',
    'Hafiz Rahim',
    'Mei Lin',
  ]
  const statuses: ('online' | 'idle' | 'offline')[] = [
    'online',
    'online',
    'online',
    'idle',
    'online',
    'offline',
    'idle',
    'online',
  ]
  const baseCoords = [
    [3.139, 101.6869],
    [3.1569, 101.7123],
    [3.12, 101.665],
    [3.105, 101.695],
    [3.17, 101.73],
    [3.09, 101.65],
    [3.145, 101.675],
    [3.13, 101.71],
  ]
  const addresses = [
    'Jalan Bukit Bintang, KL',
    'Jalan Ampang, KL',
    'Bangsar, KL',
    'Chow Kit, KL',
    'KLCC Area, KL',
    'Kepong, KL',
    'Damansara, PJ',
    'Sunway, PJ',
  ]
  const phones = [
    '01712345678',
    '01812345678',
    '01312345678',
    '01612345678',
    '01912345678',
    '01512345678',
    '01412345678',
    '01712345679',
  ]
  const teamIds = [
    'team-1',
    'team-1',
    'team-2',
    'team-2',
    'team-3',
    'team-3',
    'team-1',
    'team-2',
  ]
  const assignedZoneIds = [
    'gf1',
    'gf1',
    'gf2',
    undefined,
    'gf1',
    undefined,
    'gf2',
    'gf3',
  ]
  const checkInTimes = [
    '08:32 AM',
    '08:45 AM',
    '09:01 AM',
    '08:58 AM',
    '09:15 AM',
    null,
    '08:22 AM',
    '09:30 AM',
  ]
  return names.map((name, i) => ({
    id: `officer-${i + 1}`,
    name,
    lat: (baseCoords[i]![0] as number) + (Math.random() - 0.5) * 0.01,
    lng: (baseCoords[i]![1] as number) + (Math.random() - 0.5) * 0.01,
    status: statuses[i]!,
    lastSeen: statuses[i] === 'offline' ? '8m ago' : 'Just now',
    speed: statuses[i] === 'online' ? Math.random() * 60 : 0,
    battery: Math.floor(Math.random() * 60 + 30),
    address: addresses[i],
    phone: phones[i],
    teamId: teamIds[i],
    assignedZoneId: assignedZoneIds[i],
    checkInStatus:
      statuses[i] !== 'offline' ? ('in' as const) : ('out' as const),
    checkInTime: checkInTimes[i] ?? undefined,
  }))
}

const DEFAULT_GEOFENCES: GeoFence[] = [
  {
    id: 'gf1',
    name: 'KL City Centre',
    lat: 3.139,
    lng: 101.6869,
    radius: 3000,
    color: '#00d4aa',
    assignedOfficerIds: ['officer-1', 'officer-2', 'officer-5'],
  },
  {
    id: 'gf2',
    name: 'Petaling Jaya',
    lat: 3.1073,
    lng: 101.6067,
    radius: 2500,
    color: '#f59e0b',
    assignedOfficerIds: ['officer-3', 'officer-7'],
  },
  {
    id: 'gf3',
    name: 'Subang Jaya',
    lat: 3.057,
    lng: 101.5851,
    radius: 2000,
    color: '#8b5cf6',
    assignedOfficerIds: ['officer-8'],
  },
]

const DEMO_COMPANIES: Company[] = [
  {
    id: 'co-1',
    name: 'Acme Malaysia Sdn Bhd',
    description: 'Primary client',
    plan: 'enterprise',
    isActive: true,
    teamCount: 2,
    officerCount: 5,
    createdAt: '2025-01-01',
  },
  {
    id: 'co-2',
    name: 'SwiftSales Co.',
    description: 'Regional partner',
    plan: 'pro',
    isActive: true,
    teamCount: 1,
    officerCount: 3,
    createdAt: '2025-02-01',
  },
]

const DEMO_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Alpha Sales',
    companyId: 'co-1',
    companyName: 'Acme Malaysia',
    description: 'KL region',
    color: '#00d4aa',
    localAdminId: 'la-1',
    localAdminName: 'Hassan Ali',
    officerCount: 3,
    isActive: true,
  },
  {
    id: 'team-2',
    name: 'Beta Marketing',
    companyId: 'co-1',
    companyName: 'Acme Malaysia',
    description: 'PJ region',
    color: '#60a5fa',
    localAdminId: null,
    localAdminName: null,
    officerCount: 2,
    isActive: true,
  },
  {
    id: 'team-3',
    name: 'Field Ops',
    companyId: 'co-2',
    companyName: 'SwiftSales Co.',
    description: 'Subang region',
    color: '#f59e0b',
    localAdminId: 'la-2',
    localAdminName: 'Diana Lim',
    officerCount: 2,
    isActive: true,
  },
]

const DEMO_LOCAL_ADMINS: LocalAdmin[] = [
  {
    id: 'la-1',
    name: 'Hassan Ali',
    email: 'hassan@acme.com',
    teamId: 'team-1',
    teamName: 'Alpha Sales',
    companyId: 'co-1',
    status: 'approved',
    officerCount: 3,
  },
  {
    id: 'la-2',
    name: 'Diana Lim',
    email: 'diana@swift.com',
    teamId: 'team-3',
    teamName: 'Field Ops',
    companyId: 'co-2',
    status: 'approved',
    officerCount: 2,
  },
]

const INITIAL_APPROVALS: PendingApproval[] = [
  {
    id: 'ap1',
    name: 'Danial Azri',
    email: 'danial@company.com',
    submittedAt: '2 min ago',
    phone: '01712345678',
    department: 'Sales Team A',
    cvFileName: 'danial_azri_cv.pdf',
  },
  {
    id: 'ap2',
    name: 'Wan Farah',
    email: 'farah@company.com',
    submittedAt: '15 min ago',
    phone: '01812345678',
    department: 'Marketing B',
    cvFileName: 'wan_farah_resume.pdf',
  },
  {
    id: 'ap3',
    name: 'Reza Maulana',
    email: 'reza@company.com',
    submittedAt: '32 min ago',
    phone: '01912345678',
    department: 'Field Ops',
    cvFileName: 'reza_maulana_cv.docx',
  },
]

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'al1',
    type: 'geofence',
    message: 'Ahmad Farhan exited KL City Centre',
    officer: 'Ahmad Farhan',
    time: '1 min ago',
    read: false,
  },
  {
    id: 'al2',
    type: 'inactivity',
    message: 'Siti Zara idle for 15 minutes',
    officer: 'Siti Zara',
    time: '5 min ago',
    read: false,
  },
  {
    id: 'al3',
    type: 'approval',
    message: 'New registration: Danial Azri (01712345678)',
    officer: 'Danial Azri',
    time: '8 min ago',
    read: true,
  },
  {
    id: 'al4',
    type: 'geofence',
    message: 'Rizwan Malik entered Petaling Jaya zone',
    officer: 'Rizwan Malik',
    time: '12 min ago',
    read: true,
  },
]

const DEMO_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'officer-1',
    senderName: 'Ahmad Farhan',
    type: 'text',
    content: 'Reached the client site',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    isMine: false,
  },
  {
    id: 'm2',
    senderId: 'admin',
    senderName: 'Main Admin',
    type: 'text',
    content: 'Good work. Proceed with the presentation.',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    isMine: true,
  },
  {
    id: 'm3',
    senderId: 'officer-2',
    senderName: 'Nurul Hana',
    type: 'text',
    content: 'Traffic jam on Ampang. Running 10 min late.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    isMine: false,
  },
]

type NavTab =
  | 'dashboard'
  | 'requests'
  | 'map'
  | 'officers'
  | 'teams'
  | 'attendance'
  | 'analytics'
  | 'messages'
  | 'settings'

type ModalType =
  | 'total-officers'
  | 'active-now'
  | 'checked-in'
  | 'pending-access'
  | 'companies'
  | 'teams'
  | 'unread-alerts'
  | 'km-today'
  | null

const INACTIVITY_ALERT_MS = 2 * 60 * 1000

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({
  type,
  officers,
  teams,
  companies,
  alerts,
  pendingApprovals,
  geoFences,
  onClose,
  onMarkAlertsRead,
  onNavigate,
  onApprove,
  onReject,
  onRemove,
  onAssignOfficerToZone,
  showToast,
}: {
  type: ModalType
  officers: OfficerMarker[]
  teams: Team[]
  companies: Company[]
  alerts: Alert[]
  pendingApprovals: PendingApproval[]
  geoFences: GeoFence[]
  onClose: () => void
  onMarkAlertsRead: () => void
  onNavigate: (tab: NavTab) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onRemove: (id: string) => void
  onAssignOfficerToZone: (officerId: string, zoneId: string | null) => void
  showToast: (text: string, type: 'success' | 'error' | 'warning') => void
}) {
  const [assigningOfficer, setAssigningOfficer] =
    useState<OfficerMarker | null>(null)

  if (!type) return null

  const statusDot = (status: string) =>
    status === 'online'
      ? 'bg-teal-400'
      : status === 'idle'
        ? 'bg-amber-400'
        : 'bg-slate-600'

  const batteryColor = (b: number) =>
    b > 60 ? '#10b981' : b > 30 ? '#f59e0b' : '#ef4444'

  const getTitle = () => {
    if (type === 'total-officers') return 'All Officers'
    if (type === 'active-now') return 'Active Officers'
    if (type === 'checked-in') return 'Checked In Officers'
    if (type === 'pending-access') return 'Pending Access Requests'
    if (type === 'companies') return 'Companies'
    if (type === 'teams') return 'Active Teams'
    if (type === 'unread-alerts') return 'Unread Alerts'
    if (type === 'km-today') return 'KM Report — Today'
    return ''
  }

  const activeOfficers = officers.filter((o) => o.status === 'online')
  const checkedInOfficers = officers.filter((o) => o.checkInStatus === 'in')
  const unreadAlerts = alerts.filter((a) => !a.read)

  const displayOfficers =
    type === 'total-officers'
      ? officers
      : type === 'active-now'
        ? activeOfficers
        : type === 'checked-in'
          ? checkedInOfficers
          : []

  const alertTypeConfig: Record<string, { color: string; label: string }> = {
    geofence: { color: '#f59e0b', label: 'GEO-FENCE' },
    inactivity: { color: '#60a5fa', label: 'INACTIVITY' },
    approval: { color: '#00d4aa', label: 'APPROVAL' },
    system: { color: '#ef4444', label: 'SYSTEM' },
  }

  return (
    <AnimatePresence>
      {/* Zone assignment sub-modal */}
      <AnimatePresence>
        {assigningOfficer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAssigningOfficer(null)}
            className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#0d1425] border border-[#1e2d4a] rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="h-1 bg-gradient-to-r from-teal-500 to-blue-500" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center">
                      <Target size={15} className="text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-['Rajdhani'] font-bold text-sm tracking-wide">
                        Assign Work Zone
                      </h3>
                      <p className="text-slate-500 text-[10px] font-['Rajdhani']">
                        {assigningOfficer.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssigningOfficer(null)}
                    className="w-7 h-7 rounded-lg bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {geoFences.map((fence) => {
                    const isAssigned =
                      assigningOfficer.assignedZoneId === fence.id
                    const count = fence.assignedOfficerIds?.length ?? 0
                    return (
                      <button
                        key={fence.id}
                        onClick={() => {
                          onAssignOfficerToZone(
                            assigningOfficer.id,
                            isAssigned ? null : fence.id,
                          )
                          showToast(
                            isAssigned
                              ? `${assigningOfficer.name} removed from zone`
                              : `${assigningOfficer.name} assigned to ${fence.name}`,
                            isAssigned ? 'warning' : 'success',
                          )
                          setAssigningOfficer(null)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${isAssigned ? 'bg-teal-500/10 border-teal-500/40' : 'bg-[#080e1c] border-[#1e2d4a] hover:border-[#2a3a5a]'}`}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: fence.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-['Rajdhani'] font-semibold">
                            {fence.name}
                          </p>
                          <p className="text-slate-500 text-[9px] font-['JetBrains_Mono']">
                            r={(fence.radius / 1000).toFixed(1)}km · {count}{' '}
                            assigned
                          </p>
                        </div>
                        {isAssigned && (
                          <span className="text-[9px] text-teal-400 font-['Rajdhani'] font-bold">
                            ✓ ASSIGNED
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {assigningOfficer.assignedZoneId && (
                  <button
                    onClick={() => {
                      onAssignOfficerToZone(assigningOfficer.id, null)
                      showToast(
                        `${assigningOfficer.name} removed from zone`,
                        'warning',
                      )
                      setAssigningOfficer(null)
                    }}
                    className="w-full mt-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-red-400 text-xs font-['Rajdhani'] font-bold transition-colors"
                  >
                    Remove Zone Assignment
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] bg-[#0d1425] border border-[#1e2d4a] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d4a] bg-[#080e1c] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-teal-400 rounded-full" />
              <h2 className="text-white font-['Rajdhani'] font-bold text-lg tracking-wide">
                {getTitle()}
              </h2>
              {(type === 'active-now' ||
                type === 'total-officers' ||
                type === 'checked-in') && (
                <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-xs font-['JetBrains_Mono'] font-bold">
                  {displayOfficers.length}
                </span>
              )}
              {type === 'unread-alerts' && (
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-['JetBrains_Mono'] font-bold">
                  {unreadAlerts.length} new
                </span>
              )}
              {type === 'pending-access' && pendingApprovals.length > 0 && (
                <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-['JetBrains_Mono'] font-bold">
                  {pendingApprovals.length} pending
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {type === 'unread-alerts' && unreadAlerts.length > 0 && (
                <button
                  onClick={onMarkAlertsRead}
                  className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 rounded-xl text-teal-400 text-xs font-['Rajdhani'] font-bold transition-colors"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Officers List */}
            {(type === 'total-officers' ||
              type === 'active-now' ||
              type === 'checked-in') && (
              <div className="p-4 space-y-2">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    {
                      label: 'Online',
                      value: activeOfficers.length,
                      color: '#00d4aa',
                    },
                    {
                      label: 'Idle',
                      value: officers.filter((o) => o.status === 'idle').length,
                      color: '#f59e0b',
                    },
                    {
                      label: 'Offline',
                      value: officers.filter((o) => o.status === 'offline')
                        .length,
                      color: '#6b7280',
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-[#080e1c] border border-[#1e2d4a] rounded-xl p-3 text-center"
                    >
                      <p
                        className="text-2xl font-['Rajdhani'] font-bold"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </p>
                      <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wider mt-0.5">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {displayOfficers.map((o) => {
                  const teamName =
                    o.teamId === 'team-1'
                      ? 'Alpha Sales'
                      : o.teamId === 'team-2'
                        ? 'Beta Marketing'
                        : 'Field Ops'
                  const assignedZone = geoFences.find(
                    (g) => g.id === o.assignedZoneId,
                  )
                  return (
                    <div
                      key={o.id}
                      className="bg-[#080e1c] border border-[#1e2d4a] hover:border-[#2a3a5a] rounded-xl p-3.5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-full bg-[#1e2d4a] border-2 border-[#2a3a5a] flex items-center justify-center">
                            <span className="text-teal-400 font-['Rajdhani'] font-bold text-base">
                              {o.name.charAt(0)}
                            </span>
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#080e1c] ${statusDot(o.status)} ${o.status === 'online' ? 'animate-pulse' : ''}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-white font-['Rajdhani'] font-bold text-sm">
                              {o.name}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {assignedZone && (
                                <span
                                  className="text-[8px] font-['Rajdhani'] font-bold px-1.5 py-0.5 rounded border"
                                  style={{
                                    color: assignedZone.color,
                                    backgroundColor: `${assignedZone.color}15`,
                                    borderColor: `${assignedZone.color}40`,
                                  }}
                                >
                                  {assignedZone.name}
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded-full border ${o.status === 'online' ? 'bg-teal-500/10 border-teal-500/25 text-teal-400' : o.status === 'idle' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-slate-500/10 border-slate-500/25 text-slate-500'}`}
                              >
                                {o.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            <span className="text-slate-500 text-[10px] font-['JetBrains_Mono'] flex items-center gap-1">
                              <Phone size={8} /> {o.phone}
                            </span>
                            <span className="text-slate-500 text-[10px] font-['JetBrains_Mono'] flex items-center gap-1">
                              <Building2 size={8} /> {teamName}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 mt-1">
                            <span className="text-slate-500 text-[10px] font-['JetBrains_Mono'] flex items-center gap-1">
                              <MapPin size={8} /> {o.address}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#1e2d4a]">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase">
                            Speed
                          </p>
                          <p className="text-teal-400 text-xs font-['JetBrains_Mono'] font-bold mt-0.5">
                            {o.speed.toFixed(1)}{' '}
                            <span className="text-[8px] text-slate-600">
                              km/h
                            </span>
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase">
                            Battery
                          </p>
                          <p
                            className="text-xs font-['JetBrains_Mono'] font-bold mt-0.5"
                            style={{ color: batteryColor(o.battery) }}
                          >
                            {o.battery}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase">
                            Check-In
                          </p>
                          <p className="text-slate-300 text-[10px] font-['JetBrains_Mono'] mt-0.5">
                            {(o as OfficerMarker & { checkInTime?: string })
                              .checkInTime ?? 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-['Rajdhani'] uppercase">
                            Zone
                          </p>
                          <button
                            onClick={() => setAssigningOfficer(o)}
                            className="text-[9px] font-['Rajdhani'] font-bold mt-0.5 transition-colors hover:text-teal-400"
                            style={{
                              color: assignedZone
                                ? assignedZone.color
                                : '#4b5563',
                            }}
                          >
                            {assignedZone ? assignedZone.name : '+ Assign'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Unread Alerts */}
            {type === 'unread-alerts' && (
              <div className="p-4 space-y-2">
                {unreadAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle
                      size={32}
                      className="text-teal-400/30 mx-auto mb-3"
                    />
                    <p className="text-slate-500 font-['Rajdhani']">
                      No unread alerts
                    </p>
                  </div>
                ) : (
                  unreadAlerts.map((alert) => {
                    const cfg = alertTypeConfig[alert.type] ?? {
                      color: '#6b7280',
                      label: 'ALERT',
                    }
                    return (
                      <div
                        key={alert.id}
                        className="bg-[#080e1c] border border-[#1e2d4a] rounded-xl p-3.5 flex items-start gap-3"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
                          style={{
                            backgroundColor: `${cfg.color}15`,
                            borderColor: `${cfg.color}30`,
                          }}
                        >
                          <AlertTriangle
                            size={13}
                            style={{ color: cfg.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span
                              className="text-[9px] font-['JetBrains_Mono'] font-bold px-1.5 py-0.5 rounded border"
                              style={{
                                color: cfg.color,
                                backgroundColor: `${cfg.color}10`,
                                borderColor: `${cfg.color}30`,
                              }}
                            >
                              {cfg.label}
                            </span>
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                          </div>
                          <p className="text-slate-200 text-xs font-['Rajdhani'] leading-relaxed">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            {alert.officer && (
                              <span className="text-slate-500 text-[10px] font-['JetBrains_Mono'] flex items-center gap-1">
                                <Users size={8} /> {alert.officer}
                              </span>
                            )}
                            <span className="text-slate-600 text-[10px] font-['JetBrains_Mono'] flex items-center gap-1">
                              <Clock size={8} /> {alert.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                {alerts.filter((a) => a.read).length > 0 && (
                  <div className="mt-4">
                    <p className="text-slate-600 text-[10px] font-['Rajdhani'] uppercase tracking-widest mb-2 px-1">
                      Previously Read
                    </p>
                    {alerts
                      .filter((a) => a.read)
                      .map((alert) => {
                        const cfg = alertTypeConfig[alert.type] ?? {
                          color: '#6b7280',
                          label: 'ALERT',
                        }
                        return (
                          <div
                            key={alert.id}
                            className="bg-[#080e1c]/50 border border-[#1e2d4a]/50 rounded-xl p-3 flex items-start gap-3 mb-2 opacity-50"
                          >
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${cfg.color}10` }}
                            >
                              <AlertTriangle
                                size={10}
                                style={{ color: cfg.color }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-400 text-xs font-['Rajdhani']">
                                {alert.message}
                              </p>
                              <p className="text-slate-600 text-[10px] font-['JetBrains_Mono'] mt-0.5">
                                {alert.time}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Teams */}
            {type === 'teams' && (
              <div className="p-4 space-y-3">
                {teams.map((team) => {
                  const teamOfficers = officers.filter(
                    (o) => o.teamId === team.id,
                  )
                  const activeCount = teamOfficers.filter(
                    (o) => o.status === 'online',
                  ).length
                  const idleCount = teamOfficers.filter(
                    (o) => o.status === 'idle',
                  ).length
                  const offlineCount = teamOfficers.filter(
                    (o) => o.status === 'offline',
                  ).length
                  const checkedInCount = teamOfficers.filter(
                    (o) => o.checkInStatus === 'in',
                  ).length
                  const pct =
                    teamOfficers.length > 0
                      ? (activeCount / teamOfficers.length) * 100
                      : 0
                  return (
                    <div
                      key={team.id}
                      className="bg-[#080e1c] border border-[#1e2d4a] rounded-xl overflow-hidden"
                    >
                      <div
                        className="h-1"
                        style={{ backgroundColor: team.color }}
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: team.color }}
                              />
                              <h3 className="text-white font-['Rajdhani'] font-bold text-base">
                                {team.name}
                              </h3>
                              <span
                                className={`text-[9px] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded border ${team.isActive ? 'bg-teal-500/10 border-teal-500/25 text-teal-400' : 'bg-slate-500/10 border-slate-500/25 text-slate-500'}`}
                              >
                                {team.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs font-['Rajdhani'] mt-1">
                              {team.companyName} · {team.description}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className="text-2xl font-['Rajdhani'] font-bold"
                              style={{ color: team.color }}
                            >
                              {teamOfficers.length}
                            </p>
                            <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase">
                              officers
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {[
                            {
                              label: 'Active',
                              value: activeCount,
                              color: '#00d4aa',
                            },
                            {
                              label: 'Idle',
                              value: idleCount,
                              color: '#f59e0b',
                            },
                            {
                              label: 'Offline',
                              value: offlineCount,
                              color: '#6b7280',
                            },
                            {
                              label: 'Checked In',
                              value: checkedInCount,
                              color: '#10b981',
                            },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="bg-[#0d1425] rounded-lg p-2 text-center"
                            >
                              <p
                                className="text-lg font-['Rajdhani'] font-bold"
                                style={{ color: s.color }}
                              >
                                {s.value}
                              </p>
                              <p className="text-[9px] text-slate-600 font-['Rajdhani'] uppercase">
                                {s.label}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 font-['Rajdhani']">
                              Activity Rate
                            </span>
                            <span
                              className="font-['JetBrains_Mono'] font-bold"
                              style={{ color: team.color }}
                            >
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-[#0d1425] rounded-lg">
                          <Shield size={11} className="text-slate-500" />
                          <span className="text-slate-400 text-xs font-['Rajdhani']">
                            Local Admin:
                          </span>
                          <span className="text-slate-200 text-xs font-['Rajdhani'] font-semibold">
                            {team.localAdminName ?? (
                              <span className="text-slate-600">
                                Not assigned
                              </span>
                            )}
                          </span>
                        </div>
                        {teamOfficers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#1e2d4a]">
                            <p className="text-slate-600 text-[10px] font-['Rajdhani'] uppercase tracking-wider mb-2">
                              Team Members
                            </p>
                            <div className="space-y-1.5">
                              {teamOfficers.map((o) => {
                                const zone = geoFences.find(
                                  (g) => g.id === o.assignedZoneId,
                                )
                                return (
                                  <div
                                    key={o.id}
                                    className="flex items-center gap-2.5"
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(o.status)}`}
                                    />
                                    <span className="text-slate-300 text-xs font-['Rajdhani'] flex-1">
                                      {o.name}
                                    </span>
                                    {zone && (
                                      <span
                                        className="text-[8px] font-['Rajdhani'] font-bold"
                                        style={{ color: zone.color }}
                                      >
                                        {zone.name}
                                      </span>
                                    )}
                                    <span className="text-slate-600 text-[10px] font-['JetBrains_Mono']">
                                      {o.battery}%
                                    </span>
                                    <span className="text-teal-400 text-[10px] font-['JetBrains_Mono']">
                                      {o.speed.toFixed(0)} km/h
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Companies */}
            {type === 'companies' && (
              <div className="p-4 space-y-3">
                {companies.map((co) => {
                  const coTeams = teams.filter((t) => t.companyId === co.id)
                  const coOfficers = officers.filter((o) =>
                    coTeams.some((t) => t.id === o.teamId),
                  )
                  const activeCount = coOfficers.filter(
                    (o) => o.status === 'online',
                  ).length
                  return (
                    <div
                      key={co.id}
                      className="bg-[#080e1c] border border-[#1e2d4a] rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-['Rajdhani'] font-bold text-base">
                            {co.name}
                          </h3>
                          <p className="text-slate-500 text-xs font-['Rajdhani'] mt-1">
                            {co.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-full uppercase">
                            {co.plan}
                          </span>
                          <span
                            className={`text-[9px] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full border ${co.isActive ? 'bg-teal-500/10 border-teal-500/25 text-teal-400' : 'bg-slate-500/10 border-slate-500/25 text-slate-500'}`}
                          >
                            {co.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            label: 'Teams',
                            value: coTeams.length,
                            color: '#8b5cf6',
                          },
                          {
                            label: 'Officers',
                            value: coOfficers.length,
                            color: '#60a5fa',
                          },
                          {
                            label: 'Active Now',
                            value: activeCount,
                            color: '#00d4aa',
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="bg-[#0d1425] rounded-lg p-2.5 text-center"
                          >
                            <p
                              className="text-xl font-['Rajdhani'] font-bold"
                              style={{ color: s.color }}
                            >
                              {s.value}
                            </p>
                            <p className="text-[9px] text-slate-600 font-['Rajdhani'] uppercase mt-0.5">
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#1e2d4a] flex items-center gap-2 text-[10px]">
                        <Calendar size={9} className="text-slate-500" />
                        <span className="text-slate-500 font-['JetBrains_Mono']">
                          Created: {co.createdAt}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* KM Today */}
            {type === 'km-today' && (
              <div className="p-4 space-y-3">
                <div className="bg-[#080e1c] border border-[#1e2d4a] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 font-['Rajdhani'] text-sm">
                      Total Fleet Distance
                    </span>
                    <TrendingUp size={14} className="text-amber-400" />
                  </div>
                  <p className="text-4xl font-['Rajdhani'] font-bold text-amber-400">
                    142.7<span className="text-xl text-slate-500 ml-1">km</span>
                  </p>
                  <p className="text-slate-600 text-xs font-['JetBrains_Mono'] mt-1">
                    Across all active officers today
                  </p>
                </div>
                {officers
                  .filter((o) => o.status !== 'offline')
                  .map((o, i) => {
                    const km = (((i * 7 + 12) % 30) + 5).toFixed(1)
                    const pct = Math.min(
                      (parseFloat(km) / 40) * 100,
                      100,
                    ).toFixed(0)
                    return (
                      <div
                        key={o.id}
                        className="bg-[#080e1c] border border-[#1e2d4a] rounded-xl p-3.5"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#1e2d4a] flex items-center justify-center flex-shrink-0">
                            <span className="text-teal-400 font-['Rajdhani'] font-bold text-xs">
                              {o.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-['Rajdhani'] font-semibold">
                              {o.name}
                            </p>
                            <p className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                              #{i + 1} · {o.address}
                            </p>
                          </div>
                          <p className="text-amber-400 font-['JetBrains_Mono'] font-bold text-sm flex-shrink-0">
                            {km} km
                          </p>
                        </div>
                        <div className="h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Pending access — inline approve/reject */}
            {type === 'pending-access' && (
              <div className="p-4 space-y-3">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle
                      size={32}
                      className="text-teal-400/30 mx-auto mb-3"
                    />
                    <p className="text-slate-500 font-['Rajdhani']">
                      No pending requests
                    </p>
                  </div>
                ) : (
                  pendingApprovals.map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#080e1c] border border-[#1e2d4a] rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-[#1e2d4a] border border-[#2a3a5a] flex items-center justify-center">
                          <span className="text-teal-400 font-['Rajdhani'] font-bold text-lg">
                            {req.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-['Rajdhani'] font-bold">
                            {req.name}
                          </p>
                          <p className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                            {req.email}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemove(req.id)}
                          className="w-7 h-7 rounded-lg bg-slate-500/10 border border-slate-500/20 hover:bg-red-500/15 hover:border-red-500/30 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
                          title="Remove"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-3">
                        <span className="flex items-center gap-1 text-slate-400 font-['JetBrains_Mono']">
                          <Phone size={8} /> {req.phone}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 font-['Rajdhani']">
                          <Building2 size={8} /> {req.department}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 font-['Rajdhani']">
                          <Calendar size={8} /> {req.submittedAt}
                        </span>
                        {req.cvFileName && (
                          <span className="flex items-center gap-1 text-blue-400 font-['Rajdhani']">
                            <FileText size={8} /> {req.cvFileName}
                          </span>
                        )}
                      </div>
                      {req.cvFileName && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-[#0d1425] border border-[#1e2d4a] rounded-xl">
                          <div className="w-6 h-6 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText size={11} className="text-blue-400" />
                          </div>
                          <p className="text-slate-300 text-[11px] font-['Rajdhani'] flex-1 truncate">
                            {req.cvFileName}
                          </p>
                          <button
                            onClick={() =>
                              showToast(
                                `CV: ${req.cvFileName ?? 'file'}`,
                                'success',
                              )
                            }
                            className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg text-blue-400 text-[9px] font-['Rajdhani'] font-bold transition-colors"
                          >
                            <Download size={9} /> CV
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprove(req.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] rounded-xl text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors shadow-[0_0_16px_rgba(0,212,170,0.2)]"
                        >
                          <UserCheck size={12} /> APPROVE
                        </button>
                        <button
                          onClick={() => onReject(req.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors"
                        >
                          <UserX size={12} /> REJECT
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {(type === 'active-now' ||
            type === 'total-officers' ||
            type === 'checked-in') && (
            <div className="flex-shrink-0 px-5 py-3 border-t border-[#1e2d4a] bg-[#080e1c]">
              <button
                onClick={() => {
                  onClose()
                  onNavigate('map')
                }}
                className="w-full py-2.5 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 rounded-xl text-teal-400 text-sm font-['Rajdhani'] font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={14} /> View on Live Map <ArrowRight size={13} />
              </button>
            </div>
          )}
          {type === 'teams' && (
            <div className="flex-shrink-0 px-5 py-3 border-t border-[#1e2d4a] bg-[#080e1c]">
              <button
                onClick={() => {
                  onClose()
                  onNavigate('teams')
                }}
                className="w-full py-2.5 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 rounded-xl text-teal-400 text-sm font-['Rajdhani'] font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <Building2 size={14} /> Manage Teams <ArrowRight size={13} />
              </button>
            </div>
          )}
          {type === 'pending-access' && pendingApprovals.length > 0 && (
            <div className="flex-shrink-0 px-5 py-3 border-t border-[#1e2d4a] bg-[#080e1c]">
              <button
                onClick={() => {
                  onClose()
                  onNavigate('requests')
                }}
                className="w-full py-2.5 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 rounded-xl text-orange-400 text-sm font-['Rajdhani'] font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={14} /> Open Full Requests Tab{' '}
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [isAuthed, setIsAuthed] = useState(
    () =>
      typeof window !== 'undefined' &&
      sessionStorage.getItem('adminAuth') === 'true',
  )
  const [officers, setOfficers] = useState<OfficerMarker[]>(generateOfficers)
  const [pendingApprovals, setPendingApprovals] =
    useState<PendingApproval[]>(INITIAL_APPROVALS)
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [toast, setToast] = useState<{
    text: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)
  const [geoFences, setGeoFences] = useState<GeoFence[]>(DEFAULT_GEOFENCES)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>(DEMO_COMPANIES)
  const [teams, setTeams] = useState<Team[]>(DEMO_TEAMS)
  const [localAdmins, setLocalAdmins] =
    useState<LocalAdmin[]>(DEMO_LOCAL_ADMINS)
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [clockNow, setClockNow] = useState(new Date())
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const alertSoundRef = useRef<HTMLAudioElement | null>(null)
  const officerHistoryRef = useRef<
    Record<string, { lat: number; lng: number; time: number }>
  >({})

  useEffect(() => {
    const t = setInterval(() => setClockNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [activeTab])

  useEffect(() => {
    const interval = setInterval(() => {
      setOfficers((prev) =>
        prev.map((officer) => {
          if (officer.status === 'offline') return officer
          const newLat = officer.lat + (Math.random() - 0.5) * 0.0008
          const newLng = officer.lng + (Math.random() - 0.5) * 0.0008
          const hist = officerHistoryRef.current[officer.id]
          if (hist) {
            const dist =
              Math.hypot(newLat - hist.lat, newLng - hist.lng) * 111000
            const timeDiff = Date.now() - hist.time
            if (dist < 20 && timeDiff > INACTIVITY_ALERT_MS) {
              setAlerts((a) => [
                {
                  id: `al-${Date.now()}`,
                  type: 'inactivity',
                  message: `${officer.name} inactive for ${Math.round(timeDiff / 60000)} min`,
                  officer: officer.name,
                  time: 'Just now',
                  read: false,
                },
                ...a.slice(0, 19),
              ])
              if (soundEnabled && alertSoundRef.current)
                alertSoundRef.current.play().catch(() => {})
            }
          }
          officerHistoryRef.current[officer.id] = {
            lat: newLat,
            lng: newLng,
            time: Date.now(),
          }
          for (const fence of DEFAULT_GEOFENCES) {
            const dist =
              Math.hypot(newLat - fence.lat, newLng - fence.lng) * 111000
            const prevDist =
              Math.hypot(officer.lat - fence.lat, officer.lng - fence.lng) *
              111000
            if (prevDist <= fence.radius && dist > fence.radius) {
              setAlerts((a) => [
                {
                  id: `al-geo-${Date.now()}`,
                  type: 'geofence',
                  message: `${officer.name} EXITED ${fence.name}`,
                  officer: officer.name,
                  time: 'Just now',
                  read: false,
                },
                ...a.slice(0, 19),
              ])
              if (soundEnabled && alertSoundRef.current)
                alertSoundRef.current.play().catch(() => {})
            }
          }
          return {
            ...officer,
            lat: newLat,
            lng: newLng,
            speed: Math.random() * 60,
            lastSeen: 'Just now',
          }
        }),
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [soundEnabled])

  const analytics: AnalyticsSummary = {
    totalOfficers: officers.length,
    activeNow: officers.filter((o) => o.status === 'online').length,
    idleCount: officers.filter((o) => o.status === 'idle').length,
    offlineCount: officers.filter((o) => o.status === 'offline').length,
    totalDistanceToday: 142.7,
    alertsToday: alerts.length,
    avgResponseTime: 4.2,
    coveragePercent: 73,
  }

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' | 'warning') => {
      setToast({ text, type })
      setTimeout(() => setToast(null), 3500)
    },
    [],
  )

  const handleApprove = useCallback(
    (id: string) => {
      const a = pendingApprovals.find((x) => x.id === id)
      setPendingApprovals((prev) => prev.filter((x) => x.id !== id))
      if (a) showToast(`✓ ${a.name} approved`, 'success')
    },
    [pendingApprovals, showToast],
  )

  const handleReject = useCallback(
    (id: string) => {
      const a = pendingApprovals.find((x) => x.id === id)
      setPendingApprovals((prev) => prev.filter((x) => x.id !== id))
      const note = rejectNote[id]
      if (a)
        showToast(
          `✗ ${a.name} rejected${note ? `: ${note.slice(0, 30)}` : ''}`,
          'error',
        )
    },
    [pendingApprovals, showToast, rejectNote],
  )

  const handleRemoveFromList = useCallback(
    (id: string) => {
      const a = pendingApprovals.find((x) => x.id === id)
      setPendingApprovals((prev) => prev.filter((x) => x.id !== id))
      if (a) showToast(`${a.name} removed from list`, 'warning')
    },
    [pendingApprovals, showToast],
  )

  // ── Zone Assignment Handler ────────────────────────────────────────────────
  const handleAssignOfficerToZone = useCallback(
    (officerId: string, zoneId: string | null) => {
      setOfficers((prev) =>
        prev.map((o) =>
          o.id === officerId
            ? { ...o, assignedZoneId: zoneId ?? undefined }
            : o,
        ),
      )
      setGeoFences((prev) =>
        prev.map((fence) => {
          const currentIds = fence.assignedOfficerIds ?? []
          if (zoneId === fence.id) {
            return {
              ...fence,
              assignedOfficerIds: [...new Set([...currentIds, officerId])],
            }
          } else {
            return {
              ...fence,
              assignedOfficerIds: currentIds.filter((id) => id !== officerId),
            }
          }
        }),
      )
      const officer = officers.find((o) => o.id === officerId)
      const zone = geoFences.find((g) => g.id === zoneId)
      if (officer && zone) {
        showToast(`${officer.name} assigned to ${zone.name}`, 'success')
      } else if (officer && !zoneId) {
        showToast(`${officer.name} removed from zone`, 'warning')
      }
    },
    [officers, geoFences, showToast],
  )

  const handleSendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        senderId: 'admin',
        senderName: 'Main Admin',
        type: 'text',
        content: text,
        timestamp: new Date().toISOString(),
        isMine: true,
      },
    ])
  }

  if (!isAuthed) return <AdminLogin onSuccess={() => setIsAuthed(true)} />

  const checkedIn = officers.filter((o) => o.checkInStatus === 'in').length
  const unreadAlerts = alerts.filter((a) => !a.read).length

  const NAV_ITEMS: { id: NavTab; icon: React.ElementType; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'requests', icon: Bell, label: 'Requests' },
    { id: 'map', icon: MapPin, label: 'Live Map' },
    { id: 'officers', icon: Users, label: 'Officers' },
    { id: 'teams', icon: Building2, label: 'Teams' },
    { id: 'attendance', icon: ClipboardList, label: 'Attendance' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const getNavBadge = (id: NavTab) => {
    if (id === 'requests') return pendingApprovals.length
    if (id === 'officers') return pendingApprovals.length
    if (id === 'attendance') return unreadAlerts
    return 0
  }

  const NavItem = ({
    id,
    icon: Icon,
    label,
    collapsed = false,
  }: {
    id: NavTab
    icon: React.ElementType
    label: string
    collapsed?: boolean
  }) => {
    const isActive = activeTab === id
    const badge = getNavBadge(id)
    return (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all relative group ${isActive ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-slate-300 hover:bg-[#1a2540] border border-transparent'}`}
      >
        <div className="relative flex-shrink-0">
          <Icon size={16} />
          {badge > 0 && (
            <div className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-0.5">
              <span className="text-[8px] text-white font-bold leading-none">
                {badge}
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <span className="text-xs font-['Rajdhani'] font-semibold tracking-wide whitespace-nowrap">
            {label}
          </span>
        )}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a2540] border border-[#2a3a5a] rounded-lg text-white text-xs font-['Rajdhani'] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
            {label}
            {badge > 0 ? ` (${badge})` : ''}
          </div>
        )}
      </button>
    )
  }

  const statCards = [
    {
      label: 'Total Officers',
      value: analytics.totalOfficers,
      icon: Users,
      color: '#00d4aa',
      bg: 'rgba(0,212,170,0.08)',
      border: 'rgba(0,212,170,0.2)',
      modal: 'total-officers' as ModalType,
      hint: 'Click for full list',
    },
    {
      label: 'Active Now',
      value: analytics.activeNow,
      icon: Activity,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.08)',
      border: 'rgba(96,165,250,0.2)',
      modal: 'active-now' as ModalType,
      hint: 'Click to see active officers',
    },
    {
      label: 'Checked In',
      value: checkedIn,
      icon: UserCheck,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
      modal: 'checked-in' as ModalType,
      hint: 'Click for check-in report',
    },
    {
      label: 'Pending Access',
      value: pendingApprovals.length,
      icon: Clock,
      color: '#f97316',
      bg: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.2)',
      modal: 'pending-access' as ModalType,
      hint: 'Click to review requests',
    },
    {
      label: 'Companies',
      value: companies.length,
      icon: Building2,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
      modal: 'companies' as ModalType,
      hint: 'Click for company details',
    },
    {
      label: 'Teams',
      value: teams.length,
      icon: Shield,
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.08)',
      border: 'rgba(236,72,153,0.2)',
      modal: 'teams' as ModalType,
      hint: 'Click for team details',
    },
    {
      label: 'Unread Alerts',
      value: unreadAlerts,
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)',
      modal: 'unread-alerts' as ModalType,
      hint: 'Click to view all alerts',
    },
    {
      label: 'KM Today',
      value: `${analytics.totalDistanceToday}`,
      icon: TrendingUp,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
      modal: 'km-today' as ModalType,
      hint: 'Click for distance report',
    },
  ]

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden select-none">
      {/* Alert sound */}
      <audio ref={alertSoundRef} preload="auto">
        <source
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFhIB9eHBnXFJJQDg2ODk8QEZNVFteZGlvcHFxb21qZWJeWlhYWVtfZGtyd3t9f3+AgH9/fn17eXh4eHl6e3x9fn9/gH+AfX16d3Rxa2RfW1dWT1FTVVhcX2Nnand8gIKEhIaHh4eHhoSCgH97d3JsaGZjY2NkZGVnam1wcnV4fX+BgoODg4ODg4KBgH98eHRwamNdWildWVlZXWVxgZGpsb3J1eHt9fn9/gH+AfX16d3Rxa2RfW1dUT1BWWFtfY2dqbnF0d3p8fn9/f4B/fn17eHRwamJbVVFPT09QUlVZXmFma3B0eHuAgoSFhoaGhoaFg4F/fHl1cGphXFhVU1NUVVhbXmFmamxwdHd6fH5/f4B/fn17eXVxbGZgXFlXV1hYWlxfY2hsbXFzdnd5fH5/f4CAf36Afg=="
          type="audio/wav"
        />
      </audio>

      {/* Detail Modal */}
      {activeModal && (
        <DetailModal
          type={activeModal}
          officers={officers}
          teams={teams}
          companies={companies}
          alerts={alerts}
          pendingApprovals={pendingApprovals}
          geoFences={geoFences}
          onClose={() => setActiveModal(null)}
          onMarkAlertsRead={() => {
            setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
            setActiveModal(null)
            showToast('All alerts marked as read', 'success')
          }}
          onNavigate={(tab) => {
            setActiveModal(null)
            setActiveTab(tab)
          }}
          onApprove={(id) => handleApprove(id)}
          onReject={(id) => handleReject(id)}
          onRemove={(id) => handleRemoveFromList(id)}
          onAssignOfficerToZone={handleAssignOfficerToZone}
          showToast={showToast}
        />
      )}

      {/* ── DESKTOP NAV RAIL ─────────────────────────────────────── */}
      <motion.div
        animate={{ width: navCollapsed ? 52 : 185 }}
        transition={{ type: 'spring', damping: 28 }}
        className="hidden md:flex flex-col flex-shrink-0 bg-[#080e1c] border-r border-[#1e2d4a] z-30 overflow-hidden"
      >
        <div className="h-14 flex items-center px-3 border-b border-[#1e2d4a] gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
            <MapPin size={13} className="text-teal-400" />
          </div>
          <AnimatePresence>
            {!navCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-white font-['Rajdhani'] font-bold text-base tracking-widest whitespace-nowrap"
              >
                FIELDTRACK
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-1.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, icon, label }) => (
            <NavItem
              key={id}
              id={id}
              icon={icon}
              label={label}
              collapsed={navCollapsed}
            />
          ))}
        </nav>
        <div className="p-2 border-t border-[#1e2d4a] space-y-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-full h-8 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-['Rajdhani'] ${soundEnabled ? 'text-teal-400 hover:bg-teal-500/10' : 'text-slate-600 hover:bg-[#1a2540]'}`}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {!navCollapsed && (
              <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            )}
          </button>
          <button
            onClick={() => setNavCollapsed(!navCollapsed)}
            className="w-full h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-[#1a2540] transition-colors"
          >
            {navCollapsed ? (
              <ChevronRight size={13} />
            ) : (
              <ChevronLeft size={13} />
            )}
          </button>
        </div>
      </motion.div>

      {/* ── MOBILE NAV DRAWER ──────────────────────────────────── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-[#080e1c] border-r border-[#1e2d4a] flex flex-col"
              style={{
                paddingTop: 'var(--safe-top)',
                paddingBottom: 'var(--safe-bottom)',
              }}
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-[#1e2d4a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                    <MapPin size={13} className="text-teal-400" />
                  </div>
                  <span className="text-white font-['Rajdhani'] font-bold text-base tracking-widest">
                    FIELDTRACK
                  </span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
                {NAV_ITEMS.map(({ id, icon, label }) => (
                  <NavItem key={id} id={id} icon={icon} label={label} />
                ))}
              </nav>
              <div className="p-3 border-t border-[#1e2d4a]">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-full h-9 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-['Rajdhani'] font-semibold ${soundEnabled ? 'text-teal-400 bg-teal-500/10' : 'text-slate-600 bg-[#1a2540]'}`}
                >
                  {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  {soundEnabled ? 'Alert Sound ON' : 'Alert Sound OFF'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[#1e2d4a] bg-[#080e1c] flex-shrink-0"
          style={{ paddingTop: 'var(--safe-top)' }}
        >
          <button
            onClick={() => setMobileNavOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#0d1425] border border-[#1e2d4a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={16} />
          </button>
          <span className="text-white font-['Rajdhani'] font-bold tracking-widest text-sm">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label.toUpperCase() ??
              'DASHBOARD'}
          </span>
          {pendingApprovals.length > 0 ? (
            <button
              onClick={() => setActiveTab('requests')}
              className="relative w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400"
            >
              <Bell size={16} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[7px] text-white font-bold">
                  {pendingApprovals.length}
                </span>
              </div>
            </button>
          ) : (
            <div className="w-9 h-9 flex items-center justify-center">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden md:block">
          <AdminTopBar
            analytics={analytics}
            pendingCount={pendingApprovals.length}
            alerts={alerts}
            onClearAlerts={() =>
              setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
            }
          />
        </div>

        {/* Status bar */}
        <div className="h-6 bg-[#060b16] border-b border-[#1e2d4a] flex items-center px-3 gap-3 flex-shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-[9px] text-teal-400/70 font-['JetBrains_Mono'] whitespace-nowrap">
              {analytics.activeNow} ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span className="text-[9px] text-amber-400/70 font-['JetBrains_Mono'] whitespace-nowrap">
              {analytics.idleCount} IDLE
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-[9px] text-green-400/70 font-['JetBrains_Mono'] whitespace-nowrap">
              {checkedIn} IN
            </span>
          </div>
          {pendingApprovals.length > 0 && (
            <button
              onClick={() => setActiveTab('requests')}
              className="flex items-center gap-1 flex-shrink-0"
            >
              <Bell size={9} className="text-orange-400 animate-bounce" />
              <span className="text-[9px] text-orange-400 font-['JetBrains_Mono'] font-bold whitespace-nowrap">
                {pendingApprovals.length} PENDING
              </span>
            </button>
          )}
          {unreadAlerts > 0 && (
            <button
              onClick={() => setActiveModal('unread-alerts')}
              className="flex items-center gap-1 flex-shrink-0"
            >
              <AlertTriangle size={9} className="text-red-400 animate-pulse" />
              <span className="text-[9px] text-red-400 font-['JetBrains_Mono'] font-bold whitespace-nowrap">
                {unreadAlerts} ALERTS
              </span>
            </button>
          )}
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[9px] text-slate-600 font-['JetBrains_Mono']">
              {clockNow.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* ── TAB CONTENT ────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ═══ DASHBOARD ══════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <h1 className="text-white font-['Rajdhani'] font-bold text-xl sm:text-2xl tracking-wide">
                    Good{' '}
                    {clockNow.getHours() < 12
                      ? 'Morning'
                      : clockNow.getHours() < 17
                        ? 'Afternoon'
                        : 'Evening'}
                    , Admin 👋
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm font-['Rajdhani'] mt-0.5">
                    {clockNow.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-teal-400 text-[10px] font-['JetBrains_Mono'] font-bold whitespace-nowrap">
                    SYSTEM ONLINE
                  </span>
                </div>
              </motion.div>

              <AnimatePresence>
                {pendingApprovals.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-3 sm:p-4"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-amber-500 rounded-l-xl sm:rounded-l-2xl" />
                    <div className="pl-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                            <Bell size={16} className="text-orange-400" />
                          </div>
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">
                              {pendingApprovals.length}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-orange-300 font-['Rajdhani'] font-bold text-sm sm:text-base tracking-wide">
                            {pendingApprovals.length} Officer Request
                            {pendingApprovals.length > 1 ? 's' : ''} Awaiting
                            Approval
                          </p>
                          <p className="text-slate-400 text-xs font-['Rajdhani'] hidden sm:block">
                            New officers waiting for approval before system
                            access
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveModal('pending-access')}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 rounded-xl text-orange-400 text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors"
                        >
                          <Eye size={12} /> Quick Review
                        </button>
                        <button
                          onClick={() => setActiveTab('requests')}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-xl text-[#0a0f1e] text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors"
                        >
                          Full Tab <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {statCards.map(
                  ({
                    label,
                    value,
                    icon: Icon,
                    color,
                    bg,
                    border,
                    modal,
                    hint,
                  }) => (
                    <motion.button
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveModal(modal)}
                      className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 border cursor-pointer text-left group"
                      style={{ backgroundColor: bg, borderColor: border }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)`,
                        }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}18` }}
                          >
                            <Icon size={15} style={{ color }} />
                          </div>
                          <Eye
                            size={10}
                            style={{ color }}
                            className="opacity-0 group-hover:opacity-60 transition-opacity"
                          />
                        </div>
                        <p
                          className="text-2xl sm:text-3xl font-['Rajdhani'] font-bold"
                          style={{ color }}
                        >
                          {value}
                        </p>
                        <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wider mt-0.5">
                          {label}
                        </p>
                        <p
                          className="text-[9px] font-['JetBrains_Mono'] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color }}
                        >
                          {hint} →
                        </p>
                      </div>
                    </motion.button>
                  ),
                )}
              </div>

              {/* Requests + Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#1e2d4a]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                        <Bell size={11} className="text-orange-400" />
                      </div>
                      <span className="text-white font-['Rajdhani'] font-bold text-sm tracking-wide">
                        Officer Requests
                      </span>
                      {pendingApprovals.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-orange-500/15 border border-orange-500/25 rounded-full text-orange-300 text-[9px] font-bold">
                          {pendingApprovals.length} pending
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="text-teal-400/60 hover:text-teal-400 text-[10px] font-['Rajdhani'] transition-colors flex items-center gap-1"
                    >
                      All <ArrowRight size={9} />
                    </button>
                  </div>
                  <div className="divide-y divide-[#1e2d4a]">
                    {pendingApprovals.length === 0 ? (
                      <div className="py-8 text-center">
                        <CheckCircle
                          size={24}
                          className="text-teal-400/30 mx-auto mb-2"
                        />
                        <p className="text-slate-600 text-sm font-['Rajdhani']">
                          No pending requests
                        </p>
                      </div>
                    ) : (
                      pendingApprovals.slice(0, 3).map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center gap-3 px-4 sm:px-5 py-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#1e2d4a] border border-[#2a3a5a] flex items-center justify-center flex-shrink-0">
                            <span className="text-teal-400 font-['Rajdhani'] font-bold text-sm">
                              {req.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-['Rajdhani'] font-semibold text-sm truncate">
                              {req.name}
                            </p>
                            <p className="text-slate-500 text-[10px] font-['JetBrains_Mono'] truncate">
                              {req.phone} · {req.submittedAt}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/25 flex items-center justify-center text-teal-400 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={12} />
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 flex items-center justify-center text-red-400 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#1e2d4a]">
                    <button
                      onClick={() => setActiveModal('unread-alerts')}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                        <AlertTriangle size={11} className="text-red-400" />
                      </div>
                      <span className="text-white font-['Rajdhani'] font-bold text-sm tracking-wide group-hover:text-red-300 transition-colors">
                        Recent Alerts
                      </span>
                      {unreadAlerts > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500/15 border border-red-500/25 rounded-full text-red-300 text-[9px] font-bold animate-pulse">
                          {unreadAlerts} new
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveModal('unread-alerts')}
                        className="text-red-400/60 hover:text-red-400 text-[10px] font-['Rajdhani'] transition-colors flex items-center gap-1"
                      >
                        View All <ArrowRight size={9} />
                      </button>
                      <button
                        onClick={() =>
                          setAlerts((prev) =>
                            prev.map((a) => ({ ...a, read: true })),
                          )
                        }
                        className="text-slate-500 hover:text-teal-400 text-[10px] font-['Rajdhani'] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-[#1e2d4a] max-h-48 overflow-y-auto">
                    {alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-3 px-4 sm:px-5 py-2.5 ${!alert.read ? 'bg-[#0f1930]' : ''}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${alert.type === 'geofence' ? 'bg-red-400' : alert.type === 'inactivity' ? 'bg-amber-400' : 'bg-blue-400'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-300 text-xs font-['Rajdhani'] leading-relaxed">
                            {alert.message}
                          </p>
                          <p className="text-slate-600 text-[10px] font-['JetBrains_Mono'] mt-0.5">
                            {alert.time}
                          </p>
                        </div>
                        {!alert.read && (
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Officer Status */}
              <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#1e2d4a]">
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-teal-400" />
                    <span className="text-white font-['Rajdhani'] font-bold text-sm tracking-wide">
                      Live Officer Status
                    </span>
                    <span className="text-[9px] font-['JetBrains_Mono'] text-slate-500">
                      Click to view on map
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveModal('total-officers')}
                    className="text-teal-400/60 hover:text-teal-400 text-[10px] font-['Rajdhani'] flex items-center gap-1 transition-colors"
                  >
                    Full Report <ArrowRight size={9} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <div className="flex gap-0 min-w-max">
                    {officers.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOfficer(o.id)
                          setActiveTab('map')
                        }}
                        className="flex flex-col items-center gap-1.5 py-3 px-3 sm:px-4 hover:bg-[#0f1930] transition-colors group border-r border-[#1e2d4a] last:border-r-0"
                      >
                        <div className="relative">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1e2d4a] border-2 border-[#2a3a5a] flex items-center justify-center group-hover:border-teal-500/40 transition-colors">
                            <span className="text-teal-400 font-['Rajdhani'] font-bold text-sm">
                              {o.name.charAt(0)}
                            </span>
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1425] ${o.status === 'online' ? 'bg-teal-400 animate-pulse' : o.status === 'idle' ? 'bg-amber-400' : 'bg-slate-600'}`}
                          />
                        </div>
                        <p className="text-white text-[10px] sm:text-xs font-['Rajdhani'] font-semibold truncate max-w-[60px] sm:max-w-[75px]">
                          {o.name.split(' ')[0]}
                        </p>
                        <div className="flex items-center gap-1">
                          <Battery
                            size={8}
                            style={{
                              color:
                                o.battery > 50
                                  ? '#10b981'
                                  : o.battery > 25
                                    ? '#f59e0b'
                                    : '#ef4444',
                            }}
                          />
                          <span
                            className="text-[9px] font-['JetBrains_Mono']"
                            style={{
                              color:
                                o.battery > 50
                                  ? '#10b981'
                                  : o.battery > 25
                                    ? '#f59e0b'
                                    : '#ef4444',
                            }}
                          >
                            {o.battery}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Teams */}
              <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#1e2d4a]">
                  <div className="flex items-center gap-2">
                    <Shield size={13} className="text-pink-400" />
                    <span className="text-white font-['Rajdhani'] font-bold text-sm tracking-wide">
                      Active Teams
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveModal('teams')}
                    className="text-pink-400/60 hover:text-pink-400 text-[10px] font-['Rajdhani'] flex items-center gap-1 transition-colors"
                  >
                    Full Details <ArrowRight size={9} />
                  </button>
                </div>
                <div className="divide-y divide-[#1e2d4a]">
                  {teams.map((team) => {
                    const teamOfficers = officers.filter(
                      (o) => o.teamId === team.id,
                    )
                    const active = teamOfficers.filter(
                      (o) => o.status === 'online',
                    ).length
                    const pct =
                      teamOfficers.length > 0
                        ? (active / teamOfficers.length) * 100
                        : 0
                    return (
                      <button
                        key={team.id}
                        onClick={() => setActiveModal('teams')}
                        className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-[#0f1930] transition-colors text-left"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white text-xs font-['Rajdhani'] font-semibold">
                              {team.name}
                            </p>
                            <span className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                              {active}/{teamOfficers.length} active
                            </span>
                          </div>
                          <div className="h-1 bg-[#1a2540] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: team.color,
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight
                          size={10}
                          className="text-slate-600 flex-shrink-0"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  {
                    label: 'Live Map',
                    icon: MapPin,
                    tab: 'map' as NavTab,
                    color: '#00d4aa',
                    desc: 'Track officers',
                  },
                  {
                    label: 'Requests',
                    icon: Bell,
                    tab: 'requests' as NavTab,
                    color: '#f97316',
                    badge: pendingApprovals.length,
                    desc: 'Pending approvals',
                  },
                  {
                    label: 'Attendance',
                    icon: ClipboardList,
                    tab: 'attendance' as NavTab,
                    color: '#8b5cf6',
                    desc: 'Daily records',
                  },
                  {
                    label: 'Messages',
                    icon: MessageSquare,
                    tab: 'messages' as NavTab,
                    color: '#60a5fa',
                    desc: 'Team channel',
                  },
                ].map(({ label, icon: Icon, tab, color, badge, desc }) => (
                  <button
                    key={label}
                    onClick={() => setActiveTab(tab)}
                    className="relative flex flex-col gap-2 px-3 sm:px-4 py-3 sm:py-4 bg-[#0d1425] border border-[#1e2d4a] hover:border-[#2a3a5a] rounded-xl transition-all group text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-slate-200 text-xs sm:text-sm font-['Rajdhani'] font-bold group-hover:text-white transition-colors">
                        {label}
                      </p>
                      <p className="text-slate-600 text-[9px] font-['Rajdhani']">
                        {desc}
                      </p>
                    </div>
                    {badge != null && badge > 0 && (
                      <div className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-0.5">
                        <span className="text-[7px] text-white font-bold">
                          {badge}
                        </span>
                      </div>
                    )}
                    <ArrowRight
                      size={10}
                      style={{ color }}
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-70 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ REQUESTS ══════════════════════════════════════════ */}
          {activeTab === 'requests' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-white font-['Rajdhani'] font-bold text-xl sm:text-2xl tracking-wide flex flex-wrap items-center gap-2 sm:gap-3">
                    <Bell size={20} className="text-orange-400" />
                    Officer Access Requests
                    {pendingApprovals.length > 0 && (
                      <span className="px-2.5 py-1 bg-orange-500/15 border border-orange-500/20 rounded-full text-orange-300 text-xs sm:text-sm font-bold">
                        {pendingApprovals.length} pending
                      </span>
                    )}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-['Rajdhani'] mt-1">
                    Review and approve officer registration requests. Officers
                    cannot log in until approved.
                  </p>
                </motion.div>

                <div className="flex items-start gap-2.5 px-3 sm:px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                  <Shield
                    size={14}
                    className="text-blue-400 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-blue-300/80 text-xs font-['Rajdhani'] leading-relaxed">
                    <span className="font-bold">
                      Officers are blocked from logging in until you approve.
                    </span>{' '}
                    Once approved, they will be notified and can access the
                    system.
                  </p>
                </div>

                <AnimatePresence>
                  {pendingApprovals.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={24} className="text-teal-400" />
                      </div>
                      <p className="text-white font-['Rajdhani'] font-bold text-lg">
                        All Requests Reviewed
                      </p>
                      <p className="text-slate-500 text-sm font-['Rajdhani'] mt-1">
                        No pending officer requests at this time.
                      </p>
                    </motion.div>
                  ) : (
                    pendingApprovals.map((req, idx) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -60, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl overflow-hidden"
                      >
                        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1e2d4a] to-[#0d1830] border border-[#2a3a5a] flex items-center justify-center flex-shrink-0">
                              <span className="text-teal-400 font-['Rajdhani'] font-bold text-xl sm:text-2xl">
                                {req.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <h3 className="text-white font-['Rajdhani'] font-bold text-base sm:text-lg">
                                  {req.name}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                                    <Clock
                                      size={9}
                                      className="text-orange-400"
                                    />
                                    <span className="text-orange-300 text-[9px] font-['Rajdhani'] font-bold">
                                      PENDING
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFromList(req.id)}
                                    title="Remove from list"
                                    className="w-6 h-6 rounded-lg bg-slate-500/10 border border-slate-500/20 hover:bg-red-500/15 hover:border-red-500/30 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
                                  >
                                    <Trash2 size={9} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                <div className="flex items-center gap-1">
                                  <Mail size={9} className="text-slate-500" />
                                  <span className="text-slate-400 text-[10px] font-['JetBrains_Mono']">
                                    {req.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone size={9} className="text-slate-500" />
                                  <span className="text-slate-400 text-[10px] font-['JetBrains_Mono']">
                                    {req.phone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Building2
                                    size={9}
                                    className="text-slate-500"
                                  />
                                  <span className="text-slate-400 text-[10px] font-['Rajdhani']">
                                    {req.department}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar
                                    size={9}
                                    className="text-slate-500"
                                  />
                                  <span className="text-slate-400 text-[10px] font-['Rajdhani']">
                                    {req.submittedAt}
                                  </span>
                                </div>
                              </div>

                              {req.cvFileName && (
                                <div className="flex items-center gap-2 mt-2.5 p-2 bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl">
                                  <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText
                                      size={12}
                                      className="text-blue-400"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-slate-300 text-[11px] font-['Rajdhani'] font-semibold truncate">
                                      {req.cvFileName}
                                    </p>
                                    <p className="text-slate-600 text-[9px] font-['JetBrains_Mono']">
                                      CV / Resume
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      showToast(
                                        `Downloading ${req.cvFileName ?? 'CV'}...`,
                                        'success',
                                      )
                                    }
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg text-blue-400 text-[9px] font-['Rajdhani'] font-bold transition-colors"
                                  >
                                    <Download size={9} /> VIEW CV
                                  </button>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {[
                                  { label: 'Phone Verified', ok: true },
                                  { label: 'Face Captured', ok: true },
                                  { label: 'Terms Accepted', ok: true },
                                  { label: 'Permissions', ok: true },
                                  {
                                    label: 'CV Attached',
                                    ok: !!req.cvFileName,
                                  },
                                ].map(({ label, ok }) => (
                                  <div
                                    key={label}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-['Rajdhani'] font-semibold ${ok ? 'bg-teal-500/8 border-teal-500/20 text-teal-400' : 'bg-red-500/8 border-red-500/20 text-red-400'}`}
                                  >
                                    {ok ? (
                                      <CheckCircle size={8} />
                                    ) : (
                                      <XCircle size={8} />
                                    )}{' '}
                                    {label}
                                  </div>
                                ))}
                              </div>

                              <input
                                placeholder="Optional rejection note..."
                                value={rejectNote[req.id] ?? ''}
                                onChange={(e) =>
                                  setRejectNote((prev) => ({
                                    ...prev,
                                    [req.id]: e.target.value,
                                  }))
                                }
                                className="w-full mt-3 bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-3 py-2 text-slate-300 text-xs font-['Rajdhani'] placeholder-slate-700 focus:outline-none focus:border-red-500/40 transition-colors"
                              />

                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] rounded-xl text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors shadow-[0_0_20px_rgba(0,212,170,0.25)] flex-1"
                                >
                                  <UserCheck size={12} /> APPROVE
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors flex-1"
                                >
                                  <UserX size={12} /> REJECT
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <h3 className="text-slate-400 font-['Rajdhani'] font-semibold text-sm mb-3 flex items-center gap-2">
                    <Zap size={12} className="text-teal-400" /> Recently
                    Processed
                  </h3>
                  {[
                    {
                      name: 'Farid Hassan',
                      action: 'approved',
                      time: '1 hour ago',
                    },
                    {
                      name: 'Lina Yusuf',
                      action: 'approved',
                      time: '3 hours ago',
                    },
                    {
                      name: 'Omar Shaikh',
                      action: 'rejected',
                      time: 'Yesterday',
                    },
                  ].map(({ name, action, time }) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 py-2.5 border-b border-[#1a2540] last:border-0"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${action === 'approved' ? 'bg-teal-500/10' : 'bg-red-500/10'}`}
                      >
                        {action === 'approved' ? (
                          <CheckCircle size={12} className="text-teal-400" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                      </div>
                      <span className="text-slate-300 text-sm font-['Rajdhani'] flex-1">
                        {name}
                      </span>
                      <span
                        className={`text-[10px] font-['Rajdhani'] font-bold uppercase ${action === 'approved' ? 'text-teal-400' : 'text-red-400'}`}
                      >
                        {action}
                      </span>
                      <span className="text-slate-600 text-[10px] font-['JetBrains_Mono']">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ MAP ════════════════════════════════════════════════ */}
          {activeTab === 'map' && (
            <div
              className="flex-1 flex overflow-hidden"
              style={{ minHeight: 0 }}
            >
              {/* Map container — position:relative so LiveMap (absolute inset-0) works */}
              <div className="flex-1 relative overflow-hidden min-h-0">
                <LiveMap
                  officers={officers}
                  selectedOfficer={selectedOfficer}
                  onSelectOfficer={setSelectedOfficer}
                  geoFences={geoFences}
                  onAssignOfficerToZone={handleAssignOfficerToZone}
                />
              </div>
              {/* Desktop officer sidebar */}
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 272, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 28 }}
                    className="hidden md:block flex-shrink-0 overflow-hidden border-l border-[#1e2d4a]"
                  >
                    <OfficerSidebar
                      officers={officers}
                      pendingApprovals={pendingApprovals}
                      selectedOfficer={selectedOfficer}
                      onSelectOfficer={setSelectedOfficer}
                      activeTab="officers"
                      onTabChange={() => {}}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      analytics={analytics}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Sidebar toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-40 w-5 h-10 bg-[#0d1425] border border-[#1e2d4a] rounded-l-lg items-center justify-center text-slate-500 hover:text-white transition-colors"
                style={{ right: sidebarCollapsed ? 0 : 272 }}
              >
                {sidebarCollapsed ? (
                  <ChevronLeft size={10} />
                ) : (
                  <ChevronRight size={10} />
                )}
              </button>
            </div>
          )}

          {/* ═══ OFFICERS ══════════════════════════════════════════ */}
          {activeTab === 'officers' && (
            <div className="flex-1 overflow-hidden">
              <OfficerSidebar
                officers={officers}
                pendingApprovals={pendingApprovals}
                selectedOfficer={selectedOfficer}
                onSelectOfficer={(id) => {
                  setSelectedOfficer(id)
                  setActiveTab('map')
                }}
                activeTab="officers"
                onTabChange={() => {}}
                onApprove={handleApprove}
                onReject={handleReject}
                analytics={analytics}
                fullWidth
              />
            </div>
          )}

          {/* ═══ TEAMS ═════════════════════════════════════════════ */}
          {activeTab === 'teams' && (
            <div className="flex-1 overflow-hidden">
              <TeamsCompaniesPanel
                companies={companies}
                teams={teams}
                localAdmins={localAdmins}
                allOfficers={officers.map((o) => ({
                  id: o.id,
                  name: o.name,
                  email: `${o.id}@field.com`,
                  teamId: o.teamId ?? null,
                  companyId: null,
                }))}
                onCreateCompany={(name, desc, plan) => {
                  setCompanies((prev) => [
                    ...prev,
                    {
                      id: `co-${Date.now()}`,
                      name,
                      description: desc,
                      plan,
                      isActive: true,
                      teamCount: 0,
                      officerCount: 0,
                      createdAt: new Date().toISOString().slice(0, 10),
                    },
                  ])
                  showToast(`Company "${name}" created`, 'success')
                }}
                onDeleteCompany={(id) => {
                  setCompanies((prev) => prev.filter((c) => c.id !== id))
                  showToast('Company deleted', 'warning')
                }}
                onCreateTeam={(name, companyId, desc, color) => {
                  const co = companies.find((c) => c.id === companyId)
                  setTeams((prev) => [
                    ...prev,
                    {
                      id: `team-${Date.now()}`,
                      name,
                      companyId,
                      companyName: co?.name ?? '',
                      description: desc,
                      color,
                      localAdminId: null,
                      localAdminName: null,
                      officerCount: 0,
                      isActive: true,
                    },
                  ])
                  showToast(`Team "${name}" created`, 'success')
                }}
                onDeleteTeam={(id) => {
                  setTeams((prev) => prev.filter((t) => t.id !== id))
                  showToast('Team deleted', 'warning')
                }}
                onAssignAdmin={(teamId, adminId) => {
                  const admin = localAdmins.find((a) => a.id === adminId)
                  setTeams((prev) =>
                    prev.map((t) =>
                      t.id === teamId
                        ? {
                            ...t,
                            localAdminId: adminId,
                            localAdminName: admin?.name ?? null,
                          }
                        : t,
                    ),
                  )
                  showToast('Admin assigned', 'success')
                }}
                onRemoveAdmin={(adminId) => {
                  setTeams((prev) =>
                    prev.map((t) =>
                      t.localAdminId === adminId
                        ? { ...t, localAdminId: null, localAdminName: null }
                        : t,
                    ),
                  )
                  showToast('Admin removed', 'warning')
                }}
                onAssignOfficerToTeam={(officerId, teamId) => {
                  setOfficers((prev) =>
                    prev.map((o) =>
                      o.id === officerId ? { ...o, teamId } : o,
                    ),
                  )
                  showToast('Officer assigned to team', 'success')
                }}
                onCreateLocalAdmin={(name, email, teamId, companyId) => {
                  const team = teams.find((t) => t.id === teamId)
                  const newAdmin: LocalAdmin = {
                    id: `la-${Date.now()}`,
                    name,
                    email,
                    teamId,
                    teamName: team?.name ?? null,
                    companyId,
                    status: 'pending',
                    officerCount: 0,
                  }
                  setLocalAdmins((prev) => [...prev, newAdmin])
                  setTeams((prev) =>
                    prev.map((t) =>
                      t.id === teamId
                        ? {
                            ...t,
                            localAdminId: newAdmin.id,
                            localAdminName: name,
                          }
                        : t,
                    ),
                  )
                  showToast(`Local admin "${name}" created`, 'success')
                }}
              />
            </div>
          )}

          {/* ═══ ATTENDANCE ════════════════════════════════════════ */}
          {activeTab === 'attendance' && (
            <div className="flex-1 overflow-hidden">
              <AttendancePanel officers={officers} onShowToast={showToast} />
            </div>
          )}

          {/* ═══ MESSAGES ══════════════════════════════════════════ */}
          {activeTab === 'messages' && (
            <div className="flex-1 overflow-hidden">
              <MessengerPanel
                currentUserId="admin"
                currentUserName="Main Admin"
                messages={messages}
                onSendText={handleSendMessage}
                onSendVoice={(blob, duration) =>
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `m-${Date.now()}`,
                      senderId: 'admin',
                      senderName: 'Main Admin',
                      type: 'voice',
                      fileUrl: URL.createObjectURL(blob),
                      duration,
                      timestamp: new Date().toISOString(),
                      isMine: true,
                    },
                  ])
                }
                onSendMedia={(file, type, geo) =>
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `m-${Date.now()}`,
                      senderId: 'admin',
                      senderName: 'Main Admin',
                      type,
                      fileUrl: URL.createObjectURL(file),
                      geoLat: geo.lat,
                      geoLng: geo.lng,
                      geoAddress: geo.address,
                      capturedAt: new Date().toISOString(),
                      timestamp: new Date().toISOString(),
                      isMine: true,
                    },
                  ])
                }
                onVoiceCall={() => showToast('Voice call initiated', 'success')}
                chatTitle="Team Channel"
                isGroupChat
              />
            </div>
          )}

          {/* ═══ ANALYTICS ═════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <h2 className="text-white font-['Rajdhani'] font-bold text-xl sm:text-2xl tracking-wide mb-5">
                Analytics Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  {
                    label: 'Total Officers',
                    value: analytics.totalOfficers,
                    color: '#00d4aa',
                  },
                  {
                    label: 'Active Now',
                    value: analytics.activeNow,
                    color: '#60a5fa',
                  },
                  {
                    label: 'KM Today',
                    value: analytics.totalDistanceToday.toFixed(1),
                    color: '#f59e0b',
                  },
                  {
                    label: 'Coverage %',
                    value: `${analytics.coveragePercent}%`,
                    color: '#8b5cf6',
                  },
                  {
                    label: 'Companies',
                    value: companies.length,
                    color: '#ec4899',
                  },
                  { label: 'Teams', value: teams.length, color: '#10b981' },
                  {
                    label: 'Local Admins',
                    value: localAdmins.length,
                    color: '#f97316',
                  },
                  { label: 'Checked In', value: checkedIn, color: '#00d4aa' },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl p-3 sm:p-4"
                  >
                    <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p
                      className="text-2xl sm:text-3xl font-['Rajdhani'] font-bold"
                      style={{ color }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl p-4 sm:p-5">
                <h3 className="text-white font-['Rajdhani'] font-semibold text-sm sm:text-base mb-4">
                  Team Performance
                </h3>
                <div className="space-y-3">
                  {teams.map((team) => {
                    const teamOfficers = officers.filter(
                      (o) => o.teamId === team.id,
                    )
                    const active = teamOfficers.filter(
                      (o) => o.status === 'online',
                    ).length
                    const pct =
                      teamOfficers.length > 0
                        ? (active / teamOfficers.length) * 100
                        : 0
                    return (
                      <div key={team.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="text-slate-300 text-xs sm:text-sm font-['Rajdhani']">
                              {team.name}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                            {active}/{teamOfficers.length} active
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ══════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <h2 className="text-white font-['Rajdhani'] font-bold text-xl sm:text-2xl tracking-wide mb-5">
                System Settings
              </h2>
              <div className="space-y-3 max-w-2xl">
                {[
                  {
                    label: 'Appwrite Endpoint',
                    desc: 'Backend API endpoint',
                    value: 'sgp.cloud.appwrite.io',
                  },
                  {
                    label: 'Project ID',
                    desc: 'Employee Tracking System',
                    value: '69cb0dd10032c979e8b7',
                  },
                  {
                    label: 'Custom Domain',
                    desc: 'Production URL',
                    value: 'www.vixsy.live',
                  },
                  {
                    label: 'Tracking Interval',
                    desc: 'Location update frequency',
                    value: '5 seconds',
                  },
                  {
                    label: 'Inactivity Timeout',
                    desc: 'Mark officer offline after',
                    value: '2 minutes',
                  },
                  {
                    label: 'Same-Location Alert',
                    desc: 'Alert if no movement after',
                    value: '1 hour',
                  },
                  {
                    label: 'History Retention',
                    desc: 'Keep location history for',
                    value: '24 hours',
                  },
                  {
                    label: 'Geo-fence Alerts',
                    desc: 'Alert on boundary violations',
                    value: 'Enabled',
                  },
                  {
                    label: 'Mock Location Detection',
                    desc: 'Flag suspicious GPS data',
                    value: 'Enabled',
                  },
                  {
                    label: 'Auto Absent Marking',
                    desc: 'Mark absent after 2hr inactivity',
                    value: 'Enabled',
                  },
                  {
                    label: 'OTP Phone Verification',
                    desc: 'BD number required on register',
                    value: 'Enabled',
                  },
                  {
                    label: 'Offline Queue Sync',
                    desc: 'Auto-sync when internet restored',
                    value: 'Enabled',
                  },
                  {
                    label: 'Alert Sound',
                    desc: 'Audio alert on geo-fence breach',
                    value: soundEnabled ? 'On' : 'Off',
                  },
                ].map(({ label, desc, value }) => (
                  <div
                    key={label}
                    className="bg-[#0d1425] border border-[#1e2d4a] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-white font-['Rajdhani'] font-semibold text-sm">
                        {label}
                      </p>
                      <p className="text-slate-500 text-xs font-['Rajdhani']">
                        {desc}
                      </p>
                    </div>
                    <span className="text-teal-400 text-sm font-['JetBrains_Mono'] flex-shrink-0">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── MOBILE BOTTOM NAV ──────────────────────────────────── */}
        <div
          className="md:hidden flex-shrink-0 bg-[#080e1c] border-t border-[#1e2d4a] flex items-center justify-around px-1 py-1"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + 4px)' }}
        >
          {[
            { id: 'dashboard' as NavTab, icon: LayoutDashboard, label: 'Home' },
            {
              id: 'requests' as NavTab,
              icon: Bell,
              label: 'Requests',
              badge: pendingApprovals.length,
            },
            { id: 'map' as NavTab, icon: MapPin, label: 'Map' },
            { id: 'messages' as NavTab, icon: MessageSquare, label: 'Chat' },
            { id: 'officers' as NavTab, icon: Users, label: 'Officers' },
          ].map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all relative ${activeTab === id ? 'text-teal-400' : 'text-slate-600'}`}
            >
              <div className="relative">
                <Icon size={18} />
                {badge != null && badge > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-red-500 rounded-full flex items-center justify-center px-0.5">
                    <span className="text-[7px] text-white font-bold">
                      {badge}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-['Rajdhani'] font-semibold tracking-wide">
                {label}
              </span>
              {activeTab === id && (
                <motion.div
                  layoutId="admin-tab-dot"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-teal-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Sidebar */}
      <ProfileSidebar
        name="Kawsar Hossain"
        email="kawsarhossain31des@gmail.com"
        role="main_admin"
        onSignOut={() => {
          sessionStorage.removeItem('adminAuth')
          sessionStorage.removeItem('adminEmail')
          setIsAuthed(false)
        }}
        companyName="FieldTrack Systems"
      />

      {/* Floating Chat (desktop only) */}
      <AnimatePresence>
        {activeTab !== 'messages' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setActiveTab('messages')}
            className="hidden md:flex fixed bottom-6 right-16 z-40 w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/25 items-center justify-center hover:bg-teal-500/25 transition-colors shadow-xl"
          >
            <MessageSquare size={16} className="text-teal-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 60, x: '-50%' }}
            className={`fixed bottom-20 md:bottom-6 left-1/2 z-[100] px-4 py-2.5 rounded-xl border backdrop-blur-xl flex items-center gap-2.5 shadow-2xl whitespace-nowrap ${toast.type === 'success' ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}
          >
            <AlertTriangle size={13} />
            <span className="font-['Rajdhani'] font-semibold text-sm tracking-wide">
              {toast.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
