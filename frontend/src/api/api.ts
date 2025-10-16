const API_URL = "http://localhost:4000/api";

export async function fetchInbox() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Non connecté");

  const res = await fetch(`${API_URL}/gmail/inbox`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

export async function sendMail(to: string, subject: string, text: string) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Non connecté");

  const res = await fetch(`${API_URL}/mail/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to, subject, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}