/**
 * GrabTV Client SDK (sandbox build)
 * Implements the integration contract in docs/GRABTV_CLIENT.md against a
 * locally-hosted /api/telemetry endpoint instead of the production CDN/API.
 */

export {};

declare global {
  interface Window {
    programId?: string;
    measurementId?: string;
    sessionToken?: string;
    generateProgramIdHash: (programId: string) => string | null;
    generateSessionToken: (apiKey: string, apiSecret: string) => Promise<string>;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const PROGRAM_ID_PATTERN = /^[a-zA-Z0-9_-]{7,44}$/;

function validateProgramId(programId: string): boolean {
  if (!programId || /\s/.test(programId)) return false;
  return PROGRAM_ID_PATTERN.test(programId);
}

// Deterministic, non-cryptographic hash (FNV-1a) — same input always maps to
// the same programUID, which is what lets a catalog join on it later.
function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

window.generateProgramIdHash = (programId: string): string | null => {
  if (!validateProgramId(programId)) {
    console.error(
      '[GrabTV SDK] Invalid programId: must be 7-44 chars, alphanumeric/dash/underscore only, no spaces.'
    );
    return null;
  }
  return `prg_${fnv1aHash(programId)}`;
};

window.generateSessionToken = (apiKey: string, apiSecret: string): Promise<string> => {
  return fetch('/api/session-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, apiSecret }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Session token request failed: ${res.status}`);
      return res.json();
    })
    .then((data: { token: string }) => {
      window.sessionToken = data.token;
      return data.token;
    })
    .catch((err) => {
      console.error('[GrabTV SDK] Authorization failed:', err);
      throw err;
    });
};

interface TelemetryPayload {
  programUID: string;
  leftPercent: number;
  topPercent: number;
  leftPixels: number;
  topPixels: number;
  currentTime: number;
  clientViewportWidth: number;
  clientViewportHeight: number;
  authToken?: string;
}

function findVideoElement(): HTMLVideoElement | null {
  const byId = document.getElementById('target-video');
  if (byId instanceof HTMLVideoElement) return byId;

  const byClass = document.querySelector('video.target-video');
  if (byClass instanceof HTMLVideoElement) return byClass;

  const all = document.querySelectorAll('video');
  return all.length > 0 ? (all[all.length - 1] as HTMLVideoElement) : null;
}

function findClickHandler(): HTMLElement | null {
  const byTag = document.querySelector('click-handler');
  if (byTag instanceof HTMLElement) return byTag;

  const byId = document.getElementById('click-handler');
  if (byId instanceof HTMLElement) return byId;

  const byClass = document.querySelector('.click-handler');
  if (byClass instanceof HTMLElement) return byClass;

  return null;
}

function enforceDomPlacement(video: HTMLVideoElement, handler: HTMLElement): void {
  if (video.nextElementSibling !== handler) {
    video.insertAdjacentElement('afterend', handler);
  }
}

// Accounts for letterboxing/pillarboxing under object-fit: contain so
// percentages stay relative to the actual video frame, not the element box.
function getVideoContentRect(video: HTMLVideoElement): DOMRect {
  const rect = video.getBoundingClientRect();
  const videoRatio = video.videoWidth / video.videoHeight;
  if (!videoRatio || !isFinite(videoRatio)) return rect;

  const elRatio = rect.width / rect.height;
  if (elRatio > videoRatio) {
    const width = rect.height * videoRatio;
    return new DOMRect(rect.left + (rect.width - width) / 2, rect.top, width, rect.height);
  }
  const height = rect.width / videoRatio;
  return new DOMRect(rect.left, rect.top + (rect.height - height) / 2, rect.width, height);
}

function positionOverlay(video: HTMLVideoElement, handler: HTMLElement): void {
  const rect = video.getBoundingClientRect();
  Object.assign(handler.style, {
    position: 'absolute',
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '2147483647',
    pointerEvents: 'auto',
  });
}

function loadGoogleAnalytics(measurementId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onload = () => {
      window.gtag!('event', 'page_view');
      window.dispatchEvent(
        new CustomEvent('grabtv:ga-hit', { detail: { type: 'page_view', measurementId } })
      );
      resolve();
    };
    script.onerror = () => reject(new Error('Google Analytics unreachable'));
    document.head.appendChild(script);
  });
}

function initGrabTvSdk(): void {
  if (!window.programId) {
    console.error('[GrabTV SDK] window.programId is not defined. Exiting.');
    return;
  }

  const video = findVideoElement();
  if (!video) {
    console.error('[GrabTV SDK] No target <video> element found in DOM. Exiting.');
    return;
  }

  const handler = findClickHandler();
  if (!handler) {
    console.error('[GrabTV SDK] No click-handler element found in DOM. Exiting.');
    return;
  }

  enforceDomPlacement(video, handler);
  positionOverlay(video, handler);

  const resync = () => positionOverlay(video, handler);
  window.addEventListener('resize', resync);
  window.addEventListener('scroll', resync, true);
  if ('ResizeObserver' in window) {
    new ResizeObserver(resync).observe(video);
  }

  let sandboxReady = false;
  if (window.measurementId) {
    loadGoogleAnalytics(window.measurementId)
      .then(() => {
        sandboxReady = true;
      })
      .catch((err) => console.error('[GrabTV SDK] Sandbox mode disabled:', err));
  }

  let latestCurrentTime = 0;
  const startPolling = () => {
    const poll = () => {
      latestCurrentTime = video.currentTime;
      requestAnimationFrame(poll);
    };
    poll();
  };

  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    startPolling();
  } else {
    video.addEventListener('canplay', startPolling, { once: true });
  }

  handler.addEventListener('click', (event: MouseEvent) => {
    const contentRect = getVideoContentRect(video);
    if (contentRect.width === 0 || contentRect.height === 0) return;

    const leftPixels = event.clientX - contentRect.left;
    const topPixels = event.clientY - contentRect.top;
    const leftPercent = Math.round((leftPixels / contentRect.width) * 10000) / 100;
    const topPercent = Math.round((topPixels / contentRect.height) * 10000) / 100;

    const payload: TelemetryPayload = {
      programUID: window.programId!,
      leftPercent: Math.min(100, Math.max(0, leftPercent)),
      topPercent: Math.min(100, Math.max(0, topPercent)),
      leftPixels: Math.round(leftPixels * 100) / 100,
      topPixels: Math.round(topPixels * 100) / 100,
      currentTime: Math.round(latestCurrentTime * 100) / 100,
      clientViewportWidth: window.innerWidth,
      clientViewportHeight: window.innerHeight,
    };
    if (window.sessionToken) payload.authToken = window.sessionToken;

    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('[GrabTV SDK] Telemetry POST failed:', err));

    window.dispatchEvent(new CustomEvent('grabtv:telemetry', { detail: payload }));

    if (sandboxReady && window.gtag) {
      window.gtag('event', 'click_telemetry', payload);
      window.dispatchEvent(
        new CustomEvent('grabtv:ga-hit', {
          detail: { type: 'click_telemetry', measurementId: window.measurementId },
        })
      );
    }
  });

  window.dispatchEvent(new CustomEvent('grabtv:ready'));
}

if (document.readyState === 'complete') {
  initGrabTvSdk();
} else {
  window.addEventListener('load', initGrabTvSdk);
}
