'use client'
import { useState } from 'react'
import { ArrowLeft, Camera, LogOut } from 'lucide-react'
import { motion } from 'motion/react'

interface OfficerSettingsProps {
  officerName: string
  facePhoto?: string
  approvalStatus?: string
  onBack: () => void
  onUpdatePhoto?: (photo: string) => void
}

export default function OfficerSettings({
  officerName,
  facePhoto,
  approvalStatus,
  onBack,
  onUpdatePhoto,
}: OfficerSettingsProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-12 pb-5">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#0d1425] border border-[#1e2d4a] flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-slate-400" />
        </button>
        <h1 className="font-['Rajdhani'] font-bold text-white text-xl tracking-wide">
          SETTINGS
        </h1>
      </div>
    </div>
  )
}