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

// [CONTENT TRUNCATED FOR BREVITY - Full content available in source]