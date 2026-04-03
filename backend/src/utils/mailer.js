import axios from "axios";

// ─── Common Send Function ─────────────────────────────
const sendMail = async (emails, subject, html) => {
  try {
    console.log("📨 Sending to:", emails);

    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "BranchFlow Alerts",
          email: process.env.BREVO_EMAIL, // verified email
        },
        to: emails.map(e => ({ email: e })),
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email Sent:", res.data);
  } catch (error) {
    console.error("❌ Send Error FULL:", error.response?.data || error.message);
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

// ─── Forgot Password Email ─────────────────────────────
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = `🔐 Password Reset Request for BranchFlow Pro`;
  
  const html = `
    <div style="font-family:Segoe UI;padding:20px;max-width:600px;margin:0 auto;background-color:#f9f9f9;border-radius:10px;">
      <h2 style="color:#4e8dff;">Password Reset</h2>
      <p style="font-size:16px;">You requested to reset your password. Please click the button below to set a new password.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${resetUrl}" style="background-color:#4e8dff;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;display:inline-block;">Reset Password</a>
      </div>
      <p style="font-size:14px;color:#666;">If you did not request this, please ignore this email. This link will expire in 10 minutes.</p>
      <p style="font-size:12px;color:#999;margin-top:20px;">If the button doesn't work, copy and paste this link: ${resetUrl}</p>
    </div>
  `;

  await sendMail([email], subject, html);
};