import nodemailer from 'nodemailer';

// Create Gmail transporter optimized for Render/Hosting
const createTransporter = () => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn("[Mailer] SMTP credentials missing in environment");
    return null;
  }
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS on port 587
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Skip certificate validation for better compatibility
    }
  });
};

// ─── Dispatch Created Notification ───────────────────────────────────
export const sendDispatchEmail = async (emails, dispatchData, fromBranchName, toBranchName) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Skipped] Missing SMTP_EMAIL or SMTP_PASSWORD in .env`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails,
      subject: `🚚 New Dispatch Incoming: #${dispatchData.trackingId}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 24px; color: #333; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">📦 New Dispatch Alert</h1>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #374151;">A new <strong>${dispatchData.category}</strong> shipment is on its way.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 10px; color: #6b7280; font-size: 13px;">Tracking ID</td><td style="padding: 10px; font-weight: 700; color: #4f46e5;">#${dispatchData.trackingId}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">From</td><td style="padding: 10px; font-weight: 600;">${fromBranchName}</td></tr>
              <tr><td style="padding: 10px; color: #6b7280; font-size: 13px;">To</td><td style="padding: 10px; font-weight: 600;">${toBranchName}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">Courier</td><td style="padding: 10px; font-weight: 600;">${dispatchData.courierName}</td></tr>
            </table>
            <p style="font-size: 14px; color: #6b7280;">Please check your BranchFlow portal to confirm receipt when the shipment arrives.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 11px; color: #9ca3af; text-align: center;">Automated notification from BranchFlow</p>
          </div>
        </div>
      `
    });

    console.log(`[Dispatch Email] ✅ Sent to ${emails.join(', ')} | MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('[Dispatch Email] ❌ Failed:', error.message);
  }
};

// ─── Status Update Notification ──────────────────────────────────────
export const sendStatusUpdateEmail = async (emails, dispatchData, fromBranchName, toBranchName, newStatus, updatedBy) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Status Email Skipped] Missing SMTP credentials`);
    return;
  }

  const statusConfig = {
    RECEIVED:       { color: '#10b981', emoji: '✅', msg: 'has been successfully received and verified' },
    FAILED:         { color: '#ef4444', emoji: '❌', msg: 'has been marked as Failed / Rejected' },
    IN_TRANSIT:     { color: '#3b82f6', emoji: '🚛', msg: 'is now In Transit' },
    WAITING_RECEIPT:{ color: '#f59e0b', emoji: '⏳', msg: 'is waiting for receipt confirmation' },
    OVERDUE:        { color: '#ef4444', emoji: '⚠️', msg: 'has been flagged as Overdue' },
    PENDING:        { color: '#f59e0b', emoji: '🕐', msg: 'is marked as Pending' },
    SENT:           { color: '#6366f1', emoji: '📤', msg: 'has been dispatched' }
  };

  const cfg = statusConfig[newStatus] || { color: '#4e8dff', emoji: '📦', msg: `status updated to ${newStatus}` };

  try {
    const info = await transporter.sendMail({
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails,
      subject: `${cfg.emoji} Shipment #${dispatchData.trackingId} — ${newStatus}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 24px; color: #333; max-width: 600px; margin: auto;">
          <div style="background: ${cfg.color}; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">${cfg.emoji} Status: ${newStatus}</h1>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #374151;">Shipment <strong>#${dispatchData.trackingId}</strong> ${cfg.msg}.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 10px; color: #6b7280; font-size: 13px;">Tracking ID</td><td style="padding: 10px; font-weight: 700; color: ${cfg.color};">#${dispatchData.trackingId}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">From</td><td style="padding: 10px; font-weight: 600;">${fromBranchName}</td></tr>
              <tr><td style="padding: 10px; color: #6b7280; font-size: 13px;">To</td><td style="padding: 10px; font-weight: 600;">${toBranchName}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">Category</td><td style="padding: 10px; font-weight: 600;">${dispatchData.category}</td></tr>
              <tr><td style="padding: 10px; color: #6b7280; font-size: 13px;">Courier</td><td style="padding: 10px; font-weight: 600;">${dispatchData.courierName}</td></tr>
              <tr style="background: #f9fafb;"><td style="padding: 10px; color: #6b7280; font-size: 13px;">Updated By</td><td style="padding: 10px; font-weight: 600;">${updatedBy || 'System'}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 11px; color: #9ca3af; text-align: center;">Automated notification from BranchFlow</p>
          </div>
        </div>
      `
    });

    console.log(`[Status Email] ✅ Sent to ${emails.join(', ')} for #${dispatchData.trackingId} → ${newStatus} | MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('[Status Email] ❌ Failed:', error.message);
  }
};
