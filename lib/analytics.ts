
export type TrackEventPayload = {
  event_name: string;

  // Compatible con el lambda actual de eventos (requiere session_id salvo referral_visit)
  session_id?: string;

  // En el lambda actual se llama "platform"
  platform?: string;

  page?: string;
  ts?: string;
  meta?: Record<string, any>;
};

export function trackEvent(payload: TrackEventPayload): void {
  try {
    if (!payload.session_id && payload.event_name !== "referral_visit") {
  return;
}
    const body = JSON.stringify({
      ...payload,
      ts: payload.ts ?? new Date().toISOString(),
      page:
        payload.page ??
        (typeof window !== "undefined" ? window.location.pathname : undefined),
    });

    // Prefer sendBeacon
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }

    // Fallback: fetch keepalive
    if (typeof fetch === "function") {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // best-effort only
  }
}
