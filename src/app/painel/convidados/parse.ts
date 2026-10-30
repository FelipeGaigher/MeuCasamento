// Uma pessoa por linha: "Nome; telefone; e-mail; grupo" (so o nome e obrigatorio).
export function parseGuestLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(/[;\t]/).map((p) => p.trim()))
    .filter((parts) => parts[0] && parts[0].length >= 2)
    .map(([name, phone, email, group]) => ({
      name: name.slice(0, 120),
      phone: phone || null,
      email: email && /\S+@\S+\.\S+/.test(email) ? email.toLowerCase() : null,
      group: group || null,
    }));
}
