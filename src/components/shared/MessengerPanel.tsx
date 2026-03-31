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

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e]">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-[#1e2d4a] flex items-center gap-3 bg-[#080e1c]">
        <div className="flex-1">
          <h3 className="text-white font-['Rajdhani'] font-bold tracking-wide">
            {chatTitle}
          </h3>
          <p className="text-teal-400/60 text-[10px] font-['JetBrains_Mono']">
            {isGroupChat ? 'GROUP CHAT' : 'DIRECT MESSAGE'} · {messages.length}
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
                {msg.type === 'text' && msg.content && (
                  <p className="text-slate-200 text-sm font-['Rajdhani'] leading-relaxed">
                    {msg.content}
                  </p>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-8 h-8 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-teal-400 transition-colors"
            title="Send image"
          >
            <Image size={14} />
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="w-8 h-8 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-teal-400 transition-colors"
            title="Send video"
          >
            <Video size={14} />
          </button>

          <div className="flex-1 relative">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendText()}
              placeholder={`Message as ${currentUserName}...`}
              className="w-full bg-[#0d1425] border border-[#1e2d4a] rounded-xl px-4 py-2.5 text-white text-sm font-['Rajdhani'] placeholder-slate-700 focus:outline-none focus:border-teal-500/40 transition-colors"
            />
          </div>

          {text.trim() ? (
            <button
              onClick={sendText}
              className="w-9 h-9 rounded-xl bg-teal-500 hover:bg-teal-400 flex items-center justify-center text-[#0a0f1e] transition-colors shadow-[0_0_16px_rgba(0,212,170,0.3)]"
            >
              <Send size={15} />
            </button>
          ) : (
            <button
              className="w-9 h-9 rounded-xl bg-[#1e2d4a] hover:bg-[#2a3a5a] flex items-center justify-center text-slate-400 hover:text-teal-400"
              title="Hold to record voice"
            >
              <Mic size={15} />
            </button>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) e.target.value = ''
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}