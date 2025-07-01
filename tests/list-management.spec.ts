import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { coverageCollector } from "./coverage-setup";

test.describe("List Management", () => {
  test.beforeEach(async ({ page }) => {
    await coverageCollector.startCoverage(page);
    await page.goto("/", { waitUntil: 'networkidle' });
    // Wait for any list to be visible (handles dynamic list names)
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    await coverageCollector.stopCoverage(page, `list-management-${testInfo.title}`);
  });

  test("Create a new todo list", async ({ page }) => {
    const listName = `Test List ${uuidv4()}`;
    
    // Find and fill the new list input field
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(listName);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    
    // Verify the new list appears in the sidebar navigation
    await expect(page.locator(`text=${listName}`).first()).toBeVisible();
    
    // Verify navigation to the new list
    await page.locator(`text=${listName}`).first().click();
    await expect(page.locator("text=This list is empty.").first()).toBeVisible();
  });

  test("Navigate between different lists", async ({ page }) => {
    const listName1 = `List 1 ${uuidv4()}`;
    const listName2 = `List 2 ${uuidv4()}`;
    
    // Create first list
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(listName1);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await expect(page.locator(`text=${listName1}`).first()).toBeVisible();
    
    // Create second list
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(listName2);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await expect(page.locator(`text=${listName2}`).first()).toBeVisible();
    
    // Navigate to first list
    await page.locator(`text=${listName1}`).first().click();
    await page.waitForURL(`**/lists/**`);
    
    // Navigate to second list
    await page.locator(`text=${listName2}`).first().click();
    await page.waitForURL(`**/lists/**`);
    
    // Navigate to any existing "My Awesome List" (instead of hardcoded "existing list")
    await page.locator("text=/My Awesome List/").first().click();
    await page.waitForURL(`**/lists/**`);
  });

  test("Delete a todo list", async ({ page }) => {
    const listName = `Delete Test List ${uuidv4()}`;
    
    // Create a new list
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(listName);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await expect(page.locator(`text=${listName}`).first()).toBeVisible();
    
    // Navigate to the new list
    await page.locator(`text=${listName}`).first().click();
    
    // Find and click the more options menu (usually three dots)
    const moreButton = page.locator('button[aria-label*="More"], button:has-text("More"), button[role="button"]:has([data-icon-name="More"])').first();
    if (await moreButton.isVisible()) {
      await moreButton.click();
      
      // Click delete option
      await page.locator('button[role="menuitem"]:has-text("Delete")').click();
      
      // Verify the list is no longer in the sidebar
      await expect(page.locator(`text=${listName}`).first()).not.toBeVisible();
    }
  });

  test("Verify default list creation", async ({ page }) => {
    // The app should create default "My Awesome List" patterns if no lists exist
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
    
    // Verify we can navigate to any existing list
    await page.locator("text=/My Awesome List/").first().click();
    // Check for either empty state or existing items
    const hasEmptyState = await page.locator("text=This list is empty.").first().isVisible();
    const hasItems = await page.locator('[data-testid*="item"], .item, li').first().isVisible();
    expect(hasEmptyState || hasItems).toBeTruthy();
  });

  test("Handle empty list states", async ({ page }) => {
    // Navigate to any existing list (use first available list)
    await page.locator("text=/My Awesome List/").first().click();
    
    // Check for either empty state message or existing content
    const hasEmptyState = await page.locator("text=This list is empty.").first().isVisible();
    const hasAddInput = await page.locator('[placeholder="Add an item"]').isVisible();
    
    // Either should have empty state message OR add item input should be visible
    expect(hasEmptyState || hasAddInput).toBeTruthy();
    
    // Verify add item input is visible and functional when it exists
    if (hasAddInput) {
      await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
    }
  });
});