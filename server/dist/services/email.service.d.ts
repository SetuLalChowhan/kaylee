import nodemailer from "nodemailer";
export declare const getMailTransporter: (type?: "hello" | "support") => Promise<{
    transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
    from: string;
}>;
export declare const sendEmail: (to: string, subject: string, html: string, type?: "hello" | "support") => Promise<void>;
//# sourceMappingURL=email.service.d.ts.map