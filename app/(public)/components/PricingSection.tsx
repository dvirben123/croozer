import { Check, Percent, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { motion } from "motion/react";
import { useScrollAnimation } from "hooks/useScrollAnimation";

const plans = [
  {
    name: "מבוסס עמלה",
    subtitle: "המסלול הבסיסי",
    price: "רק 8%",
    period: "עמלה על הזמנה",
    description: "משלמים רק על מה שמרוויחים",
    icon: Percent,
    features: [
      "8% עמלה על כל הזמנה שהושלמה",
      "בוט וואטסאפ מתקדם + AI",
      "מערכת תשלומים מובנית",
      "תמיכה באימייל",
      "דשבורד ניהול בסיסי",
      "התקנה וההדרכה - חינם",
      "ללא התחייבות - אפשר לעצור בכל עת",
    ],
    popular: false,
    cta: "התחילו עכשיו",
    highlight: "מתאים לעסקים שמתחילים או עם נפח הזמנות נמוך",
  },
  {
    name: "חודשי קבוע",
    subtitle: "המסלול המלא",
    price: "₪399",
    period: "לחודש",
    description: "תשלום חודשי קבוע",
    icon: Calendar,
    features: [
      "בוט וואטסאפ מתקדם + AI",
      "מערכת תשלום מובנית",
      "אינטגרציה עם כל מערכות התשלום",
      "דוחות ואנליטיקס מתקדמים",

      "שיווק אוטומטי ללקוחות",
      "גיבויים אוטומטיים",
      "אפשרות לכמה סניפים",
    ],
    popular: true,
    cta: "התחילו עכשיו",
    highlight: "מתאים לעסקים עם נפח הזמנות גדול",
  },
];

export function PricingSection() {
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
            בחרו את המסלול שמתאים לעסק שלכם
            <span className="text-primary block !text-[24px] sm:!text-[32px]">
              תמחור שקוף - תוצאות מובטחות
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative rounded-lg p-6 sm:p-8 border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:border-primary/50"
              }`}
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
                duration: 0.7,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={
                    isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
                  }
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                >
                  <span className="bg-primary text-primary-foreground px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-regular">
                    הפופולרי ביותר
                  </span>
                </motion.div>
              )}

              <motion.div
                className="text-center mb-4 sm:mb-6"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
              >
                <motion.div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
                    plan.popular ? "bg-primary/20" : "bg-card"
                  }`}
                  whileHover={{
                    rotate: 360,
                    transition: { duration: 0.6 },
                  }}
                >
                  <plan.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      plan.popular ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </motion.div>

                <h3 className="text-responsive-h3 mb-1 text-card-foreground text-center">
                  {plan.name}
                </h3>
                <p className="text-responsive-base text-muted-foreground mb-3 sm:mb-4 text-center">
                  {plan.subtitle}
                </p>

                <motion.div
                  className="mb-3 sm:mb-4"
                  initial={{ scale: 0 }}
                  animate={isVisible ? { scale: 1 } : { scale: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5 + index * 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <div className="text-primary font-extrabold text-2xl sm:text-3xl">
                    {plan.price}
                  </div>
                  <span className="text-responsive-base text-muted-foreground">
                    {plan.period}
                  </span>
                </motion.div>

                <p className="text-responsive-base text-muted-foreground mb-4 sm:mb-6">
                  {plan.description}
                </p>

                <div className="bg-accent/30 p-2 sm:p-3 rounded-lg mb-4 sm:mb-6">
                  <p className="text-responsive-base text-accent-foreground">
                    {plan.highlight}
                  </p>
                </div>
              </motion.div>

              <motion.ul
                className="space-y-2 sm:space-y-3 mb-6 sm:mb-8"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.2 }}
              >
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    className="flex items-center gap-2 sm:gap-3 text-right"
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                    }
                    transition={{
                      duration: 0.3,
                      delay: 0.9 + index * 0.2 + featureIndex * 0.1,
                    }}
                  >
                    <span className="text-responsive-base text-card-foreground flex-1">
                      {feature}
                    </span>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={
                        isVisible
                          ? { scale: 1, rotate: 0 }
                          : { scale: 0, rotate: -180 }
                      }
                      transition={{
                        duration: 0.3,
                        delay: 1 + index * 0.2 + featureIndex * 0.1,
                        type: "spring",
                        stiffness: 500,
                      }}
                    >
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 1.2 + index * 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className={`w-full text-responsive-base ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-card border border-border text-card-foreground hover:bg-accent"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          className="mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <h3 className="text-responsive-h3 mb-6 sm:mb-8 text-foreground text-center">
            שאלות נפוצות
          </h3>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  value: "item-1",
                  question: "כמה זמן לוקח להקים את הבוט?",
                  answer:
                    "ההקמה הבסיסית לוקחת כ-5 דקות בלבד! אתם מתחברים לחשבון הווטסאפ שלכם, בוחרים תבנית מתאימה לעסק ומתחילים לעבד הודעות מיד. עבור התאמות מתקדמות יותר, התהליך יכול לקחת עד יום עבודה אחד.",
                },
                {
                  value: "item-2",
                  question:
                    "האם הבוט יכול להחליף את שירות הלקוחות שלי לחלוטין?",
                  answer:
                    "הבוט מטפל ב-80-90% מהפניות הבסיסיות באופן אוטומטי, וכך משחרר אתכם להתמקד בפניות המורכבות יותר. כשהבוט לא יודע לענות, הוא מעביר את השיחה אליכם באופן חלק ואלגנטי.",
                },
                {
                  value: "item-3",
                  question: "מה קורה אם הלקוח רוצה לדבר עם בן אדם?",
                  answer:
                    "הבוט יודע לזהות מתי הלקוח מעוניין לדבר עם בן אדם ומעביר את השיחה אליכם מיידית. אתם מקבלים התראה ויכולים להמשיך את השיחה בצורה חלקה מהנקודה שבה הבוט עצר.",
                },
                {
                  value: "item-4",
                  question: "האם הבוט יכול לקבל הזמנות ותשלומים?",
                  answer:
                    "בהחלט! הבוט יכול להציג תפריט, לקבל הזמנות, לחשב מחירים, ואפילו לקבל תשלומים באמצעות חיבור למערכות התשלום הפופולריות כמו Paybox, Cardcom ואחרות.",
                },
                {
                  value: "item-5",
                  question: "איך הבוט יודע מה לענות?",
                  answer:
                    "הבוט משתמש בבינה מלאכותית מתקדמת שלומדת מהשיחות והמידע שאתם מזינים לו. אתם יכולים להגדיר תשובות מוכנות לשאלות נפוצות, ולהוסיף מידע על המוצרים והשירותים שלכם.",
                },
                {
                  value: "item-6",
                  question: "מה עם אבטחה ופרטיות של הלקוחות?",
                  answer:
                    "אנחנו נוקטים בסטנדרטים הכי גבוהים של אבטחת מידע. כל הנתונים מוצפנים, אנחנו לא שומרים פרטי תשלום, ופועלים בהתאם לחוק הגנת הפרטיות בישראל ותקנות GDPR.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.8 + index * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <AccordionItem value={faq.value}>
                    <AccordionTrigger className="text-right text-card-foreground text-responsive-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-right text-muted-foreground text-responsive-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
