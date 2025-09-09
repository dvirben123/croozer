import { Phone, Globe, Truck, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface WhyUsSectionProps {
  onOpenContactDialog: () => void;
}

const comparisons = [
  {
    icon: Phone,
    title: "מול הזמנות טלפוניות",
    traditional: "המתנה בטלפון, טעויות בהזמנות, זמינות מוגבלת",
    withBot: "הזמנות מיידיות, מדויקות ב-100%, זמינות 24/7",
    improvement: "חיסכון של עד כ-4 שעות עבודה ביום",
  },
  {
    icon: Globe,
    title: "מול אתר אינטרנט",
    traditional: "צריך להוריד אפליקציה, הרשמה מסובכת, נטישת עגלות",
    withBot: "פשוט כמו שליחת הודעה, ללא הרשמה, שיחה אישית",
    improvement: "עלייה של 60% בהשלמת הזמנות",
  },
  {
    icon: Truck,
    title: "מול פלטפורמות משלוחים",
    traditional: "עמלות גבוהות (15-30%), אין קשר ישיר עם הלקוח",
    withBot: "עמלה נמוכה מאוד ואפשרות בחירה של חברת שילוח פנימית/חיצונית",
    improvement: "חיסכון של 25% בעמלות חודשיות",
  },
  {
    icon: MessageCircle,
    title: "הבוט בוואטסאפ שלנו",
    traditional: "",
    withBot: "כל היתרונות ביחד: פשטות, חיסכון, זמינות ובניית קשר אישי",
    improvement: "הפתרון המושלם לעסק המודרני",
  },
];

export function WhyUsSection({ onOpenContactDialog }: WhyUsSectionProps) {
  const { isVisible, elementRef } = useScrollAnimation(0.1);

  return (
    <section
      ref={elementRef}
      className="py-16 sm:py-20 px-4 sm:px-6 bg-background"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-responsive-h2 mb-4 sm:mb-6 text-foreground text-center">
            למה לבחור בבוט בוואטסאפ?
            <span className="text-primary block !text-[24px] sm:!text-[32px]">
              כי הוא יותר מכל פתרון אחר
            </span>
          </h2>

          <p className="max-w-3xl mx-auto text-muted-foreground text-center !text-[16px] sm:!text-[20px]">
            השוואה ברורה שמראה איך הבוט שלנו עולה על כל השאר
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-lg p-4 sm:p-6 border border-border hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={
                isVisible
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
              }
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <motion.div
                  className="bg-primary/20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                  whileHover={{
                    rotate: 15,
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                >
                  <comparison.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </motion.div>
                <h3 className="text-responsive-h3 text-card-foreground text-right">
                  {comparison.title}
                </h3>
              </div>

              {comparison.traditional && (
                <motion.div
                  className="mb-3 sm:mb-4 p-3 sm:p-4 bg-destructive/10 rounded-lg border border-destructive/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <h4 className="text-destructive mb-2 text-right text-responsive-base font-extrabold">
                    הדרך המסורתית:
                  </h4>
                  <p className="text-responsive-base text-muted-foreground text-right">
                    {comparison.traditional}
                  </p>
                </motion.div>
              )}

              <motion.div
                className="mb-3 sm:mb-4 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <h4 className="text-primary mb-2 text-right text-responsive-base font-extrabold">
                  עם הבוט שלנו:
                </h4>
                <p className="text-responsive-base text-muted-foreground text-right">
                  {comparison.withBot}
                </p>
              </motion.div>

              <motion.div
                className="bg-accent/50 p-2 sm:p-3 rounded-lg text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  isVisible
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <span className="text-primary font-extrabold text-center text-responsive-base">
                  {comparison.improvement}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section
        <motion.div 
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 sm:p-8 border border-border">
            <motion.h3 
              className="text-responsive-h3 mb-3 sm:mb-4 text-foreground text-center"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              מוכנים לעבור לפתרון החכם יותר?
            </motion.h3>
            
            <motion.p 
              className="text-muted-foreground mb-4 sm:mb-6 text-center !text-[16px] sm:!text-[20px]"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              תנו לבוט לעבוד בשבילכם ותראו את ההבדל כבר מהיום הראשון
            </motion.p>
            
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <motion.button 
                className="border border-border text-foreground hover:bg-accent px-6 sm:px-8 py-2 sm:py-3 rounded-lg transition-all duration-300 text-responsive-base"
                onClick={onOpenContactDialog}
                whileHover={{ 
                  scale: 1.05,
                  borderColor: "rgba(94, 234, 212, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                שאלו אותנו הכל
              </motion.button>
            </motion.div>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
