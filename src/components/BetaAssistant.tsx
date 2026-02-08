import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import { askBeta } from '../services/aiService'

/* ── Types ─────────────────────────────────────────────── */

interface Message {
  role: 'user' | 'bot'
  text: string
}

const WELCOME: Message = {
  role: 'bot',
  text: 'Hola Dr. Soy Beta, tu asistente clínico con IA. ¿En qué puedo ayudarte hoy?',
}

/* ── Component ─────────────────────────────────────────── */

export default function BetaAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Auto-scroll on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  /* Focus input when chat opens */
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function handleSend() {
    const question = input.trim()
    if (!question || isLoading) return

    const userMsg: Message = { role: 'user', text: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const answer = await askBeta(question)
      setMessages(prev => [...prev, { role: 'bot', text: answer }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Lo siento, no pude conectar con el servidor de IA. Intenta de nuevo.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* ── FAB ────────────────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-beta-mint shadow-lg shadow-beta-mint/25 transition-transform hover:scale-110"
          >
            <MessageCircle size={24} className="text-omega-abyss" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat window ────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-omega-abyss shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-beta-mint/15">
                  <Bot size={16} className="text-beta-mint" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Beta Assistant</p>
                  <p className="text-[10px] text-beta-mint">Gemini Flash · Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'bot'
                        ? 'bg-beta-mint/15 text-beta-mint'
                        : 'bg-omega-violet/20 text-omega-violet'
                    }`}
                  >
                    {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'bot'
                        ? 'bg-white/[0.05] text-white/80'
                        : 'bg-beta-mint/15 text-white/90'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-beta-mint/15 text-beta-mint">
                    <Bot size={14} />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3.5 py-2.5">
                    <Loader2 size={12} className="animate-spin text-beta-mint" />
                    <span className="text-xs text-white/40">Escribiendo...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.06] px-3 py-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-beta-mint text-omega-abyss transition-transform hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
