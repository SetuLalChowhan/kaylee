import nodemailer from "nodemailer";
import prisma from "../config/db.js";
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
        const transporter = nodemailer.createTransport({
            host,
            port,
            auth: {
                user,
                pass,
            },
        });
        return { transporter, from };
    }
    catch (err) {
        console.error("Failed to load SMTP configs from DB, falling back to process.env:", err);
        const from = type === "support" ? "support@getstakd.co" : "hello@getstakd.co";
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 587),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        return { transporter, from };
    }
};
export const sendEmail = async (to, subject, html, type = "hello") => {
    try {
        const { transporter, from } = await getMailTransporter(type);
        await transporter.sendMail({
            from: `"STAKD" <${from}>`,
            to,
            subject,
            html,
        });
    }
    catch (err) {
        console.error(`[Email Service Error] Failed to send email to ${to}:`, err.message || err);
    }
};
//# sourceMappingURL=email.service.js.map