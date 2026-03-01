import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  try {
    // Force using SMTP_USER as sender to prevent Google DMARC rejections
    const sender = process.env.SMTP_USER ? `"Planny 🐾" <${process.env.SMTP_USER}>` : '"Planny 🐾" <hello@planny.app>';

    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
