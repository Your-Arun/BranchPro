import { Resend } from 'resend';

// Uses HTTP API instead of SMTP — works on Render free tier
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const FROM_EMAIL = 'BranchFlow <onboarding@resend.dev>'; // Free tier uses resend.dev domain

// ─── Dispatch Created Notification ───────────────────────────────────
export const sendDispatchEmail = async (emails, dispatchData, fromBranchName, toBranchName) => {
  const resend = getResend();
  if (!resend) {
    console.log(`[Email Skipped] Missing RESEND_API_KEY in .env`);
    console.log(`Would have sent to: ${emails.join(', ')}`);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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

    if (error) {
      console.error('[Dispatch Email] ❌ Resend Error:', error);
    } else {
      console.log(`[Dispatch Email] ✅ Sent to ${emails.join(', ')} | ID: ${data?.id}`);
    }
  } catch (error) {
    console.error('[Dispatch Email] ❌ Failed:', error.message);
  }
};

// ─── Status Update Notification ──────────────────────────────────────
export const sendStatusUpdateEmail = async (emails, dispatchData, fromBranchName, toBranchName, newStatus, updatedBy) => {
  const resend = getResend();
  if (!resend) {
    console.log(`[Status Email Skipped] Missing RESEND_API_KEY`);
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
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
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

    if (error) {
      console.error('[Status Email] ❌ Resend Error:', error);
    } else {
      console.log(`[Status Email] ✅ Sent to ${emails.join(', ')} for #${dispatchData.trackingId} → ${newStatus} | ID: ${data?.id}`);
    }
  } catch (error) {
    console.error('[Status Email] ❌ Failed:', error.message);
  }
};
