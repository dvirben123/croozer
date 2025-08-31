import {
  Clock,
  Smartphone,
  CreditCard,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useScrollAnimation } from "hooks/useScrollAnimation";

const features = [
  {
    icon: Clock,
    title: "זמינות 24/7",
    description:
      "הבוט עובד מסביב לשעון, גם כשאתם לא זמינים - לקוחות יכולים להזמין בכל שעה",
  },
  {
    icon: Smartphone,
    title: "הזמנה פשוטה",
    description:
      "לקוחות שולחים הזמנות ישירות בוואטסאפ בכמה הקשות פשוטות, ללא אפליקציות מסובכות",
  },
  {
    icon: CreditCard,
    title: "תשלום מיידי",
    description:
      "קישור תשלום בטוח נשלח אוטומטית ללקוח לאחר האישור, ללא עיכובים או טעויות",
  },
  {
    icon: Users,
    title: "ניהול לקוחות",
    description: "מערכת CRM מובנית שזוכרת את הלקוחות שלכם ומה הם אוהבים להזמין",
  },
  {
    icon: Target,
    title: "שיווק חכם",
    description:
      "שליחת מבצעים מותאמים אישית ללקוחות קבועים והגדלת המכירות באופן אוטומטי",
  },
  {
    icon: CheckCircle,
    title: "מערכת אישור חכמה",
    description:
      "הבוט מאשר הזמנות, בודק זמינות ושולח הודעות עדכון אוטומטיות ללקוח",
  },
];

export function SolutionSection() {
  const { isVisible, elementRef } = useScrollAnimation(0.1);

  return (
    <section
      ref={elementRef}
      className="py-16 sm:py-20 px-4 sm:px-6 bg-accent/30"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-responsive-h2 mb-4 sm:mb-6 text-foreground text-center">
            הכירו את בוט ההזמנות
            <span className="text-primary block !text-[24px] sm:!text-[32px]">
              שמדבר את השפה של הלקוחות שלכם
            </span>
          </h2>

          <p className="max-w-3xl mx-auto text-muted-foreground text-center !text-[16px] sm:!text-[20px]">
            הפתרון המושלם שמחבר בין הנוחות של וואטסאפ לבין הצרכים העסקיים שלכם
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-card/50 border border-border rounded-lg p-4 sm:p-6 text-center hover:shadow-lg hover:bg-card/70 transition-all duration-300 group"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={
                isVisible
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
                  : {
                      opacity: 0,
                      y: 50,
                      scale: 0.9,
                    }
              }
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                y: -5,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                className="bg-gradient-to-r from-primary/20 to-secondary/20 p-3 sm:p-4 rounded-full w-fit mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300"
                whileHover={{
                  rotate: 360,
                  transition: { duration: 0.6 },
                }}
              >
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </motion.div>

              <h3 className="text-responsive-h3 mb-2 sm:mb-3 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-responsive-base text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
