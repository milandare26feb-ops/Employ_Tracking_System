'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Camera, RotateCcw, Check } from 'lucide-react'

interface FaceCaptureProps {
  onCapture: (photo: string) => void
}

export default function FaceCapture({ onCapture }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setHasCamera(false)
      }
    }

    initCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480)
        const photo = canvasRef.current.toDataURL('image/jpeg')
        setCapturedPhoto(photo)
      }
    }
  }

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h2 className="text-white font-['Rajdhani'] font-bold text-2xl tracking-wide mb-6 text-center">
          FACE VERIFICATION
        </h2>
        {hasCamera ? (
          <>
            <div className="relative mb-4 rounded-2xl overflow-hidden border border-[#1e2d4a]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto bg-[#0d1425]"
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="hidden"
              />
            </div>
            {!capturedPhoto && (
              <motion.button
                onClick={capturePhoto}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-teal-500 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl flex items-center justify-center gap-2"
              >
                <Camera size={18} /> CAPTURE PHOTO
              </motion.button>
            )}
            {capturedPhoto && (
              <motion.button
                onClick={confirmPhoto}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-teal-500 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl flex items-center justify-center gap-2"
              >
                <Check size={18} /> CONFIRM & CONTINUE
              </motion.button>
            )}
          </>
        ) : (
          <p className="text-slate-400 text-center">Camera access required</p>
        )}
      </div>
    </div>
  )
}