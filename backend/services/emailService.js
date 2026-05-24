const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter configured for Mailtrap sandbox SMTP.
 * Set these four env vars in your .env file:
 *   MAILTRAP_HOST=sandbox.smtp.mailtrap.io
 *   MAILTRAP_PORT=2525
 *   MAILTRAP_USER=<your mailtrap inbox username>
 *   MAILTRAP_PASS=<your mailtrap inbox password>
 *   EMAIL_FROM=noreply@locallink.dev   (optional, cosmetic)
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525', 10),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

/**
 * Send a beautifully-designed OTP email to a new registering user.
 * @param {object} opts
 * @param {string} opts.to      recipient email
 * @param {string} opts.name    recipient's display name
 * @param {string} opts.otp     6-digit code
 */
async function sendOtpEmail({ to, name, otp }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Verify your LocalLink account</title>
  <style>
    body { margin:0; padding:0; background:#f5f3ff; font-family:'Segoe UI',Arial,sans-serif; }
    .wrap { max-width:520px; margin:40px auto; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 8px 40px rgba(124,58,237,0.10); }
    .header { background:linear-gradient(135deg,#7c3aed,#a78bfa); padding:36px 40px 28px; text-align:center; }
    .logo-box { display:inline-flex; align-items:center; gap:10px; margin-bottom:4px; }
    .logo-icon { width:44px; height:44px; background:rgba(255,255,255,0.18); border-radius:12px; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:16px; color:#fff; letter-spacing:-0.5px; }
    .logo-text { color:#fff; font-size:1.3rem; font-weight:800; letter-spacing:-0.02em; }
    .header h1 { color:#fff; font-size:1.05rem; font-weight:500; margin:10px 0 0; opacity:0.92; }
    .body { padding:36px 40px; }
    .greeting { font-size:1rem; color:#1a1a2e; font-weight:600; margin:0 0 8px; }
    .desc { font-size:0.93rem; color:#6b7280; line-height:1.6; margin:0 0 28px; }
    .otp-row { display:flex; gap:8px; justify-content:center; margin:0 0 28px; }
    .otp-digit { width:52px; height:60px; background:#f5f3ff; border:2px solid #ddd6fe; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.75rem; font-weight:800; color:#7c3aed; letter-spacing:0; }
    .note { font-size:0.83rem; color:#9ca3af; text-align:center; line-height:1.5; margin:0 0 10px; }
    .divider { height:1px; background:#f3f4f6; margin:24px 0; }
    .footer { font-size:0.8rem; color:#9ca3af; text-align:center; line-height:1.6; padding:0 40px 30px; }
    @media (max-width:560px) {
      .wrap { margin:12px; border-radius:14px; }
      .body, .footer { padding-left:24px; padding-right:24px; }
      .header { padding:28px 24px 22px; }
      .otp-digit { width:42px; height:50px; font-size:1.4rem; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo-box">
        <div class="logo-icon">LL</div>
        <span class="logo-text">Local Link</span>
      </div>
      <h1>Email Verification</h1>
    </div>
    <div class="body">
      <p class="greeting">Hi ${name},</p>
      <p class="desc">
        Welcome to LocalLink — your local community marketplace! To complete your registration, enter the 6-digit verification code below:
      </p>
      <div class="otp-row">
        ${otp.split('').map(d => `<div class="otp-digit">${d}</div>`).join('')}
      </div>
      <p class="note">⏱ This code expires in <strong>10 minutes</strong>.</p>
      <p class="note">If you didn't create a LocalLink account, you can safely ignore this email.</p>
      <div class="divider"></div>
      <p class="note" style="margin:0;">Do not share this code with anyone. LocalLink will never ask for it.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} LocalLink · Community Marketplace<br/>
      This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"LocalLink" <${process.env.EMAIL_FROM || 'noreply@locallink.dev'}>`,
    to,
    subject: `${otp} is your LocalLink verification code`,
    html,
  });
}

module.exports = { sendOtpEmail };
