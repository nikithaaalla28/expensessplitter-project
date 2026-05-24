const nodemailer = require('nodemailer');

/**
 * Mail Service - Handles all email sending operations
 * Uses Gmail SMTP configuration with environment variables
 * Credentials are stored securely in .env file
 */

// Initialize Nodemailer transporter with Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,        // Gmail email address
    pass: process.env.EMAIL_PASSWORD,    // Gmail app-specific password
  },
  // Additional security options
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Determine whether email credentials are configured and not placeholders
 * @returns {boolean}
 */
const isEmailConfigured = () => {
  const { EMAIL_USER, EMAIL_PASSWORD } = process.env;
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    return false;
  }

  const placeholderEmailPatterns = [/your[-_.]?real/i, /your[-_.]?email/i, /example\.com/i, /test/i];
  const placeholderPasswordPatterns = [/your[-_.]?16[-_.]?character/i, /app[-_.]?specific[-_.]?password/i, /password/i];

  const looksLikePlaceholderEmail = placeholderEmailPatterns.some((pattern) => pattern.test(EMAIL_USER));
  const looksLikePlaceholderPassword = placeholderPasswordPatterns.some((pattern) => pattern.test(EMAIL_PASSWORD));

  if (looksLikePlaceholderEmail || looksLikePlaceholderPassword) {
    return false;
  }

  return true;
};

/**
 * Send welcome email to newly registered user
 * @param {string} recipientEmail - Email address of the new user
 * @param {string} userName - Full name of the user
 * @returns {Promise<boolean>} - Returns true if email sent successfully, false otherwise
 */
const sendWelcomeEmail = async (recipientEmail, userName) => {
  try {
    // Validate required parameters
    if (!recipientEmail || !userName) {
      console.error('❌ Email Service Error: Missing recipient email or user name');
      return false;
    }

    // Skip sending if email is not configured or still using placeholders
    if (!isEmailConfigured()) {
      console.warn('⚠️ Email Service skipped: EMAIL_USER or EMAIL_PASSWORD is not configured correctly.');
      return false;
    }

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email address
      to: recipientEmail,            // Recipient's email address
      subject: 'Welcome to Expense Splitter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Expense Splitter</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Welcome to the community</p>
          </div>

          <!-- Body -->
          <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <!-- Greeting -->
            <p style="color: #1f2937; font-size: 16px; margin: 0 0 20px 0;">
              Hello <strong>${userName}</strong>,
            </p>

            <!-- Main Message -->
            <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0 0 20px 0;">
              You have successfully registered to <strong>Expense Splitter</strong>.
            </p>

            <!-- Features List -->
            <p style="color: #4b5563; font-size: 15px; margin: 0 0 15px 0;">
              Now you can:
            </p>

            <ul style="color: #4b5563; font-size: 15px; line-height: 28px; margin: 0 0 30px 0; padding-left: 20px;">
              <li>✓ Manage groups and organize shared expenses</li>
              <li>✓ Track expenses and balances easily</li>
              <li>✓ Settle payments and close group accounts</li>
              <li>✓ View detailed reports and analytics</li>
            </ul>

            <!-- Call to Action -->
            <div style="background-color: #f0f4ff; padding: 20px; border-radius: 6px; margin: 30px 0; text-align: center;">
              <p style="color: #667eea; font-size: 14px; margin: 0;">
                Ready to get started? Log in to your dashboard now!
              </p>
            </div>

            <!-- Closing -->
            <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0;">
              Thank you for joining Expense Splitter. We're excited to have you on board!
            </p>

            <!-- Support -->
            <p style="color: #9ca3af; font-size: 13px; margin: 25px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you have any questions or need assistance, feel free to reach out to our support team.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">© 2026 Expense Splitter. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply directly.</p>
          </div>
        </div>
      `,
      // Plain text version for email clients that don't support HTML
      text: `
Hello ${userName},

You have successfully registered to Expense Splitter.
Now you can manage groups, expenses, settlements, and reports easily.

Thank you for joining Expense Splitter.
      `.trim(),
    };

    // Attempt to send the email
    const info = await transporter.sendMail(mailOptions);

    // Log successful email sending
    console.log(`✅ Welcome email sent successfully to ${recipientEmail}`);
    console.log(`📧 Email ID: ${info.messageId}`);

    return true;
  } catch (error) {
    // Log detailed error information for debugging
    console.error(`❌ Email Service Error: Failed to send welcome email to ${recipientEmail}`);
    console.error(`📝 Error Details:`, error.message);

    // Return false to indicate email sending failure
    // Note: Registration will still complete successfully even if email sending fails
    return false;
  }
};

/**
 * Verify email configuration - Test the email transporter connection
 * Call this during server startup to ensure email service is properly configured
 */
const verifyEmailConfiguration = async () => {
  try {
    // Check if required environment variables are set and not placeholder values
    if (!isEmailConfigured()) {
      console.warn('⚠️  Warning: Email credentials are missing or still placeholder values in .env file');
      console.warn('   Please configure EMAIL_USER and EMAIL_PASSWORD with a valid Gmail account and app-specific password');
      console.warn('   Welcome email feature will be disabled until credentials are configured');
      return false;
    }

    // Verify SMTP connection with timeout
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email verification timeout (10s)')), 10000)
    );

    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('✅ Email Service Initialized: Gmail SMTP connection verified');
    return true;
  } catch (error) {
    console.warn('⚠️  Email Configuration Warning:', error.message);
    console.warn('   Welcome email feature will be disabled');
    console.warn('   To enable: Configure valid EMAIL_USER and EMAIL_PASSWORD in .env');
    return false;
  }
};

// Export functions for use in other modules
module.exports = {
  sendWelcomeEmail,
  verifyEmailConfiguration,
  isEmailConfigured,
};
