import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הוראות למחיקת נתונים - Croozer AI",
  description: "הוראות למחיקת נתונים מבוט הוואטסאפ של Croozer AI",
  robots: {
    index: true,
    follow: true,
  },
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hebrew Version */}
        <div className="mb-16" dir="rtl">
          <h1 className="text-4xl font-bold mb-8 text-center">
            הוראות למחיקת נתונים מבוט הוואטסאפ של Croozer AI
          </h1>

          <div className="prose prose-lg max-w-none text-right space-y-6">
            <p className="text-lg leading-relaxed">
              אנו מחויבים לכבד את זכותך לבקש מחיקה של הנתונים האישיים שלך. על פי
              תנאי השימוש של פלטפורמת מטא (Meta), אנו מספקים לך את האפשרות לבקש
              מחיקת נתונים שסופקו במסגרת האינטראקציה שלך עם בוט הוואטסאפ שלנו.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                כדי להגיש בקשה למחיקת נתונים, אנא בצע את השלבים הבאים:
              </h2>

              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    שלב 1: שלח בקשת מחיקה
                  </h3>
                  <p>
                    פתח את שיחת הוואטסאפ עם הבוט של Croozer AI ושלח את ההודעה
                    הבאות: <strong>"מבקש למחוק נתונים"</strong>.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    שלב 2: אימות זהות
                  </h3>
                  <p>
                    כדי להגן על פרטיותך, הבוט יבקש ממך לבצע אימות זהות בסיסי כדי
                    לוודא שאתה הוא בעל החשבון. אימות זה עשוי לכלול אישור מספר
                    הטלפון שלך או פרטים מזהים אחרים שסיפקת בעבר.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    שלב 3: אישור קבלת הבקשה
                  </h3>
                  <p>
                    לאחר השלמת האימות בהצלחה, תקבל מהבוט אישור שהבקשה שלך התקבלה
                    בהצלחה, יחד עם קישור וקוד אישור. הקישור ישמש אותך למעקב אחר
                    סטטוס הבקשה.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    שלב 4: תהליך המחיקה
                  </h3>
                  <p>
                    אנו מתחייבים למחוק את הנתונים האישיים שלך ממערכותינו בתוך{" "}
                    <strong>30 יום</strong> ממועד קבלת הבקשה המאושרת, אלא אם כן
                    אנו מחויבים חוקית לשמור חלק מהנתונים לתקופה ארוכה יותר.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    שלב 5: הודעת השלמה
                  </h3>
                  <p>כאשר תהליך המחיקה יושלם, תקבל הודעת אישור בווטסאפ.</p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
                  שימו לב:
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  מחיקת הנתונים ממערכותינו אינה משפיעה על מידע ששמור על ידיך או
                  על ידי גורמים אחרים ששיתפת את המידע איתם מחוץ לשירות שלנו.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-16"></div>

        {/* English Version */}
        <div dir="ltr">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Data Deletion Instructions from Croozer AI WhatsApp Bot
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-lg leading-relaxed">
              We are committed to respecting your right to request the deletion
              of your personal data. In accordance with Meta's platform terms,
              we provide you with the option to request the deletion of data
              provided during your interaction with our WhatsApp bot.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                To submit a data deletion request, please follow these steps:
              </h2>

              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Step 1: Send a Deletion Request
                  </h3>
                  <p>
                    Open the WhatsApp conversation with the Croozer AI bot and
                    send the following message:{" "}
                    <strong>"Request to delete data"</strong>.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Step 2: Identity Verification
                  </h3>
                  <p>
                    To protect your privacy and ensure secure processing, we
                    will require basic identity verification to confirm you are
                    the account holder. This verification may include confirming
                    your phone number or other identifying details you have
                    previously provided.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Step 3: Request Confirmation
                  </h3>
                  <p>
                    After successful verification, you will receive an
                    acknowledgment from the bot that your request has been
                    received, along with a link and a confirmation code. The
                    link will allow you to track the status of your request.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Step 4: Deletion Process
                  </h3>
                  <p>
                    We are committed to deleting your personal data from our
                    systems within <strong>30 days</strong> of receiving the
                    approved request, unless we are legally obligated to retain
                    some of the data for a longer period.
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Step 5: Completion Notification
                  </h3>
                  <p>
                    Once the deletion process is complete, you will receive a
                    confirmation message on WhatsApp.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
                  Please note:
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Deleting data from our systems does not affect information
                  that you or other parties have saved elsewhere, outside of our
                  service.
                </p>
              </div>
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
