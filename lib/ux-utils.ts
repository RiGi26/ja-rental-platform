/**
 * Trigger a short haptic vibration on supported mobile browsers.
 * Safe to call on desktop — navigator.vibrate is a no-op there.
 */
export function triggerHaptic(ms = 10) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms)
  }
}
