'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Bell,
  Shield,
  Users,
  Activity,
  Wifi,
  ChevronDown,
  LogOut,
  Settings,
  User,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react'
import type { AnalyticsSummary } from './OfficerSidebar'

interface AdminTopBarProps {
  analytics: AnalyticsSummary
  pendingCount: number
  alerts: Alert[]
  onClearAlerts: () => void
}

export interface Alert {
  id: string
  type: 'geofence' | 'inactivity' | 'approval' | 'system'
  message: string
  officer?: string
  time: string
  read: boolean
}

// [CONTENT TRUNCATED FOR BREVITY - Full content available in source]