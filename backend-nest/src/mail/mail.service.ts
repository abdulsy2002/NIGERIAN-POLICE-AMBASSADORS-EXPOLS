import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resendApiKey?: string;
  private readonly fromEmail?: string;
  private readonly transporter?: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.resendApiKey = config.get<string>('RESEND_API_KEY');
    this.fromEmail = config.get<string>('RESEND_FROM_EMAIL') || config.get<string>('MAIL_USER');
    const mailUser = config.get<string>('MAIL_USER');
    const mailPass = config.get<string>('MAIL_PASS');

    if (!this.resendApiKey && mailUser && mailPass) {
      this.transporter = nodemailer.createTransport({
        host: config.get<string>('MAIL_HOST') || 'smtp.gmail.com',
        port: Number(config.get('MAIL_PORT') || 587),
        secure: false,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
        auth: { user: mailUser, pass: mailPass },
      });
    }
  }

  async sendRegistrationReceivedEmail(opts: {
    to: string;
    fullName: string;
    memberType: 'alumni' | 'ambassador';
  }): Promise<boolean> {
    const appUrl = this.config.get<string>('APP_URL') || 'http://localhost:3000';
    const name = this.escapeHtml(opts.fullName);
    const typeLabel = opts.memberType === 'alumni' ? 'Alumni' : 'Ambassador';
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
  <h1 style="color:#003366">We received your NPAE registration</h1>
  <p>Hello ${name},</p>
  <p>Thank you for registering as an NPAE ${typeLabel}. Your registration has been received and is awaiting administrator review.</p>
  <p>We will email you again when your account is reviewed. You can visit <a href="${this.escapeHtml(appUrl)}/login">your account</a> to continue.</p>
  <p>Nigerian Police Ambassadors Expols</p>
</body>
</html>`;

    return this.sendEmail({
      to: opts.to,
      subject: 'We received your NPAE registration',
      html,
      emailKind: 'registration confirmation',
    });
  }

  async sendWelcomeEmail(opts: {
    to: string;
    fullName: string;
    identityNumber: string;
    memberType: 'alumni' | 'ambassador';
  }) {
    const { to, fullName, identityNumber, memberType } = opts;
    const appUrl = this.config.get<string>('APP_URL') || 'http://localhost:3000';
    const name = this.escapeHtml(fullName);
    const safeIdentityNumber = this.escapeHtml(identityNumber);
    const typeLabel = memberType === 'alumni' ? 'Alumni' : 'Ambassador';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #003366 0%, #004d99 100%); padding: 36px 32px; text-align: center; }
    .header img { height: 64px; margin-bottom: 12px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 36px 32px; }
    .badge { background: #f0f7ff; border: 2px solid #003366; border-radius: 10px; padding: 20px 24px; text-align: center; margin: 24px 0; }
    .badge p { margin: 0 0 6px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
    .badge h2 { margin: 0; color: #003366; font-size: 26px; font-weight: 800; letter-spacing: 3px; }
    .steps { background: #f9fafb; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .steps h3 { margin: 0 0 12px; color: #003366; font-size: 15px; }
    .steps ol { margin: 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 1.8; }
    .btn { display: block; width: fit-content; margin: 28px auto 0; background: #003366; color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; }
    .footer { background: #f4f6fb; padding: 20px 32px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎉 Welcome to NPAE!</h1>
      <p>Nigerian Police Ambassadors Expols</p>
    </div>
    <div class="body">
      <p>Dear <strong>${name}</strong>,</p>
      <p>Congratulations! Your <strong>${typeLabel}</strong> account has been <strong>approved</strong> by an administrator. You are now a verified member of the Nigerian Police Ambassadors Expols (NPAE).</p>

      <div class="badge">
        <p>Your Identity Number</p>
        <h2>${safeIdentityNumber}</h2>
      </div>

      <p>Please keep your identity number safe — it is used to identify you as a verified NPAE member and appears on your ID card.</p>

      <div class="steps">
        <h3>Next Steps</h3>
        <ol>
          <li>Log in to your dashboard at <a href="${this.escapeHtml(appUrl)}/login">${this.escapeHtml(appUrl)}/login</a></li>
          <li>Download your official NPAE ID card from your profile</li>
          <li>Complete any pending profile information</li>
        </ol>
      </div>

      <a href="${this.escapeHtml(appUrl)}/login" class="btn">Go to My Dashboard →</a>
    </div>
    <div class="footer">
      <p>Nigerian Police Ambassadors Expols (NPAE) &mdash; Official Member Portal</p>
      <p>If you did not register for this account, please contact us immediately.</p>
    </div>
  </div>
</body>
</html>`;

    return this.sendEmail({
      to,
      subject: `Your NPAE ${typeLabel} Account Has Been Approved — ID: ${identityNumber}`,
      html,
      emailKind: 'approval email',
    });
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character] || character);
  }

  private async sendEmail(opts: {
    to: string;
    subject: string;
    html: string;
    emailKind: string;
  }): Promise<boolean> {
    if (!this.fromEmail) {
      this.logger.error(`Cannot send ${opts.emailKind}: RESEND_FROM_EMAIL or MAIL_USER is not configured`);
      return false;
    }

    if (this.resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [opts.to],
            subject: opts.subject,
            html: opts.html,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        const result = await response.json() as { id?: string; message?: string; name?: string };
        if (!response.ok || !result.id) {
          this.logger.error(`Resend failed to accept ${opts.emailKind} (HTTP ${response.status}): ${result.message || result.name || 'No email ID returned'}`);
          return false;
        }
        this.logger.log(`Resend accepted ${opts.emailKind} (id=${result.id})`);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Unable to send ${opts.emailKind} through Resend: ${message}`);
        return false;
      }
    }

    if (!this.transporter) {
      this.logger.error(`Cannot send ${opts.emailKind}: configure RESEND_API_KEY or SMTP credentials`);
      return false;
    }

    try {
      const result = await this.transporter.sendMail({
        from: this.fromEmail,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      this.logger.log(`SMTP accepted ${opts.emailKind} (id=${result.messageId})`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Unable to send ${opts.emailKind} through SMTP: ${message}`);
      return false;
    }
  }
}
