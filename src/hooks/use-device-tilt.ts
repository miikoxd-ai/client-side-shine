export type Tilt = { x: number; y: number };

/**
 * Tilt motion detection is disabled.
 * Always returns {0, 0} and never requests device orientation permission.
 */
export function useDeviceTilt(_maxAngle = 30): Tilt {
  return { x: 0, y: 0 };
}
