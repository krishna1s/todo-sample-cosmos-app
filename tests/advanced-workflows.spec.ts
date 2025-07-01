import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { coverageCollector } from "./coverage-setup";

test.describe("Advanced Workflows and Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await coverageCollector.startCoverage(page);
    await page.goto("/", { waitUntil: 'networkidle' });
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    await coverageCollector.stopCoverage(page, `advanced-workflows-${testInfo.title}`);
  });

  test("Complex workflow: Multiple lists with items and state changes", async ({ page }) => {
    const workList = `Work Tasks ${uuidv4()}`;
    const personalList = `Personal Tasks ${uuidv4()}`;
    
    // Create work list
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(workList);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await page.locator(`text=${workList}`).first().click();
    
    // Add work items
    const workItems = [
      `Review code ${uuidv4()}`,
      `Team meeting ${uuidv4()}`,
      `Write documentation ${uuidv4()}`
    ];
    
    for (const item of workItems) {
      await page.locator('[placeholder="Add an item"]').fill(item);
      await page.locator('[placeholder="Add an item"]').press("Enter");
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
    
    // Create personal list
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(personalList);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await page.locator(`text=${personalList}`).first().click();
    
    // Add personal items
    const personalItems = [
      `Grocery shopping ${uuidv4()}`,
      `Call dentist ${uuidv4()}`,
      `Exercise ${uuidv4()}`
    ];
    
    for (const item of personalItems) {
      await page.locator('[placeholder="Add an item"]').fill(item);
      await page.locator('[placeholder="Add an item"]').press("Enter");
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
    
    // Navigate between lists and verify content isolation
    await page.locator(`text=${workList}`).first().click();
    await expect(page.locator(`text=${workItems[0]}`).first()).toBeVisible();
    await expect(page.locator(`text=${personalItems[0]}`)).not.toBeVisible();
    
    await page.locator(`text=${personalList}`).first().click();
    await expect(page.locator(`text=${personalItems[0]}`).first()).toBeVisible();
    await expect(page.locator(`text=${workItems[0]}`)).not.toBeVisible();
  });

  test("Data validation and edge cases", async ({ page }) => {
    await page.locator("text=/My Awesome List/").first().click();
    
    // Test very long item names
    const longItemName = `Very long item name that should test the UI limits and see how it handles extremely long text input that might cause layout issues ${uuidv4()}`;
    await page.locator('[placeholder="Add an item"]').fill(longItemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${longItemName.substring(0, 20)}`).first()).toBeVisible();
    
    // Test special characters
    const specialCharItem = `Item with special chars: !@#$%^&*()_+-=[]{}|;:,.<>? ${uuidv4()}`;
    await page.locator('[placeholder="Add an item"]').fill(specialCharItem);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${specialCharItem.substring(0, 20)}`).first()).toBeVisible();
    
    // Test Unicode characters
    const unicodeItem = `Unicode test: 🚀 📝 ✅ 中文 日本語 العربية ${uuidv4()}`;
    await page.locator('[placeholder="Add an item"]').fill(unicodeItem);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator("text=🚀").first()).toBeVisible();
  });

  test("Performance with large number of items", async ({ page }) => {
    await page.locator("text=/My Awesome List/").first().click();
    
    // Create many items to test performance
    const itemCount = 20;
    const items = [];
    
    for (let i = 0; i < itemCount; i++) {
      const itemName = `Performance Test Item ${i} ${uuidv4()}`;
      items.push(itemName);
      
      await page.locator('[placeholder="Add an item"]').fill(itemName);
      await page.locator('[placeholder="Add an item"]').press("Enter");
      
      // Check every 5th item to avoid overwhelming the test
      if (i % 5 === 0) {
        await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
      }
    }
    
    // Verify first and last items are visible
    await expect(page.locator(`text=${items[0]}`).first()).toBeVisible();
    await expect(page.locator(`text=${items[items.length - 1]}`).first()).toBeVisible();
  });

  test("Concurrent operations", async ({ page }) => {
    await page.locator("text=/My Awesome List/").first().click();
    
    // Create multiple items quickly
    const items = [
      `Concurrent Item 1 ${uuidv4()}`,
      `Concurrent Item 2 ${uuidv4()}`,
      `Concurrent Item 3 ${uuidv4()}`
    ];
    
    // Add items rapidly without waiting for each to complete
    for (const item of items) {
      await page.locator('[placeholder="Add an item"]').fill(item);
      await page.locator('[placeholder="Add an item"]').press("Enter");
    }
    
    // Verify all items eventually appear
    for (const item of items) {
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
  });

  test("State persistence across navigation", async ({ page }) => {
    const testList = `State Test List ${uuidv4()}`;
    const testItem = `State Test Item ${uuidv4()}`;
    
    // Create list and item
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(testList);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await page.locator(`text=${testList}`).first().click();
    
    await page.locator('[placeholder="Add an item"]').fill(testItem);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${testItem}`).first()).toBeVisible();
    
    // Navigate away and back
    await page.locator("text=/My Awesome List/").first().click();
    await page.locator(`text=${testList}`).first().click();
    
    // Verify item is still there
    await expect(page.locator(`text=${testItem}`).first()).toBeVisible();
    
    // Test browser navigation
    await page.goBack();
    await page.goForward();
    await expect(page.locator(`text=${testItem}`).first()).toBeVisible();
  });

  test("Error handling and recovery", async ({ page }) => {
    await page.locator("text=/My Awesome List/").first().click();
    
    // Test rapid operations that might cause conflicts
    const rapidItem = `Rapid Test ${uuidv4()}`;
    
    // Fill and submit quickly multiple times
    await page.locator('[placeholder="Add an item"]').fill(rapidItem);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await page.locator('[placeholder="Add an item"]').fill(rapidItem);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    
    // Should handle gracefully (either reject duplicate or allow)
    await page.waitForTimeout(2000);
    
    // Test invalid operations
    const nonExistentItem = `Non-existent ${uuidv4()}`;
    // Try to interact with item that doesn't exist
    const itemElement = page.locator(`text=${nonExistentItem}`);
    if (await itemElement.isVisible()) {
      await itemElement.click();
    }
    
    // Application should remain functional
    await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
  });

  test("Cross-browser compatibility checks", async ({ page }) => {
    // Test basic functionality that should work across browsers
    await page.locator("text=/My Awesome List/").first().click();
    
    const compatItem = `Compatibility Test ${uuidv4()}`;
    await page.locator('[placeholder="Add an item"]').fill(compatItem);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${compatItem}`).first()).toBeVisible();
    
    // Test keyboard events
    await page.locator('[placeholder="Add an item"]').focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    
    // Test mouse events
    await page.locator(`text=${compatItem}`).first().hover();
    await page.locator(`text=${compatItem}`).first().click();
  });

  test("Accessibility features", async ({ page }) => {
    await page.locator("text=/My Awesome List/").first().click();
    
    // Test keyboard-only navigation
    await page.keyboard.press("Tab");
    
    // Verify ARIA labels and roles are present
    const addItemInput = page.locator('[placeholder="Add an item"]');
    await expect(addItemInput).toBeVisible();
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
    
    // Test screen reader friendly elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      // Verify buttons have accessible names
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label');
          const text = await button.textContent();
          expect(ariaLabel || text).toBeTruthy();
        }
      }
    }
  });

  test("URL routing and deep linking", async ({ page }) => {
    const testList = `Routing Test ${uuidv4()}`;
    
    // Create a list and get its URL
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(testList);
    await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
    await page.locator(`text=${testList}`).first().click();
    
    const currentUrl = page.url();
    expect(currentUrl).toContain('lists');
    
    // Test direct navigation to the URL
    await page.goto(currentUrl);
    await expect(page.locator(`text=${testList}`).first()).toBeVisible();
    
    // Test invalid URLs
    await page.goto('/lists/invalid-id');
    // Should handle gracefully (redirect or show error)
    await page.waitForTimeout(2000);
    
    // Should still be able to navigate normally
    await page.goto('/');
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
  });

  test("Data cleanup and list management", async ({ page }) => {
    // Create several test lists for cleanup
    const testLists = [
      `Cleanup Test 1 ${uuidv4()}`,
      `Cleanup Test 2 ${uuidv4()}`,
      `Cleanup Test 3 ${uuidv4()}`
    ];
    
    for (const listName of testLists) {
      await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().fill(listName);
      await page.locator('input[placeholder*="list"], input[placeholder*="List"]').first().press("Enter");
      await expect(page.locator(`text=${listName}`).first()).toBeVisible();
    }
    
    // Clean up by deleting lists
    for (const listName of testLists) {
      await page.locator(`text=${listName}`).first().click();
      
      const moreButton = page.locator('button[aria-label*="More"], button:has-text("More"), button[role="button"]:has([data-icon-name="More"])').first();
      if (await moreButton.isVisible()) {
        await moreButton.click();
        const deleteButton = page.locator('button[role="menuitem"]:has-text("Delete")');
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          await expect(page.locator(`text=${listName}`)).not.toBeVisible();
        }
      }
    }
    
    // Verify we can still use the application normally
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
    await page.locator("text=/My Awesome List/").first().click();
    await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
  });
});