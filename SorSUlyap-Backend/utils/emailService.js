const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = async (email, otp, type) => {
  const subjects = {
    signup: 'Verify Your SorSUlyap Account',
    login: 'Your Login Verification Code',
    forgot_password: 'Reset Your Password'
  };

  const messages = {
    signup: `Your verification code is: <strong>${otp}</strong><br>This code will expire in ${process.env.OTP_EXPIRE_MINUTES} minutes.`,
    login: `Your login verification code is: <strong>${otp}</strong><br>This code will expire in ${process.env.OTP_EXPIRE_MINUTES} minutes.`,
    forgot_password: `Your password reset code is: <strong>${otp}</strong><br>This code will expire in ${process.env.OTP_EXPIRE_MINUTES} minutes.`
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>SorSUlyap</h2>
      <p>${messages[type]}</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
    </div>
  `;

  return await sendEmail(email, subjects[type], html);
};

module.exports = { sendEmail, sendOTPEmail };
