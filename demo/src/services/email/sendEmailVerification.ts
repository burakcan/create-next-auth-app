import { transporter } from "./transporter";

export async function sendEmailVerification(email: string, code: string) {
  transporter.sendMail(
    {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome! Your verification code",
      html: `<p>Thank you for signing up!</p><br />
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Enter this code in the app to verify your email.</p>
      <p>Alternatively, you can click the link below to verify your email.</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/verify-email?code=${code}">Verify your email</a>
      `,
      text: `Your verification code is: ${code}`,
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}
