import nodemailer, { Transporter } from "nodemailer";
import { env, isDevelopment } from "@/config/env";
import { logger } from "@/utils/logger";

// Many PaaS hosts (including Render) block or silently drop outbound SMTP
// connections (e.g. port 587), which makes nodemailer hang until its default
// ~2 minute connection timeout instead of failing fast. Resend's HTTPS API
// runs over the same port as normal web traffic (443) and is never blocked,
// so it's used instead of SMTP whenever Resend is the configured provider.
const RESEND_API_URL = "https://api.resend.com/emails";
const isResend = env.SMTP_HOST === "smtp.resend.com";

async function sendViaResendApi({ to, subject, html }: SendMailOptions): Promise<void> {
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SMTP_PASSWORD}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.SMTP_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { id?: string };
  logger.info({ to, subject, messageId: data.id }, "Email sent via Resend API");
}

let transporterPromise: Promise<Transporter> | null = null;

async function createTransporter(): Promise<Transporter> {
  if (env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
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

export async function sendMail(options: SendMailOptions): Promise<void> {
  if (isResend && !isDevelopment) {
    return sendViaResendApi(options);
  }

  const { to, subject, html } = options;
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
