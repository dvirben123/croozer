import { useState } from 'react';
import { Slider } from './ui/slider';
import { motion } from 'motion/react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function ROICalculatorSection() {
  const { isVisible, elementRef } = useScrollAnimation(0.1);
  const [monthlyOrders, setMonthlyOrders] = useState([500]);
  const [avgOrderValue, setAvgOrderValue] = useState([120]);

  // Calculations
  const monthlyRevenue = monthlyOrders[0] * avgOrderValue[0];
  const deliveryPlatformCommission = monthlyRevenue * 0.25; // 25% commission
  const botMonthlyFee = 299;
  const monthlySavings = deliveryPlatformCommission - botMonthlyFee;

  return (
    <section ref={elementRef} className="py-16 sm:py-20 px-4 sm:px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-responsive-h2 mb-4 sm:mb-6 text-foreground text-center">
            חשבו כמה אתם מפסידים כל חודש
          </h2>
          
          <p className="max-w-3xl mx-auto text-muted-foreground text-responsive-base text-center text-[20px]">
            הזינו את הנתונים שלכם וראו את הפוטנציאל הכלכלי
          </p>
        </motion.div>

        <motion.div 
          className="bg-card/50 rounded-lg p-6 sm:p-8 border border-border"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {/* Sliders */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Monthly Orders Slider */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <div className="text-center">
                <h3 className="text-responsive-h3 text-card-foreground mb-2">מספר הזמנות חודשיות</h3>
                <div className="text-primary text-2xl sm:text-3xl font-extrabold">
                  {monthlyOrders[0]} הזמנות
                </div>
              </div>
              <Slider
                value={monthlyOrders}
                onValueChange={setMonthlyOrders}
                max={2000}
                min={50}
                step={50}
                className="w-full"
                dir="rtl"
              />
            </motion.div>

            {/* Average Order Value Slider */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              <div className="text-center">
                <h3 className="text-responsive-h3 text-card-foreground mb-2">מחיר ממוצע להזמנה (₪)</h3>
                <div className="text-primary text-2xl sm:text-3xl font-extrabold">
                  ₪{avgOrderValue[0]}
                </div>
              </div>
              <Slider
                value={avgOrderValue}
                onValueChange={setAvgOrderValue}
                max={500}
                min={30}
                step={10}
                className="w-full"
                dir="rtl"
              />
            </motion.div>
          </div>

          {/* Results */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {/* Delivery Platforms Cost - Right */}
            <motion.div 
              className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 sm:p-6 text-center"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <h4 className="text-destructive text-responsive-base font-extrabold mb-2">פלטפורמות משלוחים</h4>
              <div className="text-destructive text-2xl sm:text-3xl font-extrabold mb-1">
                ₪{deliveryPlatformCommission.toLocaleString()}
              </div>
              <p className="text-destructive text-sm">עמלה חודשית (25%)</p>
            </motion.div>

            {/* Bot Cost - Center */}
            <motion.div 
              className="bg-card/30 border border-border rounded-lg p-4 sm:p-6 text-center"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <h4 className="text-card-foreground text-responsive-base font-extrabold mb-2">בוט וואטסאפ</h4>
              <div className="text-primary text-2xl sm:text-3xl font-extrabold mb-1">
                ₪{botMonthlyFee}
              </div>
              <p className="text-muted-foreground text-sm">ממו חודשי קבוע</p>
            </motion.div>

            {/* Savings - Left (Highlighted) */}
            <motion.div 
              className="bg-gradient-to-r from-primary/10 to-primary/20 border-2 border-primary rounded-lg p-4 sm:p-6 text-center"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <h4 className="text-primary text-responsive-base font-extrabold mb-2">החיסכון שלכם</h4>
              <div className="text-primary text-2xl sm:text-3xl font-extrabold mb-1">
                ₪{monthlySavings.toLocaleString()}
              </div>
              <p className="text-primary text-sm">חיסכון חודשי</p>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div 
            className="mt-6 p-4 bg-accent/30 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          >
            <p className="text-accent-foreground text-responsive-base">
              💡 <strong>חיסכון שנתי משוער:</strong> ₪{(monthlySavings * 12).toLocaleString()}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}