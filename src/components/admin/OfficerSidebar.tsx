'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  ChevronRight,
  Search,
  Battery,
  Navigation,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Plus,
} from 'lucide-react'
import type { OfficerMarker } from './LiveMap'

interface OfficerSidebarProps {
  officers: OfficerMarker[]
  pendingApprovals: PendingApproval[]
  selectedOfficer: string | null
  onSelectOfficer: (id: string | null) => void
  activeTab: string
  onTabChange: (tab: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  analytics: AnalyticsSummary
  fullWidth?: boolean
}

export interface PendingApproval {
  id: string
  name: string
  email: string
  submittedAt: string
  phone: string
  department: string
  cvFileName?: string
}

export interface AnalyticsSummary {
  totalOfficers: number
  activeNow: number
  idleCount: number
  offlineCount: number
  totalDistanceToday: number
  alertsToday: number
  avgResponseTime: number
  coveragePercent: number
}

const tabs = [
  { id: 'officers', label: 'Officers', icon: Users },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle },
  { id: 'geofences', label: 'Geo-Fences', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function OfficerSidebar({
  officers,
  pendingApprovals,
  selectedOfficer,
  onSelectOfficer,
  activeTab,
  onTabChange,
  onApprove,
  onReject,
  analytics,
  fullWidth,
}: OfficerSidebarProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'online' | 'idle' | 'offline'
  >('all')

  const filteredOfficers = officers.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div
      className={`flex h-full bg-[#0d1425] border-l border-[#1e2d4a] ${fullWidth ? 'w-full' : ''}`}
    >
      {/* Tab Rail */}
      <div className="w-14 flex flex-col items-center py-4 gap-1 bg-[#080e1c] border-r border-[#1e2d4a]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const hasBadge = tab.id === 'approvals' && pendingApprovals.length > 0
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                isActive
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {hasBadge && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center">
                  {pendingApprovals.length}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-teal-400 rounded-r-full"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Content Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'officers' && (
            <motion.div
              key="officers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#1e2d4a]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-['Rajdhani'] font-bold text-white text-base tracking-wide">
                    FIELD OFFICERS
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                      <span className="text-teal-400 text-[11px] font-['JetBrains_Mono']">
                        {analytics.activeNow} LIVE
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search officers..."
                    className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>
                <div className="flex gap-1">
                  {(['all', 'online', 'idle', 'offline'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`flex-1 py-1 rounded text-[10px] font-['Rajdhani'] font-semibold tracking-wide uppercase transition-all ${
                        statusFilter === s
                          ? s === 'online'
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : s === 'idle'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : s === 'offline'
                                ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-[#0a0f1e] text-slate-600 border border-[#1e2d4a] hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Officer List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredOfficers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <Users size={24} className="text-slate-700" />
                    <p className="text-slate-600 text-xs font-['Rajdhani']">
                      No officers found
                    </p>
                  </div>
                ) : (
                  filteredOfficers.map((officer) => (
                    <OfficerCard
                      key={officer.id}
                      officer={officer}
                      isSelected={selectedOfficer === officer.id}
                      onSelect={() =>
                        onSelectOfficer(
                          selectedOfficer === officer.id ? null : officer.id,
                        )
                      }
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'approvals' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-[#1e2d4a]">
                <h2 className="font-['Rajdhani'] font-bold text-white text-base tracking-wide">
                  PENDING APPROVALS
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {pendingApprovals.length} requests awaiting review
                </p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {pendingApprovals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <CheckCircle size={24} className="text-teal-700" />
                    <p className="text-slate-500 text-xs font-['Rajdhani']">
                      All approvals processed
                    </p>
                  </div>
                ) : (
                  pendingApprovals.map((approval) => (
                    <ApprovalCard
                      key={approval.id}
                      approval={approval}
                      onApprove={() => onApprove(approval.id)}
                      onReject={() => onReject(approval.id)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-[#1e2d4a]">
                <h2 className="font-['Rajdhani'] font-bold text-white text-base tracking-wide">
                  ANALYTICS
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Today's performance overview
                </p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                <AnalyticsPanel analytics={analytics} officers={officers} />
              </div>
            </motion.div>
          )}

          {activeTab === 'geofences' && (
            <motion.div
              key="geofences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-[#1e2d4a]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-['Rajdhani'] font-bold text-white text-base tracking-wide">
                      GEO-FENCES
                    </h2>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Active boundary zones
                    </p>
                  </div>
                  <button className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 hover:bg-teal-500/20 transition-colors">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {[
                  {
                    name: 'KL City Centre',
                    officers: 3,
                    violations: 0,
                    color: '#00d4aa',
                  },
                  {
                    name: 'Petaling Jaya',
                    officers: 2,
                    violations: 1,
                    color: '#f59e0b',
                  },
                  {
                    name: 'Shah Alam',
                    officers: 1,
                    violations: 0,
                    color: '#8b5cf6',
                  },
                  {
                    name: 'Subang Jaya',
                    officers: 4,
                    violations: 2,
                    color: '#ef4444',
                  },
                ].map((fence) => (
                  <div
                    key={fence.name}
                    className="bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl p-3 hover:border-teal-500/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: fence.color }}
                        />
                        <span className="text-white text-xs font-['Rajdhani'] font-semibold">
                          {fence.name}
                        </span>
                      </div>
                      {fence.violations > 0 && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-['JetBrains_Mono']">
                          {fence.violations} violation
                          {fence.violations > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users size={10} /> {fence.officers} officers
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield size={10} /> Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-[#1e2d4a]">
                <h2 className="font-['Rajdhani'] font-bold text-white text-base tracking-wide">
                  REPORTS
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Export and download reports
                </p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {[
                  { name: 'Daily Activity Log', date: 'Today', size: '2.4 MB' },
                  { name: 'Weekly Summary', date: 'This Week', size: '8.1 MB' },
                  {
                    name: 'Location History',
                    date: 'Last 7 days',
                    size: '15.3 MB',
                  },
                  {
                    name: 'Geo-fence Violations',
                    date: 'This Month',
                    size: '1.2 MB',
                  },
                  {
                    name: 'Officer Performance',
                    date: 'This Month',
                    size: '3.7 MB',
                  },
                ].map((report) => (
                  <div
                    key={report.name}
                    className="bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl p-3 flex items-center justify-between hover:border-teal-500/20 transition-colors group"
                  >
                    <div>
                      <p className="text-white text-xs font-['Rajdhani'] font-semibold">
                        {report.name}
                      </p>
                      <p className="text-slate-600 text-[10px] mt-0.5 font-['JetBrains_Mono']">
                        {report.date} · {report.size}
                      </p>
                    </div>
                    <button className="w-7 h-7 rounded-lg bg-teal-500/0 border border-transparent group-hover:bg-teal-500/10 group-hover:border-teal-500/20 flex items-center justify-center text-slate-600 group-hover:text-teal-400 transition-all">
                      <Download size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-[#1e2d4a]">
                <h2 className="font-['Rajdhani'] font-bold text-white text-base tracking-wide">
                  SYSTEM SETTINGS
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                <SettingsSection
                  title="Tracking Intervals"
                  items={[
                    {
                      label: 'Update Frequency',
                      value: '5 seconds',
                      type: 'select',
                    },
                    {
                      label: 'Inactivity Timeout',
                      value: '2 minutes',
                      type: 'select',
                    },
                    {
                      label: 'History Retention',
                      value: '24 hours',
                      type: 'select',
                    },
                  ]}
                />
                <SettingsSection
                  title="Notifications"
                  items={[
                    {
                      label: 'Geo-fence Alerts',
                      value: 'Enabled',
                      type: 'toggle',
                    },
                    {
                      label: 'Inactivity Alerts',
                      value: 'Enabled',
                      type: 'toggle',
                    },
                    {
                      label: 'New Approvals',
                      value: 'Enabled',
                      type: 'toggle',
                    },
                    { label: 'Sound Alerts', value: 'Enabled', type: 'toggle' },
                  ]}
                />
                <SettingsSection
                  title="Access Control"
                  items={[
                    {
                      label: 'Require Face Capture',
                      value: 'Enforced',
                      type: 'badge',
                    },
                    {
                      label: 'Location Permission',
                      value: 'Mandatory',
                      type: 'badge',
                    },
                    {
                      label: 'Admin Approval',
                      value: 'Required',
                      type: 'badge',
                    },
                  ]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function OfficerCard({
  officer,
  isSelected,
  onSelect,
}: {
  officer: OfficerMarker
  isSelected: boolean
  onSelect: () => void
}) {
  const statusConfig = {
    online: {
      color: 'text-teal-400',
      bg: 'bg-teal-500',
      label: 'ONLINE',
      ring: 'border-teal-500/30',
    },
    idle: {
      color: 'text-amber-400',
      bg: 'bg-amber-500',
      label: 'IDLE',
      ring: 'border-amber-500/30',
    },
    offline: {
      color: 'text-slate-500',
      bg: 'bg-slate-600',
      label: 'OFFLINE',
      ring: 'border-slate-700',
    },
  }
  const cfg = statusConfig[officer.status]

  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left p-3 border-b border-[#1e2d4a] transition-all hover:bg-white/[0.02] ${
        isSelected ? 'bg-teal-500/5 border-l-2 border-l-teal-400' : ''
      }`}
      whileHover={{ x: 2 }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`relative w-10 h-10 rounded-full border-2 ${cfg.ring} overflow-hidden flex-shrink-0 bg-[#0a0f1e]`}
        >
          {officer.facePhoto ? (
            <img
              src={officer.facePhoto}
              className="w-full h-full object-cover"
              alt={officer.name}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-['Rajdhani'] font-bold text-sm"
              style={{ color: cfg.bg.replace('bg-', '') }}
            >
              {officer.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0d1425] ${cfg.bg} ${officer.status === 'online' ? 'animate-pulse' : ''}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-white text-xs font-['Rajdhani'] font-semibold truncate">
              {officer.name}
            </span>
            <span
              className={`text-[9px] font-['JetBrains_Mono'] font-semibold ${cfg.color}`}
            >
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-600 text-[10px] flex items-center gap-1 font-['JetBrains_Mono']">
              <Navigation size={8} /> {officer.speed.toFixed(1)} km/h
            </span>
            <span className="text-slate-600 text-[10px] flex items-center gap-1 font-['JetBrains_Mono']">
              <Battery size={8} /> {officer.battery}%
            </span>
          </div>
          <p className="text-slate-600 text-[10px] mt-0.5 truncate">
            {officer.address ||
              `${officer.lat.toFixed(4)}, ${officer.lng.toFixed(4)}`}
          </p>
        </div>
        <ChevronRight
          size={12}
          className={`flex-shrink-0 transition-colors ${isSelected ? 'text-teal-400' : 'text-slate-700'}`}
        />
      </div>
    </motion.button>
  )
}

function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: {
  approval: PendingApproval
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#0a0f1e] border border-amber-500/20 rounded-xl p-3"
    >
      <div className="flex items-start gap-2 mb-3">
        <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-400 font-['Rajdhani'] font-bold text-sm">
            {approval.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-['Rajdhani'] font-semibold">
            {approval.name}
          </p>
          <p className="text-slate-500 text-[10px] truncate">
            {approval.email}
          </p>
          <p className="text-amber-500/60 text-[10px] font-['JetBrains_Mono'] mt-0.5">
            {approval.department}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-[11px] font-['Rajdhani'] font-semibold tracking-wide hover:bg-teal-500/20 transition-colors flex items-center justify-center gap-1"
        >
          <CheckCircle size={11} /> APPROVE
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[11px] font-['Rajdhani'] font-semibold tracking-wide hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
        >
          <XCircle size={11} /> REJECT
        </button>
      </div>
    </motion.div>
  )
}

function AnalyticsPanel({
  analytics,
  officers,
}: {
  analytics: AnalyticsSummary
  officers: OfficerMarker[]
}) {
  const stats = [
    {
      label: 'Total Officers',
      value: analytics.totalOfficers,
      color: '#60a5fa',
      suffix: '',
    },
    {
      label: 'Active Now',
      value: analytics.activeNow,
      color: '#00d4aa',
      suffix: '',
    },
    {
      label: 'Distance Today',
      value: analytics.totalDistanceToday,
      color: '#8b5cf6',
      suffix: ' km',
    },
    {
      label: 'Alerts Today',
      value: analytics.alertsToday,
      color: '#f59e0b',
      suffix: '',
    },
    {
      label: 'Coverage',
      value: analytics.coveragePercent,
      color: '#00d4aa',
      suffix: '%',
    },
    {
      label: 'Avg Response',
      value: analytics.avgResponseTime,
      color: '#60a5fa',
      suffix: 's',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl p-3"
          >
            <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p
              className="font-['JetBrains_Mono'] font-bold text-lg"
              style={{ color: stat.color }}
            >
              {stat.value}
              {stat.suffix}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl p-3">
        <p className="text-slate-400 text-[11px] font-['Rajdhani'] uppercase tracking-wide mb-3">
          Status Distribution
        </p>
        <div className="space-y-2">
          {[
            {
              label: 'Online',
              count: analytics.activeNow,
              total: analytics.totalOfficers,
              color: '#00d4aa',
            },
            {
              label: 'Idle',
              count: analytics.idleCount,
              total: analytics.totalOfficers,
              color: '#f59e0b',
            },
            {
              label: 'Offline',
              count: analytics.offlineCount,
              total: analytics.totalOfficers,
              color: '#4b5563',
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span
                  className="font-['Rajdhani']"
                  style={{ color: item.color }}
                >
                  {item.label}
                </span>
                <span className="font-['JetBrains_Mono'] text-slate-500">
                  {item.count}/{item.total}
                </span>
              </div>
              <div className="h-1.5 bg-[#1e2d4a] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl p-3">
        <p className="text-slate-400 text-[11px] font-['Rajdhani'] uppercase tracking-wide mb-2">
          Top Performers Today
        </p>
        <div className="space-y-2">
          {officers.slice(0, 3).map((officer, i) => (
            <div key={officer.id} className="flex items-center gap-2">
              <span className="text-slate-600 text-[10px] font-['JetBrains_Mono'] w-4">
                #{i + 1}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#1e2d4a] flex items-center justify-center text-[10px] font-['Rajdhani'] font-bold text-slate-300 overflow-hidden">
                {officer.facePhoto ? (
                  <img
                    src={officer.facePhoto}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  officer.name.slice(0, 1)
                )}
              </div>
              <span className="text-slate-300 text-[11px] font-['Rajdhani'] flex-1 truncate">
                {officer.name}
              </span>
              <span className="text-teal-400 text-[10px] font-['JetBrains_Mono']">
                {(Math.random() * 30 + 10).toFixed(1)} km
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsSection({
  title,
  items,
}: {
  title: string
  items: { label: string; value: string; type: string }[]
}) {
  return (
    <div>
      <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-widest mb-2 px-1">
        {title}
      </p>
      <div className="bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl overflow-hidden">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-3 py-2.5 ${i < items.length - 1 ? 'border-b border-[#1e2d4a]' : ''}`}
          >
            <span className="text-slate-300 text-xs font-['Rajdhani']">
              {item.label}
            </span>
            {item.type === 'toggle' ? (
              <div className="w-8 h-4 bg-teal-500 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            ) : item.type === 'badge' ? (
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-['Rajdhani']">
                {item.value}
              </span>
            ) : (
              <span className="text-teal-400 text-[11px] font-['JetBrains_Mono']">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
