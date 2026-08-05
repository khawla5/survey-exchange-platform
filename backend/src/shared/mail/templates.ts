const baseStyle = `
  font-family: 'Inter', -apple-system, sans-serif; background-color: #FFDAB9;
  padding: 40px 0; margin: 0;
`;

const cardStyle = `
  max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px;
  padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);
`;

const buttonStyle = `
  display: inline-block; background: #F08080; color: #ffffff; text-decoration: none;
  padding: 14px 28px; border-radius: 14px; font-weight: 600; margin-top: 16px;
`;

const codeStyle = `
  font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #F08080;
  text-align: center; margin: 24px 0; font-family: monospace;
`;

function wrap(content: string): string {
  return `<html><body style="${baseStyle}"><div style="${cardStyle}">${content}
    <p style="color:#6B7280;font-size:12px;margin-top:32px;">Survey Exchange Platform</p>
  </div></body></html>`;
}

export function verificationEmailTemplate(firstName: string, code: string): string {
  return wrap(`
    <h2 style="color:#111827;">Verify your email, ${firstName}</h2>
    <p style="color:#6B7280;">Use the code below to verify your Survey Exchange account. It expires in 15 minutes.</p>
    <div style="${codeStyle}">${code}</div>
    <p style="color:#6B7280;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

export function passwordResetEmailTemplate(firstName: string, resetUrl: string): string {
  return wrap(`
    <h2 style="color:#111827;">Reset your password, ${firstName}</h2>
    <p style="color:#6B7280;">We received a request to reset your password. This link expires in 30 minutes.</p>
    <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
    <p style="color:#6B7280;font-size:14px;margin-top:24px;">If you didn't request this, please secure your account immediately.</p>
  `);
}

export function welcomeEmailTemplate(firstName: string): string {
  return wrap(`
    <h2 style="color:#111827;">Welcome to Survey Exchange, ${firstName} 🎉</h2>
    <p style="color:#6B7280;">Your account is verified. Answer surveys to earn points, then spend them to get responses to your own research.</p>
  `);
}

export function passwordChangedEmailTemplate(firstName: string): string {
  return wrap(`
    <h2 style="color:#111827;">Your password was changed</h2>
    <p style="color:#6B7280;">Hi ${firstName}, this confirms your Survey Exchange password was just changed. If this wasn't you, contact support immediately.</p>
  `);
}
