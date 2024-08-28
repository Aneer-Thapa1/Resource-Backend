const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "habit234pulse@gmail.com",
    pass: "vholnvmegtvmjptw",
  },
});

module.exports = transporter;
