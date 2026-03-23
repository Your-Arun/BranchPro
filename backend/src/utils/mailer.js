import nodemailer from 'nodemailer';
import dns from 'dns';
import net from 'net';

// Force Node.js DNS to prefer IPv4 over IPv6
dns.setDefaultResultOrder('ipv4first');

// Resolve Gmail SMTP to IPv4 manually
const resolveIPv4 = (hostname) => {
  return new Promise((resolve, reject) => {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses.length) {
        reject(err || new Error('No IPv4 addresses found'));
      } else {
        resolve(addresses[0]);
      }
    });
  });
};

// Create a reusable transporter with forced IPv4
const createGmailTransporter = async () => {
  const ipv4Address = await resolveIPv4('smtp.gmail.com');
  console.log(`[Mailer] Resolved smtp.gmail.com → ${ipv4Address} (IPv4)`);

  return nodemailer.createTransport({
    host: ipv4Address,
    port: 587,
    secure: false,
    requireTLS: true,
    tls: {
      servername: 'smtp.gmail.com', // Required for TLS cert validation
      rejectUnauthorized: true
    },
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });
};

// Create dispatch notification email
export const sendDispatchEmail = async (emails, dispatchData, fromBranchName, toBranchName) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`[Email Skipped] Missing SMTP_EMAIL or SMTP_PASSWORD in .env file.`);
    console.log(`Would have sent notification to: ${emails.join(', ')}`);
    return;
  }

  try {
    const transporter = await createGmailTransporter();

    const mailOptions = {
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails,
      subject: `🚚 New Dispatch Incoming: #${dispatchData.trackingId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4e8dff;">New Dispatch Created</h2>
          <p>A new ${dispatchData.category} shipment is on its way to your branch.</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Tracking ID:</strong> #${dispatchData.trackingId}</p>
            <p><strong>From:</strong> ${fromBranchName}</p>
            <p><strong>To:</strong> ${toBranchName}</p>
            <p><strong>Courier:</strong> ${dispatchData.courierName}</p>
          </div>
          <p>Please check your BranchFlow portal to confirm receipt when the shipment arrives.</p>
          <br/>
          <p style="font-size: 12px; color: #888;">This is an automated workflow from BranchFlow.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Dispatch Email] ✅ Successfully sent to ${emails.join(', ')} | MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('[Dispatch Email] ❌ Failed:', error.message);
    console.error('[Dispatch Email] Full Error:', error);
  }
};

// Email when dispatch status is updated (RECEIVED, FAILED, etc.)
export const sendStatusUpdateEmail = async (emails, dispatchData, fromBranchName, toBranchName, newStatus, updatedBy) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`[Status Email Skipped] Missing SMTP credentials.`);
    return;
  }

  const statusColors = {
    RECEIVED: '#10b981',
    FAILED: '#ef4444',
    IN_TRANSIT: '#3b82f6',
    WAITING_RECEIPT: '#f59e0b',
    OVERDUE: '#ef4444',
    PENDING: '#f59e0b',
    SENT: '#6366f1'
  };

  const statusMessages = {
    RECEIVED: 'has been successfully received and verified',
    FAILED: 'has been marked as Failed / Rejected',
    IN_TRANSIT: 'is now In Transit',
    WAITING_RECEIPT: 'is waiting for receipt confirmation',
    OVERDUE: 'has been flagged as Overdue',
    PENDING: 'is marked as Pending',
    SENT: 'has been dispatched'
  };

  const color = statusColors[newStatus] || '#4e8dff';
  const message = statusMessages[newStatus] || `status updated to ${newStatus}`;

  try {
    const transporter = await createGmailTransporter();

    const mailOptions = {
      from: `"BranchFlow Alerts" <${process.env.SMTP_EMAIL}>`,
      to: emails,
      subject: `📦 Shipment #${dispatchData.trackingId} — ${newStatus}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: ${color};">Shipment Status: ${newStatus}</h2>
          <p>Shipment <strong>#${dispatchData.trackingId}</strong> ${message}.</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tracking ID:</strong> #${dispatchData.trackingId}</p>
            <p><strong>From:</strong> ${fromBranchName}</p>
            <p><strong>To:</strong> ${toBranchName}</p>
            <p><strong>Category:</strong> ${dispatchData.category}</p>
            <p><strong>Courier:</strong> ${dispatchData.courierName}</p>
            <p><strong>Updated By:</strong> ${updatedBy || 'System'}</p>
          </div>
          <p style="font-size: 12px; color: #888;">This is an automated notification from BranchFlow.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Status Email] ✅ Sent to ${emails.join(', ')} for #${dispatchData.trackingId} → ${newStatus} | MessageId: ${info.messageId}`);
  } catch (error) {
    console.error('[Status Email] ❌ Failed:', error.message);
    console.error('[Status Email] Full Error:', error);
  }
};
