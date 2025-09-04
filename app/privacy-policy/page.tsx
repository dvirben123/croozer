import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות - Croozer AI",
  description: "מדיניות הפרטיות של Croozer AI - הגנה על המידע האישי שלכם",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hebrew Version */}
        <div className="mb-16" dir="rtl">
          <h1 className="text-4xl font-bold mb-8 text-center">
            מדיניות פרטיות - Croozer AI
          </h1>

          <div className="prose prose-lg max-w-none text-right space-y-6">
            <p className="text-lg leading-relaxed">
              חברת Croozer AI ("החברה", "אנחנו") מכבדת את פרטיות המשתמשים
              בשירותיה ומחויבת להגן על המידע האישי שלכם. מדיניות פרטיות זו מתארת
              את סוגי המידע שאנו אוספים, את מטרות השימוש בו ואת האופן שבו אנו
              שומרים עליו ומטפלים בו, בהתאם לדרישות החוק בישראל, לרבות תיקון 13
              לחוק הגנת הפרטיות, וכן תנאי השימוש של WhatsApp.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                1. המידע שאנו אוספים
              </h2>
              <p className="mb-4">
                במסגרת השימוש בבוט הוואטסאפ שלנו, אנו עשויים לאסוף את המידע הבא:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>
                  <strong>מידע אישי:</strong> מספר טלפון נייד, שם פרופיל שבחרתם,
                  ותמונת פרופיל (אם קיימת), המועברים אלינו על ידי WhatsApp.
                </li>
                <li>
                  <strong>מידע על התקשורת:</strong> תוכן הודעות והאינטראקציות
                  שלכם עם הבוט. מידע זה נאסף לצורך מתן השירות המבוקש (לדוגמה,
                  ביצוע הזמנות).
                </li>
              </ul>
              <p className="mt-4">
                החברה היא בקר הנתונים (Data Controller) שאוספת ומשתמשת במידע זה.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                2. מטרות איסוף המידע
              </h2>
              <p className="mb-4">
                אנו משתמשים במידע שאנו אוספים למטרות הבאות:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>
                  <strong>הפעלת השירות:</strong> כדי לנהל את האינטראקציה שלכם עם
                  הבוט, לעבד הזמנות, לתת מענה לשאלות ולספק את השירות שביקשתם.
                </li>
                <li>
                  <strong>שיפור השירות:</strong> למידה ושיפור מתמיד של יכולות
                  הבוט, אבטחת השירות, ומניעת הונאות.
                </li>
                <li>
                  <strong>תאימות משפטית:</strong> עמידה בדרישות חוקיות
                  ורגולטוריות, לרבות הפקת מסמכים חשבונאיים כנדרש על פי חוק לאחר
                  ביצוע עסקה.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                3. העברת המידע לצדדים שלישיים
              </h2>
              <p className="mb-4">
                אנו עשויים לשתף את המידע שלכם עם צדדים שלישיים רק כאשר הדבר נדרש
                לצורך מתן השירות, למשל:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>
                  <strong>שותפים עסקיים:</strong> חברות המספקות שירותים משלימים,
                  כגון חברות סליקה להשלמת תשלומים ומערכות להפקת חשבוניות
                  אוטומטיות.
                </li>
                <li>
                  <strong>ספקי שירותים:</strong> חברות המספקות תשתית אחסון
                  נתונים (אשר עשויה להיות ממוקמת בישראל או מחוצה לה, לרבות
                  בארה"ב, בריטניה והאיחוד האירופי), או שירותים טכניים אחרים.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                4. מידע על שימוש בבינה מלאכותית (AI)
              </h2>
              <p>
                השירות שלנו מתבסס על מערכות בינה מלאכותית. אנו מחויבים ליישם
                אמצעי הגנה מתאימים, לרבות הערכת סיכונים, שקיפות, מזעור הטיות,
                ותיעוד מלא של המערכת, כדי להבטיח שימוש הוגן ואחראי בטכנולוגיה.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                5. זכויות המשתמש
              </h2>
              <p className="mb-4">בכפוף לחוק, עומדות לכם הזכויות הבאות:</p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li>
                  <strong>זכות עיון:</strong> אתם רשאים לבקש לעיין במידע האישי
                  שאנו מחזיקים אודותיכם.
                </li>
                <li>
                  <strong>זכות תיקון:</strong> אם מצאתם כי המידע שברשותנו אינו
                  נכון, מלא או מדויק, אתם רשאים לבקש לתקן אותו.
                </li>
                <li>
                  <strong>זכות מחיקה:</strong> אתם רשאים לבקש למחוק את המידע
                  האישי שלכם.
                </li>
                <li>
                  <strong>זכות להתנגדות:</strong> אתם רשאים להתנגד לעיבוד המידע
                  האישי שלכם במקרים מסוימים.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                6. אבטחת מידע
              </h2>
              <p>
                אנו נוקטים באמצעי אבטחת מידע מחמירים כדי להגן על המידע שלכם מפני
                גישה, שימוש או חשיפה בלתי מורשים. כל המידע נשמר על שרתים
                מאובטחים.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                7. עדכונים למדיניות הפרטיות
              </h2>
              <p>
                אנו עשויים לעדכן את מדיניות הפרטיות מעת לעת. כל עדכון ייכנס
                לתוקף מיד עם פרסומו באתר זה.
              </p>
            </section>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-16"></div>

        {/* English Version */}
        <div dir="ltr">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Privacy Policy - Croozer AI
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-lg leading-relaxed">
              Croozer AI ("the Company," "we," "us") respects the privacy of our
              users and is committed to protecting your personal information.
              This privacy policy describes the types of information we collect,
              the purposes for which we use it, and how we protect and handle
              it, in accordance with legal requirements in Israel, including
              Amendment 13 to the Privacy Protection Law, and the terms of
              service of WhatsApp.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                1. The Information We Collect
              </h2>
              <p className="mb-4">
                In the course of your use of our WhatsApp bot, we may collect
                the following information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Personal Information:</strong> Your mobile phone
                  number, chosen profile name, and profile picture (if
                  available), which are passed to us by WhatsApp.
                </li>
                <li>
                  <strong>Communication Information:</strong> The content of
                  your messages and interactions with the bot. This information
                  is collected to provide the requested service (e.g., to
                  process orders).
                </li>
              </ul>
              <p className="mt-4">
                The Company is a Data Controller that collects and uses this
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                2. Purposes of Data Collection
              </h2>
              <p className="mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Service Operation:</strong> To manage your interaction
                  with the bot, process orders, answer questions, and provide
                  the service you requested.
                </li>
                <li>
                  <strong>Service Improvement:</strong> To continuously learn
                  from and improve the bot's capabilities, ensure service
                  security, and prevent fraud.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To meet legal and
                  regulatory requirements, including the automatic generation of
                  accounting documents as required by law after a transaction is
                  completed.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                3. Sharing Data with Third Parties
              </h2>
              <p className="mb-4">
                We may share your information with third parties only when
                necessary to provide the service, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Business Partners:</strong> Companies that provide
                  complementary services, such as payment gateways for
                  processing payments and systems for automatic invoice
                  generation.
                </li>
                <li>
                  <strong>Service Providers:</strong> Companies that provide
                  data storage infrastructure (which may be located in Israel or
                  abroad, including the USA, UK, and the EU), or other technical
                  services.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                4. Information on the Use of Artificial Intelligence (AI)
              </h2>
              <p>
                Our service relies on artificial intelligence systems. We are
                committed to implementing appropriate safeguards, including risk
                assessment, transparency, bias mitigation, and full
                documentation of the system, to ensure fair and responsible use
                of the technology.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                5. User Rights
              </h2>
              <p className="mb-4">
                Subject to the law, you have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Right to Access:</strong> You are entitled to request
                  access to the personal information we hold about you.
                </li>
                <li>
                  <strong>Right to Rectification:</strong> If you find that the
                  information we have is incorrect, incomplete, or inaccurate,
                  you may request that it be corrected.
                </li>
                <li>
                  <strong>Right to Deletion:</strong> You may request that your
                  personal information be deleted.
                </li>
                <li>
                  <strong>Right to Object:</strong> You may object to the
                  processing of your personal information in certain cases.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                6. Information Security
              </h2>
              <p>
                We take stringent security measures to protect your information
                from unauthorized access, use, or disclosure. All information is
                stored on secure servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                7. Updates to the Privacy Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. Any update
                will take effect immediately upon its publication on this site.
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
