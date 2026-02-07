import nodemailer from "nodemailer";

/**
 * Sends an email using Nodemailer with a Gmail account.
 */
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments: nodemailer.SendMailOptions["attachments"] = []
): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"MotoFix" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export default sendEmail;
