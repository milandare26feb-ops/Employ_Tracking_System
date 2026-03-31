'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  MapPin,
  Navigation,
  Battery,
  Clock,
  Activity,
  Phone,
  Wifi,
  WifiOff,
  AlertTriangle,
  Route,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
  ExternalLink,
  Calendar,
  History,
  ChevronDown,
  ChevronUp,
  Building2,
  UserCheck,
  Shield,
  CheckCircle,
  Users,
  Target,
  MapPinOff,
} from 'lucide-react'

export interface OfficerMarker {
  id: string
  name: string
  lat: number
  lng: number
  status: 'online' | 'idle' | 'offline'
  facePhoto?: string
  lastSeen: string
  speed: number
  battery: number
  address?: string
  phone?: string
  teamId?: string
  checkInStatus?: 'in' | 'out'
  checkInTime?: string
  assignedZoneId?: string
}

interface LiveMapProps {
  officers: OfficerMarker[]
  selectedOfficer: string | null
  onSelectOfficer: (id: string | null) => void
  geoFences: GeoFence[]
  onAssignOfficerToZone?: (officerId: string, zoneId: string | null) => void
}

export interface GeoFence {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
  color: string
  assignedOfficerIds?: string[]
}

interface HistoryPoint {
  lat: number
  lng: number
  time: number
  speed: number
  address?: string
}

interface WorkHistoryEntry {
  date: string
  monthYear: string
  location: string
  checkIn: string
  checkOut: string
  kmTravelled: number
  status: 'completed' | 'active' | 'absent'
  teamName: string
  assignedZone: string
}

const MAX_HISTORY = 60

function generateWorkHistory(officerName: string): WorkHistoryEntry[] {
  const zones = [
    'Jalan Bukit Bintang, KL',
    'KLCC Area, KL',
    'Bangsar South, KL',
    'Damansara Uptown, PJ',
    'Mont Kiara, KL',
    'Chow Kit, KL',
    'Sunway Pyramid Area',
    'Puchong IOI City',
    'Subang Jaya SS15',
    'Shah Alam i-City',
  ]
  const teams = ['Alpha Sales', 'Beta Marketing', 'Field Ops']
  const entries: WorkHistoryEntry[] = []
  const now = new Date()

  // Seed based on name so same officer gets consistent history
  const seed = officerName.charCodeAt(0) + officerName.charCodeAt(1)

  for (let d = 59; d >= 0; d--) {
    const date = new Date(now)
    date.setDate(date.getDate() - d)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 && (seed + d) % 3 !== 0) continue
    if (dayOfWeek === 6 && (seed + d) % 2 !== 0) continue

    const isAbsent = (seed + d) % 13 === 0
    const dateStr = date.toISOString().slice(0, 10)
    const monthYear = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    const zone = zones[(seed + d) % zones.length] ?? zones[0]
    const team = teams[(seed + d) % teams.length] ?? teams[0]
    const kmTravelled = isAbsent
      ? 0
      : parseFloat((((seed + d) % 30) + 5 + Math.random() * 5).toFixed(1))
    const checkInHour = 8 + ((seed + d) % 2)
    const checkInMin = (seed * d) % 59
    const checkOutHour = 17 + ((seed + d) % 2)
    const checkOutMin = (seed + d * 2) % 59
    const fmt = (h: number, m: number) =>
      `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`

    entries.push({
      date: dateStr,
      monthYear,
      location: isAbsent ? '—' : (zone ?? '—'),
      checkIn: isAbsent ? '—' : fmt(checkInHour, checkInMin),
      checkOut: isAbsent
        ? '—'
        : d === 0
          ? 'Active'
          : fmt(checkOutHour, checkOutMin),
      kmTravelled,
      status: isAbsent ? 'absent' : d === 0 ? 'active' : 'completed',
      teamName: team ?? 'Field Ops',
      assignedZone: isAbsent ? '—' : (zone ?? '—'),
    })
  }

  return entries.reverse()
}

// ── Officer Full History Modal ────────────────────────────────────────────────
function OfficerHistoryModal({
  officer,
  onClose,
}: {
  officer: OfficerMarker
  onClose: () => void
}) {
  const history = generateWorkHistory(officer.name)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const grouped: Record<string, WorkHistoryEntry[]> = {}
  history.forEach((e) => {
    if (!grouped[e.monthYear]) grouped[e.monthYear] = []
    grouped[e.monthYear].push(e)
  })
  const months = Object.keys(grouped)

  const totalKm = history.reduce((s, e) => s + e.kmTravelled, 0).toFixed(1)
  const activeDays = history.filter((e) => e.status !== 'absent').length
  const absentDays = history.filter((e) => e.status === 'absent').length

  const statusStyle = (s: WorkHistoryEntry['status']) => {
    if (s === 'active') return 'bg-teal-500/15 border-teal-500/30 text-teal-400'
    if (s === 'absent') return 'bg-red-500/10 border-red-500/20 text-red-400'
    return 'bg-slate-500/10 border-slate-500/20 text-slate-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-[#0a0f1e] border border-[#1e2d4a] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d4a] bg-[#080e1c] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center">
              <History size={16} className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-white font-['Rajdhani'] font-bold text-base tracking-wide">
                {officer.name} — Work History
              </h2>
              <p className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                Last 60 days · Location & Assignment Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 border-b border-[#1e2d4a] flex-shrink-0">
          {[
            { label: 'Days Active', value: activeDays, color: '#00d4aa' },
            { label: 'Days Absent', value: absentDays, color: '#ef4444' },
            { label: 'Total KM', value: `${totalKm}`, color: '#f59e0b' },
            {
              label: 'Avg KM/Day',
              value:
                activeDays > 0
                  ? (parseFloat(totalKm) / activeDays).toFixed(1)
                  : '0',
              color: '#60a5fa',
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`p-3 text-center ${i < 3 ? 'border-r border-[#1e2d4a]' : ''}`}
            >
              <p
                className="font-['JetBrains_Mono'] font-bold text-sm"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p className="text-slate-600 text-[9px] font-['Rajdhani'] uppercase tracking-widest mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {months.map((month) => {
            const entries = grouped[month] ?? []
            const isOpen =
              expandedMonth === month ||
              (expandedMonth === null && month === months[0])
            const monthKm = entries
              .reduce((s, e) => s + e.kmTravelled, 0)
              .toFixed(1)
            const monthActive = entries.filter(
              (e) => e.status !== 'absent',
            ).length
            return (
              <div key={month} className="border-b border-[#1e2d4a]">
                <button
                  onClick={() => setExpandedMonth(isOpen ? '__none__' : month)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#0d1425] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={13} className="text-teal-400" />
                    <span className="text-white font-['Rajdhani'] font-bold text-sm tracking-wide">
                      {month}
                    </span>
                    <span className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                      {monthActive} days · {monthKm} km
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={13} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={13} className="text-slate-500" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-2">
                        {entries.map((entry) => (
                          <div
                            key={entry.date}
                            className={`rounded-xl border p-3 ${entry.status === 'active' ? 'bg-teal-500/5 border-teal-500/20' : entry.status === 'absent' ? 'bg-red-500/5 border-red-500/15' : 'bg-[#080e1c] border-[#1e2d4a]'}`}
                          >
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-300 text-xs font-['JetBrains_Mono'] font-semibold">
                                  {new Date(entry.date).toLocaleDateString(
                                    'en-US',
                                    { weekday: 'short', day: 'numeric' },
                                  )}
                                </span>
                                <span
                                  className={`text-[8px] font-['Rajdhani'] font-bold px-1.5 py-0.5 rounded border uppercase ${statusStyle(entry.status)}`}
                                >
                                  {entry.status}
                                </span>
                              </div>
                              {entry.status !== 'absent' && (
                                <span className="text-amber-400 text-[10px] font-['JetBrains_Mono'] font-bold">
                                  {entry.kmTravelled} km
                                </span>
                              )}
                            </div>
                            {entry.status !== 'absent' && (
                              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1.5">
                                  <MapPin
                                    size={9}
                                    className="text-teal-500 flex-shrink-0"
                                  />
                                  <span className="text-slate-400 text-[10px] font-['Rajdhani'] truncate">
                                    {entry.location}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Building2
                                    size={9}
                                    className="text-blue-500 flex-shrink-0"
                                  />
                                  <span className="text-slate-400 text-[10px] font-['Rajdhani'] truncate">
                                    {entry.teamName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock
                                    size={9}
                                    className="text-green-500 flex-shrink-0"
                                  />
                                  <span className="text-slate-400 text-[10px] font-['JetBrains_Mono']">
                                    In: {entry.checkIn}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock
                                    size={9}
                                    className="text-red-400 flex-shrink-0"
                                  />
                                  <span className="text-slate-400 text-[10px] font-['JetBrains_Mono']">
                                    Out: {entry.checkOut}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Zone Assignment Modal ─────────────────────────────────────────────────────
function ZoneAssignModal({
  officer,
  geoFences,
  onAssign,
  onClose,
}: {
  officer: OfficerMarker
  geoFences: GeoFence[]
  onAssign: (officerId: string, zoneId: string | null) => void
  onClose: () => void
}) {
  const currentZone = geoFences.find((g) => g.id === officer.assignedZoneId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
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
                  {officer.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {currentZone && (
            <div className="mb-3 p-2.5 bg-teal-500/5 border border-teal-500/20 rounded-xl flex items-center gap-2">
              <CheckCircle size={12} className="text-teal-400 flex-shrink-0" />
              <span className="text-teal-300 text-xs font-['Rajdhani']">
                Currently assigned:{' '}
                <span className="font-bold">{currentZone.name}</span>
              </span>
            </div>
          )}

          <p className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-widest mb-3">
            Select a geo-fence zone
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {geoFences.length === 0 && (
              <div className="text-center py-6">
                <MapPinOff size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-['Rajdhani']">
                  No zones available
                </p>
                <p className="text-slate-600 text-xs font-['Rajdhani'] mt-1">
                  Create geo-fence zones on the map first
                </p>
              </div>
            )}
            {geoFences.map((fence) => {
              const isAssigned = officer.assignedZoneId === fence.id
              const assignedCount = fence.assignedOfficerIds?.length ?? 0
              return (
                <button
                  key={fence.id}
                  onClick={() => {
                    onAssign(officer.id, isAssigned ? null : fence.id)
                    onClose()
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                    isAssigned
                      ? 'bg-teal-500/10 border-teal-500/40'
                      : 'bg-[#080e1c] border-[#1e2d4a] hover:border-[#2a3a5a] hover:bg-[#0d1820]'
                  }`}
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
                      Radius: {(fence.radius / 1000).toFixed(1)} km ·{' '}
                      {assignedCount} officer{assignedCount !== 1 ? 's' : ''}{' '}
                      assigned
                    </p>
                  </div>
                  {isAssigned ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9px] text-teal-400 font-['Rajdhani'] font-bold flex-shrink-0">
                        ASSIGNED ✓
                      </span>
                      <span className="text-[8px] text-red-400/70 font-['Rajdhani']">
                        Click to remove
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-600 font-['Rajdhani'] flex-shrink-0">
                      Assign →
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {officer.assignedZoneId && (
            <button
              onClick={() => {
                onAssign(officer.id, null)
                onClose()
              }}
              className="w-full mt-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-red-400 text-xs font-['Rajdhani'] font-bold tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              <MapPinOff size={12} /> Remove Zone Assignment
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main LiveMap Component ────────────────────────────────────────────────────
export default function LiveMap({
  officers,
  selectedOfficer,
  onSelectOfficer,
  geoFences,
  onAssignOfficerToZone,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())
  const circlesRef = useRef<Map<string, import('leaflet').Circle>>(new Map())
  const circleLabelMarkersRef = useRef<Map<string, import('leaflet').Marker>>(
    new Map(),
  )
  const polylinesRef = useRef<Map<string, import('leaflet').Polyline>>(
    new Map(),
  )
  const historyRef = useRef<Map<string, HistoryPoint[]>>(new Map())

  const [mapReady, setMapReady] = useState(false)
  const [showHistory, setShowHistory] = useState(true)
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite'>('dark')
  const tileLayerRef = useRef<import('leaflet').TileLayer | null>(null)
  const [popupOfficer, setPopupOfficer] = useState<OfficerMarker | null>(null)
  const [popupTimeAtLocation, setPopupTimeAtLocation] = useState('0m')
  const [zoom, setZoom] = useState(10)
  const [historyModalOfficer, setHistoryModalOfficer] =
    useState<OfficerMarker | null>(null)
  const [assignModalOfficer, setAssignModalOfficer] =
    useState<OfficerMarker | null>(null)

  // Update location history for trails
  useEffect(() => {
    officers.forEach((o) => {
      if (o.status === 'offline') return
      const existing = historyRef.current.get(o.id) ?? []
      const last = existing[existing.length - 1]
      if (
        !last ||
        Math.hypot(o.lat - last.lat, o.lng - last.lng) * 111000 > 5
      ) {
        const updated = [
          ...existing,
          {
            lat: o.lat,
            lng: o.lng,
            time: Date.now(),
            speed: o.speed,
            address: o.address,
          },
        ].slice(-MAX_HISTORY)
        historyRef.current.set(o.id, updated)
      }
    })
  }, [officers])

  // Compute "time at location" for popup
  useEffect(() => {
    if (!popupOfficer) return
    const hist = historyRef.current.get(popupOfficer.id) ?? []
    if (hist.length < 2) {
      setPopupTimeAtLocation('< 1m')
      return
    }
    const current = hist[hist.length - 1]
    let stationaryStart = current?.time ?? Date.now()
    for (let i = hist.length - 2; i >= 0; i--) {
      const pt = hist[i]
      if (!pt || !current) break
      const dist =
        Math.hypot(current.lat - pt.lat, current.lng - pt.lng) * 111000
      if (dist > 30) break
      stationaryStart = pt.time
    }
    const mins = Math.round((Date.now() - stationaryStart) / 60000)
    if (mins < 60) setPopupTimeAtLocation(`${mins}m`)
    else setPopupTimeAtLocation(`${Math.floor(mins / 60)}h ${mins % 60}m`)
  }, [popupOfficer])

  // Map initialization
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
        ._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [3.139, 101.6869],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 20,
      })

      const tile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 20 },
      ).addTo(map)

      tileLayerRef.current = tile
      map.on('zoomend', () => setZoom(map.getZoom()))
      mapInstanceRef.current = map
      setMapReady(true)
    }

    void initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Toggle tile layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !tileLayerRef.current) return
    const updateLayer = async () => {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current!
      map.removeLayer(tileLayerRef.current!)
      const url =
        mapLayer === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      tileLayerRef.current = L.tileLayer(url, { maxZoom: 20 }).addTo(map)
    }
    void updateLayer()
  }, [mapLayer, mapReady])

  const handleOfficerClick = useCallback(
    (officer: OfficerMarker) => {
      setPopupOfficer((prev) => (prev?.id === officer.id ? null : officer))
      onSelectOfficer(officer.id)
    },
    [onSelectOfficer],
  )

  // Update markers and polylines
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current!

      officers.forEach((officer) => {
        const statusColor =
          officer.status === 'online'
            ? '#00d4aa'
            : officer.status === 'idle'
              ? '#f59e0b'
              : '#6b7280'
        const isSelected = selectedOfficer === officer.id
        const assignedZone = geoFences.find(
          (g) => g.id === officer.assignedZoneId,
        )
        const zoneBadge = assignedZone
          ? `<div style="position:absolute;top:-34px;left:50%;transform:translateX(-50%);background:${assignedZone.color}22;border:1px solid ${assignedZone.color}88;color:${assignedZone.color};padding:2px 6px;border-radius:4px;font-family:'Rajdhani',sans-serif;font-size:8px;font-weight:700;white-space:nowrap;backdrop-filter:blur(4px);pointer-events:none;">${assignedZone.name}</div>`
          : ''

        const iconHtml = `
          <div style="position:relative;width:${isSelected ? 56 : 46}px;height:${isSelected ? 56 : 46}px;cursor:pointer;transition:all 0.3s ease;">
            ${officer.status === 'online' ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70px;height:70px;border-radius:50%;background:${statusColor}22;animation:pulse-ring 2s infinite;border:1.5px solid ${statusColor}66;"></div>` : ''}
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${isSelected ? 52 : 42}px;height:${isSelected ? 52 : 42}px;border-radius:50%;border:3px solid ${statusColor};overflow:hidden;background:#1a2035;box-shadow:0 0 ${isSelected ? 24 : 12}px ${statusColor}99,0 4px 12px rgba(0,0,0,0.5);">
              ${
                officer.facePhoto
                  ? `<img src="${officer.facePhoto}" style="width:100%;height:100%;object-fit:cover;" />`
                  : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:${isSelected ? 16 : 14}px;color:${statusColor};background:linear-gradient(135deg,#1a2035,#0d1b2e);">${officer.name.slice(0, 2).toUpperCase()}</div>`
              }
            </div>
            <div style="position:absolute;bottom:1px;right:1px;width:14px;height:14px;border-radius:50%;background:${statusColor};border:2px solid #0a0f1e;box-shadow:0 0 6px ${statusColor};"></div>
            <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#0d1425cc;border:1px solid ${statusColor}55;color:${statusColor};padding:1px 6px;border-radius:4px;font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;white-space:nowrap;backdrop-filter:blur(4px);">${officer.name.split(' ')[0]}</div>
            ${zoneBadge}
          </div>
        `

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [80, 80],
          iconAnchor: [40, 40],
        })

        if (markersRef.current.has(officer.id)) {
          const marker = markersRef.current.get(officer.id)!
          marker.setLatLng([officer.lat, officer.lng])
          marker.setIcon(icon)
        } else {
          const marker = L.marker([officer.lat, officer.lng], { icon })
            .addTo(map)
            .on('click', () => handleOfficerClick(officer))
          markersRef.current.set(officer.id, marker)
        }

        const marker = markersRef.current.get(officer.id)!
        marker.off('click')
        marker.on('click', () => handleOfficerClick(officer))

        if (showHistory) {
          const hist = historyRef.current.get(officer.id) ?? []
          if (hist.length >= 2) {
            const latlngs = hist.map((p) => [p.lat, p.lng] as [number, number])
            if (polylinesRef.current.has(officer.id)) {
              polylinesRef.current.get(officer.id)!.setLatLngs(latlngs)
            } else {
              const line = L.polyline(latlngs, {
                color: statusColor,
                weight: 3,
                opacity: 0.6,
                dashArray: '6, 4',
                lineCap: 'round',
              }).addTo(map)
              polylinesRef.current.set(officer.id, line)
            }
          }
        } else {
          if (polylinesRef.current.has(officer.id)) {
            map.removeLayer(polylinesRef.current.get(officer.id)!)
            polylinesRef.current.delete(officer.id)
          }
        }
      })

      markersRef.current.forEach((marker, id) => {
        if (!officers.find((o) => o.id === id)) {
          map.removeLayer(marker)
          markersRef.current.delete(id)
        }
      })
    }

    void updateMarkers()
  }, [
    officers,
    mapReady,
    selectedOfficer,
    handleOfficerClick,
    showHistory,
    geoFences,
  ])

  // Draw geofences with officer count overlay
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    const drawGeoFences = async () => {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current!

      // Clear old circles and labels
      circlesRef.current.forEach((c) => map.removeLayer(c))
      circlesRef.current.clear()
      circleLabelMarkersRef.current.forEach((m) => map.removeLayer(m))
      circleLabelMarkersRef.current.clear()

      geoFences.forEach((fence) => {
        const assignedCount = officers.filter(
          (o) => o.assignedZoneId === fence.id,
        ).length
        const circle = L.circle([fence.lat, fence.lng], {
          radius: fence.radius,
          color: fence.color,
          fillColor: fence.color,
          fillOpacity: 0.06,
          weight: 2,
          dashArray: '10, 6',
        }).addTo(map)

        const labelIcon = L.divIcon({
          html: `<div style="background:${fence.color}22;border:1px solid ${fence.color}88;color:${fence.color};padding:3px 10px;border-radius:6px;font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;white-space:nowrap;backdrop-filter:blur(4px);box-shadow:0 2px 8px rgba(0,0,0,0.3);">${fence.name}${assignedCount > 0 ? ` · ${assignedCount} assigned` : ''}</div>`,
          className: '',
          iconAnchor: [0, 0],
        })

        const labelMarker = L.marker([fence.lat, fence.lng], {
          icon: labelIcon,
          interactive: false,
        }).addTo(map)

        circlesRef.current.set(fence.id, circle)
        circleLabelMarkersRef.current.set(fence.id, labelMarker)
      })
    }
    void drawGeoFences()
  }, [geoFences, mapReady, officers])

  // Pan to selected officer
  useEffect(() => {
    if (!selectedOfficer || !mapReady || !mapInstanceRef.current) return
    const officer = officers.find((o) => o.id === selectedOfficer)
    if (officer) {
      mapInstanceRef.current.flyTo(
        [officer.lat, officer.lng],
        Math.max(zoom, 14),
        { animate: true, duration: 1 },
      )
    }
  }, [selectedOfficer, officers, mapReady, zoom])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleLocate = () => {
    if (selectedOfficer) {
      const o = officers.find((x) => x.id === selectedOfficer)
      if (o)
        mapInstanceRef.current?.flyTo([o.lat, o.lng], 16, {
          animate: true,
          duration: 1,
        })
    } else {
      mapInstanceRef.current?.setView([3.139, 101.6869], 10)
    }
  }

  const handleOpenNewTab = () => {
    const center = mapInstanceRef.current?.getCenter()
    const z = mapInstanceRef.current?.getZoom() ?? 10
    const lat = center?.lat ?? 3.139
    const lng = center?.lng ?? 101.6869
    window.open(
      `https://www.openstreetmap.org/#map=${z}/${lat.toFixed(5)}/${lng.toFixed(5)}`,
      '_blank',
    )
  }

  const selectedOfficerData = selectedOfficer
    ? (officers.find((o) => o.id === selectedOfficer) ?? null)
    : null
  const officerHistory = popupOfficer
    ? (historyRef.current.get(popupOfficer.id) ?? [])
    : []

  const popupAssignedZone = popupOfficer
    ? geoFences.find((g) => g.id === popupOfficer.assignedZoneId)
    : null

  return (
    // Root fills parent absolutely
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
        .leaflet-container { background: #0a0f1e !important; }
        .leaflet-control-container { display: none !important; }
      `}</style>

      {/* Map fills container */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1e] z-10">
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            <span className="text-teal-400 font-['Rajdhani'] font-semibold text-sm tracking-widest">
              INITIALIZING MAP
            </span>
          </motion.div>
        </div>
      )}

      {/* ── Custom Map Controls — OVERLAID top-right ─────────────── */}
      {mapReady && (
        <div className="absolute top-3 right-3 z-[40] flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-9 h-9 bg-[#0d1425]/90 backdrop-blur-xl border border-[#1e2d4a] rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/40 transition-all shadow-lg"
          >
            <ZoomIn size={15} />
          </button>
          <div className="w-9 h-7 bg-[#0d1425]/90 backdrop-blur-xl border border-[#1e2d4a] rounded-lg flex items-center justify-center">
            <span className="text-[9px] text-slate-500 font-['JetBrains_Mono']">
              {zoom}
            </span>
          </div>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-9 h-9 bg-[#0d1425]/90 backdrop-blur-xl border border-[#1e2d4a] rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-500/40 transition-all shadow-lg"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={handleLocate}
            title="Center on selected officer"
            className="w-9 h-9 bg-[#0d1425]/90 backdrop-blur-xl border border-[#1e2d4a] rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-all shadow-lg mt-1"
          >
            <Locate size={14} />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            title="Toggle location trails"
            className={`w-9 h-9 backdrop-blur-xl border rounded-xl flex items-center justify-center transition-all shadow-lg ${showHistory ? 'bg-teal-500/15 border-teal-500/40 text-teal-400' : 'bg-[#0d1425]/90 border-[#1e2d4a] text-slate-500'}`}
          >
            <Route size={14} />
          </button>
          <button
            onClick={() =>
              setMapLayer(mapLayer === 'dark' ? 'satellite' : 'dark')
            }
            title={
              mapLayer === 'dark' ? 'Switch to Satellite' : 'Switch to Dark'
            }
            className={`w-9 h-9 backdrop-blur-xl border rounded-xl flex items-center justify-center transition-all shadow-lg ${mapLayer === 'satellite' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-[#0d1425]/90 border-[#1e2d4a] text-slate-400 hover:text-purple-400 hover:border-purple-500/40'}`}
          >
            <Layers size={14} />
          </button>
          <button
            onClick={handleOpenNewTab}
            title="Open in OpenStreetMap"
            className="w-9 h-9 bg-[#0d1425]/90 backdrop-blur-xl border border-[#1e2d4a] rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-lg"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      )}

      {/* ── LIVE indicator top-left ────────────────────────────────── */}
      {mapReady && (
        <div className="absolute top-3 left-3 z-[40] pointer-events-none">
          <div className="bg-[#080e1c]/85 backdrop-blur-xl border border-[#1e2d4a] rounded-xl px-3 py-1.5 flex items-center gap-2">
            <MapPin size={11} className="text-teal-400" />
            <span className="text-white text-[10px] font-['Rajdhani'] font-semibold tracking-wide">
              LIVE MAP
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* ── Officer count badge top-center ──────────────────────────── */}
      {mapReady && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[40] pointer-events-none">
          <div className="bg-[#080e1c]/85 backdrop-blur-xl border border-[#1e2d4a] rounded-xl px-3 py-1.5 flex items-center gap-3">
            {[
              {
                color: '#00d4aa',
                label: 'Online',
                count: officers.filter((o) => o.status === 'online').length,
              },
              {
                color: '#f59e0b',
                label: 'Idle',
                count: officers.filter((o) => o.status === 'idle').length,
              },
              {
                color: '#6b7280',
                label: 'Offline',
                count: officers.filter((o) => o.status === 'offline').length,
              },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span
                  className="text-[9px] font-['JetBrains_Mono']"
                  style={{ color: s.color }}
                >
                  {s.count} {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Zone legend bottom-left ──────────────────────────────── */}
      {mapReady && geoFences.length > 0 && (
        <div className="absolute bottom-4 left-3 z-[40] pointer-events-none">
          <div className="bg-[#080e1c]/85 backdrop-blur-xl border border-[#1e2d4a] rounded-xl p-2.5 space-y-1.5 max-w-[160px]">
            <p className="text-slate-600 text-[8px] font-['Rajdhani'] uppercase tracking-widest">
              Geo-Fence Zones
            </p>
            {geoFences.map((f) => {
              const count = officers.filter(
                (o) => o.assignedZoneId === f.id,
              ).length
              return (
                <div key={f.id} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="text-slate-400 text-[9px] font-['Rajdhani'] truncate">
                    {f.name}
                  </span>
                  {count > 0 && (
                    <span
                      className="text-[8px] font-['JetBrains_Mono'] font-bold ml-auto flex-shrink-0"
                      style={{ color: f.color }}
                    >
                      {count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Google Maps-style Officer Profile Popup ──────────────── */}
      <AnimatePresence>
        {popupOfficer && (
          <motion.div
            key={popupOfficer.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-14 sm:w-[380px] bg-[#0d1425]/97 backdrop-blur-2xl border border-[#1e2d4a] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-[50]"
          >
            <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500" />

            {/* Profile Header */}
            <div className="p-4 flex items-start gap-3 border-b border-[#1e2d4a] bg-[#080e1c] flex-shrink-0">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${popupOfficer.status === 'online' ? 'border-teal-400 shadow-[0_0_16px_rgba(0,212,170,0.4)]' : popupOfficer.status === 'idle' ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.3)]' : 'border-slate-600'}`}
                >
                  {popupOfficer.facePhoto ? (
                    <img
                      src={popupOfficer.facePhoto}
                      className="w-full h-full object-cover"
                      alt={popupOfficer.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-900/60 to-blue-900/60">
                      <span className="font-['Rajdhani'] font-bold text-xl text-teal-400">
                        {popupOfficer.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0d1425] flex items-center justify-center ${popupOfficer.status === 'online' ? 'bg-teal-400' : popupOfficer.status === 'idle' ? 'bg-amber-400' : 'bg-slate-600'}`}
                >
                  <Activity size={8} className="text-[#0a0f1e]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-['Rajdhani'] font-bold text-base leading-tight">
                    {popupOfficer.name}
                  </h3>
                  <span
                    className={`text-[9px] font-['JetBrains_Mono'] font-bold px-2 py-0.5 rounded-full border ${popupOfficer.status === 'online' ? 'bg-teal-500/15 text-teal-400 border-teal-500/30' : popupOfficer.status === 'idle' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}
                  >
                    {popupOfficer.status.toUpperCase()}
                  </span>
                </div>
                {popupOfficer.phone && (
                  <div className="flex items-center gap-1 mt-1">
                    <Phone size={9} className="text-slate-500" />
                    <span className="text-slate-400 text-[10px] font-['JetBrains_Mono']">
                      {popupOfficer.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={9} className="text-teal-500" />
                  <span className="text-slate-500 text-[10px] font-['JetBrains_Mono'] truncate">
                    {popupOfficer.lat.toFixed(5)}, {popupOfficer.lng.toFixed(5)}
                  </span>
                </div>
                {popupAssignedZone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield
                      size={9}
                      style={{ color: popupAssignedZone.color }}
                    />
                    <span
                      className="text-[10px] font-['Rajdhani'] font-semibold"
                      style={{ color: popupAssignedZone.color }}
                    >
                      Zone: {popupAssignedZone.name}
                    </span>
                  </div>
                )}
                {popupOfficer.address && (
                  <p className="text-slate-600 text-[10px] mt-0.5 truncate">
                    {popupOfficer.address}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setPopupOfficer(null)
                  onSelectOfficer(null)
                }}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
              >
                <X size={12} />
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 border-b border-[#1e2d4a]">
              {[
                {
                  label: 'Speed',
                  value: `${popupOfficer.speed.toFixed(1)}`,
                  unit: 'km/h',
                  icon: Navigation,
                  color: '#00d4aa',
                },
                {
                  label: 'Battery',
                  value: `${popupOfficer.battery}`,
                  unit: '%',
                  icon: Battery,
                  color:
                    popupOfficer.battery > 50
                      ? '#00d4aa'
                      : popupOfficer.battery > 20
                        ? '#f59e0b'
                        : '#ef4444',
                },
                {
                  label: 'At Location',
                  value: popupTimeAtLocation,
                  unit: '',
                  icon: Clock,
                  color: '#60a5fa',
                },
                {
                  label: 'Signal',
                  value: popupOfficer.status !== 'offline' ? 'Good' : 'Lost',
                  unit: '',
                  icon: popupOfficer.status !== 'offline' ? Wifi : WifiOff,
                  color:
                    popupOfficer.status !== 'offline' ? '#00d4aa' : '#ef4444',
                },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className={`p-2.5 flex flex-col items-center ${i < 3 ? 'border-r border-[#1e2d4a]' : ''}`}
                  >
                    <Icon
                      size={12}
                      style={{ color: stat.color }}
                      className="mb-1"
                    />
                    <span
                      className="font-['JetBrains_Mono'] font-bold text-xs"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span className="text-slate-700 text-[8px] font-['Rajdhani']">
                        {stat.unit}
                      </span>
                    )}
                    <span className="text-slate-600 text-[9px] mt-0.5 font-['Rajdhani'] text-center leading-tight">
                      {stat.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Battery Health Bar */}
            <div className="px-4 pt-3 pb-2 border-b border-[#1e2d4a]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-500 text-[9px] font-['Rajdhani'] uppercase tracking-widest">
                  Battery Health
                </span>
                <span
                  className={`text-[9px] font-['Rajdhani'] font-bold ${popupOfficer.battery > 50 ? 'text-teal-400' : popupOfficer.battery > 20 ? 'text-amber-400' : 'text-red-400'}`}
                >
                  {popupOfficer.battery > 50
                    ? 'GOOD'
                    : popupOfficer.battery > 20
                      ? 'LOW'
                      : 'CRITICAL'}
                </span>
              </div>
              <div className="h-2 bg-[#1a2540] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${popupOfficer.battery}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      popupOfficer.battery > 50
                        ? 'linear-gradient(90deg, #00d4aa, #10b981)'
                        : popupOfficer.battery > 20
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ef4444, #f87171)',
                  }}
                />
              </div>
            </div>

            {/* Assigned Zone Info */}
            <div className="px-4 py-2.5 border-b border-[#1e2d4a]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[9px] font-['Rajdhani'] uppercase tracking-widest">
                  Assigned Work Zone
                </span>
                {onAssignOfficerToZone && (
                  <button
                    onClick={() => setAssignModalOfficer(popupOfficer)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 rounded-lg text-teal-400 text-[9px] font-['Rajdhani'] font-bold transition-colors"
                  >
                    <UserCheck size={8} />{' '}
                    {popupOfficer.assignedZoneId ? 'Change' : 'Assign'} Zone
                  </button>
                )}
              </div>
              {popupAssignedZone ? (
                <div className="flex items-center gap-2 mt-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: popupAssignedZone.color }}
                  />
                  <span
                    className="text-sm font-['Rajdhani'] font-bold"
                    style={{ color: popupAssignedZone.color }}
                  >
                    {popupAssignedZone.name}
                  </span>
                  <span className="text-slate-600 text-[9px] font-['JetBrains_Mono']">
                    r={(popupAssignedZone.radius / 1000).toFixed(1)}km
                  </span>
                </div>
              ) : (
                <p className="text-slate-600 text-[10px] font-['Rajdhani'] mt-1">
                  No zone assigned — click Assign Zone to set one
                </p>
              )}
            </div>

            {/* Today's Activity */}
            <div className="px-4 py-3 border-b border-[#1e2d4a]">
              <p className="text-slate-500 text-[9px] font-['Rajdhani'] uppercase tracking-widest mb-2">
                Today's Activity
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: 'Distance',
                    value: `${(officerHistory.length * 0.15 + 2).toFixed(1)} km`,
                    color: '#8b5cf6',
                  },
                  {
                    label: 'Active Time',
                    value: `${Math.max(1, Math.floor(officerHistory.length * 0.3))}h`,
                    color: '#00d4aa',
                  },
                  {
                    label: 'Stops',
                    value: `${Math.max(1, Math.floor(officerHistory.length / 6))}`,
                    color: '#f59e0b',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-[#0a0f1e] rounded-xl p-2 text-center"
                  >
                    <p
                      className="font-['JetBrains_Mono'] font-bold text-xs"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </p>
                    <p className="text-slate-600 text-[9px] font-['Rajdhani'] mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Speed / Trail chart */}
            <div className="px-4 py-3 border-b border-[#1e2d4a]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 text-[9px] font-['Rajdhani'] uppercase tracking-widest">
                  Location Trail ({officerHistory.length} pts)
                </p>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-1 text-[9px] font-['Rajdhani'] font-bold ${showHistory ? 'text-teal-400' : 'text-slate-600'}`}
                >
                  {showHistory ? <Eye size={9} /> : <EyeOff size={9} />}
                  {showHistory ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-end gap-0.5 h-8">
                {officerHistory.slice(-24).map((p, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${Math.max(20, Math.min(100, p.speed * 2))}%`,
                      background: `rgba(0,212,170,${0.3 + (i / 24) * 0.7})`,
                    }}
                    title={`${p.speed.toFixed(1)} km/h`}
                  />
                ))}
                {officerHistory.length === 0 && (
                  <p className="text-slate-700 text-[10px] font-['Rajdhani'] w-full text-center">
                    No trail data yet
                  </p>
                )}
              </div>
            </div>

            {/* Duty Status */}
            <div className="px-4 py-2.5 border-b border-[#1e2d4a] flex items-center justify-between">
              <span className="text-slate-500 text-[10px] font-['Rajdhani'] uppercase tracking-wide">
                Duty Status
              </span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-['Rajdhani'] font-bold tracking-wide ${popupOfficer.checkInStatus === 'in' ? 'bg-teal-500/10 border-teal-500/25 text-teal-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${popupOfficer.checkInStatus === 'in' ? 'bg-teal-400 animate-pulse' : 'bg-red-400'}`}
                />
                {popupOfficer.checkInStatus === 'in'
                  ? 'CHECKED IN'
                  : 'CHECKED OUT'}
              </div>
            </div>

            {/* Inactivity alert */}
            {popupTimeAtLocation.includes('h') &&
              parseInt(popupTimeAtLocation) >= 1 && (
                <div className="mx-4 mt-2 mb-1 flex items-center gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                  <AlertTriangle
                    size={10}
                    className="text-amber-400 flex-shrink-0"
                  />
                  <p className="text-amber-400/80 text-[10px] font-['Rajdhani']">
                    Officer at this location for {popupTimeAtLocation}
                  </p>
                </div>
              )}

            {/* Actions */}
            <div className="px-4 py-3 flex gap-2">
              <button
                onClick={() => {
                  if (mapInstanceRef.current && popupOfficer) {
                    mapInstanceRef.current.flyTo(
                      [popupOfficer.lat, popupOfficer.lng],
                      17,
                      { animate: true, duration: 1 },
                    )
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 text-[10px] font-['Rajdhani'] font-bold tracking-wide hover:bg-teal-500/20 transition-colors"
              >
                <Eye size={11} /> ZOOM IN
              </button>
              <button
                onClick={() => setHistoryModalOfficer(popupOfficer)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-[10px] font-['Rajdhani'] font-bold tracking-wide hover:bg-purple-500/20 transition-colors"
              >
                <History size={11} /> HISTORY
              </button>
              {onAssignOfficerToZone && (
                <button
                  onClick={() => setAssignModalOfficer(popupOfficer)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-['Rajdhani'] font-bold tracking-wide hover:bg-blue-500/20 transition-colors"
                >
                  <Users size={11} /> ASSIGN
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mini bar (popup closed but officer selected) ──────────── */}
      <AnimatePresence>
        {selectedOfficerData && !popupOfficer && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setPopupOfficer(selectedOfficerData)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-3 px-4 py-2.5 bg-[#0d1425]/95 backdrop-blur-xl border border-teal-500/30 rounded-2xl shadow-xl hover:border-teal-500/60 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
              <span className="text-teal-400 font-['Rajdhani'] font-bold text-xs">
                {selectedOfficerData.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="text-left">
              <p className="text-white text-xs font-['Rajdhani'] font-bold">
                {selectedOfficerData.name}
              </p>
              <p className="text-slate-500 text-[9px] font-['JetBrains_Mono']">
                {selectedOfficerData.speed.toFixed(1)} km/h ·{' '}
                {selectedOfficerData.battery}% batt
              </p>
            </div>
            <span className="text-teal-400 text-[9px] font-['Rajdhani'] font-bold">
              VIEW PROFILE →
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Officer Full Work History Modal ──────────────────────── */}
      <AnimatePresence>
        {historyModalOfficer && (
          <OfficerHistoryModal
            officer={historyModalOfficer}
            onClose={() => setHistoryModalOfficer(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Zone Assignment Modal ────────────────────────────────── */}
      <AnimatePresence>
        {assignModalOfficer && onAssignOfficerToZone && (
          <ZoneAssignModal
            officer={assignModalOfficer}
            geoFences={geoFences}
            onAssign={(officerId, zoneId) => {
              onAssignOfficerToZone(officerId, zoneId)
              // Update local popup officer state to reflect new zone
              setPopupOfficer((prev) =>
                prev?.id === officerId
                  ? { ...prev, assignedZoneId: zoneId ?? undefined }
                  : prev,
              )
            }}
            onClose={() => setAssignModalOfficer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
