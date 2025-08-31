import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { motion } from "motion/react";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] bg-card text-card-foreground border-border dark"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-primary text-center">
            מסמך תנאים ומדיניות
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            תנאי השימוש ומדיניות הפרטיות שלנו
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <motion.div
            className="space-y-6 text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-muted-foreground leading-relaxed">
              ברוכים הבאים לעמוד הבית של [שם החברה שלך]. אנו מציעים פתרונות
              טכנולוגיים לעסקים קטנים ובינוניים בתחום המזון ותחומים נוספים,
              ומטרתנו היא לסייע לכם לייעל את תהליכי ההזמנה והתשלום. מסמך זה מפרט
              את תנאי השימוש בשירותים שלנו ואת מדיניות הפרטיות שלנו.
            </p>

            <div className="space-y-4">
              <h3 className="text-primary">1. מדיניות פרטיות</h3>
              <p className="text-card-foreground leading-relaxed">
                אנו מכבדים את פרטיותכם ומחויבים להגן עליה. מסמך זה מתאר כיצד אנו
                אוספים, משתמשים ושומרים על המידע האישי שלכם שנמסר לנו דרך עמוד
                נחיתה זה.
              </p>

              <div className="pr-4 space-y-3">
                <p className="text-card-foreground leading-relaxed">
                  <span className="text-primary">איסוף מידע:</span> בעמוד נחיתה
                  זה, אנו אוספים אך ורק מידע שנמסר לנו באופן וולונטרי על ידכם
                  דרך טופס יצירת הקשר. מידע זה כולל: שם מלא, שם העסק, כתובת דואר
                  אלקטרוני ומספר טלפון.
                </p>

                <p className="text-card-foreground leading-relaxed">
                  <span className="text-primary">שימוש במידע:</span> המידע שנאסף
                  ישמש אך ורק לצורך יצירת קשר ראשוני עמכם, תיאום שיחת ייעוץ
                  והצגת השירותים שלנו.
                </p>

                <p className="text-card-foreground leading-relaxed">
                  <span className="text-primary">הגנת מידע:</span> אנו נוקטים
                  באמצעי אבטחה סבירים כדי להגן על המידע האישי שלכם מפני גישה לא
                  מורשית, שימוש לרעה או חשיפה.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-primary">2. תנאי שימוש בשירות</h3>
              <p className="text-card-foreground leading-relaxed">
                על ידי שימוש בעמוד נחיתה זה ופנייה אלינו דרכו, אתם מסכימים
                לתנאים הבאים.
              </p>

              <div className="pr-4 space-y-3">
                <p className="text-card-foreground leading-relaxed">
                  <span className="text-primary">תיאור השירות:</span> השירות
                  המוצג בעמוד זה הוא בוט הזמנות אוטומטי בוואטסאפ, המיועד לסייע
                  לבעלי עסקים בניהול הזמנות, תשלומים וקשרי לקוחות. עמוד נחיתה זה
                  נועד למטרות שיווקיות בלבד ואינו מהווה פלטפורמה להזמנה ישירה.
                </p>

                <p className="text-card-foreground leading-relaxed">
                  <span className="text-primary">תהליך ההטמעה:</span> אנו מציעים
                  תהליך התאמה והטמעה של הבוט לעסק שלכם. לאחר שתסכימו להתקשרות
                  עסקית, נספק לכם פירוט מלא ומדויק של תהליך ההתקנה, ההפעלה
                  והתמיכה.
                </p>

                <p className="text-card-foreground leading-relaxed">
                  <span className="text-primary">הסכם שירות נפרד:</span> כל
                  התקשרות עסקית עתידית תהיה כפופה להסכם שירות מפורט ונפרד,
                  שיגדיר את תנאי התשלום, תנאי הביטול, הגבלות אחריות נוספות, וכל
                  תנאי רלוונטי אחר.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-primary">3. הגבלת אחריות</h3>
              <p className="text-card-foreground leading-relaxed">
                השירותים והמידע באתר זה ניתנים "כמות שהם" ("As Is"). איננו
                אחראים לכל נזק, ישיר או עקיף, שייגרם כתוצאה מהסתמכות על מידע או
                שימוש בשירותינו. אנו עושים כל מאמץ לספק מידע מדויק, אך איננו
                מתחייבים שיהיה ללא טעויות או שהאתר יפעל ללא הפרעות.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-primary">4. קניין רוחני</h3>
              <p className="text-card-foreground leading-relaxed">
                כל התוכן, העיצוב, הקוד, התכנים השיווקיים, והטכנולוגיה העומדת
                מאחורי בוט ההזמנות, לרבות השם והלוגו של [שם החברה שלך], הם
                קנייננו הבלעדי. אין להעתיק, לשכפל או להשתמש בהם ללא אישור מפורש
                מראש ובכתב.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-primary">5. יצירת קשר ונגישות</h3>
              <p className="text-card-foreground leading-relaxed">
                לשאלות, בקשות או הערות, ניתן ליצור עמנו קשר באמצעות פרטי יצירת
                הקשר המופיעים באתר. אנו מחויבים להנגשת האתר ככל הניתן ופועלים
                בהתאם לתקנות הנגישות הרלוונטיות. אם נתקלתם בבעיית נגישות, אנא
                צרו עמנו קשר.
              </p>
            </div>
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
