import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_PHOTON_ENDPOINT, PHOTON_OSM_TAG_GROUPS, PHOTON_RESULT_LIMIT } from "@/src/config/overpass";
import { THAILAND_MAP_VIEW } from "@/src/config/geography";

export const runtime = "nodejs";

const [[minLongitude, minLatitude], [maxLongitude, maxLatitude]] = THAILAND_MAP_VIEW.bounds;
const querySchema = z.object({
  lon: z.coerce.number().min(minLongitude).max(maxLongitude),
  lat: z.coerce.number().min(minLatitude).max(maxLatitude),
  radius: z.coerce.number().int().min(1).max(10),
  osm_tag: z.enum(PHOTON_OSM_TAG_GROUPS),
});

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(requestUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bounded Photon query" }, { status: 400 });
  }

  const upstreamUrl = new URL(DEFAULT_PHOTON_ENDPOINT);
  upstreamUrl.search = new URLSearchParams({
    lon: String(parsed.data.lon),
    lat: String(parsed.data.lat),
    radius: String(parsed.data.radius),
    osm_tag: parsed.data.osm_tag,
    limit: String(PHOTON_RESULT_LIMIT),
    lang: "th",
  }).toString();

  try {
    const response = await fetch(upstreamUrl, {
      headers: { Accept: "application/json", "User-Agent": "EVAtlasThailand/0.9 educational-prototype" },
      signal: AbortSignal.timeout(9_000),
    });
    if (!response.ok) return NextResponse.json({ error: "Photon provider unavailable" }, { status: 502 });
    const payload = await response.json();
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "Photon provider unavailable" }, { status: 502 });
  }
}
