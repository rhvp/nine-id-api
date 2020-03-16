const nodemailer = require('nodemailer');

const sendEmail = async options => {
    try {
        // 1) Create a transporter
    const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: '465',
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          },
          requireTLS: true,
          tls: {
            ciphers: "SSLv3"
          }
        });
      
        // 2) Define the email options
        const mailOptions = {
          from: options.from,
          to: options.email,
          subject: options.subject,
          replyTo: options.replyTo,
          // text: options.message
          html: options.message
        };
      
        // 3) Actually send the email
        await transporter.sendMail(mailOptions);
    } catch(err) {
        console.error('Error sending email:', err)
    }
    
  };
  
  module.exports = sendEmail;