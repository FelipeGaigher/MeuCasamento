// E-mail transacional via Brevo. Chave so em variavel de ambiente.

export const brevoConfigured = () => !!process.env.BREVO_API_KEY;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#2a2023">${escape(text)
    .split("\n")
    .map((l) => `<p style="margin:0 0 8px">${l || "&nbsp;"}</p>`)
    .join("")}</div>`;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL ?? "ola@meucasamento.app",
        name: process.env.BREVO_SENDER_NAME ?? "Meu Casamento",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Brevo HTTP ${res.status}`);
}
