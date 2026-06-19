import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
export const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: '"My App" <noreply@myapp.com>',
        to,
        subject,
        html,
    });
};
//# sourceMappingURL=email.service.js.map