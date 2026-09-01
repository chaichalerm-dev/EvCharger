import { THAILAND_MAP_VIEW } from "@/src/config/geography";
import { OverpassBuildingFootprintProvider } from "@/src/providers/osm-building.provider";

const provider = new OverpassBuildingFootprintProvider();

function coordinate(value: string | null) {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = coordinate(url.searchParams.get("latitude"));
  const longitude = coordinate(url.searchParams.get("longitude"));
  const [[west, south], [east, north]] = THAILAND_MAP_VIEW.bounds;

  if (latitude == null || longitude == null
    || latitude < south || latitude > north
    || longitude < west || longitude > east) {
    return Response.json({ error: "Coordinates must be inside the Thailand map bounds." }, { status: 400 });
  }

  try {
    const collection = await provider.nearby({ latitude, longitude });
    return Response.json(collection, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
        "Content-Type": "application/geo+json; charset=utf-8",
      },
    });
  } catch (error) {
    console.warn("Building API providers unavailable", error);
    return Response.json({ error: "Building data is temporarily unavailable." }, { status: 502 });
  }
}
