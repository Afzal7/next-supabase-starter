import { emailConfig, EmailService, replaceTemplateVars } from '@/config/email';
import { AppError, ErrorCode } from '@/types';

export class GenericEmailService implements EmailService {
  constructor(private config = emailConfig) {}

  async sendInvitation(invitationData: {
    email: string;
    groupName: string;
    inviterName: string;
    role: string;
    acceptUrl: string;
    expiryDays: number;
  }): Promise<void> {
    try {
      const template = this.config.templates.invitation;

      const subject = replaceTemplateVars(template.subject, {
        groupName: invitationData.groupName,
      });

      const html = replaceTemplateVars(template.html, {
        ...invitationData,
        email: invitationData.email,
      });

      const text = replaceTemplateVars(template.text, {
        ...invitationData,
        email: invitationData.email,
      });

      await this.sendEmail({
        to: invitationData.email,
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw new AppError(
        ErrorCode.EMAIL_SEND_FAILED,
        'Failed to send invitation email',
        500
      );
    }
  }

  async sendWelcome(memberData: {
    email: string;
    userName: string;
    groupName: string;
    role: string;
    groupUrl: string;
  }): Promise<void> {
    try {
      const template = this.config.templates.welcome;

      const subject = replaceTemplateVars(template.subject, {
        groupName: memberData.groupName,
      });

      const html = replaceTemplateVars(template.html, memberData);
      const text = replaceTemplateVars(template.text, memberData);

      await this.sendEmail({
        to: memberData.email,
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error for welcome emails - they're not critical
    }
  }

  private async sendEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    switch (this.config.provider) {
      case 'resend':
        await this.sendWithResend({ to, subject, html, text });
        break;
      case 'sendgrid':
        await this.sendWithSendGrid({ to, subject, html, text });
        break;
      case 'aws-ses':
        await this.sendWithSES({ to, subject, html, text });
        break;
      default:
        throw new Error(`Unsupported email provider: ${this.config.provider}`);
    }
  }

  private async sendWithResend({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: [to],
        subject,
        html,
        text,
        reply_to: this.config.replyTo?.email,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${response.status} ${error}`);
    }
  }

  private async sendWithSendGrid({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
        }],
        from: {
          email: this.config.from.email,
          name: this.config.from.name,
        },
        subject,
        content: [
          {
            type: 'text/html',
            value: html,
          },
          {
            type: 'text/plain',
            value: text,
          },
        ],
        reply_to: this.config.replyTo ? {
          email: this.config.replyTo.email,
          name: this.config.replyTo.name,
        } : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${response.status} ${error}`);
    }
  }

  private async sendWithSES({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    // AWS SES implementation would go here
    // This is a placeholder - actual implementation would use AWS SDK
    throw new Error('AWS SES implementation not yet implemented');
  }
}

// Export singleton instance
export const emailService = new GenericEmailService();