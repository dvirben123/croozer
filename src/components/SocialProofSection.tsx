import { Star, ChefHat, Pizza, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const testimonials = [
  {
    name: "אמיר כהן",
    business: "פיצה אמיר",
    icon: Pizza,
    rating: 5,
    text: "הבוט שינה לנו את החיים! מקבלים פי 3 יותר הזמנות מאז שהתחלנו להשתמש בו. הלקוחות אוהבים כמה זה פשוט להזמין דרך וואטסאפ ואנחנו חוסכים המון זמן.",
    improvement: "300% עלייה בהזמנות"
  },
  {
    name: "שרה לוי",
    business: "בית קפה שרה",
    icon: Coffee,
    rating: 5,
    text: "אחרי שהתקנו את הבוט, סוף סוף יכולנו להתמקד בבישול ולא לחכות כל הזמן לטלפון. הלקוחות מזמינים גם בלילה ובסופי שבוע - זה פשוט מדהים!",
    improvement: "4 שעות חיסכון ביום"
  },
  {
    name: "דני רוזן",
    business: "מסעדת דני",
    icon: ChefHat,
    rating: 5,
    text: "הכי מרוצה מההחלטה להשתמש בבוט וואטסאפ. הוא מטפל בכל ההזמנות בצורה מקצועית, שומר על רשימת לקוחות ואפילו שולח מבצעים אוטומטיים.",
    improvement: "50% פחות טעויות"
  }
];

export function SocialProofSection() {
  const { isVisible, elementRef } = useScrollAnimation(0.1);

  return (
    <section ref={elementRef} className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div 
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-responsive-h2 mb-4 sm:mb-6 text-foreground text-center">
            אל תקחו את המילה שלנו בלבד
            <span className="text-primary block !text-[24px] sm:!text-[32px]">סיפורי הצלחה אמיתיים</span>
          </h2>
          
          <p className="max-w-3xl mx-auto text-muted-foreground text-center !text-[16px] sm:!text-[20px]">
            בעלי עסקים שכמוכם שכבר חוו את ההבדל
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-card rounded-lg p-4 sm:p-6 border border-border hover:border-primary/50 transition-all duration-300 text-right group"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isVisible ? { 
                opacity: 1, 
                y: 0, 
                scale: 1 
              } : { 
                opacity: 0, 
                y: 50, 
                scale: 0.9 
              }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              whileHover={{ 
                y: -5,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div 
                    className="bg-primary/20 p-2 sm:p-3 rounded-full group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ 
                      rotate: 15,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <testimonial.icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </motion.div>
                  <div className="text-right">
                    <h4 className="text-responsive-base font-extrabold text-card-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.2 + index * 0.1 + i * 0.05 
                      }}
                    >
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <motion.p 
                className="text-responsive-base text-muted-foreground leading-relaxed mb-3 sm:mb-4 text-right"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                "{testimonial.text}"
              </motion.p>

              {/* Improvement Badge */}
              <motion.div 
                className="bg-gradient-to-r from-primary/10 to-secondary/10 p-2 sm:p-3 rounded-lg text-center border border-primary/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <span className="text-primary font-extrabold text-sm sm:text-base">{testimonial.improvement}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}