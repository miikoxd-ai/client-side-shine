import { useEffect, useState } from "react";

export type Tilt = { x: number; y: number };

/**
 * Returns normalized device tilt in range [-1, 1] for x (left-right) and y (front-back).
 * Falls back to {0,0} when sensors are unavailable or permission denied.
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

    // iOS 13+ requires permission
    const DOE = (window as unknown as {
      DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
    }).DeviceOrientationEvent;

    if (DOE && typeof DOE.requestPermission === "function") {
      const requestOnGesture = async () => {
        try {
          const res = await DOE.requestPermission!();
          if (res === "granted") attach();
        } catch {
          /* denied */
        }
        window.removeEventListener("click", requestOnGesture);
        window.removeEventListener("touchend", requestOnGesture);
      };
      window.addEventListener("click", requestOnGesture, { once: true });
      window.addEventListener("touchend", requestOnGesture, { once: true });
    } else {
      attach();
    }

    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [maxAngle]);

  return tilt;
}
