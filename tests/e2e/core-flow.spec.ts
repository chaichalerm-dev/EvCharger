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
