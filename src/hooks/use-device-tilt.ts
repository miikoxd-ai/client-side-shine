import { useEffect, useState } from "react";

export type Tilt = { x: number; y: number };

const PERMISSION_KEY = "vicstate-id:tilt-permission";

function readStoredPermission(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(PERMISSION_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeStoredPermission(v: "granted" | "denied") {
  try {
    localStorage.setItem(PERMISSION_KEY, v);
  } catch {
    // ignore
  }
}

/**
 * Returns normalized device tilt in range [-1, 1] for x (left-right) and y (front-back).
 * Falls back to {0,0} when sensors are unavailable or permission denied.
 */
export function useDeviceTilt(maxAngle = 30): Tilt {
  const [tilt, setTilt] = useState<Tilt>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
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
        attach();
        // Silently retry the gesture-bound request to (re)enable sensor on iOS.
        const silentRetry = async () => {
          try {
            await DOE.requestPermission!();
          } catch {
            // ignore
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
        // do nothing
      } else {
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
            writeStoredPermission("denied");
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
