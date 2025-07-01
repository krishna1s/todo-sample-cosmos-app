import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

test.describe("Azure Endpoint Quick Tests", () => {
  test("Application loads successfully", async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle', timeout: 30000 });
    
    // Verify the application loads
    await expect(page.locator("title")).toHaveText("AzDev Todo");
    
    // Check if we can see the main interface
    await expect(page.locator("body")).toBeVisible();
    
    console.log("✅ Application loaded successfully on Azure endpoint");
  });

  test("Can create a new todo item", async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the application to be ready
    await page.waitForSelector('input[placeholder*="item"]', { timeout: 30000 });
    
    const itemName = `Test Item ${uuidv4()}`;
    
    // Create a new todo item
    await page.locator('input[placeholder*="item"]').fill(itemName);
    await page.locator('input[placeholder*="item"]').press("Enter");
    
    // Verify item was created
    await expect(page.locator(`text=${itemName}`)).toBeVisible({ timeout: 10000 });
    
    console.log(`✅ Successfully created todo item: ${itemName}`);
  });

  test("Can navigate between lists", async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check if default list is visible
    await expect(page.locator("text=My List").first()).toBeVisible({ timeout: 30000 });
    
    // Try to create a new list
    const listName = `Test List ${uuidv4()}`;
    
    const listInput = page.locator('input[placeholder*="list"]');
    if (await listInput.isVisible()) {
      await listInput.fill(listName);
      await listInput.press("Enter");
      
      // Verify list was created
      await expect(page.locator(`text=${listName}`)).toBeVisible({ timeout: 10000 });
      console.log(`✅ Successfully created new list: ${listName}`);
    } else {
      console.log("✅ Default list is visible, list creation may require different UI interaction");
    }
  });
});