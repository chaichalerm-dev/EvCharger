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
  await page.locator(".maplibregl-canvas").click({ position: { x: 100, y: 180 } });
  await expect(page.locator(".result-heading")).toContainText("READY TO ANALYZE");
});

test("language and theme controls remain interactive", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await expect(page.getByRole("heading", { name: /มีพื้นที่ในใจ/ })).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("combobox", { name: "โหมดสี" }).selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("combobox", { name: "ภาษา" }).selectOption("en");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /Have a location in mind/ })).toBeVisible();
});

test("3D and public location context controls remain usable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("evatlas.language", "en"));
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
  await page.route("**/api.worldpop.org/v2/**", (route) => route.fulfill({
    contentType: "application/json",
    body: route.request().method() === "POST" ? JSON.stringify({ task_id: "e2e-worldpop" }) : JSON.stringify({ status: "success", result: { total_population: 15000, population_density: 5300, area_km2: 3.14, data_year: 2025, data_source: "WorldPop Global 2" } })
  }));

  await page.goto("/map");
  await expect(page.locator(".map-canvas")).toHaveAttribute("data-country", "TH");
  await expect(page.locator(".map-country-badge")).toContainText("Thailand coverage");
  await expect(page.locator(".layer-icon svg")).toHaveCount(7);
  await expect(page.locator(".map-symbol-legend .map-symbol-item")).toHaveCount(5);
  await expect(page.locator(".map-symbol-legend")).toContainText("EV Stations");
  await expect(page.locator(".map-symbol-legend")).toContainText("Gas Stations");
  const threeD = page.locator(".map-3d-btn");
  await expect(threeD).toHaveText("3D", { timeout: 15000 });
  await expect(threeD).toHaveAttribute("title", /Mapterhorn terrain/);
  await threeD.click();
  await expect(threeD).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".map-3d-status")).toBeVisible();
  await expect(page.locator(".map-3d-status")).toHaveAttribute("data-3d-status", /LOADING|READY|TERRAIN_ONLY|UNAVAILABLE/);
  await page.getByRole("button", { name: "Analyze this area" }).click();
  await expect(page.locator(".public-api-card")).toContainText("31°C");
  await expect(page.locator(".public-api-card")).toContainText("4 m");
  await expect(page.locator(".public-api-card")).toContainText("3.5 m³/s");
  await expect(page.locator(".public-api-card")).toContainText("not verified parcel-level flood risk");
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
