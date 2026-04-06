import { createTransport, Transporter } from "nodemailer";
import { UsesendTransport } from 'usesend-nodemailer';

const getTransport = (): Transporter => {
    const usesendEnabled = process.env.USESEND_ENABLED?.toLowerCase() !== "false";
    const apiKey = process.env.USESEND_API_KEY;
    const apiUrl = process.env.USESEND_URL;

    if (!usesendEnabled) {
        return createTransport({ jsonTransport: true });
    }

    if (!apiKey || !apiUrl) {
        throw new Error('USESEND_API_KEY and USESEND_URL environment variables are required');
    }

    return createTransport(
        UsesendTransport.makeTransport({
            apiKey,
            apiUrl,
        })
    )
};

export const mailer = getTransport();
