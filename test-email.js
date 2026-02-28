const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function test() {
  console.log('Testing SMTP connection...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('FROM:', process.env.EMAIL_FROM);

  try {
    await transporter.verify();
    console.log('✅ SMTP connection is working!');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER,
      subject: '✅ Planny SMTP Test',
      html: '<h1>SMTP test SUCCESS!</h1><p>Emails are working!</p>'
    });
    console.log('✅ Test email sent! Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    console.error('Full error:', error);
  }
}

test();
