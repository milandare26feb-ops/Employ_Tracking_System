'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import PermissionGate from './PermissionGate'
import FaceCapture from './FaceCapture'
import OfficerHome from './OfficerHome'
import OfficerSettings from './OfficerSettings'
import OfficerRegistration from './OfficerRegistration'
import OfficerApprovalPending from './OfficerApprovalPending'
import ProfileSidebar from '../shared/ProfileSidebar'
import MessengerPanel, { type Message } from '../shared/MessengerPanel'
import {
  MessageSquare,
  Home,
  Settings,
  MapPin,
  Shield,
  UserPlus,
  LogIn,
} from 'lucide-react'

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fieldtrack_officer_session'
const ACCOUNTS_KEY = 'fieldtrack_accounts'

export interface SavedAccount {
  name: string
  email: string
  phone: string
  password: string
  facePhoto?: string
  cvFileName?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  checkInStatus: 'in' | 'out'
  permissionsGranted: boolean
  termsAccepted: boolean
  firstLoginDone: boolean
  registeredAt: string
}

interface SavedSession {
  email: string
  rememberMe: boolean
}

function loadAccounts(): Record<string, SavedAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, SavedAccount>) : {}
  } catch {
    return {}
  }
}

function saveAccounts(accounts: Record<string, SavedAccount>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {}
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as SavedSession
    if (!s.rememberMe) return null
    return s
  } catch {
    return null
  }
}

function saveSession(session: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {}
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Types ─────────────────────────────────────────────────────────────────────

type AppFlow =
  | 'loading'
  | 'landing'
  | 'register'
  | 'sign-in'
  | 'pending'
  | 'rejected'
  | 'permissions'
  | 'face-capture'
  | 'home'
  | 'settings'
  | 'messages'

const DEMO_MESSAGES: Message[] = [
  {
    id: 'dm1',
    senderId: 'admin',
    senderName: 'Main Admin',
    type: 'text',
    content: 'Welcome! Please check in when you reach your assigned zone.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    isMine: false,
  },
  {
    id: 'dm2',
    senderId: 'admin',
    senderName: 'Local Admin',
    type: 'text',
    content:
      "Today's target: Gulshan - Banani sector. Report all client visits.",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    isMine: false,
  },
]

export default function OfficerApp() {
  // Component code continues...
  return null
}