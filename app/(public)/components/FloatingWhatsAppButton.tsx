import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingWhatsAppButtonProps {
  onOpenContactDialog: () => void;
}

export function FloatingWhatsAppButton({ onOpenContactDialog }: FloatingWhatsAppButtonProps) {
  return (
    <motion.div
      className="fixed left-6 bottom-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: 2, 
        duration: 0.5, 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.button
        onClick={onOpenContactDialog}
        className="relative bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group transition-all duration-300"
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 20px 40px rgba(34, 197, 94, 0.4)"
        }}
        whileTap={{ scale: 0.9 }}
        aria-label="צור קשר בוואטסאפ"
      >
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-green-400 rounded-full opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Icon */}
        <MessageCircle className="h-8 w-8 z-10" />
      </motion.button>
      
      {/* Tooltip */}
      <motion.div
        className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-card text-card-foreground px-3 py-2 rounded-lg shadow-lg border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        dir="rtl"
      >
        <span className="text-sm">שלחו הודעה בוואטסאפ</span>
        {/* Arrow */}
        <div className="absolute left-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-card"></div>
      </motion.div>
    </motion.div>
  );
}