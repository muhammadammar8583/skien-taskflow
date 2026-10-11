import nodemailer, { type Transporter } from "nodemailer";
import { getAuthEnvironment } from "@/lib/env";
import {
  createOtpEmail,
  createPasswordChangedEmail,
} from "@/lib/email-templates/password-reset";

let transporter: Transporter | undefined;

function getTransporter() {
  const env = getAuthEnvironment();
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  return { transporter, from: env.SMTP_FROM };
}

export async function sendPasswordResetOtp(email: string, otp: string) {
  const mail = createOtpEmail(otp);
  const transport = getTransporter();

  await transport.transporter.sendMail({
    from: transport.from,
    to: email,
    ...mail,
  });
}

export async function sendPasswordChangedConfirmation(email: string) {
  const mail = createPasswordChangedEmail();
  const transport = getTransporter();

  await transport.transporter.sendMail({
    from: transport.from,
    to: email,
    ...mail,
  });
}
