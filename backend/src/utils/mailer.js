import nodemailer from 'nodemailer';

let transporter;

// ─── Create Transporter (ONLY ONCE) ─────────────────
const createTransporter = async () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // ✅ CHANGED
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // ✅ CHANGED
      pass: process.env.SMTP_PASS, // ✅ CHANGED
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Brevo Connected");
  } catch (err) {
    console.error("❌ Brevo Verify Error:", err);
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
      from: `"BranchFlow Alerts" <${process.env.SMTP_USER}>`, // ✅ CHANGED
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