import nodemailer from 'nodemailer';

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const buildTransporter = () => {
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure =
    process.env.SMTP_SECURE === 'true'
      ? true
      : process.env.SMTP_SECURE === 'false'
        ? false
        : smtpPort === 465;

  return nodemailer.createTransport({
    host: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: smtpPort === 587,
    auth: {
      user: (process.env.SMTP_USER || '').trim(),
      pass: (process.env.SMTP_PASS || '').replace(/\s+/g, '')
    }
  });
};

const sendEmail = async ({ to, subject, text, html }: SendEmailInput): Promise<void> => {
  const transporter = buildTransporter();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@commissary.local',
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    const err = error as Error & { response?: string };
    if (err.response?.includes('535-5.7.8')) {
      err.message =
        'SMTP authentication failed (535). For Gmail, use an App Password (not your account password), keep 2FA enabled, and verify SMTP_USER/SMTP_PASS/SMTP_HOST/SMTP_PORT.';
    }
    throw err;
  }
};

export default sendEmail;
