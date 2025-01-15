import nodemailer from "nodemailer";
import ejs from "ejs";

import { fileURLToPath } from "url";
import { dirname } from "path";
const currentFilePath = import.meta.url;
const currentDirectory = dirname(fileURLToPath(currentFilePath));

console.log(currentDirectory);

const mail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "varunkumar02021@gmail.com",
    pass: "hqbemcslyoykmrpm",
  },
});

const sendEmailVerificationLink = async (email, token, name) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/confirm_email.ejs`,
      { token, name }
    );
    const mailOptions = {
      from: "storytime.nyros@gmail.com",
      to: email,
      subject: "Storytime - Email Confirmation",
      html: renderedContent,
    };
    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return error;
  }
};

const sendPasswordResetLink = async (email, token, name) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/reset_password.ejs`,
      { token, name }
    );
    const mailOptions = {
      from: "storytime.nyros@gmail.com",
      to: email,
      subject: "Storytime - Password reset link",
      html: renderedContent,
    };
    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return error;
  }
};

export { sendEmailVerificationLink, sendPasswordResetLink };
