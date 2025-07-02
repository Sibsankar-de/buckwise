import nodemailer from 'nodemailer';

type SendMailOptions = {
    subject: string;
    html: string;
    sendTo: string;
};

export async function sendMail({ subject, html, sendTo }: SendMailOptions): Promise<void> {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: `Buckwise<${process.env.SMTP_USER}>`,
        to: sendTo,
        subject,
        html,
    });
}