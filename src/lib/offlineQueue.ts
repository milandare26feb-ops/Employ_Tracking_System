/**
 * Offline GPS Queue — stores location pings in IndexedDB when offline.
 * Auto-syncs when connectivity is restored.
 */

export interface QueuedLocation {
  id: string
  officerId: string
  lat: number
  lng: number
  accuracy: number
  speed: number | null
  heading: number | null
  altitude: number | null
  battery: number | null
  timestamp: string
  synced: boolean
  syncAttempts: number
  isDelayedSync: boolean
}

const DB_NAME = 'fieldtrack_offline'
const DB_VERSION = 1
const STORE_NAME = 'location_queue'

class OfflineQueue {
  private db: IDBDatabase | null = null
  private syncTimer: ReturnType<typeof setInterval> | null = null
  private onSyncCallback: ((items: QueuedLocation[]) => Promise<void>) | null =
    null
  private onlineHandler: (() => Promise<void>) | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve()
        return
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('synced', 'synced', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result
        resolve()
      }
      req.onerror = () => reject(req.error)
    })
  }

  async enqueue(
    location: Omit<
      QueuedLocation,
      'id' | 'synced' | 'syncAttempts' | 'isDelayedSync'
    >,
  ): Promise<void> {
    if (!this.db) return
    const item: QueuedLocation = {
      ...location,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      synced: false,
      syncAttempts: 0,
      isDelayedSync: !navigator.onLine,
    }
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).add(item)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async getPending(): Promise<QueuedLocation[]> {
    if (!this.db) return []
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly')
      const req = tx
        .objectStore(STORE_NAME)
        .index('synced')
        .getAll(IDBKeyRange.only(false))
      req.onsuccess = () => resolve(req.result as QueuedLocation[])
      req.onerror = () => reject(req.error)
    })
  }

  async markSynced(ids: string[]): Promise<void> {
    if (!this.db) return
    const tx = this.db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    for (const id of ids) {
      const req = store.get(id)
      req.onsuccess = () => {
        if (req.result) {
          const item = { ...req.result, synced: true }
          store.put(item)
        }
      }
    }
  }

  async getCount(): Promise<{ total: number; pending: number }> {
    if (!this.db) return { total: 0, pending: 0 }
    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const totalReq = store.count()
      const pendingReq = store.index('synced').count(IDBKeyRange.only(false))
      let total = 0,
        pending = 0,
        done = 0
      const check = () => {
        if (++done === 2) resolve({ total, pending })
      }
      totalReq.onsuccess = () => {
        total = totalReq.result
        check()
      }
      pendingReq.onsuccess = () => {
        pending = pendingReq.result
        check()
      }
    })
  }

  // Prune items older than 48 hours that are already synced
  async prune(): Promise<void> {
    if (!this.db) return
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const tx = this.db.transaction(STORE_NAME, 'readwrite')
    const range = IDBKeyRange.upperBound(cutoff)
    const req = tx.objectStore(STORE_NAME).index('timestamp').openCursor(range)
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest)
        .result as IDBCursorWithValue | null
      if (cursor) {
        if (cursor.value.synced) cursor.delete()
        cursor.continue()
      }
    }
  }

  startAutoSync(
    onSync: (items: QueuedLocation[]) => Promise<void>,
    intervalMs = 10000,
  ): void {
    this.onSyncCallback = onSync
    if (this.syncTimer) clearInterval(this.syncTimer)
    this.syncTimer = setInterval(async () => {
      if (navigator.onLine) {
        const pending = await this.getPending()
        if (pending.length > 0 && this.onSyncCallback) {
          try {
            await this.onSyncCallback(pending)
            await this.markSynced(pending.map((p) => p.id))
          } catch {
            // will retry next interval
          }
        }
      }
    }, intervalMs)

    // Clean up previous handler if it exists
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler)
    }

    // Also try immediately when network comes back
    this.onlineHandler = async () => {
      const pending = await this.getPending()
      if (pending.length > 0 && this.onSyncCallback) {
        try {
          await this.onSyncCallback(pending)
          await this.markSynced(pending.map((p) => p.id))
        } catch {}
      }
    }
    window.addEventListener('online', this.onlineHandler)
  }

  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler)
      this.onlineHandler = null
    }
  }
}

export const offlineQueue = new OfflineQueue()
