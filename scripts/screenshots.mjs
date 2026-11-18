// Captures desktop (1440px) and phone (390px) screenshots into docs/screenshots/,
// signed in as the demo player/coach where needed.
//
// Usage: npm run screenshots [-- <base-url>]   (default http://localhost:3000)
// Needs Google Chrome (override with CHROME_PATH) and the .env.local Supabase vars.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs"; import { tmpdir } from "node:os"; import { join } from "node:path";
import { createServerClient } from "@supabase/ssr";
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, ""); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function cookiesFor(email) {
  const jar = new Map();
  const c = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (cs) => cs.forEach(({ name, value }) => jar.set(name, value)) } });
  const { error } = await c.auth.signInWithPassword({ email, password: process.env.DEMO_ACCOUNT_PASSWORD }); if (error) throw error;
  return [...jar].map(([name, value]) => ({ name, value, domain: new URL(BASE).hostname, path: "/" }));
}
const chrome = spawn(process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--remote-debugging-port=9333", `--user-data-dir=${mkdtempSync(join(tmpdir(), "shots-"))}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch("http://127.0.0.1:9333/json/list")).json()).find((x) => x.type === "page"); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map(); const listeners = []; const errors = [];
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else listeners.forEach((l) => l(m));
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description?.split("\n")[0]); });
const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result))); ws.send(JSON.stringify({ id: n, method, params })); });
await send("Page.enable"); await send("Network.enable"); await send("Runtime.enable");
async function shot(name, path, { width, height, mobile = false, cookies = [], full = true }) {
  await send("Network.clearBrowserCookies"); if (cookies.length) await send("Network.setCookies", { cookies });
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile });
  const loaded = new Promise((r) => { const l = (m) => { if (m.method === "Page.loadEventFired") { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
  await send("Page.navigate", { url: BASE + path }); await loaded; await sleep(1200);
  const { result } = await send("Runtime.evaluate", { expression: "JSON.stringify({ h: document.documentElement.scrollHeight, o: document.documentElement.scrollWidth > window.innerWidth })", returnByValue: true });
  const info = JSON.parse(result.value); const h = full ? Math.min(info.h, 4000) : height;
  if (full) { await send("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: 2, mobile }); await sleep(400); }
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width, height: h, scale: 1 } });
  writeFileSync(`docs/screenshots/${name}.png`, Buffer.from(data, "base64"));
  console.log(`${name.padEnd(18)} ${width}x${h}${info.o ? "  horizontal overflow" : ""}`);
}
try {
  const player = await cookiesFor("demo-player@example.com"), coach = await cookiesFor("demo-coach@example.com");
  const desktop = { width: 1440, height: 900 }, phone = { width: 390, height: 844, mobile: true };
  await shot("home", "/", desktop);
  await shot("login", "/login", desktop);
  await shot("calendar", "/calendar?week=1", { ...desktop, cookies: player });
  await shot("dashboard", "/dashboard", { ...desktop, cookies: player });
  await shot("admin", "/admin", { ...desktop, cookies: coach });
  await shot("mobile-home", "/", { ...phone, full: false });
  await shot("mobile-login", "/login", phone);
  await shot("mobile-calendar", "/calendar?week=1", { ...phone, cookies: player, full: false });
} finally { console.log("browser exceptions:", errors.length ? [...new Set(errors)].join(" | ") : "none"); ws.close(); chrome.kill(); }
