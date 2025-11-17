export type EmailProvider = "resend" | "sendgrid" | "aws-ses";

export type EmailTemplate = {
	subject: string;
	html: string;
	text: string;
};

export type EmailConfig = {
	provider: EmailProvider;
	templates: {
		invitation: EmailTemplate;
		welcome: EmailTemplate;
		invitationReminder?: EmailTemplate;
		memberRemoved?: EmailTemplate;
	};
	from: {
		email: string;
		name: string;
	};
	replyTo?: {
		email: string;
		name?: string;
	};
};

// Default email configuration
export const emailConfig: EmailConfig = {
	provider: "resend",
	templates: {
		invitation: {
			subject: "You've been invited to join {{groupName}}",
			html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Join {{groupName}}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">You've been invited to join {{groupName}}!</h1>

            <p>Hello,</p>

            <p><strong>{{inviterName}}</strong> has invited you to join <strong>{{groupName}}</strong> as a <strong>{{role}}</strong>.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{acceptUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
            </div>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{acceptUrl}}</p>

            <p>This invitation will expire in {{expiryDays}} days.</p>

            <p>If you didn't expect this invitation, you can safely ignore this email.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #666; font-size: 14px;">
              This invitation was sent to {{email}}. If you have any questions, please contact the sender.
            </p>
          </div>
        </body>
        </html>
      `,
			text: `
You've been invited to join {{groupName}}!

Hello,

{{inviterName}} has invited you to join {{groupName}} as a {{role}}.

To accept this invitation, visit: {{acceptUrl}}

This invitation will expire in {{expiryDays}} days.

If you didn't expect this invitation, you can safely ignore this email.

---
This invitation was sent to {{email}}
      `,
		},
		welcome: {
			subject: "Welcome to {{groupName}}!",
			html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to {{groupName}}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to {{groupName}}!</h1>

            <p>Hello {{userName}},</p>

            <p>Welcome to <strong>{{groupName}}</strong>! You've successfully joined as a <strong>{{role}}</strong>.</p>

            <p>You can now:</p>
            <ul>
              <li>Access all {{groupName}} resources</li>
              <li>Collaborate with team members</li>
              <li>Manage your profile and preferences</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{{groupUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to {{groupName}}</a>
            </div>

            <p>If you have any questions, feel free to reach out to the group administrators.</p>

            <p>Happy collaborating!</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #666; font-size: 14px;">
              You're receiving this email because you joined {{groupName}}.
            </p>
          </div>
        </body>
        </html>
      `,
			text: `
Welcome to {{groupName}}!

Hello {{userName}},

Welcome to {{groupName}}! You've successfully joined as a {{role}}.

You can now access all {{groupName}} resources and collaborate with team members.

Visit {{groupUrl}} to get started.

If you have any questions, feel free to reach out to the group administrators.

Happy collaborating!

---
You're receiving this email because you joined {{groupName}}
      `,
		},
	},
	from: {
		email: "noreply@yourapp.com",
		name: "Your App",
	},
	replyTo: {
		email: "support@yourapp.com",
	},
};

// Template variable replacer
export const replaceTemplateVars = (
	template: string,
	variables: Record<string, string | number>,
): string => {
	let result = template;
	for (const [key, value] of Object.entries(variables)) {
		result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
	}
	return result;
};

// Email service interface
export interface EmailService {
	sendInvitation(invitationData: {
		email: string;
		groupName: string;
		inviterName: string;
		role: string;
		acceptUrl: string;
		expiryDays: number;
	}): Promise<void>;

	sendWelcome(memberData: {
		email: string;
		userName: string;
		groupName: string;
		role: string;
		groupUrl: string;
	}): Promise<void>;
}
