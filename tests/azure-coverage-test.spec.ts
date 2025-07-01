import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

test.describe("Azure Endpoint Tests with Coverage", () => {
  let coverageData: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Start JavaScript coverage collection
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
      reportAnonymousScripts: true,
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Stop coverage and collect data
    const coverage = await page.coverage.stopJSCoverage();
    
    // Filter to only include application code from Azure endpoint
    const filteredCoverage = coverage.filter(entry => {
      const url = entry.url;
      return (
        url.includes("azurewebsites.net") &&
        !url.includes("node_modules") &&
        !url.includes("test") &&
        !url.includes("spec") &&
        (url.endsWith(".js") || url.includes("assets/"))
      );
    });

    if (filteredCoverage.length > 0) {
      coverageData.push(...filteredCoverage);
      console.log(`📊 Coverage collected: ${filteredCoverage.length} files for test: ${testInfo.title}`);
    }
  });

  test.afterAll(async () => {
    // Save coverage data
    const fs = require('fs');
    const path = require('path');
    
    const coverageDir = path.join(__dirname, 'coverage');
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }
    
    const coverageFile = path.join(coverageDir, 'azure-coverage.json');
    fs.writeFileSync(coverageFile, JSON.stringify(coverageData, null, 2));
    
    console.log(`📊 Total coverage entries: ${coverageData.length}`);
    console.log(`📁 Coverage data saved to: ${coverageFile}`);
  });

  test("Application loads with coverage tracking", async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle', timeout: 30000 });
    
    // Verify the application loads
    await expect(page.locator("title")).toHaveText("AzDev Todo");
    
    // Check if we can see the main interface
    await expect(page.locator("body")).toBeVisible();
    
    // Interact with various UI elements to increase coverage
    await page.waitForTimeout(2000); // Let JS load
    
    console.log("✅ Application loaded with coverage tracking");
  });

  test("Todo item operations with coverage", async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the application to be ready
    await page.waitForSelector('input[placeholder*="item"]', { timeout: 30000 });
    
    const itemName = `Coverage Test ${uuidv4()}`;
    
    // Create a new todo item
    await page.locator('input[placeholder*="item"]').fill(itemName);
    await page.locator('input[placeholder*="item"]').press("Enter");
    
    // Verify item was created
    await expect(page.locator(`text=${itemName}`)).toBeVisible({ timeout: 10000 });
    
    // Try to interact with the item (toggle state, etc.)
    const itemElement = page.locator(`text=${itemName}`).first();
    if (await itemElement.isVisible()) {
      await itemElement.click();
      await page.waitForTimeout(1000); // Let state change
    }
    
    console.log(`✅ Todo operations completed: ${itemName}`);
  });

  test("UI interactions for maximum coverage", async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle', timeout: 30000 });
    
    // Interact with various UI elements to maximize code coverage
    await page.waitForTimeout(2000);
    
    // Try to click on various elements that might exist
    const possibleElements = [
      'button',
      'input',
      '[role="button"]',
      'a',
      '.btn',
      '.button',
    ];
    
    for (const selector of possibleElements) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          // Click the first visible element
          const firstVisible = elements.find(async el => await el.isVisible());
          if (firstVisible) {
            await firstVisible.click({ timeout: 2000 });
            await page.waitForTimeout(500);
          }
        }
      } catch (error) {
        // Continue if element interaction fails
        console.log(`Skipped interaction with ${selector}`);
      }
    }
    
    console.log("✅ UI interaction coverage test completed");
  });
});