import { transporter } from "./transporter";

export async function sendPasswordReset(
  email: string,
  id: number,
  token: string
) {
  transporter.sendMail(
    {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password.</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/reset-password?t=${id}-${token}">Reset your password</a><br />
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request a password reset, you can ignore this email.</p>
      `,
      text: `Click the link below to reset your password: ${process.env.NEXT_PUBLIC_URL}/reset-password/${token}`,
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}
