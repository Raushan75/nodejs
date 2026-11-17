const nodemailer = require("nodemailer");

// Email is sent only when SMTP settings exist in .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, (optional) EMAIL_FROM
// For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, and SMTP_PASS is an
// "App password" (Google Account > Security > App passwords), not your normal password.
const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    // Development fallback: no SMTP configured, so print the email in the server console.
    console.log("\n===== EMAIL (SMTP not configured, printed instead) =====");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(text);
    console.log("=======================================================\n");
    return;
  }

  const port = Number(process.env.SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `DevTinder <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
