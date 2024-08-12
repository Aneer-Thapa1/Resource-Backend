
// const sendOTPVerificationEmail = async ({ id, email,user }) => {
//     try {
//       const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
//       const saltRounds = 10;
//       const hashedOTP = await bcrypt.hash(otp, saltRounds);
  
     
//       const updatedUser = await prisma.userPool.update({
//         where: {
//           userPoolId: id,
//         },
//         data: {
//           otp: hashedOTP,
//           created_at: new Date(),
//           expire_at: new Date(Date.now() + 30000), // OTP expires in 1 hour
//         },
//       });
  
//       const mailOptions = OTPmail(otp, email, user);
  
//       await transporter.sendMail(mailOptions);
  
//       return {
//         status: "pending",
//         message: "Verification OTP email sent",
//         data: {
//           userId: updatedUser.userPoolId,
//           user_email: email,
//         },
//       };
//     } catch (error) {
//       console.error("An error occurred during OTP email sending:", error);
//       throw new Error("Failed to send OTP email.");
//     }
//   };
  
//   const verifyOTP = async (req, res) => {
//     const { user_id, otp } = req.body;
  
//     if (!user_id || !otp) {
//       return res.status(400).json({ error: "User ID and OTP are required!" });
//     }
  
//     try {
//       const user = await prisma.userPool.findUnique({
//         where: {
//           userPoolId: Number(user_id),
//         },
//       });
  
//       if (!user) {
//         return res.status(404).json({ error: "User not found!" });
//       }
  
//       const providedOTP = String(otp);
//       const storedHash = String(user.otp);
//       const currentTime = new Date();
//       const otpExpireTime = user.expire_at;
  
//       if (!providedOTP || !storedHash) {
//         return res.status(400).json({ error: "Invalid OTP format!" });
//       }
  
//       if (currentTime > otpExpireTime) {
//        await prisma.userPool.update({
//           where: {
//             userPoolId: Number(user_id),
//           },
//           data: {
//            created_at:null,
//             otp: null,
//             expire_at: null,
//           },
//         });
     
//         return res.status(400).json({ error: "OTP has expired!" });
//       }
  
//       const matchedOTP = await bcrypt.compare(providedOTP, storedHash);
  
//       if (!matchedOTP) {
//         return res.status(400).json({ error: "Invalid OTP!" });
//       }
  
//       const verifiedUser = await prisma.userPool.update({
//         where: {
//           userPoolId: Number(user_id),
//         },
//         data: {
//           verified: true,
//           otp: null,
//           expire_at: null,
//         },
//       });
  
//       return res.status(200).json({ message: "User OTP verified successfully!" });
//     } catch (error) {
//       console.error("An error occurred during OTP verification:", error);
//       return res
//         .status(500)
//         .json({ error: "An error occurred during OTP verification" });
//     }
//   };
  
  
  // Send OTP Verification Email
//   const sendOTPVerificationEmail = async ({ id, email, user }) => {
//     try {
//       const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
//       const saltRounds = 10;
//       const hashedOTP = await bcrypt.hash(otp, saltRounds);

//       const updatedUser = await prisma.userPool.update({
//         where: {
//           userPoolId: id,
//         },
//         data: {
//           otp: hashedOTP,
//           created_at: new Date(),
//           expire_at: new Date(Date.now() + 5000), // OTP expires in 5 seconds
//         },
//       });

//       const mailOptions = OTPmail(otp, email, user);

//       await transporter.sendMail(mailOptions);

//       return {
//         status: "pending",
//         message: "Verification OTP email sent",
//         data: {
//           userId: updatedUser.userPoolId,
//           user_email: email,
//         },
//       };
//     } catch (error) {
//       console.error("An error occurred during OTP email sending:", error);
//       throw new Error("Failed to send OTP email.");
//     }
//   };

