const OTPmail = (otp, email,user) => {
    return {
      from: "Resource Department",
      to: email,
      subject: "Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Email Verification Required</h2>
          <p>Dear ${user},</p>
          <p>Thank you for registering with us. To complete your registration, please verify your email address by entering the following OTP (One-Time Password) in the app:</p>
          <p style="font-size: 24px; font-weight: bold; color: #2c3e50;">${otp}</p>
          <p>This OTP is valid for a limited time, so please use it promptly to verify your email address.</p>
          <p>If you did not initiate this request, please ignore this email. No further action is required.</p>
          <p>Best regards,</p>
          <p><strong>Your Company Name</strong></p>
          <hr style="border: none; border-top: 1px solid #ccc;">
          <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply. If you have any questions, contact our support team at support@example.com.</p>
        </div>
      `,
    };
  };
  
  module.exports = OTPmail;
  