export interface IEmailService {
  sendEmail(to: string, subject: string, html: string, from?: string): Promise<boolean>;
}
