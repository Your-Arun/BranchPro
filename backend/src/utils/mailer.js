import nodemailer from 'nodemailer';

// Create a transporter using standard SMTP (Wait for user to provide credentials via .env)
export const sendDispatchEmail = async (emails, dispatchData, fromBranchName, toBranchName) => {
  // If no credentials, we just log and skip to avoid crashing
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log(`[Email Skipped] Missing SMTP_EMAIL or SMTP_PASSWORD in .env file.`);
    console.log(`Would have sent notification to: ${emails.join(', ')}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard configuration for Gmail
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

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

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${emails.join(', ')}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};
