import nodemailer from "nodemailer";
import prisma from "../config/db.js";
const buildTransporter = (opts) => {
    const port = opts.port ?? 587;
    return nodemailer.createTransport({
        host: opts.host,
        port,
        // Port 465 uses implicit TLS; 587/25 use STARTTLS (secure: false).
        secure: port === 465,
        auth: {
            user: opts.user,
            pass: opts.pass,
        },
        // Fail fast instead of hanging when the live host can't reach the SMTP server.
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
    });
};
export const getMailTransporter = async (type = "hello") => {
    try {
        const configs = await prisma.cmsContent.findMany({
            where: {
                key: {
                    in: [
                        "smtp_host",
                        "smtp_port",
                        "smtp_user",
                        "smtp_pass",
                        "email_from_hello",
                        "email_from_support",
                    ],
                },
            },
        });
        const configMap = new Map(configs.map((c) => [c.key, c.value]));
        const host = configMap.get("smtp_host") || process.env.EMAIL_HOST;
        const port = Number(configMap.get("smtp_port") || process.env.EMAIL_PORT || 587);
        const user = configMap.get("smtp_user") || process.env.EMAIL_USER;
        const pass = configMap.get("smtp_pass") || process.env.EMAIL_PASS;
        const fromHello = configMap.get("email_from_hello") || "hello@getstakd.co";
        const fromSupport = configMap.get("email_from_support") || "support@getstakd.co";
        const from = type === "support" ? fromSupport : fromHello;
        const transporter = buildTransporter({ host, port, user, pass });
        return { transporter, from };
    }
    catch (err) {
        console.error("Failed to load SMTP configs from DB, falling back to process.env:", err);
        const from = type === "support" ? "support@getstakd.co" : "hello@getstakd.co";
        const transporter = buildTransporter({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 587),
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        });
        return { transporter, from };
    }
};
/**
 * Sends an email. Resolves to `true` when the message was accepted by the SMTP
 * server and `false` when it was not. Callers that must not silently report
 * success should check the return value.
 */
export const sendEmail = async (to, subject, html, type = "hello") => {
    try {
        const { transporter, from } = await getMailTransporter(type);
        const opts = transporter.options;
        if (!opts.host || !opts.auth?.user || !opts.auth?.pass) {
            console.error("[Email Service Error] SMTP is not configured. Set smtp_host/smtp_user/smtp_pass in Admin Settings, " +
                "or provide EMAIL_HOST/EMAIL_USER/EMAIL_PASS in the server environment.");
            return false;
        }
        const info = await transporter.sendMail({
            from: `"STAKD" <${from}>`,
            to,
            subject,
            html,
        });
        console.log(`[Email Service] Sent "${subject}" to ${to} (messageId: ${info.messageId})`);
        return true;
    }
    catch (err) {
        console.error(`[Email Service Error] Failed to send "${subject}" to ${to}:`, err?.message || err);
        return false;
    }
};
//# sourceMappingURL=email.service.js.map