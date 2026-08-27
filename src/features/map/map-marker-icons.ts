import type { Map as MapLibreMap } from "maplibre-gl";

type MarkerGlyphNode =
  | { type: "path"; d: string }
  | { type: "circle"; cx: number; cy: number; radius: number };

/**
 * Lucide pictogram geometry rasterized into MapLibre images at runtime.
 * This keeps symbols fixed-size, provider-independent, and consistent with
 * the Lucide icons used in the layer controls and visible map legend.
 */
const MAP_MARKER_GLYPHS: Record<string, { color: string; nodes: MarkerGlyphNode[] }> = {
  "marker-ev": { color: "#087a5b", nodes: [{ type: "path", d: "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" }] },
  "marker-competitor": { color: "#d84f45", nodes: [
    { type: "path", d: "M10 12h4" }, { type: "path", d: "M10 8h4" }, { type: "path", d: "M14 21v-3a2 2 0 0 0-4 0v3" },
    { type: "path", d: "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" }, { type: "path", d: "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" }
  ] },
  "marker-gas": { color: "#c68100", nodes: [
    { type: "path", d: "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5" },
    { type: "path", d: "M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16" }, { type: "path", d: "M2 21h13" }, { type: "path", d: "M3 9h11" }
  ] },
  "marker-poi": { color: "#3478c7", nodes: [
    { type: "path", d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" },
    { type: "circle", cx: 12, cy: 10, radius: 3 }
  ] },
  "marker-partner": { color: "#8850ad", nodes: [
    { type: "path", d: "m11 17 2 2a1 1 0 1 0 3-3" }, { type: "path", d: "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" },
    { type: "path", d: "m21 3 1 11h-2" }, { type: "path", d: "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" }, { type: "path", d: "M3 4h8" }
  ] },
  "marker-opportunity": { color: "#086b51", nodes: [
    { type: "circle", cx: 12, cy: 12, radius: 9 }, { type: "circle", cx: 12, cy: 12, radius: 5 }, { type: "circle", cx: 12, cy: 12, radius: 1.5 }
  ] },
  "marker-cluster": { color: "#334b43", nodes: [
    { type: "path", d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" },
    { type: "path", d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" }, { type: "path", d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" }
  ] },
  "marker-selected": { color: "#064c3a", nodes: [
    { type: "circle", cx: 12, cy: 12, radius: 9 }, { type: "circle", cx: 12, cy: 12, radius: 4 }, { type: "circle", cx: 12, cy: 12, radius: 1 }
  ] }
};

export function registerMapMarkerImages(map: MapLibreMap) {
  const pixelRatio = 2;
  const displaySize = 38;
  Object.entries(MAP_MARKER_GLYPHS).forEach(([id, glyph]) => {
    if (map.hasImage(id)) return;
    const canvas = document.createElement("canvas");
    canvas.width = displaySize * pixelRatio;
    canvas.height = displaySize * pixelRatio;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(pixelRatio, pixelRatio);
    context.beginPath();
    context.roundRect(1.5, 1.5, displaySize - 3, displaySize - 3, 10);
    context.fillStyle = glyph.color;
    context.fill();
    context.strokeStyle = "rgba(255,255,255,.96)";
    context.lineWidth = 2;
    context.stroke();
    context.save();
    context.translate(7, 7);
    context.strokeStyle = "#fff";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    glyph.nodes.forEach((node) => {
      if (node.type === "path") context.stroke(new Path2D(node.d));
      else {
        context.beginPath();
        context.arc(node.cx, node.cy, node.radius, 0, Math.PI * 2);
        context.stroke();
      }
    });
    context.restore();
    map.addImage(id, context.getImageData(0, 0, canvas.width, canvas.height), { pixelRatio });
  });
}
