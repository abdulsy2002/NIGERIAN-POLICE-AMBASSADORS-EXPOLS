import { Resend } from 'resend';
import { IEmailService } from '../../core/application/services/IEmailService';

export class ResendEmailService implements IEmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ WARNING: RESEND_API_KEY is not defined. Emails will be logged but not sent.');
    }
    this.resend = new Resend(apiKey || 're_placeholder');
  }

  async sendEmail(to: string, subject: string, html: string, from?: string): Promise<boolean> {
    const sender = from || 'NPAE <noreply@npae.org.ng>';
    
    // Fallback if not configured
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${html.substring(0, 100)}...`);
      return true;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: sender,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('❌ Resend Email error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Resend Email exception:', err);
      return false;
    }
  }
}
