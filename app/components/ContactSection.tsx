import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ContactSectionProps {
  onOpenTermsDialog?: () => void;
}

export function ContactSection({ onOpenTermsDialog }: ContactSectionProps) {
  const { isVisible, elementRef } = useScrollAnimation(0.1);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
          <h2 className="text-responsive-h2 mb-4 sm:mb-6 text-foreground">
            מוכנים להתחיל?
            <span className="text-primary block !text-[24px] sm:!text-[32px]">
              בואו נדבר
            </span>
          </h2>

          <p className="max-w-3xl mx-auto text-muted-foreground !text-[16px] sm:!text-[20px]">
            מלאו את הפרטים ונחזור אליכם תוך 24 שעות עם הדגמה אישית
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <motion.div
            className="bg-card/50 rounded-lg p-6 sm:p-8 border border-border"
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <motion.h3
              className="text-responsive-h3 text-center mb-4 sm:mb-6 text-card-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              כתבו לנו
            </motion.h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-6"
              dir="rtl"
            >
              {[
                {
                  id: "fullName",
                  label: "שם מלא *",
                  type: "text",
                  placeholder: "השם המלא שלכם",
                  dir: "rtl",
                },
                {
                  id: "businessName",
                  label: "שם העסק *",
                  type: "text",
                  placeholder: "שם בית העסק שלכם",
                  dir: "rtl",
                },
                {
                  id: "phone",
                  label: "מספר טלפון *",
                  type: "tel",
                  placeholder: "050-1234567",
                  dir: "rtl",
                },
                {
                  id: "email",
                  label: "כתובת מייל *",
                  type: "email",
                  placeholder: "email@example.com",
                  dir: "ltr",
                },
              ].map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <label
                    htmlFor={field.id}
                    className="block text-muted-foreground mb-2 text-right text-responsive-base"
                  >
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    required
                    value={formData[field.id as keyof typeof formData]}
                    onChange={handleChange}
                    className="bg-input border-border text-foreground text-right text-responsive-base"
                    placeholder={field.placeholder}
                    dir={field.dir}
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 1 }}
              >
                <label
                  htmlFor="message"
                  className="block text-muted-foreground mb-2 text-right text-responsive-base"
                >
                  ספרו לנו על העסק שלכם
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground text-right text-responsive-base"
                  placeholder="איזה סוג עסק יש לכם? כמה הזמנות אתם מקבלים ביום? אילו אתגרים אתם מתמודדים איתם?"
                  dir="rtl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 sm:py-3 text-responsive-base text-[rgba(0,7,13,1)]"
                  >
                    <Send className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    שלח
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </motion.div>

          {/* WhatsApp Contact */}
          <motion.div
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 sm:p-8 text-center border border-border h-full flex flex-col justify-between">
              <div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={
                    isVisible
                      ? { scale: 1, rotate: 0 }
                      : { scale: 0, rotate: -180 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: 0.6,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
                </motion.div>

                <motion.h3
                  className="text-responsive-h3 mb-3 sm:mb-4 text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  התחילו שיחה עכשיו
                </motion.h3>

                <motion.p
                  className="text-responsive-base text-muted-foreground mb-6 sm:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  לחצו כאן לשיחת וואטסאפ ישירה איתנו
                </motion.p>

                <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                  {[
                    {
                      icon: "⚡",
                      title: "מענה מיידי",
                      desc: "אנחנו זמינים לעזור לכם",
                    },
                    {
                      icon: "🎯",
                      title: "יעוץ אישי",
                      desc: "קבלו המלצות מותאמות לעסק שלכם",
                    },
                    {
                      icon: "💡",
                      title: "הדגמה חיה",
                      desc: "ראו את הבוט פועל בזמן אמת",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-card/30 p-3 sm:p-4 rounded-lg border border-border/50"
                      initial={{ opacity: 0, x: 20 }}
                      animate={
                        isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                      }
                      transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <p className="text-responsive-base text-card-foreground mb-1 sm:mb-2">
                        {item.icon} {item.title}
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 1.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full py-2 sm:py-3 text-responsive-base">
                    <MessageCircle className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    פתח וואטסאפ
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="border-t border-border mt-12 sm:mt-16 pt-6 sm:pt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
        >
          <div className="text-center">
            <motion.div
              className="flex items-center justify-center mb-3 sm:mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                isVisible
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.8 }
              }
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <img
                src="/assets/4d243741b97f4cb27d5e541b25efddf4d20bc4a9.png"
                alt="דביר בן ישי Croozer Logo"
                className="h-8 sm:h-10 w-auto"
              />
            </motion.div>
            <motion.p
              className="text-responsive-base text-muted-foreground mb-3 sm:mb-4"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
            >
              הפתרון החכם לקבלת הזמנות בוואטסאפ
            </motion.p>

            {/* Terms and Privacy Link */}
            <motion.div
              className="mb-3 sm:mb-4"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 1.7 }}
            >
              <button
                onClick={onOpenTermsDialog}
                className="text-primary hover:text-primary/80 transition-colors underline cursor-pointer text-responsive-base"
              >
                תנאים ומדיניות
              </button>
            </motion.div>

            <motion.p
              className="text-responsive-base text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 1.8 }}
            >
              © Croozer דביר בן ישי 2024. כל הזכויות שמורות.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
