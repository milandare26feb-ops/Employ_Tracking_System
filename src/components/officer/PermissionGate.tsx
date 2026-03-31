'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle } from 'lucide-react'

interface PermissionGateProps {
  onAllGranted: () => void
}

export default function PermissionGate({ onAllGranted }: PermissionGateProps) {
  const [permissions, setPermissions] = useState({
    location: false,
    camera: false,
    microphone: false,
  })

  const requestLocationPermission = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setPermissions((prev) => ({ ...prev, location: true })),
        () => setPermissions((prev) => ({ ...prev, location: true })),
      )
    }
  }

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setPermissions((prev) => ({ ...prev, camera: true }))
    } catch {
      setPermissions((prev) => ({ ...prev, camera: true }))
    }
  }

  const allGranted =
    permissions.location && permissions.camera && permissions.microphone

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h2 className="text-white font-['Rajdhani'] font-bold text-2xl tracking-wide mb-8 text-center">
          PERMISSIONS REQUIRED
        </h2>
        <div className="space-y-3">
          <motion.button
            onClick={requestLocationPermission}
            className={`w-full py-4 rounded-2xl font-['Rajdhani'] font-bold text-base tracking-widest flex items-center justify-center gap-2 ${
              permissions.location
                ? 'bg-teal-500 text-[#0a0f1e]'
                : 'bg-[#0d1425] text-white'
            }`}
          >
            {permissions.location && <CheckCircle size={18} />}
            LOCATION ACCESS
          </motion.button>
          <motion.button
            onClick={requestCameraPermission}
            className={`w-full py-4 rounded-2xl font-['Rajdhani'] font-bold text-base tracking-widest flex items-center justify-center gap-2 ${
              permissions.camera
                ? 'bg-teal-500 text-[#0a0f1e]'
                : 'bg-[#0d1425] text-white'
            }`}
          >
            {permissions.camera && <CheckCircle size={18} />}
            CAMERA ACCESS
          </motion.button>
        </div>
        {allGranted && (
          <motion.button
            onClick={onAllGranted}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-teal-500 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl mt-6"
          >
            CONTINUE
          </motion.button>
        )}
      </div>
    </div>
  )
}