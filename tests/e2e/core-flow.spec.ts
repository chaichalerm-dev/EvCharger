import { test, expect } from "@playwright/test";

test("searches and recalculates an arbitrary location", async ({ page }) => {
  await page.goto("/map");
  await expect(page.getByRole("heading", { name: "Find & analyze a location" })).toBeVisible();
  await page.getByPlaceholder("Try Bang Na, Asok, Si Racha or an address").fill("Asok");
  await page.locator(".search-results button").first().click();
  await page.locator(".area-input input").fill("600");
  await page.getByRole("button", { name: "5 km", exact: true }).click();
  await expect(page.locator(".result-panel")).toContainText("600 m²");
  await expect(page.locator(".result-panel")).toContainText("EV HUB");
  await page.locator(".maplibregl-canvas").click({ position: { x: 100, y: 180 } });
  await expect(page.locator(".result-heading")).toContainText("Estimated");
});

test("language and theme controls remain interactive", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("combobox").first().selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("combobox").nth(1).selectOption("th");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "แดชบอร์ดผู้บริหาร" })).toBeVisible();
});

test("3D and public location context controls remain usable", async ({ page }) => {
  await page.route("**/overpass-api.de/api/interpreter", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ elements: [{ type: "node", id: 7, lat: 13.668, lon: 100.636, tags: { amenity: "charging_station", name: "Education test charger" } }] })
  }));
  await page.route("**/api.open-meteo.com/v1/forecast**", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ current: { temperature_2m: 31, precipitation: 0.2, wind_speed_10m: 8, weather_code: 2 } })
  }));
  await page.route("**/api.open-meteo.com/v1/elevation**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ elevation: [4] }) }));
  await page.route("**/flood-api.open-meteo.com/v1/flood**", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ daily: { river_discharge: [2, 3.5, 2.8] } }) }));

  await page.goto("/map");
  const threeD = page.locator(".map-3d-btn");
  await expect(threeD).toHaveText("3D");
  await threeD.click();
  await expect(threeD).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Check this area" }).click();
  await expect(page.locator(".public-api-card")).toContainText("31°C");
  await expect(page.locator(".public-api-card")).toContainText("4 m");
  await expect(page.locator(".public-api-card")).toContainText("3.5 m³/s");
  await expect(page.locator(".public-api-card")).toContainText("not verified parcel-level flood risk");
});
