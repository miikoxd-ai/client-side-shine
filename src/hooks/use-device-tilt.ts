import { useEffect, useState } from "react";

export type Tilt = { x: number; y: number };

const PERMISSION_KEY = "vicstate-id:tilt-permission";

function readStoredPermission(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(PERMISSION_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeStoredPermission(v: "granted" | "denied") {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERMISSION_KEY, v);
  } catch {
    /* ignore */
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

    let gestureHandler: (() => void) | null = null;

    if (DOE && typeof DOE.requestPermission === "function") {
      const stored = readStoredPermission();

      if (stored === "denied") {
        // Don't prompt again
      } else if (stored === "granted") {
        attach();
        // Silent gesture-bound retry to ensure events flow
        gestureHandler = async () => {
          try {
            await DOE.requestPermission!();
          } catch {
            /* ignore */
          }
          if (gestureHandler) {
            window.removeEventListener("click", gestureHandler);
            window.removeEventListener("touchend", gestureHandler);
          }
        };
        window.addEventListener("click", gestureHandler, { once: true });
        window.addEventListener("touchend", gestureHandler, { once: true });
      } else {
        gestureHandler = async () => {
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
          if (gestureHandler) {
            window.removeEventListener("click", gestureHandler);
            window.removeEventListener("touchend", gestureHandler);
          }
        };
        window.addEventListener("click", gestureHandler, { once: true });
        window.addEventListener("touchend", gestureHandler, { once: true });
      }
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      if (gestureHandler) {
        window.removeEventListener("click", gestureHandler);
        window.removeEventListener("touchend", gestureHandler);
      }
    };
  }, [maxAngle]);

  return tilt;
}
