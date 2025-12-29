const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP credentials are provided
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('========================================');
    console.log('           MOCK EMAIL SEND              ');
    console.log('========================================');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log('========================================');
    console.log('NOTE: Real email was not sent because SMTP credentials are missing.');
    console.log('      This is expected behavior in development.');
    return; // Simulate success
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
       rejectUnauthorized: false
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Journal Support'} <${process.env.FROM_EMAIL || 'noreply@journal.com'}>`, 
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
