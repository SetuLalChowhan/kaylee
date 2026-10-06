import nodemailer from "nodemailer";
export declare const getMailTransporter: (type?: "hello" | "support") => Promise<{
    transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
    from: string;
}>;
/**
 * Sends an email. Resolves to `true` when the message was accepted by the SMTP
 * server and `false` when it was not. Callers that must not silently report
 * success should check the return value.
 */
export declare const sendEmail: (to: string, subject: string, html: string, type?: "hello" | "support") => Promise<boolean>;
//# sourceMappingURL=email.service.d.ts.map