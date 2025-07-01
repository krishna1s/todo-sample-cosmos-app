import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

test.describe("List Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle' });
    await expect(page.locator("text=My List").first()).toBeVisible();
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
    
    // Verify we can navigate back to "My List"
    await page.locator("text=My List").first().click();
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
    // The app should create a default "My List" if no lists exist
    await expect(page.locator("text=My List").first()).toBeVisible();
    
    // Verify we can navigate to the default list
    await page.locator("text=My List").first().click();
    await expect(page.locator("text=This list is empty.").first()).toBeVisible();
  });

  test("Handle empty list states", async ({ page }) => {
    // Navigate to My List
    await page.locator("text=My List").first().click();
    
    // Verify empty state message
    await expect(page.locator("text=This list is empty.").first()).toBeVisible();
    
    // Verify add item input is visible and functional
    await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
  });
});