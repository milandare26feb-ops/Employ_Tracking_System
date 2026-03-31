'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Building2,
  Users,
  Plus,
  Trash2,
  Shield,
  UserPlus,
  ChevronDown,
  CheckCircle,
  Clock,
  Crown,
  X,
} from 'lucide-react'

export interface Company {
  id: string
  name: string
  description?: string
  plan: 'starter' | 'pro' | 'enterprise'
  isActive: boolean
  teamCount: number
  officerCount: number
  createdAt: string
}

export interface Team {
  id: string
  name: string
  companyId: string
  companyName: string
  description?: string
  color: string
  localAdminId: string | null
  localAdminName: string | null
  officerCount: number
  isActive: boolean
}

export interface LocalAdmin {
  id: string
  name: string
  email: string
  teamId: string | null
  teamName: string | null
  companyId: string
  status: 'pending' | 'approved'
  officerCount: number
}

interface OfficerRef {
  id: string
  name: string
  email: string
  teamId: string | null
  companyId: string | null
}

interface TeamsCompaniesPanelProps {
  companies: Company[]
  teams: Team[]
  localAdmins: LocalAdmin[]
  allOfficers: OfficerRef[]
  onCreateCompany: (name: string, desc: string, plan: Company['plan']) => void
  onDeleteCompany: (id: string) => void
  onCreateTeam: (
    name: string,
    companyId: string,
    desc: string,
    color: string,
  ) => void
  onDeleteTeam: (id: string) => void
  onAssignAdmin: (teamId: string, adminId: string) => void
  onRemoveAdmin: (adminId: string) => void
  onAssignOfficerToTeam: (
    officerId: string,
    teamId: string,
    companyId: string,
  ) => void
  onCreateLocalAdmin: (
    name: string,
    email: string,
    teamId: string,
    companyId: string,
  ) => void
}

type PanelView = 'companies' | 'teams' | 'admins'

const PLAN_COLORS: Record<Company['plan'], string> = {
  starter: '#60a5fa',
  pro: '#f59e0b',
  enterprise: '#8b5cf6',
}

const TEAM_COLORS = [
  '#00d4aa',
  '#60a5fa',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f97316',
]

export default function TeamsCompaniesPanel({
  companies,
  teams,
  localAdmins,
  allOfficers,
  onCreateCompany,
  onDeleteCompany,
  onCreateTeam,
  onDeleteTeam,
  onAssignAdmin,
  onRemoveAdmin,
  onAssignOfficerToTeam,
  onCreateLocalAdmin,
}: TeamsCompaniesPanelProps) {
  const [view, setView] = useState<PanelView>('companies')
  const [showCreateCompany, setShowCreateCompany] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  // Form state
  const [coName, setCoName] = useState('')
  const [coDesc, setCoDesc] = useState('')
  const [coPlan, setCoPlan] = useState<Company['plan']>('starter')
  const [teamName, setTeamName] = useState('')
  const [teamCompany, setTeamCompany] = useState('')
  const [teamDesc, setTeamDesc] = useState('')
  const [teamColor, setTeamColor] = useState(TEAM_COLORS[0])
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminTeam, setAdminTeam] = useState('')
  const [adminCompany, setAdminCompany] = useState('')

  const tabs: {
    id: PanelView
    label: string
    icon: typeof Building2
    count: number
  }[] = [
    {
      id: 'companies',
      label: 'Companies',
      icon: Building2,
      count: companies.length,
    },
    { id: 'teams', label: 'Teams', icon: Users, count: teams.length },
    {
      id: 'admins',
      label: 'Local Admins',
      icon: Shield,
      count: localAdmins.length,
    },
  ]

  const submitCompany = () => {
    if (!coName.trim()) return
    onCreateCompany(coName.trim(), coDesc.trim(), coPlan)
    setCoName('')
    setCoDesc('')
    setCoPlan('starter')
    setShowCreateCompany(false)
  }

  const submitTeam = () => {
    if (!teamName.trim() || !teamCompany) return
    onCreateTeam(teamName.trim(), teamCompany, teamDesc.trim(), teamColor)
    setTeamName('')
    setTeamCompany('')
    setTeamDesc('')
    setTeamColor(TEAM_COLORS[0])
    setShowCreateTeam(false)
  }

  const submitAdmin = () => {
    if (!adminName.trim() || !adminEmail.trim() || !adminTeam || !adminCompany)
      return
    onCreateLocalAdmin(
      adminName.trim(),
      adminEmail.trim(),
      adminTeam,
      adminCompany,
    )
    setAdminName('')
    setAdminEmail('')
    setAdminTeam('')
    setAdminCompany('')
    setShowCreateAdmin(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1e2d4a] flex items-center justify-between flex-shrink-0">
        <h2 className="text-white font-['Rajdhani'] font-bold text-lg tracking-wide">
          TEAMS & COMPANIES
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (view === 'companies') setShowCreateCompany(true)
            if (view === 'teams') setShowCreateTeam(true)
            if (view === 'admins') setShowCreateAdmin(true)
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-400 rounded-xl text-xs font-['Rajdhani'] font-semibold tracking-wide transition-colors"
        >
          <Plus size={13} /> Create
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e2d4a] px-3 pt-2 flex-shrink-0">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-['Rajdhani'] font-semibold tracking-wide border-b-2 transition-all mr-1 ${
              view === id
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={11} />
            {label}
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] ${
                view === id
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'bg-[#1e2d4a] text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* ── Companies ─────────────────────────────────────────────────── */}
        {view === 'companies' && (
          <AnimatePresence>
            {companies.map((co) => (
              <motion.div
                key={co.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl overflow-hidden"
              >
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    setExpandedCompany(expandedCompany === co.id ? null : co.id)
                  }
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1e2d4a] flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-['Rajdhani'] font-semibold text-sm truncate">
                        {co.name}
                      </p>
                      <span
                        className="text-[9px] font-['Rajdhani'] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                        style={{
                          color: PLAN_COLORS[co.plan],
                          backgroundColor: `${PLAN_COLORS[co.plan]}18`,
                          border: `1px solid ${PLAN_COLORS[co.plan]}33`,
                        }}
                      >
                        {co.plan}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-['JetBrains_Mono'] mt-0.5">
                      {co.teamCount} teams · {co.officerCount} officers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCompany(co.id)
                      }}
                      className="w-7 h-7 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronDown
                      size={14}
                      className={`text-slate-600 transition-transform ${
                        expandedCompany === co.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                <AnimatePresence>
                  {expandedCompany === co.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-[#1e2d4a] pt-3">
                        <p className="text-slate-400 text-xs font-['Rajdhani'] mb-2">
                          {co.description || 'No description'}
                        </p>
                        <p className="text-slate-600 text-[10px] font-['JetBrains_Mono']">
                          Created: {co.createdAt}
                        </p>
                        <div className="mt-3 space-y-1.5">
                          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani']">
                            Teams in this company
                          </p>
                          {teams
                            .filter((t) => t.companyId === co.id)
                            .map((team) => (
                              <div
                                key={team.id}
                                className="flex items-center gap-2 px-2 py-1.5 bg-[#1a2540] rounded-lg"
                              >
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: team.color }}
                                />
                                <span className="text-slate-300 text-xs font-['Rajdhani']">
                                  {team.name}
                                </span>
                                <span className="ml-auto text-slate-600 text-[10px]">
                                  {team.officerCount} officers
                                </span>
                              </div>
                            ))}
                          {teams.filter((t) => t.companyId === co.id).length ===
                            0 && (
                            <p className="text-slate-700 text-xs font-['Rajdhani'] italic">
                              No teams yet
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {companies.length === 0 && (
              <div className="text-center py-12 text-slate-600 font-['Rajdhani']">
                No companies yet. Create one to get started.
              </div>
            )}
          </AnimatePresence>
        )}

        {/* ── Teams ─────────────────────────────────────────────────────── */}
        {view === 'teams' && (
          <AnimatePresence>
            {teams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl overflow-hidden"
              >
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    setExpandedTeam(expandedTeam === team.id ? null : team.id)
                  }
                >
                  <div
                    className="w-2 h-10 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-['Rajdhani'] font-semibold text-sm">
                      {team.name}
                    </p>
                    <p className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                      {team.companyName} · {team.officerCount} officers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.localAdminId ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                        <Crown size={9} className="text-teal-400" />
                        <span className="text-teal-400 text-[9px] font-['Rajdhani']">
                          {team.localAdminName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[10px] font-['Rajdhani'] italic">
                        No admin
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTeam(team.id)
                      }}
                      className="w-7 h-7 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    <ChevronDown
                      size={14}
                      className={`text-slate-600 transition-transform ${
                        expandedTeam === team.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTeam === team.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-[#1e2d4a] pt-3 space-y-3">
                        {/* Assign admin */}
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] mb-2">
                            Assign Local Admin
                          </p>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 bg-[#0a0f1e] border border-[#1e2d4a] rounded-lg px-3 py-2 text-slate-300 text-xs font-['Rajdhani'] focus:outline-none"
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value)
                                  onAssignAdmin(team.id, e.target.value)
                              }}
                            >
                              <option value="" disabled>
                                Select admin...
                              </option>
                              {localAdmins.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                            {team.localAdminId && (
                              <button
                                onClick={() =>
                                  onRemoveAdmin(team.localAdminId!)
                                }
                                className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-['Rajdhani'] hover:bg-red-500/20 transition-colors flex items-center gap-1"
                              >
                                <X size={10} /> Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Officers in team */}
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] mb-2">
                            Assign Officers
                          </p>
                          <div className="space-y-1.5">
                            {allOfficers
                              .filter((o) => o.teamId === team.id)
                              .map((o) => (
                                <div
                                  key={o.id}
                                  className="flex items-center gap-2 px-2 py-1.5 bg-[#1a2540] rounded-lg"
                                >
                                  <CheckCircle
                                    size={11}
                                    className="text-teal-400"
                                  />
                                  <span className="text-slate-300 text-xs font-['Rajdhani'] flex-1">
                                    {o.name}
                                  </span>
                                  <button
                                    onClick={() =>
                                      onAssignOfficerToTeam(
                                        o.id,
                                        '',
                                        team.companyId,
                                      )
                                    }
                                    className="text-slate-600 hover:text-red-400 transition-colors"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            {/* Unassigned officers */}
                            {allOfficers
                              .filter((o) => !o.teamId)
                              .map((o) => (
                                <button
                                  key={o.id}
                                  onClick={() =>
                                    onAssignOfficerToTeam(
                                      o.id,
                                      team.id,
                                      team.companyId,
                                    )
                                  }
                                  className="w-full flex items-center gap-2 px-2 py-1.5 bg-[#0a0f1e] border border-dashed border-[#1e2d4a] rounded-lg hover:border-teal-500/30 transition-colors"
                                >
                                  <UserPlus
                                    size={11}
                                    className="text-slate-600"
                                  />
                                  <span className="text-slate-500 text-xs font-['Rajdhani']">
                                    {o.name}
                                  </span>
                                  <span className="ml-auto text-teal-400/60 text-[9px]">
                                    + Add
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {teams.length === 0 && (
              <div className="text-center py-12 text-slate-600 font-['Rajdhani']">
                No teams yet. Create one to get started.
              </div>
            )}
          </AnimatePresence>
        )}

        {/* ── Local Admins ───────────────────────────────────────────────── */}
        {view === 'admins' && (
          <AnimatePresence>
            {localAdmins.map((admin) => (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1425] border border-[#1e2d4a] rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1e2d4a] flex items-center justify-center">
                  <Shield size={16} className="text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-['Rajdhani'] font-semibold text-sm">
                    {admin.name}
                  </p>
                  <p className="text-slate-500 text-[10px] font-['JetBrains_Mono'] truncate">
                    {admin.email}
                  </p>
                  <p className="text-slate-600 text-[10px] font-['Rajdhani'] mt-0.5">
                    {admin.teamName ?? 'No team'} · {admin.officerCount}{' '}
                    officers managed
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-['Rajdhani'] font-bold ${
                    admin.status === 'approved'
                      ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}
                >
                  {admin.status === 'approved' ? (
                    <CheckCircle size={10} />
                  ) : (
                    <Clock size={10} />
                  )}
                  {admin.status.toUpperCase()}
                </div>
                <button
                  onClick={() => onRemoveAdmin(admin.id)}
                  className="w-7 h-7 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
            {localAdmins.length === 0 && (
              <div className="text-center py-12 text-slate-600 font-['Rajdhani']">
                No local admins yet.
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      {/* Create Company */}
      <AnimatePresence>
        {showCreateCompany && (
          <Modal
            title="Create Company"
            onClose={() => setShowCreateCompany(false)}
            onSubmit={submitCompany}
          >
            <Field
              label="Company Name"
              value={coName}
              onChange={setCoName}
              placeholder="Acme Sdn Bhd"
            />
            <Field
              label="Description"
              value={coDesc}
              onChange={setCoDesc}
              placeholder="Optional"
            />
            <div>
              <label className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] block mb-2">
                Plan
              </label>
              <select
                value={coPlan}
                onChange={(e) => setCoPlan(e.target.value as Company['plan'])}
                className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Create Team */}
      <AnimatePresence>
        {showCreateTeam && (
          <Modal
            title="Create Team"
            onClose={() => setShowCreateTeam(false)}
            onSubmit={submitTeam}
          >
            <Field
              label="Team Name"
              value={teamName}
              onChange={setTeamName}
              placeholder="Alpha Sales"
            />
            <Field
              label="Description"
              value={teamDesc}
              onChange={setTeamDesc}
              placeholder="Optional"
            />
            <div>
              <label className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] block mb-2">
                Company
              </label>
              <select
                value={teamCompany}
                onChange={(e) => setTeamCompany(e.target.value)}
                className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none"
              >
                <option value="" disabled>
                  Select company...
                </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] block mb-2">
                Team Color
              </label>
              <div className="flex gap-2">
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setTeamColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      teamColor === c
                        ? 'border-white scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Create Local Admin */}
      <AnimatePresence>
        {showCreateAdmin && (
          <Modal
            title="Create Local Admin"
            onClose={() => setShowCreateAdmin(false)}
            onSubmit={submitAdmin}
          >
            <Field
              label="Admin Name"
              value={adminName}
              onChange={setAdminName}
              placeholder="Hassan Ali"
            />
            <Field
              label="Admin Email"
              value={adminEmail}
              onChange={setAdminEmail}
              placeholder="admin@company.com"
              type="email"
            />
            <div>
              <label className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] block mb-2">
                Assign to Company
              </label>
              <select
                value={adminCompany}
                onChange={(e) => setAdminCompany(e.target.value)}
                className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none"
              >
                <option value="" disabled>
                  Select company...
                </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] block mb-2">
                Assign to Team
              </label>
              <select
                value={adminTeam}
                onChange={(e) => setAdminTeam(e.target.value)}
                className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none"
              >
                <option value="" disabled>
                  Select team...
                </option>
                {teams
                  .filter((t) => t.companyId === adminCompany)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Reusable sub-components ────────────────────────────────────────────────

function Modal({
  title,
  children,
  onClose,
  onSubmit,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  onSubmit: () => void
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none"
      >
        <div className="w-full max-w-sm bg-[#0d1425] border border-[#1e2d4a] rounded-3xl p-6 shadow-2xl space-y-4 pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-['Rajdhani'] font-bold tracking-wide">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          {children}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#1e2d4a] border border-[#2a3a5a] text-slate-400 rounded-2xl text-xs font-['Rajdhani'] font-bold tracking-widest hover:border-slate-500/50 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] rounded-2xl text-xs font-['Rajdhani'] font-bold tracking-widest transition-colors shadow-[0_0_20px_rgba(0,212,170,0.25)]"
            >
              CREATE
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label className="text-slate-500 text-[10px] uppercase tracking-wider font-['Rajdhani'] block mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0f1e] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] focus:outline-none focus:border-teal-500/50 transition-colors placeholder-slate-700"
      />
    </div>
  )
}
