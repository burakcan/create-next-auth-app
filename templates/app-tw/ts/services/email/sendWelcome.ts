import { transporter } from "./transporter";

export async function sendWelcome(email: string) {
  transporter.sendMail(
    {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to our app",
      html: `<p>Thank you for signing up!</p>
      <p>We're excited to have you on board.</p>
      `,
      text: `Thank you for signing up! We're excited to have you on board.`,
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}
