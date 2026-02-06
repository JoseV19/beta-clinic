import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-omega-dark">
      <motion.img
        src="/beta-logo.png"
        alt="Beta Clinic"
        className="h-16 w-auto object-contain"
        animate={{
          scale: [1, 1.1, 1],
          filter: [
            'drop-shadow(0 0 8px rgba(106,27,154,0.3))',
            'drop-shadow(0 0 24px rgba(106,27,154,0.6))',
            'drop-shadow(0 0 8px rgba(106,27,154,0.3))',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
