import { createTransport, Transporter } from "nodemailer";
import { UsesendTransport } from 'usesend-nodemailer';

/**
 * Email provider types:
 * - console: Logs emails to console (default, for development)
 * - smtp: Sends emails via SMTP server
 * - usesend: Sends emails via Usesend service
 */
type EmailProvider = 'console' | 'smtp' | 'usesend';

const getEmailProvider = (): EmailProvider => {
    const provider = process.env.EMAIL_PROVIDER?.toLowerCase() as EmailProvider;
    if (provider === 'smtp' || provider === 'usesend') {
        return provider;
    }
    return 'console'; // Default to console logging
};

/**
 * Creates a console transport that logs emails instead of sending them.
 * Useful for development and testing.
 */
const createConsoleTransport = (): Transporter => {
    return createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
    });
};

/**
 * Creates an SMTP transport using standard nodemailer SMTP configuration.
 * Required environment variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_USER: SMTP username
 * - SMTP_PASSWORD: SMTP password
 * - SMTP_SECURE: Use TLS (default: false, set to 'true' for port 465)
 */
const createSmtpTransport = (): Transporter => {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const secure = process.env.SMTP_SECURE === 'true';

    if (!host) {
        throw new Error('SMTP_HOST environment variable is required for SMTP provider');
    }

    return createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
    });
};

/**
 * Creates a Usesend transport using the usesend-nodemailer package.
 * Required environment variables:
 * - USESEND_API_KEY: Usesend API key
 * - USESEND_URL: Usesend API endpoint
 */
const createUsesendTransport = (): Transporter => {
    const apiKey = process.env.USESEND_API_KEY;
    const apiUrl = process.env.USESEND_URL;

    if (!apiKey || !apiUrl) {
        throw new Error('USESEND_API_KEY and USESEND_URL environment variables are required for Usesend provider');
    }

    return createTransport(
        UsesendTransport.makeTransport({
            apiKey,
            apiUrl,
        })
    );
};

/**
 * Creates the appropriate email transport based on EMAIL_PROVIDER env variable.
 */
const getTransport = (): Transporter => {
    const provider = getEmailProvider();

    switch (provider) {
        case 'smtp':
            console.log('[Email] Using SMTP transport');
            return createSmtpTransport();
        case 'usesend':
            console.log('[Email] Using Usesend transport');
            return createUsesendTransport();
        case 'console':
        default:
            console.log('[Email] Using console transport (emails will be logged, not sent)');
            return createConsoleTransport();
    }
};

const transport = getTransport();

/**
 * Wrapper around the transport's sendMail function that handles
 * console logging for development mode.
 */
export const mailer = {
    sendMail: async (mailOptions: Parameters<Transporter['sendMail']>[0]) => {
        const provider = getEmailProvider();

        if (provider === 'console') {
            console.log('\n========== EMAIL (Console Mode) ==========');
            console.log('From:', mailOptions.from || process.env.EMAIL_FROM);
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('--- Text Content ---');
            console.log(mailOptions.text || '(no text content)');
            if (mailOptions.html) {
                console.log('--- HTML Content ---');
                console.log('(HTML content available, length:', String(mailOptions.html).length, 'chars)');
            }
            if (mailOptions.attachments) {
                console.log('--- Attachments ---');
                const attachments = Array.isArray(mailOptions.attachments)
                    ? mailOptions.attachments
                    : [mailOptions.attachments];
                attachments.forEach((att, i) => {
                    if (typeof att === 'object' && att !== null) {
                        console.log(`  ${i + 1}. ${(att as { filename?: string }).filename || 'unnamed'}`);
                    }
                });
            }
            console.log('==========================================\n');

            // Return a mock response for console mode
            return {
                accepted: [mailOptions.to],
                rejected: [],
                messageId: `console-${Date.now()}@localhost`,
            };
        }

        return transport.sendMail(mailOptions);
    },
};

/**
 * Export the current email provider for debugging/logging purposes.
 */
export const emailProvider = getEmailProvider();
