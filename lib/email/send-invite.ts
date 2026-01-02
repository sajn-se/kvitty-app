import { mailer } from "./mailer";

interface SendInviteEmailParams {
  to: string;
  inviterName: string;
  workspaceName: string;
  inviteUrl: string;
}

export async function sendInviteEmail({
  to,
  inviterName,
  workspaceName,
  inviteUrl,
}: SendInviteEmailParams): Promise<void> {
  const subject = `Du har blivit inbjuden till ${workspaceName} - Kvitty`;

  const textContent = `
Hej!

${inviterName} har bjudit in dig att gå med i arbetsytan "${workspaceName}" på Kvitty.

Klicka på länken nedan för att acceptera inbjudan:
${inviteUrl}

Länken är giltig i 7 dagar.

Om du inte förväntade dig denna inbjudan kan du ignorera detta mail.

Med vänliga hälsningar,
Kvitty
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a1a1a;">Du har blivit inbjuden till ${workspaceName}</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    <strong>${inviterName}</strong> har bjudit in dig att gå med i arbetsytan
    <strong>"${workspaceName}"</strong> på Kvitty.
  </p>
  <p style="margin: 24px 0;">
    <a href="${inviteUrl}"
       style="display: inline-block; background-color: #0f172a; color: #ffffff;
              padding: 12px 24px; text-decoration: none; border-radius: 6px;
              font-weight: 500;">
      Acceptera inbjudan
    </a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">
    Länken är giltig i 7 dagar.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 12px;">
    Om du inte förväntade dig denna inbjudan kan du ignorera detta mail.
  </p>
</body>
</html>
  `.trim();

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || "noreply@kvitty.app",
    to,
    subject,
    text: textContent,
    html: htmlContent,
  });
}
