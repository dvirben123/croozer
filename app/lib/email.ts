import { Resend } from 'resend';
import { IContactLead } from '@/models/ContactLead';

// Initialize Resend lazily to avoid build-time errors
let resend: Resend | null = null;

function getResendClient() {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is not set');
        }
        resend = new Resend(apiKey);
    }
    return resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@croozer.com';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'info@croozer.com';

// Thank you email template for the lead
const getThankYouEmailTemplate = (lead: IContactLead) => ({
    subject: 'תודה על פנייתך - Croozer',
    html: `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e293b; font-size: 28px; margin-bottom: 10px;">🎉 תודה על פנייתך!</h1>
          <div style="width: 50px; height: 3px; background: linear-gradient(to right, #5eead4, #6366f1); margin: 0 auto;"></div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="font-size: 18px; color: #334155; line-height: 1.6; margin-bottom: 15px;">
            שלום ${lead.name},
          </p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 15px;">
            תודה שפנית אלינו! קיבלנו את פנייתך ונחזור אליך בהקדם האפשרי.
          </p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 15px;">
            בינתיים, אתה מוזמן לקרוא עוד על הפתרונות שלנו ואיך אנחנו יכולים לעזור לך להגדיל את ההזמנות שלך ב-300%+ עם בוט WhatsApp חכם.
          </p>
        </div>

        <div style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px;">📋 פרטי הפנייה שלך:</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="color: #475569; margin-bottom: 8px;"><strong>שם:</strong> ${lead.name}</li>
            <li style="color: #475569; margin-bottom: 8px;"><strong>אימייל:</strong> ${lead.email}</li>
            ${lead.phone ? `<li style="color: #475569; margin-bottom: 8px;"><strong>טלפון:</strong> ${lead.phone}</li>` : ''}
            ${lead.company ? `<li style="color: #475569; margin-bottom: 8px;"><strong>חברה:</strong> ${lead.company}</li>` : ''}
            <li style="color: #475569; margin-bottom: 8px;"><strong>תאריך:</strong> ${new Date(lead.createdAt).toLocaleDateString('he-IL')}</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, #5eead4, #6366f1); padding: 20px; border-radius: 8px;">
            <p style="color: white; font-size: 16px; margin: 0; font-weight: 500;">
              💡 בינתיים, למה לא תבדוק את הדמו שלנו ותראה איך זה עובד?
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            צוות Croozer<br>
            📱 WhatsApp: <a href="https://wa.me/972XXXXXXXXX" style="color: #6366f1;">+972-XX-XXX-XXXX</a><br>
            📧 אימייל: <a href="mailto:${COMPANY_EMAIL}" style="color: #6366f1;">${COMPANY_EMAIL}</a>
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #94a3b8; font-size: 12px;">
          קיבלת את המייל הזה כי פנית אלינו דרך האתר שלנו.<br>
          אם יש לך שאלות, פשוט השב למייל הזה.
        </p>
      </div>
    </div>
  `,
});

// Internal notification email template
const getInternalNotificationTemplate = (lead: IContactLead) => ({
    subject: `🚀 ליד חדש מהאתר - ${lead.name}`,
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #1e293b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🚀 New Lead Alert!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">A new contact form submission has been received.</p>
      </div>
      
      <div style="background-color: white; border: 1px solid #e2e8f0; padding: 25px; border-radius: 0 0 8px 8px;">
        <div style="margin-bottom: 25px;">
          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569; width: 120px;">Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569;">Email:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
                <a href="mailto:${lead.email}" style="color: #6366f1; text-decoration: none;">${lead.email}</a>
              </td>
            </tr>
            ${lead.phone ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569;">Phone:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
                <a href="tel:${lead.phone}" style="color: #6366f1; text-decoration: none;">${lead.phone}</a>
              </td>
            </tr>
            ` : ''}
            ${lead.company ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569;">Company:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${lead.company}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569;">Source:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${lead.source}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #475569;">Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${new Date(lead.createdAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        ${lead.message ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 10px;">Message</h3>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #6366f1;">
            <p style="margin: 0; color: #475569; line-height: 1.5;">${lead.message}</p>
          </div>
        </div>
        ` : ''}

        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <p style="margin: 0; color: #92400e; font-weight: 500;">
            ⚡ Action Required: Follow up with this lead within 24 hours for best conversion rates!
          </p>
        </div>
      </div>
    </div>
  `,
});

export async function sendThankYouEmail(lead: IContactLead) {
    try {
        const emailTemplate = getThankYouEmailTemplate(lead);
        const resendClient = getResendClient();

        const { data, error } = await resendClient.emails.send({
            from: FROM_EMAIL,
            to: [lead.email],
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        if (error) {
            console.error('Error sending thank you email:', error);
            throw new Error(`Failed to send thank you email: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error in sendThankYouEmail:', error);
        throw error;
    }
}

export async function sendInternalNotification(lead: IContactLead) {
    try {
        const emailTemplate = getInternalNotificationTemplate(lead);
        const resendClient = getResendClient();

        const { data, error } = await resendClient.emails.send({
            from: FROM_EMAIL,
            to: [COMPANY_EMAIL],
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        if (error) {
            console.error('Error sending internal notification:', error);
            throw new Error(`Failed to send internal notification: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error in sendInternalNotification:', error);
        throw error;
    }
}

export async function sendContactEmails(lead: IContactLead) {
    try {
        // Send both emails concurrently
        const [thankYouResult, notificationResult] = await Promise.allSettled([
            sendThankYouEmail(lead),
            sendInternalNotification(lead),
        ]);

        const results = {
            thankYou: thankYouResult,
            notification: notificationResult,
        };

        // Log any failures but don't throw - we want to save the lead even if emails fail
        if (thankYouResult.status === 'rejected') {
            console.error('Thank you email failed:', thankYouResult.reason);
        }

        if (notificationResult.status === 'rejected') {
            console.error('Internal notification failed:', notificationResult.reason);
        }

        return results;
    } catch (error) {
        console.error('Error in sendContactEmails:', error);
        throw error;
    }
}
