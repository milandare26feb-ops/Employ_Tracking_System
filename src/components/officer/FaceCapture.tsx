'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Camera,
  CheckCircle,
  RefreshCw,
  Shield,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

interface FaceCaptureProps {
  onCapture: (photoDataUrl: string) => void
  onSkip?: () => void
}

type CaptureState =
  | 'permission'
  | 'preview'
  | 'countdown'
  | 'captured'
  | 'uploading'
  | 'done'
  | 'error'

export default function FaceCapture({ onCapture }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CaptureState>('permission')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [faceDetected, setFaceDetected] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('preview')
      // Simulate face detection after 1.5s
      setTimeout(() => setFaceDetected(true), 1500)
    } catch {
      setErrorMsg(
        'Camera access denied. Please allow camera access to continue.',
      )
      setState('error')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const handleStartCountdown = useCallback(() => {
    if (!faceDetected) return
    setState('countdown')
    let count = 3
    setCountdown(count)
    const interval = setInterval(() => {
      count--
      setCountdown(count)
      if (count === 0) {
        clearInterval(interval)
        capturePhoto()
      }
    }, 1000)
  }, [faceDetected])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0)
    ctx.restore()
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedPhoto(dataUrl)
    stopCamera()
    setState('captured')
  }, [stopCamera])

  const handleAccept = useCallback(() => {
    if (!capturedPhoto) return
    setState('uploading')
    // Simulate upload
    setTimeout(() => {
      setState('done')
      onCapture(capturedPhoto)
    }, 1500)
  }, [capturedPhoto, onCapture])

  const handleRetake = useCallback(() => {
    setCapturedPhoto(null)
    setFaceDetected(false)
    setState('permission')
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Camera size={22} className="text-teal-400" />
          </div>
          <h2 className="font-['Rajdhani'] font-bold text-white text-xl tracking-wide">
            IDENTITY VERIFICATION
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            A live photo is required for system access
          </p>
        </div>

        {/* Camera Frame */}
        <div className="relative bg-[#0d1425] border border-[#1e2d4a] rounded-3xl overflow-hidden aspect-square mb-4">
          {/* Corner decorations */}
          {[
            'top-3 left-3',
            'top-3 right-3',
            'bottom-3 left-3',
            'bottom-3 right-3',
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-5 h-5 border-teal-400/60 z-10`}
              style={{
                borderTopWidth: i < 2 ? 2 : 0,
                borderBottomWidth: i >= 2 ? 2 : 0,
                borderLeftWidth: i % 2 === 0 ? 2 : 0,
                borderRightWidth: i % 2 === 1 ? 2 : 0,
                borderRadius:
                  i === 0
                    ? '8px 0 0 0'
                    : i === 1
                      ? '0 8px 0 0'
                      : i === 2
                        ? '0 0 0 8px'
                        : '0 0 8px 0',
              }}
            />
          ))}

          {/* Video / Photo */}
          <AnimatePresence mode="wait">
            {state === 'permission' || state === 'error' ? (
              <motion.div
                key="idle"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 rounded-full bg-[#1e2d4a] flex items-center justify-center">
                  <Camera size={32} className="text-slate-600" />
                </div>
                {state === 'error' ? (
                  <div className="text-center px-4">
                    <AlertTriangle
                      size={16}
                      className="text-red-400 mx-auto mb-2"
                    />
                    <p className="text-red-400 text-xs text-center leading-relaxed">
                      {errorMsg}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-600 text-xs text-center px-4">
                    Camera will appear here
                  </p>
                )}
              </motion.div>
            ) : state === 'captured' ||
              state === 'uploading' ||
              state === 'done' ? (
              <motion.div
                key="captured"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {capturedPhoto && (
                  <img
                    src={capturedPhoto}
                    alt="Captured face"
                    className="w-full h-full object-cover"
                  />
                )}
                {state === 'uploading' && (
                  <div className="absolute inset-0 bg-[#0a0f1e]/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <Loader2
                        size={28}
                        className="text-teal-400 animate-spin mx-auto mb-2"
                      />
                      <p className="text-teal-400 text-xs font-['Rajdhani'] font-semibold tracking-wider">
                        UPLOADING...
                      </p>
                    </div>
                  </div>
                )}
                {state === 'done' && (
                  <div className="absolute inset-0 bg-teal-500/10 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10 }}
                    >
                      <CheckCircle size={60} className="text-teal-400" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="video"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                  playsInline
                  muted
                />
                {/* Face detection overlay */}
                <AnimatePresence>
                  {faceDetected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-40 h-48 border-2 border-teal-400 rounded-full relative">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-teal-400/30"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Countdown overlay */}
                {state === 'countdown' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                      key={countdown}
                      initial={{ scale: 2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-20 h-20 bg-teal-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-teal-400"
                    >
                      <span className="font-['Rajdhani'] font-bold text-5xl text-teal-400">
                        {countdown}
                      </span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Face detection status */}
          {(state === 'preview' || state === 'countdown') && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <div
                className={`px-3 py-1 rounded-full text-[11px] font-['Rajdhani'] font-semibold backdrop-blur-sm flex items-center gap-1.5 ${
                  faceDetected
                    ? 'bg-teal-500/20 border border-teal-500/30 text-teal-400'
                    : 'bg-[#0a0f1e]/60 border border-[#1e2d4a] text-slate-500'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${faceDetected ? 'bg-teal-400 animate-pulse' : 'bg-slate-600'}`}
                />
                {faceDetected ? 'FACE DETECTED' : 'SCANNING...'}
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Action Buttons */}
        <div className="space-y-2">
          {state === 'permission' && (
            <motion.button
              onClick={startCamera}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,212,170,0.3)]"
            >
              <Camera size={18} /> ACTIVATE CAMERA
            </motion.button>
          )}
          {state === 'error' && (
            <motion.button
              onClick={() => {
                setErrorMsg('')
                setState('permission')
              }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-[#1e2d4a] border border-[#2a3d5a] text-slate-300 font-['Rajdhani'] font-bold text-sm tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} /> RETRY
            </motion.button>
          )}
          {state === 'preview' && (
            <motion.button
              onClick={handleStartCountdown}
              disabled={!faceDetected}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-4 font-['Rajdhani'] font-bold text-base tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 ${
                faceDetected
                  ? 'bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] shadow-[0_0_30px_rgba(0,212,170,0.3)]'
                  : 'bg-[#1e2d4a] text-slate-600 cursor-not-allowed'
              }`}
            >
              <Camera size={18} />
              {faceDetected ? 'TAKE PHOTO' : 'WAITING FOR FACE...'}
            </motion.button>
          )}
          {state === 'captured' && (
            <div className="flex gap-2">
              <motion.button
                onClick={handleRetake}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 bg-[#1e2d4a] border border-[#2a3d5a] text-slate-300 font-['Rajdhani'] font-bold text-sm tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={15} /> RETAKE
              </motion.button>
              <motion.button
                onClick={handleAccept}
                whileTap={{ scale: 0.97 }}
                className="flex-[2] py-3.5 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] font-['Rajdhani'] font-bold text-sm tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.3)]"
              >
                <CheckCircle size={15} /> USE THIS PHOTO
              </motion.button>
            </div>
          )}
          {state === 'done' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400 font-['Rajdhani'] font-bold text-sm tracking-wider flex items-center justify-center gap-2"
            >
              <CheckCircle size={15} /> VERIFICATION COMPLETE
            </motion.div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-4 flex items-start gap-2 px-2">
          <Shield size={12} className="text-slate-600 mt-0.5 flex-shrink-0" />
          <p className="text-slate-600 text-[10px] leading-relaxed">
            Your photo is encrypted and stored securely in Appwrite Storage. It
            is used only for identity verification and as your map marker icon.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
