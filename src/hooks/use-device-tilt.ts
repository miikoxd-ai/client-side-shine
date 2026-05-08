import { useEffect, useState } from "react";

export type Tilt = { x: number; y: number };

const PERMISSION_KEY = "vicstate-id:tilt-permission";

type StoredPermission = "granted" | "denied";

function readStoredPermission(): StoredPermission | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(PERMISSION_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeStoredPermission(v: StoredPermission) {
  try {
    window.localStorage.setItem(PERMISSION_KEY, v);
  } catch {
    /* ignore */
  }
}

/**
 * Returns normalized device tilt in range [-1, 1] for x (left-right) and y (front-back).
 * Falls back to {0,0} when sensors are unavailable or permission denied.
 *
 * On iOS, the permission decision is cached in localStorage so the user is
 * only prompted on the first open. Subsequent opens attach the listener
 * immediately without re-prompting.
 */
export function useDeviceTilt(maxAngle = 30): Tilt {
  const [tilt, setTilt] = useState<Tilt>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0; // left/right [-90,90]
      const beta = e.beta ?? 0; // front/back [-180,180]
      const x = Math.max(-1, Math.min(1, gamma / maxAngle));
      const y = Math.max(-1, Math.min(1, (beta - 45) / maxAngle));
      setTilt({ x, y });
    };

    const attach = () => window.addEventListener("deviceorientation", handler, true);

    const DOE = (window as unknown as {
      DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
    }).DeviceOrientationEvent;

    let cleanupGesture: (() => void) | null = null;

    if (DOE && typeof DOE.requestPermission === "function") {
      const stored = readStoredPermission();

      if (stored === "granted") {
        // Permission previously granted — attach immediately, no prompt.
        attach();
        // Some iOS versions still require a gesture-bound request to start
        // delivering events even when previously granted. Do it silently.
        const silentRetry = async () => {
          try {
            const res = await DOE.requestPermission!();
            if (res === "granted") writeStoredPermission("granted");
            else writeStoredPermission(res === "denied" ? "denied" : "granted");
          } catch {
            /* ignore */
          }
          window.removeEventListener("click", silentRetry);
          window.removeEventListener("touchend", silentRetry);
        };
        window.addEventListener("click", silentRetry, { once: true });
        window.addEventListener("touchend", silentRetry, { once: true });
        cleanupGesture = () => {
          window.removeEventListener("click", silentRetry);
          window.removeEventListener("touchend", silentRetry);
        };
      } else if (stored === "denied") {
        // Previously denied — do nothing, don't prompt again.
      } else {
        // First time: prompt on first user gesture.
        const requestOnGesture = async () => {
          try {
            const res = await DOE.requestPermission!();
            if (res === "granted") {
              writeStoredPermission("granted");
              attach();
            } else {
              writeStoredPermission("denied");
            }
          } catch {
            /* denied */
          }
          window.removeEventListener("click", requestOnGesture);
          window.removeEventListener("touchend", requestOnGesture);
        };
        window.addEventListener("click", requestOnGesture, { once: true });
        window.addEventListener("touchend", requestOnGesture, { once: true });
        cleanupGesture = () => {
          window.removeEventListener("click", requestOnGesture);
          window.removeEventListener("touchend", requestOnGesture);
        };
      }
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      cleanupGesture?.();
    };
  }, [maxAngle]);

  return tilt;
}
