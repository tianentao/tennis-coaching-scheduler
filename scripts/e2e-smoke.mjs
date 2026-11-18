// Click-through smoke test in headless Chrome (via the DevTools protocol; no extra deps).
// Player: demo sign-in -> book a slot -> cancel it on the dashboard -> sign out.
// Coach: demo sign-in -> create a slot through the admin form, checked in the DB as
// 10:00 AM Pacific (then deleted). Fails on any uncaught browser exception.
//
// Usage: npm run test:e2e [-- <base-url>]   (default http://localhost:3000)
// It books and cancels on the shared demo data; run `npm run seed:demo` afterwards.
// Needs Google Chrome (override with CHROME_PATH) and the .env.local Supabase vars.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs"; import { tmpdir } from "node:os"; import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, ""); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--remote-debugging-port=9335", `--user-data-dir=${mkdtempSync(join(tmpdir(), "e-"))}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
let t; for (let i = 0; i < 50 && !t; i++) { await sleep(200); try { t = (await (await fetch("http://127.0.0.1:9335/json/list")).json()).find((x) => x.type === "page"); } catch {} }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map(); const errors = [];
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") errors.push((m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).split("\n")[0]);
});
const send = (method, params = {}) => new Promise((res) => { const n = ++id; pending.set(n, (m) => res(m.result)); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
const waitFor = async (expr, ms = 15000) => { for (let i = 0; i < ms / 250; i++) { if (await ev(expr)) return true; await sleep(250); } return false; };
const go = async (path) => { await send("Page.navigate", { url: BASE + path }); await sleep(500); await waitFor("document.readyState === 'complete'"); await sleep(700); };
const clickText = (sel, text) => ev(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(sel)})].find((x) => x.innerText.includes(${JSON.stringify(text)})); if (!b) return false; b.click(); return true; })()`);
const count = (text) => ev(`[...document.querySelectorAll('button')].filter((b) => b.innerText.includes(${JSON.stringify(text)})).length`);
let failures = 0;
const ok = (label, cond, extra = "") => (cond || failures++, console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  (" + extra + ")" : ""}`));
await send("Runtime.enable"); await send("Page.enable");
try {
  // ---- player
  await go("/login");
  ok("login page renders demo card", await ev("document.body.innerText.includes('Try as a player')"));
  await clickText("button", "Try as a player");
  ok("player button -> /calendar", await waitFor("location.pathname === '/calendar'"), await ev("location.pathname"));
  // Count active bookings first instead of assuming the seed data.
  await go("/dashboard");
  const activeBefore = await count("Cancel booking");
  await go("/calendar?week=1");
  const before = await count("Book session");
  await clickText("button", "Book session");
  // Wait for the request to finish ("Booking..." gone), not just for the label to change.
  const booked = await waitFor(`!document.body.innerText.includes('Booking...') && [...document.querySelectorAll('button')].filter((b) => b.innerText.includes('Book session')).length === ${before - 1}`);
  ok("book first open slot", booked, `${before} -> ${await count("Book session")} open`);
  await go("/dashboard");
  const active = await count("Cancel booking");
  ok("dashboard shows the new booking", active === activeBefore + 1, `${activeBefore} -> ${active} active bookings`);
  await clickText("button", "Cancel booking");
  ok("cancel booking", await waitFor(`!document.body.innerText.includes('Cancelling...') && [...document.querySelectorAll('button')].filter((b) => b.innerText.includes('Cancel booking')).length === ${active - 1}`));
  await go("/dashboard");
  ok("cancellation persisted", (await count("Cancel booking")) === activeBefore);
  await clickText("button", "Sign out");
  ok("sign out", await waitFor("document.body.innerText.includes('Sign in') && !document.body.innerText.includes('Sign out')"));
  // ---- coach
  await go("/login");
  await clickText("button", "Try as the coach");
  ok("coach button -> /admin", await waitFor("location.pathname === '/admin'"), await ev("location.pathname"));
  const d = new Date(Date.now() + 86400e3).toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const filled = await ev(`(() => {
    const set = (el, v) => { const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    const dt = document.querySelectorAll('input[type=datetime-local]'); if (dt.length < 2) return false;
    set(dt[0], '${d}T10:00'); set(dt[1], '${d}T11:00');
    const loc = [...document.querySelectorAll('label')].find((l) => l.innerText.startsWith('Location')).querySelector('input'); set(loc, 'E2E Test Court');
    return true; })()`);
  await sleep(300);
  await ev("document.querySelector('input[type=datetime-local]').form.requestSubmit()");
  await sleep(4000);
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data } = await admin.from("time_slots").select("id, starts_at").eq("location", "E2E Test Court");
  const pt = data?.[0] && new Date(data[0].starts_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" });
  ok("coach creates slot via form, stored as 10:00 AM Pacific", filled && pt?.endsWith("10:00 AM"), pt ?? "no slot created");
  if (data?.length) await admin.from("time_slots").delete().in("id", data.map((s) => s.id));
} finally {
  console.log(errors.length ? `browser exceptions: ${[...new Set(errors)].join(" || ")}` : "browser exceptions: none");
  ws.close(); chrome.kill();
}
if (failures > 0 || errors.length > 0) process.exit(1);
