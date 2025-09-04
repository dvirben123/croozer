import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תנאי שירות - Croozer AI",
  description: "תנאי השירות של Croozer AI - הסכמי השימוש בבוט הוואטסאפ שלנו",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hebrew Version */}
        <div className="mb-16" dir="rtl">
          <h1 className="text-4xl font-bold mb-8 text-center">
            תנאי שירות - Croozer AI
          </h1>

          <div className="prose prose-lg max-w-none text-right space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                1. כללי
              </h2>
              <p className="leading-relaxed">
                ברוכים הבאים לשירות הבוט של Croozer AI ("השירות"). השירות מסופק
                לך ("המשתמש") על ידי חברת Croozer AI ("החברה", "אנחנו"). על ידי
                שימוש בשירות הבוט שלנו, אתה מאשר כי קראת, הבנת והסכמת להיות כפוף
                לתנאי שימוש אלה, לרבות מדיניות הפרטיות שלנו, וכן לתנאי השימוש
                הרלוונטיים של פלטפורמת WhatsApp. אם אינך מסכים לתנאים, אינך רשאי
                להשתמש בשירות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                2. שימוש בשירות
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">שימוש מותר:</h3>
                  <p>
                    אתה רשאי להשתמש בשירות רק למטרות חוקיות, מורשות ומקובלות.
                    השירות מיועד לשימוש אישי ועסקי לצורך ביצוע הזמנות, קבלת מידע
                    ואינטראקציה עם עסקים המשתמשים בפתרונות שלנו.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">
                    התחייבויות המשתמש:
                  </h3>
                  <p className="mb-2">אתה מתחייב:</p>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>לספק מידע אמיתי, מדויק ומלא בעת השימוש בשירות.</li>
                    <li>
                      לא להשתמש בשירות באופן שעלול לפגוע, לשבש או להכביד על
                      השירות או על משתמשים אחרים.
                    </li>
                    <li>לא להתחזות לאדם או גוף אחר.</li>
                    <li>לשמור על סודיות פרטי הגישה שלך, ככל שרלוונטי.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                3. קניין רוחני
              </h2>
              <p className="leading-relaxed">
                כל זכויות הקניין הרוחני הקשורות בשירות, לרבות זכויות היוצרים
                בתוכנה, בעיצוב ובממשק, שייכות לחברת Croozer AI. אינך רשאי
                להעתיק, לשנות, להפיץ, להציג בפומבי או ליצור יצירות נגזרות מכל
                חלק של השירות ללא אישור מפורש בכתב מאיתנו. עם זאת, אתה הבעלים של
                התכנים (לדוגמה, טקסט, תמונות, לוגו) שתעביר דרך השירות לצורך הפקת
                מסמכים.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                4. סמכות שיפוט
              </h2>
              <p className="leading-relaxed">
                תנאי שימוש אלה כפופים לדיני מדינת ישראל, וכל סכסוך הנובע מהם
                יידון בבתי המשפט המוסמכים בעיר תל אביב-יפו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                5. סיום השירות
              </h2>
              <p className="leading-relaxed">
                החברה שומרת לעצמה את הזכות להשעות או להפסיק את השימוש שלך
                בשירות, באופן זמני או קבוע, אם תפר תנאי מתנאי שימוש אלה או כל
                חוק רלוונטי.
              </p>
            </section>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-16"></div>

        {/* English Version */}
        <div dir="ltr">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Terms of Service - Croozer AI
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                1. General
              </h2>
              <p className="leading-relaxed">
                Welcome to the Croozer AI bot service ("the Service"). The
                Service is provided to you ("the User") by Croozer AI ("the
                Company," "we," "us"). By using our bot service, you confirm
                that you have read, understood, and agreed to be bound by these
                Terms of Service, including our Privacy Policy, as well as the
                relevant Terms of Service of the WhatsApp platform. If you do
                not agree to these terms, you are not permitted to use the
                Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                2. Use of the Service
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">Permitted Use:</h3>
                  <p>
                    You may use the Service only for legal, authorized, and
                    acceptable purposes. The Service is intended for personal
                    and business use to place orders, receive information, and
                    interact with businesses that use our solutions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">
                    User Obligations:
                  </h3>
                  <p className="mb-2">You undertake to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Provide true, accurate, and complete information when
                      using the Service.
                    </li>
                    <li>
                      Not use the Service in a way that could harm, disrupt, or
                      overburden the Service or other users.
                    </li>
                    <li>Not impersonate any other person or entity.</li>
                    <li>
                      Maintain the confidentiality of your access details, as
                      relevant.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                3. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                All intellectual property rights related to the Service,
                including copyrights in the software, design, and interface,
                belong to Croozer AI. You are not permitted to copy, modify,
                distribute, publicly display, create derivative works from, or
                lease any part of the Service without our express written
                permission. However, you are the owner of the content (e.g.,
                text, images, logos) that you transfer through the Service for
                the purpose of generating documents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                4. Jurisdiction
              </h2>
              <p className="leading-relaxed">
                These Terms of Service are governed by the laws of the State of
                Israel, and any dispute arising from them will be heard in the
                competent courts in the city of Tel Aviv-Yafo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                5. Termination of Service
              </h2>
              <p className="leading-relaxed">
                The Company reserves the right to suspend or terminate your use
                of the Service, temporarily or permanently, if you violate any
                of these Terms of Service or any relevant law.
              </p>
            </section>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-16">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            חזרה לעמוד הבית / Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
