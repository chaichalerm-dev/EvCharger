import { test, expect } from "@playwright/test";

test("searches and recalculates an arbitrary location", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("evatlas.language", "en"));
  await page.route("**/nominatim.openstreetmap.org/search**", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify([{ display_name: "Asok, Bangkok, Thailand", lat: "13.7366", lon: "100.5600" }])
  }));
  await page.goto("/map");
  await expect(page.getByRole("heading", { name: "Find a location" })).toBeVisible();
  await page.getByPlaceholder("Try Bang Na, Asok, Si Racha or an address").fill("Asok");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.locator(".search-results button").first().click();
  await page.locator(".area-input input").fill("600");
  await page.getByRole("button", { name: "5 km", exact: true }).click();
  await expect(page.locator(".result-panel")).toContainText("Asok, Bangkok, Thailand");
  await expect(page.locator(".result-panel")).toContainText("600");
  const selectedMarker = page.locator(".selected-map-marker");
  await expect(selectedMarker).toBeVisible();
  await expect(selectedMarker).toHaveCount(1);
  await expect(selectedMarker).toHaveAttribute("data-latitude", "13.73660");
  const radiusOverlay = page.locator(".analysis-radius-overlay");
  await expect(radiusOverlay).toBeVisible();
  await expect(radiusOverlay).toHaveAttribute("data-radius-km", "5");
  await expect(radiusOverlay.locator("polygon")).toHaveCount(3);
  await expect(radiusOverlay.locator(".analysis-radius-line")).toHaveAttribute("points", /,/);
  await page.locator(".maplibregl-canvas").click({ position: { x: 100, y: 180 } });
  await expect(page.locator(".result-heading")).toContainText("READY TO ANALYZE");
  await expect(selectedMarker).not.toHaveAttribute("data-latitude", "13.73660");
});

test("language and theme controls remain interactive", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".brand")).toHaveAttribute("aria-label", "หน้าหลัก EV Atlas Thailand");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/ev-atlas-electric.svg");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--brand").trim())).toBe("#006fdd");
  await expect(page.getByRole("heading", { name: /มีพื้นที่ในใจ/ })).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("combobox", { name: "โหมดสี" }).selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--brand").trim())).toBe("#4aa8ff");
  await page.getByRole("combobox", { name: "ภาษา" }).selectOption("en");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /Have a location in mind/ })).toBeVisible();
});

test("3D and public location context controls remain usable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("evatlas.language", "en"));
  await page.route("https://tiles.openfreemap.org/**", (route) => route.abort());
  await page.route("**/api/map/buildings**", (route) => route.fulfill({
    contentType: "application/geo+json",
    body: JSON.stringify({
      type: "FeatureCollection",
      features: [
        { type: "Feature", id: "osm-building-101", properties: { osmId: 101, name: "Selected building", heightMeters: 12.4, renderHeightMeters: 22, minHeightMeters: 0, heightSource: "OSM_LEVELS_ESTIMATE", geometrySource: "OSM_FOOTPRINT", selected: true }, geometry: { type: "Polygon", coordinates: [[[100.6355, 13.6679], [100.6359, 13.6679], [100.6359, 13.6683], [100.6355, 13.6683], [100.6355, 13.6679]]] } },
        { type: "Feature", id: "osm-building-102", properties: { osmId: 102, name: "OSM building", heightMeters: 18, renderHeightMeters: 18, minHeightMeters: 0, heightSource: "OSM_HEIGHT", geometrySource: "OSM_FOOTPRINT", selected: false }, geometry: { type: "Polygon", coordinates: [[[100.637, 13.669], [100.6372, 13.669], [100.6372, 13.6692], [100.637, 13.6692], [100.637, 13.669]]] } },
      ],
    }),
  }));
  await page.route("**/api/interpreter", (route) => {
    const isBuildingRequest = route.request().postData()?.includes('way%5B%22building%22%5D') ?? false;
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ elements: isBuildingRequest ? [
        { type: "way", id: 101, tags: { building: "commercial", "building:levels": "4" }, geometry: [{ lat: 13.6679, lon: 100.6355 }, { lat: 13.6679, lon: 100.6359 }, { lat: 13.6683, lon: 100.6359 }, { lat: 13.6683, lon: 100.6355 }, { lat: 13.6679, lon: 100.6355 }] },
        { type: "way", id: 102, tags: { building: "yes", height: "18" }, geometry: [{ lat: 13.669, lon: 100.637 }, { lat: 13.669, lon: 100.6372 }, { lat: 13.6692, lon: 100.6372 }, { lat: 13.6692, lon: 100.637 }] },
      ] : [
        { type: "node", id: 7, lat: 13.668, lon: 100.636, tags: { amenity: "charging_station", name: "Education test charger" } },
        { type: "node", id: 8, lat: 13.669, lon: 100.637, tags: { amenity: "fuel", name: "Education test fuel" } },
        { type: "node", id: 9, lat: 13.671, lon: 100.639, tags: { amenity: "hospital", name: "Education test hospital" } },
      ] })
    });
  });
  await page.route("**/api.open-meteo.com/v1/forecast**", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ current: { temperature_2m: 31, precipitation: 0.2, wind_speed_10m: 8, weather_code: 2 } })
  }));
  await page.route("**/api.open-meteo.com/v1/elevation**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ elevation: [4] }) }));
  await page.route("**/flood-api.open-meteo.com/v1/flood**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ daily: { river_discharge: [2, 3.5, 2.8] } }) }));
  await page.route("**/api.worldpop.org/v2/**", (route) => route.fulfill({
    contentType: "application/json",
    body: route.request().method() === "POST" ? JSON.stringify({ task_id: "e2e-worldpop" }) : JSON.stringify({ status: "success", result: { total_population: 15000, population_density: 5300, area_km2: 3.14, data_year: 2025, data_source: "WorldPop Global 2" } })
  }));

  await page.goto("/map");
  await expect(page.locator(".map-canvas")).toHaveAttribute("data-country", "TH");
  await expect(page.locator(".fallback-map-visual")).toHaveCount(0, { timeout: 15000 });
  await expect(page.locator(".dom-selected")).toHaveCount(0);
  await expect(page.locator(".selected-map-marker")).toHaveCount(1);
  await expect(page.locator(".analysis-radius-overlay")).toHaveCount(1);
  await expect(page.locator(".map-country-badge")).toHaveCount(0);
  await expect(page.locator(".map-instruction")).toHaveCount(0);
  await expect(page.locator(".layer-icon svg")).toHaveCount(7);
  await expect(page.locator(".layer-panel")).toBeVisible();
  await expect(page.locator(".layer-row")).toHaveCount(7);
  const legendToggle = page.getByRole("button", { name: /Symbols/ });
  await expect(legendToggle).toHaveAttribute("aria-expanded", "false");
  await legendToggle.click();
  await expect(legendToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".map-symbol-legend .map-symbol-item")).toHaveCount(7);
  await expect(page.locator(".map-symbol-legend")).toContainText("EV Stations");
  await expect(page.locator(".map-symbol-legend")).toContainText("Gas Stations");
  await expect(page.locator(".map-symbol-legend .map-symbol-item.disabled")).toHaveCount(2);
  await legendToggle.click();
  await expect(page.locator(".map-symbol-legend .map-symbol-item")).toHaveCount(0);
  const threeD = page.locator(".map-3d-btn");
  await expect(threeD).toHaveAttribute("aria-label", "Enable 3D map", { timeout: 15000 });
  await expect(threeD).toHaveText("");
  await expect(page.locator(".map-center-btn")).toHaveAttribute("aria-label", "Center selected point");
  await expect(page.locator(".map-center-btn")).toHaveText("");
  await threeD.click();
  await expect(threeD).toHaveAttribute("aria-pressed", "true");
  await expect(threeD).toHaveAttribute("aria-label", "Switch to 2D map");
  await expect(page.locator(".map-3d-status")).toBeVisible();
  await expect(page.locator(".map-3d-status")).toHaveAttribute("data-3d-status", "READY");
  await expect(page.locator(".map-3d-status")).toHaveAttribute("data-building-count", "2");
  await expect(page.locator(".map-3d-status")).toContainText("2 OSM buildings ready");
  await expect(page.locator(".map-3d-status")).toContainText("one non-overlapping 3D source");
  await expect(page.locator(".map-building-block")).toHaveCount(0);
  await page.getByRole("button", { name: "Analyze this area" }).click();
  await expect(page.locator(".public-api-card")).toContainText("31°C");
  await expect(page.locator(".public-api-card")).toContainText("4 m");
  await expect(page.locator(".public-api-card")).toContainText("3.5 m³/s");
  await expect(page.locator(".public-api-card")).toContainText("not verified parcel-level flood risk");
  await expect(page.locator(".map-entity-marker, .map-entity-cluster")).not.toHaveCount(0);
  await expect(page.locator(".layer-panel")).toContainText("1 item");
});

test("saved dark theme hydrates without breaking controls", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("evatlas.language", "en");
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.getByRole("heading", { name: /มีพื้นที่ในใจ/ })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  expect(pageErrors.filter((message) => message.includes("Hydration failed"))).toEqual([]);
});

test("desktop sidebar can collapse, persist and expand", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Mobile uses the off-canvas navigation drawer");
  await page.addInitScript(() => localStorage.setItem("evatlas.language", "en"));
  await page.goto("/");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("evatlas.sidebarCollapsed"))).toBe("true");
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveClass(/sidebar-collapsed/);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.locator(".app-shell")).not.toHaveClass(/sidebar-collapsed/);
});

test("shows only one sidebar control for each responsive layout", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("evatlas.language", "en"));
  await page.goto("/");
  await expect(page.locator(".sidebar-mobile-close")).toHaveCount(0);

  if (testInfo.project.name === "mobile") {
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeHidden();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("button", { name: "Close navigation" })).toBeVisible();
    await expect(page.locator("#primary-sidebar")).toBeVisible();
    await expect(page.locator("#primary-sidebar")).toHaveCSS("top", "60px");
  } else {
    await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
  }
});

test("sidebar highlights only the current page", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("evatlas.language", "en"));
  await page.goto("/");
  await expect(page.locator(".nav-link.active")).toHaveCount(1);
  await expect(page.locator('.nav-link[href="/"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator('.nav-link[href="/map"]')).not.toHaveClass(/active/);

  await page.goto("/map");
  await expect(page.locator(".nav-link.active")).toHaveCount(1);
  await expect(page.locator('.nav-link[href="/map"]')).toHaveAttribute("aria-current", "page");
});

test("guides a first-time user from home to the next map action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /มีพื้นที่ในใจ/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /เริ่มค้นหาพื้นที่/ }).first()).toBeVisible();
  await expect(page.locator(".onboarding-step")).toHaveCount(3);
  await page.getByRole("link", { name: /เริ่มค้นหาพื้นที่/ }).first().click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(page.locator(".map-journey .journey-step")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "วิเคราะห์พื้นที่นี้" })).toBeVisible();
});
