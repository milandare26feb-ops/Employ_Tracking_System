'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Send,
  Mic,
  MicOff,
  Phone,
  Image,
  Video,
  MapPin,
  X,
  Play,
  Pause,
  Download,
} from 'lucide-react'

export interface GeoTag {
  lat: number
  lng: number
  address: string
  timestamp: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  type: 'text' | 'voice' | 'image' | 'video'
  content?: string
  fileUrl?: string
  duration?: number
  geoLat?: number
  geoLng?: number
  geoAddress?: string
  capturedAt?: string
  timestamp: string
  isMine: boolean
}

interface MessengerPanelProps {
  currentUserId: string
  currentUserName: string
  currentUserPhoto?: string
  messages: Message[]
  onSendText: (text: string) => void
  onSendVoice: (blob: Blob, duration: number) => void
  onSendMedia: (file: File, type: 'image' | 'video', geo: GeoTag) => void
  onVoiceCall: () => void
  chatTitle?: string
  isGroupChat?: boolean
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getCurrentGeo(): Promise<GeoTag> {
  return new Promise((resolve) => {
    const now = new Date().toISOString()
    if (!navigator.geolocation) {
      resolve({
        lat: 0,
        lng: 0,
        address: 'Location unavailable',
        timestamp: now,
      })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          timestamp: now,
        })
      },
      () =>
        resolve({
          lat: 0,
          lng: 0,
          address: 'Location unavailable',
          timestamp: now,
        }),
      { timeout: 5000 },
    )
  })
}

export default function MessengerPanel({
  currentUserName,
  messages,
  onSendText,
  onSendVoice,
  onSendMedia,
  onVoiceCall,
  chatTitle = 'Team Channel',
  isGroupChat = false,
}: MessengerPanelProps) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendText = () => {
    const t = text.trim()
    if (!t) return
    onSendText(t)
    setText('')
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        onSendVoice(blob, recordSeconds)
        setRecordSeconds(0)
      }
      mr.start()
      mediaRef.current = mr
      setIsRecording(true)
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      // mic not available
    }
  }, [onSendVoice, recordSeconds])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
  }, [])

  const handleMediaCapture = useCallback(
    async (file: File, type: 'image' | 'video') => {
      const geo = await getCurrentGeo()
      onSendMedia(file, type, geo)
    },
    [onSendMedia],
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e]">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-[#1e2d4a] flex items-center gap-3 bg-[#080e1c]">
        <div className="flex-1">
          <h3 className="text-white font-['Rajdhani'] font-bold tracking-wide">
            {chatTitle}
          </h3>
          <p className="text-teal-400/60 text-[10px] font-['JetBrains_Mono']">
            {isGroupChat ? 'GROUP CHAT' : 'DIRECT MESSAGE'} · {messages.length}{' '}
            messages
          </p>
        </div>
        <button
          onClick={onVoiceCall}
          className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 flex items-center justify-center text-teal-400 transition-colors"
          title="Voice Call"
        >
          <Phone size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${
              msg.isMine ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#1e2d4a] border border-[#2a3a5a] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="text-teal-400 text-[10px] font-['Rajdhani'] font-bold">
                {msg.senderName.charAt(0)}
              </span>
            </div>

            <div
              className={`max-w-[70%] ${
                msg.isMine ? 'items-end' : 'items-start'
              } flex flex-col gap-1`}
            >
              {!msg.isMine && (
                <span className="text-slate-500 text-[10px] font-['Rajdhani'] px-1">
                  {msg.senderName}
                </span>
              )}

              <div
                className={`rounded-2xl px-3.5 py-2.5 ${
                  msg.isMine
                    ? 'bg-teal-500/15 border border-teal-500/25 rounded-tr-sm'
                    : 'bg-[#0d1425] border border-[#1e2d4a] rounded-tl-sm'
                }`}
              >
                {/* Text */}
                {msg.type === 'text' && msg.content && (
                  <p className="text-slate-200 text-sm font-['Rajdhani'] leading-relaxed">
                    {msg.content}
                  </p>
                )}

                {/* Voice */}
                {msg.type === 'voice' && msg.fileUrl && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setPlayingId(playingId === msg.id ? null : msg.id)
                      }
                      className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400"
                    >
                      {playingId === msg.id ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-0.5 bg-[#1e2d4a] rounded-full relative">
                        <div className="absolute inset-y-0 left-0 w-1/3 bg-teal-500 rounded-full" />
                      </div>
                    </div>
                    <span className="text-slate-500 text-[10px] font-['JetBrains_Mono']">
                      {msg.duration ? formatDuration(msg.duration) : '0:00'}
                    </span>
                  </div>
                )}

                {/* Image / Video */}
                {(msg.type === 'image' || msg.type === 'video') &&
                  msg.fileUrl && (
                    <div className="space-y-1.5">
                      <div className="rounded-xl overflow-hidden relative">
                        {msg.type === 'image' ? (
                          <img
                            src={msg.fileUrl}
                            className="max-w-[200px] max-h-[200px] object-cover rounded-xl"
                            alt=""
                          />
                        ) : (
                          <video
                            src={msg.fileUrl}
                            controls
                            className="max-w-[200px] rounded-xl"
                          />
                        )}
                        <a
                          href={msg.fileUrl}
                          download
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
                        >
                          <Download size={10} />
                        </a>
                      </div>
                      {/* Geo + time tag */}
                      {msg.geoLat !== undefined && (
                        <div className="flex items-center gap-1 px-1">
                          <MapPin size={9} className="text-teal-400" />
                          <span className="text-slate-500 text-[9px] font-['JetBrains_Mono'] truncate">
                            {msg.geoAddress}
                          </span>
                        </div>
                      )}
                      {msg.capturedAt && (
                        <div className="flex items-center gap-1 px-1">
                          <span className="text-slate-600 text-[9px] font-['JetBrains_Mono']">
                            📸{' '}
                            {new Date(msg.capturedAt).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              <span
                className={`text-[9px] text-slate-600 font-['JetBrains_Mono'] px-1`}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-[#1e2d4a] p-3 bg-[#080e1c]">
        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-3 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl mb-2"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-300 text-xs font-['Rajdhani'] font-semibold flex-1">
                Recording voice... {formatDuration(recordSeconds)}
              </span>
              <button
                onClick={stopRecording}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* Media buttons */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-8 h-8 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-teal-400 transition-colors"
            title="Send image (live capture)"
          >
            <Image size={14} />
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="w-8 h-8 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-teal-400 transition-colors"
            title="Send video (live capture)"
          >
            <Video size={14} />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendText()}
              placeholder={`Message as ${currentUserName}...`}
              className="w-full bg-[#0d1425] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none focus:border-teal-500/40 transition-colors"
            />
          </div>

          {/* Voice / Send */}
          {text.trim() ? (
            <button
              onClick={sendText}
              className="w-9 h-9 rounded-xl bg-teal-500 hover:bg-teal-400 flex items-center justify-center text-[#0a0f1e] transition-colors shadow-[0_0_16px_rgba(0,212,170,0.3)]"
            >
              <Send size={15} />
            </button>
          ) : (
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-[#1e2d4a] hover:bg-[#2a3a5a] text-slate-400 hover:text-teal-400'
              }`}
              title="Hold to record voice"
            >
              {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          )}
        </div>

        {/* Hidden file inputs — capture only */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleMediaCapture(file, 'image')
            e.target.value = ''
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleMediaCapture(file, 'video')
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
