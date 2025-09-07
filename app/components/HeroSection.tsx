import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useParallax } from "@/hooks/useScrollAnimation";
import { VideoWithFallback } from "@/components/figma/VideoWithFallback";
import heroImage from "@/assets/32627172128547d0f411f95659737c7135d22b6c.png";

interface HeroSectionProps {
  onOpenContactDialog: () => void;
}

export function HeroSection({ onOpenContactDialog }: HeroSectionProps) {
  const scrollY = useParallax();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <VideoWithFallback
          videoSrc="/videos/hero_video.mp4"
          imageSrc={heroImage.src}
          alt="שף במטבח מכין פיצות"
          className="w-full h-full object-cover"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100vw",
            height: "100vh",
            transform: "translate(-50%, -50%)",
            minWidth: "100%",
            minHeight: "100%",
          }}
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
      </motion.div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.h1
          className="text-responsive-h1 mb-4 sm:mb-6 text-foreground text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          קבלו הזמנות ישירות לוואטסאפ
          <motion.span
            className="text-primary block !text-[28px] sm:!text-[50px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            פשוט. חכם. רווחי.
          </motion.span>
        </motion.h1>

        <motion.p
          className="mb-6 sm:mb-8 max-w-2xl mx-auto text-[rgba(220,229,241,1)] !text-[18px] sm:!text-[30px] text-center leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          הכירו את בוט ההזמנות שיעבוד בשבילכם 24/7, ימנע טעויות ויחזיר לכם את
          השליטה בלקוחות ובכסף.
        </motion.p>

        <motion.div
          className="flex justify-center items-center mb-8 sm:mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg !text-[16px] sm:!text-[20px]"
              onClick={onOpenContactDialog}
            >
              דברו איתנו
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
        >
          {[
            { title: "300%+", description: "עלייה בהזמנות" },
            { title: "24/7", description: "זמינות מלאה" },
            { title: "0₪", description: "השקעה ראשונית" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-card/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-border"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.4 + index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transition: { duration: 0.2 },
              }}
            >
              <h3 className="text-responsive-h3 text-primary mb-2">
                {stat.title}
              </h3>
              <p className="text-responsive-base text-card-foreground text-center">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-[-80px] sm:bottom-[-112px] left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
