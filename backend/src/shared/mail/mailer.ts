import nodemailer, { Transporter } from "nodemailer";
import { env, isDevelopment } from "@/config/env";
import { logger } from "@/utils/logger";

let transporterPromise: Promise<Transporter> | null = null;

async function createTransporter(): Promise<Transporter> {
  if (env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
  }

  if (isDevelopment) {
    const testAccount = await nodemailer.createTestAccount();
    logger.warn(
      "No SMTP_HOST configured — using an Ethereal sandbox inbox for development email. " +
        "Preview URLs will be logged for every email sent."
    );
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  throw new Error("SMTP_HOST must be configured in production");
}

function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info({ previewUrl, to, subject }, "Development email sent — preview URL");
  } else {
    logger.info({ to, subject, messageId: info.messageId }, "Email sent");
  }
}
