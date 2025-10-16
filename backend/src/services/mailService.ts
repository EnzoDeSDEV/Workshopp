import nodemailer from "nodemailer";
import imaps from "imap-simple";

export async function sendMail({ to, subject, text, html }: {to:string, subject:string, text?:string, html?:string}) {
  // Exemple SMTP simple (utiliser OAuth2 pour Gmail)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
  return info;
}

export async function listInbox() {
  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT || 993),
      tls: true,
      authTimeout: 3000
    }
  };
  const connection = await imaps.connect(config);
  await connection.openBox("INBOX");
  const searchCriteria = ["ALL"];
  const fetchOptions = { bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)"], struct: true };
  const messages = await connection.search(searchCriteria, fetchOptions);
  // simplification : on retourne headers
  return messages.map((m:any) => m.parts[0].body);
}