/**
 * Integration Test Server Helper
 *
 * Starts the Express HTTP server on a random OS-assigned port.
 * stopTestServer() forcefully destroys all open handles:
 *   - HTTP server (closes all connections)
 *   - MySQL connection
 *   - Redis client
 * This is necessary so node:test's event-loop drain does not hang.
 */
import http from "node:http";
import server from "../../src/app.ts";
import connection from "../../src/db/connection.ts";
import redisClient from "../../src/redis/redis.ts";

let runningServer: http.Server | null = null;
let _baseUrl = "";

/**
 * Start the HTTP server on a random port. Call in a `before()` hook.
 */
export async function startTestServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    runningServer = server.listen(0, () => {
      const addr = runningServer!.address() as { port: number };
      _baseUrl = `http://localhost:${addr.port}`;
      resolve(_baseUrl);
    });
    runningServer.on("error", reject);
  });
}

/**
 * Stop the server and destroy all open handles.
 * Call in an `after()` hook.
 */
export async function stopTestServer(): Promise<void> {
  return new Promise((resolve) => {
    // 1. Close HTTP server (stops accepting new connections)
    if (runningServer) {
      // closeAllConnections() is Node 18.2+ — kills keep-alive sockets
      (runningServer as any).closeAllConnections?.();
      runningServer.close(() => {
        // 2. Destroy MySQL connection so its socket releases
        try { connection.destroy(); } catch {}
        // 3. Quit Redis so its socket releases
        try { redisClient.disconnect(); } catch {}
        resolve();
      });
    } else {
      try { connection.destroy(); } catch {}
      try { redisClient.disconnect(); } catch {}
      resolve();
    }
  });
}

export function baseUrl() {
  return _baseUrl;
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

const TIMEOUT_MS = 8000;

export async function getJson(path: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${_baseUrl}${path}`, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function postJson(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${_baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function patchJson(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`; 
  const res = await fetch(`${_baseUrl}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function deleteJson(path: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${_baseUrl}${path}`, {
    method: "DELETE",
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}
