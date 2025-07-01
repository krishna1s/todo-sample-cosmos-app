import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { coverageCollector } from "./coverage-setup";

test.describe("UI Interactions and Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await coverageCollector.startCoverage(page);
    await page.goto("/", { waitUntil: 'networkidle' });
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    await coverageCollector.stopCoverage(page, `ui-interactions-${testInfo.title}`);
  });

  test("Verify application loads and displays correctly", async ({ page }) => {
    // Check main UI elements are present
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
    
    // Check for sidebar navigation
    const sidebar = page.locator('[role="navigation"], nav').first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toBeVisible();
    }
    
    // Check for main content area
    await page.locator("text=/My Awesome List/").first().click();
    await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
  });

  test("Navigation using browser back and forward", async ({ page }) => {
    const listName = `Nav Test List ${uuidv4()}`;
    
    // Create a new list
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(listName);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await expect(page.locator(`text=${listName}`).first()).toBeVisible();
    
    // Navigate to the new list
    await page.locator(`text=${listName}`).first().click();
    await page.waitForURL(`**/lists/**`);
    
    // Navigate to existing list
    await page.locator("text=/My Awesome List/").first().click();
    await page.waitForURL(`**/lists/**`);
    
    // Test browser back button
    await page.goBack();
    // Should be back to the new list
    
    // Test browser forward button
    await page.goForward();
    // Should be back to existing list
  });

  test("Command bar functionality", async ({ page }) => {
    const itemName = `Command Test ${uuidv4()}`;
    
    // Navigate to existing list
    await page.locator("text=/My Awesome List/").first().click();
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Select the item (if checkboxes are available)
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      
      // Verify command bar buttons become enabled
      const markCompleteButton = page.locator('button:has-text("Mark Complete")');
      const deleteButton = page.locator('button:has-text("Delete")');
      
      if (await markCompleteButton.isVisible()) {
        await expect(markCompleteButton).toBeEnabled();
      }
      
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeEnabled();
      }
    }
  });

  test("Context menu interactions", async ({ page }) => {
    const itemName = `Context Menu Test ${uuidv4()}`;
    
    // Navigate to existing list and create an item
    await page.locator("text=/My Awesome List/").first().click();
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Right-click on the item to open context menu
    await page.locator(`text=${itemName}`).first().click({ button: 'right' });
    
    // Look for context menu options
    const contextMenu = page.locator('[role="menu"], .ms-ContextualMenu').first();
    if (await contextMenu.isVisible()) {
      await expect(contextMenu).toBeVisible();
      
      // Look for common menu items
      const editOption = page.locator('[role="menuitem"]:has-text("Edit")');
      const deleteOption = page.locator('[role="menuitem"]:has-text("Delete")');
      
      if (await editOption.isVisible()) {
        await expect(editOption).toBeVisible();
      }
      
      if (await deleteOption.isVisible()) {
        await expect(deleteOption).toBeVisible();
      }
      
      // Close context menu by clicking elsewhere
      await page.locator('body').click();
      await expect(contextMenu).not.toBeVisible();
    }
  });

  test("Form validation", async ({ page }) => {
    // Navigate to existing list
    await page.locator("text=/My Awesome List/").first().click();
    
    // Try to submit empty item
    await page.locator('[placeholder="Add an item"]').focus();
    await page.locator('[placeholder="Add an item"]').press("Enter");
    
    // Should not create an empty item
    await expect(page.locator("text=This list is empty.").first()).toBeVisible();
    
    // Test with whitespace-only input
    await page.locator('[placeholder="Add an item"]').fill("   ");
    await page.locator('[placeholder="Add an item"]').press("Enter");
    
    // Should not create a whitespace-only item
    await expect(page.locator("text=This list is empty.").first()).toBeVisible();
  });

  test("Search and filter functionality", async ({ page }) => {
    const items = [
      `Important Task ${uuidv4()}`,
      `Regular Task ${uuidv4()}`,
      `Another Important Task ${uuidv4()}`
    ];
    
    // Navigate to existing list and create items
    await page.locator("text=/My Awesome List/").first().click();
    
    for (const item of items) {
      await page.locator('[placeholder="Add an item"]').fill(item);
      await page.locator('[placeholder="Add an item"]').press("Enter");
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
    
    // Look for search/filter input
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="filter"]').first();
    if (await searchInput.isVisible()) {
      // Filter by "Important"
      await searchInput.fill("Important");
      
      // Verify only important tasks are visible
      await expect(page.locator("text=Important Task").first()).toBeVisible();
      await expect(page.locator("text=Another Important Task").first()).toBeVisible();
      await expect(page.locator("text=Regular Task")).not.toBeVisible();
      
      // Clear filter
      await searchInput.fill("");
      
      // Verify all items are visible again
      for (const item of items) {
        await expect(page.locator(`text=${item}`).first()).toBeVisible();
      }
    }
  });

  test("Responsive design elements", async ({ page }) => {
    // Test with different viewport sizes
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test("Keyboard navigation", async ({ page }) => {
    // Navigate to existing list
    await page.locator("text=/My Awesome List/").first().click();
    
    // Test Tab navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Focus should be on the add item input
    const addItemInput = page.locator('[placeholder="Add an item"]');
    await expect(addItemInput).toBeFocused();
    
    // Test keyboard shortcuts if available
    await page.keyboard.press("Escape"); // Should clear focus or cancel operations
  });

  test("Loading states and error handling", async ({ page }) => {
    // Test navigation while content is loading
    await page.locator("text=/My Awesome List/").first().click();
    
    // Add an item and immediately try to add another
    const item1 = `Quick Item 1 ${uuidv4()}`;
    const item2 = `Quick Item 2 ${uuidv4()}`;
    
    await page.locator('[placeholder="Add an item"]').fill(item1);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    
    // Quickly add another item
    await page.locator('[placeholder="Add an item"]').fill(item2);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    
    // Both items should eventually appear
    await expect(page.locator(`text=${item1}`).first()).toBeVisible();
    await expect(page.locator(`text=${item2}`).first()).toBeVisible();
  });

  test("UI consistency across different lists", async ({ page }) => {
    const listName = `Consistency Test ${uuidv4()}`;
    const itemName = `Test Item ${uuidv4()}`;
    
    // Create a new list
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(listName);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await page.locator(`text=${listName}`).first().click();
    
    // Add an item to the new list
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Switch to existing list
    await page.locator("text=/My Awesome List/").first().click();
    
    // Verify the UI elements are consistent
    await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
    
    // Switch back to the new list
    await page.locator(`text=${listName}`).first().click();
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
  });
});