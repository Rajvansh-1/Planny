require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  console.log("Testing SMTP Connection...");
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'testadmin@example.com',
      subject: "Test Email from Planny",
      text: "This is a test email.",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
