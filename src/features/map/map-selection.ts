export type MapSelectionOrigin = "MAP" | "SEARCH";

/**
 * Search results may be outside the current viewport, so selecting one should
 * move the camera. A direct map click is already visible and must keep the
 * current viewport stable so the pin remains where the user clicked.
 */
export function shouldRecenterForSelection(origin: MapSelectionOrigin) {
  return origin === "SEARCH";
}
