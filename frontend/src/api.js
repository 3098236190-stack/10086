// 与 Django 后端通信的轻封装
const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

async function get(path) {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error("HTTP " + r.status + " " + path);
  return r.json();
}

async function post(path, body) {
  const r = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error("HTTP " + r.status);
    err.data = data;
    throw err;
  }
  return data;
}

export default { get, post, BASE };
