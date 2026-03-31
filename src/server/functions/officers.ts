import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAdminClient } from '@/server/lib/appwrite'
import { authMiddleware } from '@/server/functions/auth'
import { ID, Query } from 'node-appwrite'
import { setResponseStatus } from '@tanstack/react-start/server'

const DB_ID = process.env.APPWRITE_DB_ID!
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!

// ─── Types ─────────────────────────────────────────────────────────────────

export type OfficerRole = 'main_admin' | 'local_admin' | 'officer'
export type OfficerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface OfficerDoc {
  $id: string
  $createdAt: string
  userId: string
  name: string
  email: string
  phone: string | null
  status: OfficerStatus
  role: OfficerRole
  facePhotoId: string | null
  facePhotoUrl: string | null
  isOnline: boolean
  trackingEnabled: boolean
  lastSeen: string | null
  firstLoginDone: boolean
  permissionsGranted: boolean
  businessName: string | null
  address: string | null
  idDocumentId: string | null
  teamId: string | null
  companyId: string | null
  assignedArea: string | null
  checkInStatus: 'in' | 'out' | null
  checkInTime: string | null
  checkOutTime: string | null
  termsAccepted: boolean
}

export interface TeamDoc {
  $id: string
  $createdAt: string
  name: string
  companyId: string
  localAdminId: string | null
  description: string | null
  color: string
  isActive: boolean
  createdBy: string
}

export interface CompanyDoc {
  $id: string
  $createdAt: string
  name: string
  description: string | null
  logoUrl: string | null
  isActive: boolean
  createdBy: string
  plan: string
}

export interface MessageDoc {
  $id: string
  $createdAt: string
  senderId: string
  senderName: string
  recipientId: string | null
  teamId: string | null
  type: 'text' | 'voice' | 'image' | 'video'
  content: string | null
  fileId: string | null
  fileUrl: string | null
  geoLat: number | null
  geoLng: number | null
  geoAddress: string | null
  capturedAt: string | null
  isRead: boolean
  duration: number | null
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function adminDb() {
  const { databases } = createAdminClient()
  return databases
}

function adminStorage() {
  const { storage } = createAdminClient()
  return storage
}

// ─── Officer CRUD ────────────────────────────────────────────────────────────

export const getOfficerByUserIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const db = adminDb()
    try {
      const res = await db.listDocuments(DB_ID, 'officers', [
        Query.equal('userId', data.userId),
        Query.limit(1),
      ])
      return res.documents[0] as unknown as OfficerDoc | undefined
    } catch {
      return undefined
    }
  })

export const getAllOfficersFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        teamId: z.string().optional(),
        companyId: z.string().optional(),
        status: z.string().optional(),
        role: z.string().optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const queries: string[] = [Query.limit(100)]
    if (data?.teamId) queries.push(Query.equal('teamId', data.teamId))
    if (data?.companyId) queries.push(Query.equal('companyId', data.companyId))
    if (data?.status) queries.push(Query.equal('status', data.status))
    if (data?.role) queries.push(Query.equal('role', data.role))
    const res = await db.listDocuments(DB_ID, 'officers', queries)
    return res.documents as unknown as OfficerDoc[]
  })

export const createOfficerProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.string(),
      name: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      role: z.enum(['main_admin', 'local_admin', 'officer']).optional(),
      teamId: z.string().optional(),
      companyId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const db = adminDb()
    const doc = await db.createDocument(DB_ID, 'officers', ID.unique(), {
      userId: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      role: data.role ?? 'officer',
      status: data.role === 'main_admin' ? 'approved' : 'pending',
      facePhotoId: null,
      facePhotoUrl: null,
      isOnline: false,
      trackingEnabled: true,
      lastSeen: null,
      firstLoginDone: false,
      permissionsGranted: false,
      businessName: null,
      address: null,
      idDocumentId: null,
      teamId: data.teamId ?? null,
      companyId: data.companyId ?? null,
      assignedArea: null,
      checkInStatus: 'out',
      checkInTime: null,
      checkOutTime: null,
      termsAccepted: false,
    })
    return doc as unknown as OfficerDoc
  })

export const updateOfficerFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      docId: z.string(),
      data: z.record(z.unknown()),
    }),
  )
  .handler(async ({ data: payload }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const doc = await db.updateDocument(
      DB_ID,
      'officers',
      payload.docId,
      payload.data as Record<string, unknown>,
    )
    return doc as unknown as OfficerDoc
  })

export const approveOfficerFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ docId: z.string(), approve: z.boolean() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    await db.updateDocument(DB_ID, 'officers', data.docId, {
      status: data.approve ? 'approved' : 'rejected',
    })
    // Create approval record
    await db.createDocument(DB_ID, 'approvals', ID.unique(), {
      officerId: data.docId,
      officerName: '',
      officerEmail: '',
      status: data.approve ? 'approved' : 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.$id,
    })
    return { success: true }
  })

export const deleteOfficerFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ docId: z.string() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    await db.deleteDocument(DB_ID, 'officers', data.docId)
    return { success: true }
  })

// ─── Check In / Out ──────────────────────────────────────────────────────────

export const checkInOutFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      docId: z.string(),
      action: z.enum(['in', 'out']),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const now = new Date().toISOString()
    await db.updateDocument(DB_ID, 'officers', data.docId, {
      checkInStatus: data.action,
      ...(data.action === 'in'
        ? { checkInTime: now }
        : { checkOutTime: now }),
    })
    // Log activity
    await db.createDocument(DB_ID, 'activityLogs', ID.unique(), {
      officerId: data.docId,
      action: data.action === 'in' ? 'check_in' : 'check_out',
      detail: `Officer checked ${data.action}`,
      latitude: data.lat ?? null,
      longitude: data.lng ?? null,
      timestamp: now,
    })
    return { success: true }
  })

// ─── Location ────────────────────────────────────────────────────────────────

export const pushLocationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      officerId: z.string(),
      officerName: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
      speed: z.number().optional(),
      heading: z.number().optional(),
      altitude: z.number().optional(),
      battery: z.number().optional(),
      isMoving: z.boolean().optional(),
      deviceId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const db = adminDb()
    const now = new Date().toISOString()
    await db.createDocument(DB_ID, 'locations', ID.unique(), {
      officerId: data.officerId,
      officerName: data.officerName,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy ?? null,
      speed: data.speed ?? null,
      heading: data.heading ?? null,
      altitude: data.altitude ?? null,
      battery: data.battery ?? null,
      isMoving: data.isMoving ?? false,
      deviceId: data.deviceId ?? null,
      timestamp: now,
    })
    // Update officer lastSeen + isOnline
    try {
      const res = await db.listDocuments(DB_ID, 'officers', [
        Query.equal('userId', data.officerId),
        Query.limit(1),
      ])
      if (res.documents[0]) {
        await db.updateDocument(DB_ID, 'officers', res.documents[0].$id, {
          isOnline: true,
          lastSeen: now,
        })
      }
    } catch {}
    return { success: true }
  })

export const getOfficerLocationsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({ officerId: z.string(), limit: z.number().optional() }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const res = await db.listDocuments(DB_ID, 'locations', [
      Query.equal('officerId', data.officerId),
      Query.orderDesc('timestamp'),
      Query.limit(data.limit ?? 50),
    ])
    return res.documents
  })

// ─── Teams ────────────────────────────────────────────────────────────────────

export const getTeamsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ companyId: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const queries: string[] = [Query.limit(50)]
    if (data?.companyId) queries.push(Query.equal('companyId', data.companyId))
    try {
      const res = await db.listDocuments(DB_ID, 'teams', queries)
      return res.documents as unknown as TeamDoc[]
    } catch {
      return []
    }
  })

export const createTeamFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      companyId: z.string(),
      description: z.string().optional(),
      color: z.string().optional(),
      localAdminId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const doc = await db.createDocument(DB_ID, 'teams', ID.unique(), {
      name: data.name,
      companyId: data.companyId,
      description: data.description ?? null,
      color: data.color ?? '#00d4aa',
      localAdminId: data.localAdminId ?? null,
      isActive: true,
      createdBy: currentUser.$id,
    })
    return doc as unknown as TeamDoc
  })

export const updateTeamFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({ teamId: z.string(), data: z.record(z.unknown()) }),
  )
  .handler(async ({ data: payload }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const doc = await db.updateDocument(DB_ID, 'teams', payload.teamId, payload.data as Record<string, unknown>)
    return doc as unknown as TeamDoc
  })

export const deleteTeamFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ teamId: z.string() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    await db.deleteDocument(DB_ID, 'teams', data.teamId)
    return { success: true }
  })

// ─── Companies ────────────────────────────────────────────────────────────────

export const getCompaniesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    try {
      const res = await db.listDocuments(DB_ID, 'companies', [Query.limit(50)])
      return res.documents as unknown as CompanyDoc[]
    } catch {
      return []
    }
  },
)

export const createCompanyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      plan: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const doc = await db.createDocument(DB_ID, 'companies', ID.unique(), {
      name: data.name,
      description: data.description ?? null,
      logoUrl: null,
      isActive: true,
      createdBy: currentUser.$id,
      plan: data.plan ?? 'basic',
    })
    return doc as unknown as CompanyDoc
  })

export const deleteCompanyFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ companyId: z.string() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    await db.deleteDocument(DB_ID, 'companies', data.companyId)
    return { success: true }
  })

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotificationsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ recipientId: z.string() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const res = await db.listDocuments(DB_ID, 'notifications', [
      Query.equal('recipientId', data.recipientId),
      Query.orderDesc('$createdAt'),
      Query.limit(30),
    ])
    return res.documents
  })

export const markNotificationReadFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ notifId: z.string() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    await db.updateDocument(DB_ID, 'notifications', data.notifId, {
      isRead: true,
    })
    return { success: true }
  })

export const createNotificationFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      recipientId: z.string(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
      relatedId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const db = adminDb()
    await db.createDocument(DB_ID, 'notifications', ID.unique(), {
      recipientId: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      priority: data.priority ?? 'normal',
      relatedId: data.relatedId ?? null,
    })
    return { success: true }
  })

// ─── Messages ─────────────────────────────────────────────────────────────────

export const getMessagesFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      teamId: z.string().optional(),
      recipientId: z.string().optional(),
      limit: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const queries: string[] = [
      Query.orderDesc('$createdAt'),
      Query.limit(data.limit ?? 50),
    ]
    if (data.teamId) queries.push(Query.equal('teamId', data.teamId))
    if (data.recipientId)
      queries.push(Query.equal('recipientId', data.recipientId))
    try {
      const res = await db.listDocuments(DB_ID, 'messages', queries)
      return res.documents as unknown as MessageDoc[]
    } catch {
      return []
    }
  })

export const sendMessageFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      senderId: z.string(),
      senderName: z.string(),
      recipientId: z.string().optional(),
      teamId: z.string().optional(),
      type: z.enum(['text', 'voice', 'image', 'video']),
      content: z.string().optional(),
      fileId: z.string().optional(),
      fileUrl: z.string().optional(),
      geoLat: z.number().optional(),
      geoLng: z.number().optional(),
      geoAddress: z.string().optional(),
      capturedAt: z.string().optional(),
      duration: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const doc = await db.createDocument(DB_ID, 'messages', ID.unique(), {
      senderId: data.senderId,
      senderName: data.senderName,
      recipientId: data.recipientId ?? null,
      teamId: data.teamId ?? null,
      type: data.type,
      content: data.content ?? null,
      fileId: data.fileId ?? null,
      fileUrl: data.fileUrl ?? null,
      geoLat: data.geoLat ?? null,
      geoLng: data.geoLng ?? null,
      geoAddress: data.geoAddress ?? null,
      capturedAt: data.capturedAt ?? new Date().toISOString(),
      isRead: false,
      duration: data.duration ?? null,
    })
    return doc as unknown as MessageDoc
  })

// ─── GeoFences ────────────────────────────────────────────────────────────────

export const getGeoFencesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    try {
      const res = await db.listDocuments(DB_ID, 'geofences', [Query.limit(50)])
      return res.documents
    } catch {
      return []
    }
  },
)

export const createGeoFenceFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      centerLat: z.number(),
      centerLng: z.number(),
      radiusMeters: z.number(),
      color: z.string().optional(),
      alertOnExit: z.boolean().optional(),
      alertOnEnter: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const doc = await db.createDocument(DB_ID, 'geofences', ID.unique(), {
      name: data.name,
      description: data.description ?? null,
      centerLat: data.centerLat,
      centerLng: data.centerLng,
      radiusMeters: data.radiusMeters,
      color: data.color ?? '#00d4aa',
      isActive: true,
      alertOnExit: data.alertOnExit ?? true,
      alertOnEnter: data.alertOnEnter ?? false,
      assignedOfficers: null,
      createdBy: currentUser.$id,
    })
    return doc
  })

export const deleteGeoFenceFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ fenceId: z.string() }))
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    await db.deleteDocument(DB_ID, 'geofences', data.fenceId)
    return { success: true }
  })

// ─── File Upload Helper (server) ──────────────────────────────────────────────

export const uploadFileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')

    const { storage } = createAdminClient()
    const binary = Buffer.from(
      data.fileBase64.replace(/^data:[^;]+;base64,/, ''),
      'base64',
    )
    const blob = new Blob([binary], { type: data.mimeType })
    const file = new File([blob], data.fileName, { type: data.mimeType })
    const result = await storage.createFile({
      bucketId: BUCKET_ID,
      fileId: ID.unique(),
      file,
    })
    const url = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${result.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`
    return { fileId: result.$id, url }
  })

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getActivityLogsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({ officerId: z.string().optional(), limit: z.number().optional() }),
  )
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()
    if (!currentUser) throw new Error('Unauthorized')
    const db = adminDb()
    const queries: string[] = [
      Query.orderDesc('timestamp'),
      Query.limit(data?.limit ?? 30),
    ]
    if (data?.officerId) queries.push(Query.equal('officerId', data.officerId))
    try {
      const res = await db.listDocuments(DB_ID, 'activityLogs', queries)
      return res.documents
    } catch {
      return []
    }
  })