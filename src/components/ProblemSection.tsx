import { X, DollarSign, Clock, Phone, Users, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const problems = [
  {
    icon: Phone,
    text: "הטלפון לא מפסיק לצלצל והלקוחות מתחילים להתעצבן מהזמן ההמתנה הארוך"
  },
  {
    icon: X,
    text: "הזמנות שמתבלבלות בשיחה ולקוחות מקבלים משהו שלא הזמינו"
  },
  {
    icon: Clock,
    text: "אובדן הזמנות כשאתם לא זמינים לענות - כל שעה שהטלפון לא נענה זה כסף שנעלם"
  },
  {
    icon: DollarSign,
    text: "עלויות על עובדים שרק מקבלים הזמנות במקום להתמקד בבישול ובשירות"
  },
  {
    icon: Users,
    text: "לקוחות שהולכים למתחרה כי לא הספקתם לענות או שהשירות היה לא מספיק טוב"
  },
  {
    icon: TrendingDown,
    text: "הכנסות שלא מגיעות לפוטנציאל בגלל חוסר יעילות בתהליך קבלת ההזמנות"
  }
];

export function ProblemSection() {
  const { isVisible, elementRef } = useScrollAnimation(0.1);

  return (
    <section ref={elementRef} className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2 
          className="text-responsive-h2 mb-4 text-foreground text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          קבלת הזמנות לא צריכה להיות
          <motion.span 
            className="text-destructive block !text-[24px] sm:!text-[32px]"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            משימה קשה
          </motion.span>
        </motion.h2>
        
        <motion.p 
          className="mb-12 sm:mb-16 max-w-3xl mx-auto text-muted-foreground !text-[16px] sm:!text-[20px] text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          אנחנו מבינים את האתגרים שבעלי עסקים מתמודדים איתם יום יום
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((problem, index) => (
            <motion.div 
              key={index}
              className="bg-card/50 p-4 sm:p-6 rounded-lg hover:bg-card/70 transition-all duration-300 border border-border"
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2 + index * 0.1,
                ease: "easeOut" 
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div 
                  className="bg-destructive/20 p-2 sm:p-3 rounded-lg flex-shrink-0"
                  whileHover={{ 
                    rotate: 5,
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                >
                  <problem.icon className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                </motion.div>
                <p className="text-responsive-base text-card-foreground leading-relaxed text-right flex-1">
                  {problem.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}