"use client";
import { TOKEN_EVENT } from "@/lib/api/client";
import type { WSMessage } from "./types";

type Listener = (msg: WSMessage) => void;
export type WSStatus = "disconnected" | "connecting" | "connected";
type StatusListener = (s: WSStatus) => void;

const MAX_BACKOFF_MS = 30_000;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private reconnectAttempt = 0;
  private shouldReconnect = false;
  private baseUrl = "";
  private url: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private status: WSStatus = "disconnected";
  private tokenChangeListener: (() => void) | null = null;

  private setStatus(next: WSStatus) {
    if (this.status === next) return;
    console.log(`[ws] status → ${next}`);
    this.status = next;
    this.statusListeners.forEach((l) => l(next));
  }

  getStatus(): WSStatus {
    return this.status;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  connect(token: string, baseUrl: string) {
    if (!token) {
      console.warn("[ws] connect() called with empty token — aborting");
      return;
    }
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.url = `${this.baseUrl}/notifications/?token=${encodeURIComponent(token)}`;
    this.shouldReconnect = true;

    // Attach token-change listener once
    if (!this.tokenChangeListener && typeof window !== "undefined") {
      this.tokenChangeListener = () => {
        console.log("[ws] access token changed — reconnecting");
        // If connected, force a clean reconnect so future events use fresh token
        if (this.socket) {
          this.shouldReconnect = false;
          this.socket.close();
          this.socket = null;
          this.shouldReconnect = true;
        }
        this.reconnectAttempt = 0;
        const freshToken = localStorage.getItem("access_token");
        if (freshToken) {
          this.url = `${this.baseUrl}/notifications/?token=${encodeURIComponent(freshToken)}`;
        }
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.open();
      };
      window.addEventListener(TOKEN_EVENT, this.tokenChangeListener);
    }

    this.open();
  }

  private open() {
    if (!this.url) return;
    this.setStatus("connecting");
    console.log("[ws] opening", this.url);

    try {
      this.socket = new WebSocket(this.url);
    } catch (err) {
      console.error("[ws] constructor threw:", err);
      this.setStatus("disconnected");
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      console.log("[ws] open");
      this.setStatus("connected");
    };

    this.socket.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as WSMessage;
        console.log("[ws] message", data.type);
        this.listeners.forEach((l) => l(data));
      } catch {
        // ignore malformed frames
      }
    };

    this.socket.onclose = (evt) => {
      console.log("[ws] close code=", evt.code, "reason=", evt.reason);
      this.setStatus("disconnected");
      this.socket = null;
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    this.socket.onerror = (evt) => {
      console.error("[ws] error", evt);
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const base = Math.min(1000 * Math.pow(2, this.reconnectAttempt), MAX_BACKOFF_MS);
    const jitter = Math.random() * base * 0.2;
    const delay = base + jitter;
    this.reconnectAttempt += 1;
    console.log(`[ws] scheduling reconnect in ${Math.round(delay)}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("[ws] no token in localStorage — stopping reconnect");
        this.shouldReconnect = false;
        return;
      }
      this.url = `${this.baseUrl}/notifications/?token=${encodeURIComponent(token)}`;
      this.open();
    }, delay);
  }

  disconnect() {
    console.log("[ws] disconnect requested");
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.tokenChangeListener && typeof window !== "undefined") {
      window.removeEventListener(TOKEN_EVENT, this.tokenChangeListener);
      this.tokenChangeListener = null;
    }
    this.socket?.close();
    this.socket = null;
    this.setStatus("disconnected");
  }
}

export const wsManager = new WebSocketManager();
