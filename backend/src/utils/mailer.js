import nodemailer from 'nodemailer';
import dns from 'dns';

// ✅ FORCE IPv4 (MOST IMPORTANT FIX)
dns.setDefaultResultOrder('ipv4first');

const createTransporter = async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4, // ✅ FORCE IPv4
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Gmail Connected");
  } catch (err) {
    console.error("❌ Gmail Error:", err.message);
    return null;
  }

  return transporter;
};

// ─── Common Send Function ─────────────────────────────
const sendMail = async (emails, subject, html) => {
  const transporter = await createTransporter();
  if (!transporter) return;

  try {
    const info = await transporter.sendMail({
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails.join(','), // ✅ multiple emails supported
      subject,
      html,
    });

    console.log("✅ Email Sent:", info.messageId);
  } catch (error) {
    console.error("❌ Send Error:", error.message);
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