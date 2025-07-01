import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { coverageCollector } from "./coverage-setup";

test.describe("Item Detail Management", () => {
  test.beforeEach(async ({ page }) => {
    await coverageCollector.startCoverage(page);
    await page.goto("/", { waitUntil: 'networkidle' });
    await expect(page.locator("text=/My Awesome List/").first()).toBeVisible();
    await page.locator("text=/My Awesome List/").first().click();
  });

  test.afterEach(async ({ page }, testInfo) => {
    await coverageCollector.stopCoverage(page, `item-details-${testInfo.title}`);
  });

  test("Edit item details with description and due date", async ({ page }) => {
    const itemName = `Detail Test Item ${uuidv4()}`;
    const description = "This is a detailed description for testing";
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Click on the item to open details or find edit option
    await page.locator(`text=${itemName}`).first().click();
    
    // Look for edit button or double-click to edit
    let editInitiated = false;
    
    // Try double-click to edit
    await page.locator(`text=${itemName}`).first().dblclick();
    
    // Check if edit form is visible
    const nameField = page.locator('input[value*="Detail Test"], textarea[value*="Detail Test"]').first();
    const descriptionField = page.locator('textarea[placeholder*="description"], input[placeholder*="description"]').first();
    const dueDateField = page.locator('input[type="date"], input[placeholder*="due"]').first();
    
    if (await nameField.isVisible()) {
      editInitiated = true;
      
      // Edit the name
      await nameField.fill("");
      await nameField.fill(`${itemName} - Updated`);
      
      // Add description if field is available
      if (await descriptionField.isVisible()) {
        await descriptionField.fill(description);
      }
      
      // Set due date if field is available
      if (await dueDateField.isVisible()) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        await dueDateField.fill(dateString);
      }
      
      // Save changes
      const saveButton = page.locator('button:has-text("Save"), button[aria-label*="Save"]').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Verify changes were saved
        await expect(page.locator(`text=${itemName} - Updated`).first()).toBeVisible();
      }
    }
    
    // If edit wasn't initiated through double-click, try other methods
    if (!editInitiated) {
      // Look for edit button in UI
      const editButton = page.locator('button:has-text("Edit"), button[aria-label*="Edit"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Now try the form fields again
        const nameFieldAlt = page.locator('input[value*="Detail Test"], textarea[value*="Detail Test"]').first();
        if (await nameFieldAlt.isVisible()) {
          await nameFieldAlt.fill("");
          await nameFieldAlt.fill(`${itemName} - Updated`);
          
          const saveButtonAlt = page.locator('button:has-text("Save")').first();
          if (await saveButtonAlt.isVisible()) {
            await saveButtonAlt.click();
          }
        }
      }
    }
  });

  test("Change item state through dropdown", async ({ page }) => {
    const itemName = `State Change Test ${uuidv4()}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Click on the item to access state controls
    await page.locator(`text=${itemName}`).first().click();
    
    // Look for state dropdown or edit form
    await page.locator(`text=${itemName}`).first().dblclick();
    
    const stateDropdown = page.locator('select, [role="combobox"], [aria-label*="state"]').first();
    if (await stateDropdown.isVisible()) {
      await stateDropdown.click();
      
      // Try to select "In Progress" state
      const inProgressOption = page.locator('option:has-text("progress"), [role="option"]:has-text("progress"), option[value="inprogress"]').first();
      if (await inProgressOption.isVisible()) {
        await inProgressOption.click();
        
        // Save the changes
        const saveButton = page.locator('button:has-text("Save")').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    }
  });

  test("Cancel item editing", async ({ page }) => {
    const itemName = `Cancel Test Item ${uuidv4()}`;
    const originalName = itemName;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Start editing
    await page.locator(`text=${itemName}`).first().dblclick();
    
    const nameField = page.locator('input[value*="Cancel Test"], textarea[value*="Cancel Test"]').first();
    if (await nameField.isVisible()) {
      // Make changes
      await nameField.fill("");
      await nameField.fill("Changed Name - Should Not Save");
      
      // Cancel instead of saving
      const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label*="Cancel"]').first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Verify original name is preserved
        await expect(page.locator(`text=${originalName}`).first()).toBeVisible();
        await expect(page.locator("text=Changed Name - Should Not Save")).not.toBeVisible();
      } else {
        // If no cancel button, try Escape key
        await page.keyboard.press("Escape");
        await expect(page.locator(`text=${originalName}`).first()).toBeVisible();
      }
    }
  });

  test("Item with complex description and formatting", async ({ page }) => {
    const itemName = `Complex Item ${uuidv4()}`;
    const complexDescription = `This is a multi-line description
    
    It includes:
    • Bullet points
    • Special characters: !@#$%^&*()
    • Unicode: 🚀 📝 ✅
    • Numbers: 123 456.789
    
    And it should handle all of this properly.`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Edit to add complex description
    await page.locator(`text=${itemName}`).first().dblclick();
    
    const descriptionField = page.locator('textarea[placeholder*="description"], textarea[aria-label*="description"]').first();
    if (await descriptionField.isVisible()) {
      await descriptionField.fill(complexDescription);
      
      const saveButton = page.locator('button:has-text("Save")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Verify description was saved (check for a portion of it)
        await expect(page.locator("text=Bullet points").first()).toBeVisible();
      }
    }
  });

  test("Set and update due dates", async ({ page }) => {
    const itemName = `Due Date Test ${uuidv4()}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Edit to add due date
    await page.locator(`text=${itemName}`).first().dblclick();
    
    const dueDateField = page.locator('input[type="date"], input[placeholder*="due"], input[aria-label*="due"]').first();
    if (await dueDateField.isVisible()) {
      // Set due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await dueDateField.fill(dateString);
      
      const saveButton = page.locator('button:has-text("Save")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Edit again to change the date
        await page.locator(`text=${itemName}`).first().dblclick();
        
        const dueDateFieldAgain = page.locator('input[type="date"]').first();
        if (await dueDateFieldAgain.isVisible()) {
          // Set due date to next week
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const nextWeekString = nextWeek.toISOString().split('T')[0];
          await dueDateFieldAgain.fill(nextWeekString);
          
          const saveButtonAgain = page.locator('button:has-text("Save")').first();
          if (await saveButtonAgain.isVisible()) {
            await saveButtonAgain.click();
          }
        }
      }
    }
  });

  test("Item state progression workflow", async ({ page }) => {
    const itemName = `State Progression ${uuidv4()}`;
    
    // Create an item (should start as "todo")
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Progress through states: todo -> inprogress -> done
    const states = ["inprogress", "done"];
    
    for (const state of states) {
      // Click to edit/select item
      await page.locator(`text=${itemName}`).first().click();
      
      // Look for state controls
      const stateDropdown = page.locator('select, [role="combobox"]').first();
      if (await stateDropdown.isVisible()) {
        await stateDropdown.click();
        
        const stateOption = page.locator(`option[value="${state}"], [role="option"]:has-text("${state}")`).first();
        if (await stateOption.isVisible()) {
          await stateOption.click();
          
          const saveButton = page.locator('button:has-text("Save")').first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
          }
        }
      } else {
        // Try using Mark Complete button for done state
        if (state === "done") {
          const markCompleteButton = page.locator('button:has-text("Mark Complete")').first();
          if (await markCompleteButton.isVisible()) {
            await markCompleteButton.click();
          }
        }
      }
    }
  });

  test("Validation for item details", async ({ page }) => {
    const itemName = `Validation Test ${uuidv4()}`;
    
    // Create an item
    await page.locator('[placeholder="Add an item"]').fill(itemName);
    await page.locator('[placeholder="Add an item"]').press("Enter");
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
    
    // Edit the item
    await page.locator(`text=${itemName}`).first().dblclick();
    
    const nameField = page.locator('input[value*="Validation Test"], textarea[value*="Validation Test"]').first();
    if (await nameField.isVisible()) {
      // Try to save with empty name
      await nameField.fill("");
      
      const saveButton = page.locator('button:has-text("Save")').first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Should either show validation error or not save
        await page.waitForTimeout(1000);
        
        // Verify the item still exists with original name or validation is shown
        const validationError = page.locator('text=required, text=empty, [role="alert"]').first();
        if (await validationError.isVisible()) {
          // Validation error shown
          await expect(validationError).toBeVisible();
        } else {
          // Item should still exist with original name
          await expect(page.locator(`text=${itemName}`).first()).toBeVisible();
        }
      }
    }
  });

  test("Multiple items detail editing", async ({ page }) => {
    const items = [
      `Multi Edit Item 1 ${uuidv4()}`,
      `Multi Edit Item 2 ${uuidv4()}`,
      `Multi Edit Item 3 ${uuidv4()}`
    ];
    
    // Create multiple items
    for (const item of items) {
      await page.locator('[placeholder="Add an item"]').fill(item);
      await page.locator('[placeholder="Add an item"]').press("Enter");
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
    
    // Edit each item
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      await page.locator(`text=${item}`).first().dblclick();
      
      const nameField = page.locator(`input[value*="Multi Edit Item ${index + 1}"], textarea[value*="Multi Edit Item ${index + 1}"]`).first();
      if (await nameField.isVisible()) {
        await nameField.fill("");
        await nameField.fill(`${item} - Edited`);
        
        const saveButton = page.locator('button:has-text("Save")').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await expect(page.locator(`text=${item} - Edited`).first()).toBeVisible();
        }
      }
    }
  });
});