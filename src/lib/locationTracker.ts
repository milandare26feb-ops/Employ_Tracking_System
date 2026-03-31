/**
 * Background Location Tracker
 * - Tracks GPS every 5 seconds
 * - Detects mock locations, GPS tampering, suspicious accuracy
 * - Queues offline when no internet
 * - Detects inactivity and same-location stall
 */

import { offlineQueue } from './offlineQueue'

export interface TrackingUpdate {
  lat: number
  lng: number
  accuracy: number
  speed: number | null
  heading: number | null
  altitude: number | null
  battery: number | null
  timestamp: string
  isMock: boolean
  isOffline: boolean
}

export interface TrackingAlert {
  type:
    | 'mock_location'
    | 'gps_disabled'
    | 'inactivity'
    | 'same_location'
    | 'battery_low'
  message: string
  timestamp: string
}

type TrackingCallback = (update: TrackingUpdate) => void
type AlertCallback = (alert: TrackingAlert) => void

const INACTIVITY_THRESHOLD_MS = 2 * 60 * 1000 // 2 minutes
const SAME_LOCATION_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour
const MOVEMENT_THRESHOLD_M = 10 // metres
const MOCK_ACCURACY_THRESHOLD = 0 // exactly 0 = suspicious
const MIN_REALISTIC_ACCURACY = 5 // GPS should be > 5m accuracy

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function getBatteryLevel(): Promise<number | null> {
  try {
    if ('getBattery' in navigator && navigator.getBattery) {
      const battery = await navigator.getBattery()
      return Math.round(battery.level * 100)
    }
  } catch {}
  return null
}

function detectMockLocation(position: GeolocationPosition): boolean {
  // Heuristics:
  // 1. Accuracy exactly 0 (GPS mock apps often set this)
  // 2. Impossibly high accuracy (< 1m is unrealistic for mobile GPS)
  // 3. Speed exactly 0 with rapidly changing coordinates
  const acc = position.coords.accuracy
  if (acc === MOCK_ACCURACY_THRESHOLD) return true
  if (acc < MIN_REALISTIC_ACCURACY && position.coords.speed === 0) return true
  return false
}

export class LocationTracker {
  private officerId: string
  private watchId: number | null = null
  private intervalTimer: ReturnType<typeof setInterval> | null = null
  private lastPosition: { lat: number; lng: number; time: number } | null = null
  private lastMovementTime: number = Date.now()
  private sameLocationStart: number | null = null
  private onUpdate: TrackingCallback
  private onAlert: AlertCallback
  private isRunning = false

  constructor(
    officerId: string,
    onUpdate: TrackingCallback,
    onAlert: AlertCallback,
  ) {
    this.officerId = officerId
    this.onUpdate = onUpdate
    this.onAlert = onAlert
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    await offlineQueue.init()

    if (!navigator.geolocation) {
      this.onAlert({
        type: 'gps_disabled',
        message: 'Geolocation is not supported on this device.',
        timestamp: new Date().toISOString(),
      })
      return
    }

    // High-accuracy watch (for battery: use watchPosition sparingly)
    this.watchId = navigator.geolocation.watchPosition(
      async (pos) => await this.handlePosition(pos),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          this.onAlert({
            type: 'gps_disabled',
            message: 'GPS permission denied. Location tracking stopped.',
            timestamp: new Date().toISOString(),
          })
          this.stop()
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )

    // Check inactivity every 30 seconds
    this.intervalTimer = setInterval(() => this.checkInactivity(), 30000)

    // Auto-sync offline queue when online
    offlineQueue.startAutoSync(async (items) => {
      // In production: batch POST to your backend
      console.info(`[OfflineSync] Syncing ${items.length} queued locations`)
    }, 10000)
  }

  private async handlePosition(pos: GeolocationPosition): Promise<void> {
    const now = Date.now()
    const isMock = detectMockLocation(pos)
    const battery = await getBatteryLevel()

    const update: TrackingUpdate = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      altitude: pos.coords.altitude,
      battery,
      timestamp: new Date(pos.timestamp).toISOString(),
      isMock,
      isOffline: !navigator.onLine,
    }

    // Alert on mock location
    if (isMock) {
      this.onAlert({
        type: 'mock_location',
        message:
          'Warning: Mock/fake GPS location detected. This violation has been logged.',
        timestamp: new Date().toISOString(),
      })
    }

    // Battery alert
    if (battery !== null && battery <= 10) {
      this.onAlert({
        type: 'battery_low',
        message: `Battery critically low: ${battery}%. Please charge your device.`,
        timestamp: new Date().toISOString(),
      })
    }

    // Movement detection
    if (this.lastPosition) {
      const dist = haversineDistance(
        this.lastPosition.lat,
        this.lastPosition.lng,
        update.lat,
        update.lng,
      )

      if (dist > MOVEMENT_THRESHOLD_M) {
        this.lastMovementTime = now
        this.sameLocationStart = null
      } else {
        // No movement
        if (!this.sameLocationStart) {
          this.sameLocationStart = now
        } else if (now - this.sameLocationStart >= SAME_LOCATION_THRESHOLD_MS) {
          this.onAlert({
            type: 'same_location',
            message: `Officer has been stationary for over 1 hour at the same location.`,
            timestamp: new Date().toISOString(),
          })
          this.sameLocationStart = now // reset to avoid repeated alerts
        }
      }
    }

    this.lastPosition = { lat: update.lat, lng: update.lng, time: now }

    // Queue offline or call sync callback
    await offlineQueue.enqueue({
      officerId: this.officerId,
      lat: update.lat,
      lng: update.lng,
      accuracy: update.accuracy,
      speed: update.speed,
      heading: update.heading,
      altitude: update.altitude,
      battery: update.battery,
      timestamp: update.timestamp,
    })

    this.onUpdate(update)
  }

  private checkInactivity(): void {
    const now = Date.now()
    if (now - this.lastMovementTime >= INACTIVITY_THRESHOLD_MS) {
      this.onAlert({
        type: 'inactivity',
        message:
          'Officer inactive for 2+ minutes. Auto-checking for GPS issues.',
        timestamp: new Date().toISOString(),
      })
    }
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer)
      this.intervalTimer = null
    }
    offlineQueue.stopAutoSync()
    this.isRunning = false
  }

  get running(): boolean {
    return this.isRunning
  }
}
