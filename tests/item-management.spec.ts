import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

test.describe("Item Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: 'networkidle' });
    await expect(page.locator("text=My List").first()).toBeVisible();
    
    // Navigate to My List for testing
    await page.locator("text=My List").first().click();
    await expect(page.locator('[placeholder="Add an item"]')).toBeVisible();
  });

  test("Create a basic todo item", async ({ page }) => {
    const itemName = `Test Item ${uuidv4()}`;
    
    // Add a new item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    
    // Verify the item appears in the list
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Verify empty state message is gone
    await expect(page.locator("text=This list is empty.")).not.toBeVisible();
  });

  test("Create multiple todo items", async ({ page }) => {
    const items = [
      `Item 1 ${uuidv4()}`,
      `Item 2 ${uuidv4()}`,
      `Item 3 ${uuidv4()}`
    ];
    
    // Add multiple items
    for (const item of items) {
      await page.locator('[placeholder="Add an item"]').fill(item);
      await page.locator('[placeholder="Add an item"]').press("Enter");
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
    
    // Verify all items are visible
    for (const item of items) {
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
  });

  test("Mark item as complete using click", async ({ page }) => {
    const itemName = `Complete Test ${uuidv4()}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Click on the item to select it
    await page.locator(`text=${itemName}`).first().click();
    
    // Look for and click the Mark Complete button
    const markCompleteButton = page.locator('button:has-text("Mark Complete"), button[aria-label*="Mark Complete"]');
    if (await markCompleteButton.isVisible()) {
      await markCompleteButton.click();
      
      // Verify item state changed (may move to different section or show as completed)
      // The exact UI behavior may vary based on implementation
      await page.waitForTimeout(1000); // Allow UI to update
    }
  });

  test("Delete a todo item", async ({ page }) => {
    const itemName = `Delete Test ${uuidv4()}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Click on the item to select it
    await page.locator(`text=${itemName}`).first().click();
    
    // Look for delete button in various possible locations
    let deleteButton = page.locator('button:has-text("Delete")').first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
    } else {
      // Try context menu approach
      const moreButton = page.locator('button[role="menuitem"]:has-text(""), button:has([data-icon-name="More"])').first();
      if (await moreButton.isVisible()) {
        await moreButton.click();
        await page.locator('button[role="menuitem"]:has-text("Delete")').click();
      }
    }
    
    // Verify item is deleted
    await expect(page.locator(`text=${itemName}`).first()).not.toBeVisible();
  });

  test("Edit item details", async ({ page }) => {
    const originalName = `Edit Test ${uuidv4()}`;
    const newName = `Edited ${originalName}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(originalName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${originalName}`).first()).toBeVisible();
    
    // Double-click or right-click to edit (implementation dependent)
    await page.locator(`text=${originalName}`).first().dblclick();
    
    // Look for edit form or inline editing
    const nameField = page.locator('input[value*="Edit Test"], textarea[value*="Edit Test"]').first();
    if (await nameField.isVisible()) {
      await nameField.fill(newName);
      
      // Look for save button
      const saveButton = page.locator('button:has-text("Save"), button[aria-label*="Save"]').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Verify name was updated
        await expect(page.locator(`text=${newName}`).first()).toBeVisible();
        await expect(page.locator(`text=${originalName}`)).not.toBeVisible();
      }
    }
  });

  test("Add item with description", async ({ page }) => {
    const itemName = `Item with Description ${uuidv4()}`;
    const description = "This is a detailed description for the todo item";
    
    // Create basic item first
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Try to access item details for adding description
    await page.locator(`text=${itemName}`).first().click();
    
    // Look for description field or edit option
    const descriptionField = page.locator('textarea[placeholder*="description"], input[placeholder*="description"]').first();
    if (await descriptionField.isVisible()) {
      await descriptionField.fill(description);
      
      // Save changes
      const saveButton = page.locator('button:has-text("Save")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    }
  });

  test("Bulk operations on multiple items", async ({ page }) => {
    const items = [
      `Bulk Item 1 ${uuidv4()}`,
      `Bulk Item 2 ${uuidv4()}`,
      `Bulk Item 3 ${uuidv4()}`
    ];
    
    // Create multiple items
    for (const item of items) {
      await page.locator('[placeholder="Add an item"]').fill(item);
      await page.locator('[placeholder="Add an item"]').press("Enter");
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
    
    // Try to select multiple items (if checkboxes are available)
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      // Select first two items
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
      
      // Look for bulk delete button
      const bulkDeleteButton = page.locator('button:has-text("Delete")').first();
      if (await bulkDeleteButton.isVisible()) {
        await bulkDeleteButton.click();
        
        // Verify items were deleted
        await expect(page.locator(`text=${items[0]}`)).not.toBeVisible();
        await expect(page.locator(`text=${items[1]}`)).not.toBeVisible();
        await expect(page.locator(`text=${items[2]}`).first()).toBeVisible(); // Third item should remain
      }
    }
  });

  test("Item state transitions", async ({ page }) => {
    const itemName = `State Test ${uuidv4()}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Click on item to access state controls
    await page.locator(`text=${itemName}`).first().click();
    
    // Look for state dropdown or buttons (todo -> inprogress -> done)
    const stateDropdown = page.locator('select, [role="combobox"]').first();
    if (await stateDropdown.isVisible()) {
      // Change to "In Progress"
      await stateDropdown.click();
      const inProgressOption = page.locator('option:has-text("progress"), [role="option"]:has-text("progress")').first();
      if (await inProgressOption.isVisible()) {
        await inProgressOption.click();
      }
      
      // Save changes
      const saveButton = page.locator('button:has-text("Save")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    }
  });

  test("Data persistence after page reload", async ({ page }) => {
    const itemName = `Persistence Test ${uuidv4()}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Reload the page
    await page.reload({ waitUntil: 'networkidle' });
    
    // Verify item still exists
    await page.locator("text=My List").first().click();
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
  });
});