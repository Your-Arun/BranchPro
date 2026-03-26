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