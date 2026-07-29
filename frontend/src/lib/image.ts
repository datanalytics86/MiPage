/** Shared image helpers for photo-first UI and Lighthouse-friendly loading. */

/**
 * Tiny dark gold-tinted blur placeholder (avoids CLS, soft dark premium feel).
 * Safe for client + server bundles (no Node Buffer).
 */
export const DARK_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDE2IDI0Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBzdG9wLWNvbG9yPSIjMTQxNDE2Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMUMxQzIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjI0IiBmaWxsPSJ1cmwoI2cpIi8+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjI0IiBmaWxsPSIjQzlBOTYyIiBvcGFjaXR5PSIwLjA2Ii8+PC9zdmc+'

/** @deprecated use DARK_BLUR_DATA_URL */
export const DARK_BLUR_DATA_URL_CLIENT = DARK_BLUR_DATA_URL
