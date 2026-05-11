import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`\n[Development] MOCKED EMAIL (Credentials missing in .env)\nTo: ${email}\nSubject: ${subject}\nBody: ${text}\n`);
    return; // Fast-fail in development to allow registration testing
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"SkillRise" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text
  });
};

export default sendEmail;