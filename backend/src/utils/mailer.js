import nodemailer from 'nodemailer';

// ✅ Create Gmail transporter (FIXED)
const createTransporter = async () => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn("[Mailer] ❌ Missing SMTP credentials");
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail', // ✅ IMPORTANT FIX
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 10000      // 10 seconds
  });

  // ✅ Verify connection (debug ke liye)
  try {
    await transporter.verify();
    console.log("[Mailer] ✅ Gmail server ready");
  } catch (err) {
    console.error("[Mailer] ❌ Gmail connection failed:", err.message);
    return null;
  }

  return transporter;
};


// ─── Dispatch Created Notification ───────────────────────────────────
export const sendDispatchEmail = async (emails, dispatchData, fromBranchName, toBranchName) => {
  const transporter = await createTransporter();
  if (!transporter) return;

  try {
    const info = await transporter.sendMail({
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails.join(','), // ✅ FIX
      subject: `🚚 New Dispatch Incoming: #${dispatchData.trackingId}`,
      html: `
        <div style="font-family: Segoe UI; padding:20px;">
          <h2>📦 New Dispatch</h2>
          <p><b>Tracking:</b> #${dispatchData.trackingId}</p>
          <p><b>From:</b> ${fromBranchName}</p>
          <p><b>To:</b> ${toBranchName}</p>
          <p><b>Courier:</b> ${dispatchData.courierName}</p>
        </div>
      `
    });

    console.log("✅ Dispatch Email Sent:", info.messageId);
  } catch (error) {
    console.error("❌ Dispatch Email Error:", error.message);
  }
};


// ─── Status Update Notification ──────────────────────────────────────
export const sendStatusUpdateEmail = async (
  emails,
  dispatchData,
  fromBranchName,
  toBranchName,
  newStatus,
  updatedBy
) => {

  const transporter = await createTransporter();
  if (!transporter) return;

  try {
    const info = await transporter.sendMail({
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails.join(','), // ✅ FIX
      subject: `📦 #${dispatchData.trackingId} → ${newStatus}`,
      html: `
        <div style="font-family: Segoe UI; padding:20px;">
          <h2>Status Update</h2>
          <p><b>Tracking:</b> #${dispatchData.trackingId}</p>
          <p><b>Status:</b> ${newStatus}</p>
          <p><b>From:</b> ${fromBranchName}</p>
          <p><b>To:</b> ${toBranchName}</p>
          <p><b>Updated By:</b> ${updatedBy || 'System'}</p>
        </div>
      `
    });

    console.log("✅ Status Email Sent:", info.messageId);
  } catch (error) {
    console.error("❌ Status Email Error:", error.message);
  }
};