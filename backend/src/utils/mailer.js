import nodemailer from 'nodemailer';
import dns from 'dns';

// ✅ FORCE IPv4
dns.setDefaultResultOrder('ipv4first');

let transporter;

// ─── Create Transporter (ONLY ONCE) ─────────────────
const createTransporter = async () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4, // ✅ IPv4 force
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false // ✅ VPS compatibility
    },
    pool: true, // ✅ stable multiple sends
    maxConnections: 5,
    maxMessages: 100
  });

  try {
    await transporter.verify();
    console.log("✅ Gmail Connected");
  } catch (err) {
    console.error("❌ Gmail Verify Error:", err);
    transporter = null;
  }

  return transporter;
};


// ─── Common Send Function ─────────────────────────────
const sendMail = async (emails, subject, html) => {
  const t = await createTransporter();
  if (!t) return;

  try {
    console.log("📨 Sending to:", emails);

    const info = await t.sendMail({
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails.join(','), 
      subject,
      html,
    });

    console.log("✅ Email Sent:", info.messageId);
  } catch (error) {
    console.error("❌ Send Error FULL:", error);
  }
};


// ─── Dispatch Email ─────────────────────────────
export const sendDispatchEmail = async (
  emails,
  dispatchData,
  fromBranchName,
  toBranchName
) => {

  const subject = `🚚 New Dispatch #${dispatchData.trackingId}`;

  const html = `
    <div style="font-family:Segoe UI;padding:20px">
      <h2>📦 New Dispatch</h2>
      <p><b>Tracking:</b> #${dispatchData.trackingId}</p>
      <p><b>From:</b> ${fromBranchName}</p>
      <p><b>To:</b> ${toBranchName}</p>
      <p><b>Courier:</b> ${dispatchData.courierName}</p>
    </div>
  `;

  await sendMail(emails, subject, html);
};


// ─── Status Update Email ─────────────────────────────
export const sendStatusUpdateEmail = async (
  emails,
  dispatchData,
  fromBranchName,
  toBranchName,
  newStatus,
  updatedBy
) => {

  const subject = `📦 #${dispatchData.trackingId} → ${newStatus}`;

  const html = `
    <div style="font-family:Segoe UI;padding:20px">
      <h2>Status Update</h2>
      <p><b>Tracking:</b> #${dispatchData.trackingId}</p>
      <p><b>Status:</b> ${newStatus}</p>
      <p><b>From:</b> ${fromBranchName}</p>
      <p><b>To:</b> ${toBranchName}</p>
      <p><b>Updated By:</b> ${updatedBy || 'System'}</p>
    </div>
  `;

  await sendMail(emails, subject, html);
};