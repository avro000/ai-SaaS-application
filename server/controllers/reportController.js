import nodemailer from 'nodemailer';
import Report from '../models/Report.js';

// Setup reusable SMTP transporter
const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to test ethereal account if credentials not present
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

/**
 * POST /api/reports
 * Submit a tool bug or issue report, store in DB, and dispatch email notification.
 */
export const submitReport = async (req, res) => {
  try {
    const {
      reporterName,
      reporterEmail,
      toolName,
      category,
      severity = 'Medium',
      title,
      errorMessage = '',
      description,
      promptOrInput = '',
      browserInfo = '',
      osInfo = '',
      currentUrl = ''
    } = req.body;

    // Validate required fields
    if (!reporterName || !reporterEmail || !toolName || !title || !description) {
      return res.status(400).json({
        message: 'Please fill in all required fields (Name, Email, Tool, Title, and Description).'
      });
    }

    // Process screenshot if uploaded via multer
    let screenshotData = {
      url: '',
      mimetype: '',
      size: 0,
      filename: ''
    };

    let attachment = null;
    if (req.file) {
      const base64Img = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64Img}`;
      screenshotData = {
        url: dataUri,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.originalname || `screenshot_${Date.now()}.png`
      };

      attachment = {
        filename: screenshotData.filename,
        content: req.file.buffer,
        contentType: req.file.mimetype,
        cid: 'screenshot_attachment'
      };
    }

    // Create Report in MongoDB
    const report = await Report.create({
      user: req.user ? req.user._id : null,
      reporterName: reporterName.trim(),
      reporterEmail: reporterEmail.trim().toLowerCase(),
      toolName: toolName.trim(),
      category: category || 'Model / Generation Error',
      severity: severity || 'Medium',
      title: title.trim(),
      errorMessage: errorMessage.trim(),
      description: description.trim(),
      promptOrInput: promptOrInput.trim(),
      screenshot: screenshotData,
      browserInfo,
      osInfo,
      currentUrl,
      status: 'Open'
    });

    console.log(`📝 Bug Report Created: [${report.ticketId}] "${report.title}" by ${report.reporterEmail} for tool [${report.toolName}]`);

    // Prepare Email Dispatch
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'avpodder000@gmail.com';
    const severityColors = {
      'Critical / Blocker': '#ef4444',
      'High': '#f97316',
      'Medium': '#eab308',
      'Low': '#3b82f6'
    };
    const badgeColor = severityColors[severity] || '#eab308';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0e12; color: #e2e8f0; margin: 0; padding: 24px; line-height: 1.6; }
    .card { background-color: #141720; border: 1px solid #232838; border-radius: 12px; max-width: 680px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #181c28 0%, #1e2434 100%); padding: 24px; border-bottom: 1px solid #232838; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .ticket-id { font-family: monospace; font-size: 13px; color: #94a3b8; margin-top: 6px; }
    .title { font-size: 20px; font-weight: 700; color: #f8fafc; margin: 8px 0 0 0; }
    .content { padding: 24px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 20px 0 8px 0; border-bottom: 1px solid #1e2434; padding-bottom: 4px; }
    .section-title:first-child { margin-top: 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .info-item { background: #0e1118; border: 1px solid #1e2434; padding: 10px 14px; border-radius: 6px; }
    .info-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
    .info-value { font-size: 13px; color: #f1f5f9; font-weight: 600; }
    .code-box { background: #08090d; border: 1px solid #282f44; border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 6px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12px; color: #fca5a5; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
    .text-box { background: #0e1118; border: 1px solid #1e2434; padding: 14px 16px; border-radius: 6px; font-size: 13px; color: #cbd5e1; white-space: pre-wrap; line-height: 1.6; }
    .footer { padding: 16px 24px; background: #0e1118; border-top: 1px solid #1e2434; text-align: center; font-size: 11px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge" style="background-color: ${badgeColor}25; color: ${badgeColor}; border: 1px solid ${badgeColor}50;">
          ${severity} Priority
        </span>
        <span class="ticket-id">TICKET #${report.ticketId}</span>
      </div>
      <h1 class="title">${title}</h1>
    </div>

    <div class="content">
      <div class="section-title">Reporter Information</div>
      <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 16px; background: #0e1118; border: 1px solid #1e2434; border-radius: 6px;">
        <tr>
          <td width="50%" style="font-size: 13px; color: #94a3b8;"><strong>Name:</strong> ${reporterName}</td>
          <td width="50%" style="font-size: 13px; color: #94a3b8;"><strong>Email:</strong> <a href="mailto:${reporterEmail}" style="color: #38bdf8;">${reporterEmail}</a></td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #64748b;"><strong>User ID:</strong> ${req.user ? req.user._id : 'Guest / Not Logged In'}</td>
          <td style="font-size: 12px; color: #64748b;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</td>
        </tr>
        <tr>
          <td colspan="2" style="font-size: 12px; color: #64748b; border-top: 1px solid #1e2434;">
            <strong>Environment:</strong> ${osInfo || 'Unknown OS'} • ${browserInfo || 'Browser User-Agent'}
          </td>
        </tr>
      </table>

      <div class="section-title">Issue Scope & Classification</div>
      <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 16px; background: #0e1118; border: 1px solid #1e2434; border-radius: 6px;">
        <tr>
          <td width="50%" style="font-size: 13px; color: #e2e8f0;"><strong>Tool Affected:</strong> <span style="color: #eca8d6; font-weight: 600;">${toolName}</span></td>
          <td width="50%" style="font-size: 13px; color: #e2e8f0;"><strong>Category:</strong> ${category}</td>
        </tr>
        ${currentUrl ? `<tr><td colspan="2" style="font-size: 12px; color: #64748b; border-top: 1px solid #1e2434;"><strong>Origin URL:</strong> ${currentUrl}</td></tr>` : ''}
      </table>

      ${errorMessage ? `
      <div class="section-title">Captured Error Message / Stack</div>
      <div class="code-box">${errorMessage}</div>
      ` : ''}

      <div class="section-title">Detailed Description & Steps to Reproduce</div>
      <div class="text-box">${description}</div>

      ${promptOrInput ? `
      <div class="section-title">Input / Prompt Used</div>
      <div class="text-box" style="font-family: monospace; font-size: 12px; color: #a5b4fc;">${promptOrInput}</div>
      ` : ''}

      ${attachment ? `
      <div class="section-title">Attached Screenshot</div>
      <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 10px 0;">A screenshot has been attached to this email (${(req.file.size / 1024).toFixed(1)} KB).</p>
      <div style="text-align: center; background: #08090d; padding: 12px; border-radius: 6px; border: 1px solid #1e2434;">
        <img src="cid:screenshot_attachment" alt="User Screenshot" style="max-width: 100%; height: auto; border-radius: 4px; border: 1px solid #282f44;" />
      </div>
      ` : ''}
    </div>

    <div class="footer">
      NexusAI Automated Incident Dispatch • Ticket Reference: ${report.ticketId}
    </div>
  </div>
</body>
</html>
`;

    // Attempt sending email asynchronously (don't block HTTP response if SMTP has network delay)
    getTransporter()
      .then(async (transporter) => {
        const mailOptions = {
          from: `"NexusAI Incident Alert" <${process.env.SMTP_USER || 'no-reply@nexusai.dev'}>`,
          to: adminEmail,
          replyTo: reporterEmail,
          subject: `🚨 [${severity.toUpperCase()}] Issue in ${toolName} - Ticket #${report.ticketId}: ${title}`,
          html: htmlContent,
          attachments: attachment ? [attachment] : []
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Report Email sent successfully to ${adminEmail} (Message ID: ${info.messageId})`);

        // Also send confirmation receipt to user
        try {
          const userConfirmHtml = `
            <div style="font-family: sans-serif; background: #0c0e12; color: #e2e8f0; padding: 24px; border-radius: 8px; max-width: 550px;">
              <h2 style="color: #eca8d6; margin-top: 0;">Issue Report Received</h2>
              <p>Hello ${reporterName},</p>
              <p>Thank you for letting us know about the issue with <strong>${toolName}</strong>. Our engineering team has received your ticket and is actively investigating.</p>
              <div style="background: #141720; border: 1px solid #232838; padding: 14px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Ticket ID:</strong> <span style="font-family: monospace; color: #38bdf8;">${report.ticketId}</span></p>
                <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Issue Summary:</strong> ${title}</p>
                <p style="margin: 0; font-size: 13px;"><strong>Severity:</strong> ${severity}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8;">If you have additional details or context, simply reply directly to this email.</p>
              <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e2434; padding-top: 12px;">The NexusAI Team</p>
            </div>
          `;
          await transporter.sendMail({
            from: `"NexusAI Support" <${process.env.SMTP_USER || 'support@nexusai.dev'}>`,
            to: reporterEmail,
            subject: `We've received your issue report [Ticket #${report.ticketId}]`,
            html: userConfirmHtml
          });
        } catch (confirmErr) {
          console.warn('⚠️ Could not send confirmation receipt to user:', confirmErr.message);
        }
      })
      .catch((emailErr) => {
        console.error('❌ Failed to dispatch report email via SMTP:', emailErr.message);
        if (emailErr.message.includes('535') || emailErr.message.includes('Username and Password not accepted')) {
          console.warn('💡 Tip: For Gmail SMTP, generate a 16-character App Password at https://myaccount.google.com/apppasswords and set it as SMTP_PASS in server/.env');
        }
      });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our engineering team has been notified via email.',
      ticketId: report.ticketId,
      report
    });
  } catch (err) {
    console.error('❌ Report Submission Error:', err);
    return res.status(500).json({
      message: 'Failed to submit report. Please try again.',
      error: err.message
    });
  }
};

/**
 * GET /api/reports/my-reports
 * Fetch reports submitted by currently logged-in user
 */
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      $or: [
        { user: req.user._id },
        { reporterEmail: req.user.email.toLowerCase() }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({ reports });
  } catch (err) {
    console.error('❌ Error fetching user reports:', err);
    return res.status(500).json({ message: 'Failed to retrieve reports' });
  }
};
