const newUserMail = (email, user) => {
    return {
      from: "Resource Department <no-reply@yourdomain.com>",
      to: email,
      subject: "Welcome to Your New Account",
      html: `
        <p>Dear ${user},</p>
        <p>Welcome to our platform!</p>
        <p>Your account has been created successfully. Below are your login details:</p>
        <p><strong>Email:</strong> ${email}</p>
        link
        

        <p>Please log in and change your password after your first login for security purposes.</p>
        <p>If you did not request this, please contact our support team immediately.</p>
        <p>Thank you!</p>
        <p>Best regards,<br>Your Company Name</p>
      `,
    };
  };
  
  module.exports = newUserMail;
  