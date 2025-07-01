import { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Coverage collection utilities for Playwright tests
 */

export interface CoverageOptions {
  enabled: boolean;
  resetOnNavigation?: boolean;
  reportAnonymousScripts?: boolean;
}

export class CoverageCollector {
  private coverageDir: string;
  private options: CoverageOptions;

  constructor(options: CoverageOptions = { enabled: false }) {
    this.options = options;
    this.coverageDir = path.join(__dirname, "coverage");
    
    // Ensure coverage directory exists
    if (this.options.enabled && !fs.existsSync(this.coverageDir)) {
      fs.mkdirSync(this.coverageDir, { recursive: true });
    }
  }

  /**
   * Start coverage collection for a page
   */
  async startCoverage(page: Page): Promise<void> {
    if (!this.options.enabled) return;

    await page.coverage.startJSCoverage({
      resetOnNavigation: this.options.resetOnNavigation ?? true,
      reportAnonymousScripts: this.options.reportAnonymousScripts ?? true,
    });
  }

  /**
   * Stop coverage collection and save results
   */
  async stopCoverage(page: Page, testName: string): Promise<void> {
    if (!this.options.enabled) return;

    const coverage = await page.coverage.stopJSCoverage();
    
    // Filter coverage to only include application code (not test files, node_modules, etc.)
    const filteredCoverage = coverage.filter(entry => {
      const url = entry.url;
      return (
        url.includes("localhost:3000") &&
        !url.includes("node_modules") &&
        !url.includes("test") &&
        !url.includes("spec") &&
        !url.includes("coverage") &&
        !url.includes("playwright") &&
        (url.endsWith(".js") || url.endsWith(".ts") || url.endsWith(".tsx") || url.endsWith(".jsx"))
      );
    });

    if (filteredCoverage.length > 0) {
      const coverageFile = path.join(this.coverageDir, `${testName.replace(/[^a-z0-9]/gi, '_')}_coverage.json`);
      fs.writeFileSync(coverageFile, JSON.stringify(filteredCoverage, null, 2));
      console.log(`Coverage data saved to: ${coverageFile}`);
    }
  }

  /**
   * Merge all coverage files into a single report
   */
  async generateReport(): Promise<void> {
    if (!this.options.enabled) return;

    const coverageFiles = fs.readdirSync(this.coverageDir)
      .filter(file => file.endsWith('_coverage.json'))
      .map(file => path.join(this.coverageDir, file));

    if (coverageFiles.length === 0) {
      console.log("No coverage data found");
      return;
    }

    // Merge all coverage data
    const mergedCoverage: any[] = [];
    for (const file of coverageFiles) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      mergedCoverage.push(...data);
    }

    // Save merged coverage
    const mergedFile = path.join(this.coverageDir, 'merged-coverage.json');
    fs.writeFileSync(mergedFile, JSON.stringify(mergedCoverage, null, 2));
    
    console.log(`Merged coverage data saved to: ${mergedFile}`);
    console.log(`Total coverage entries: ${mergedCoverage.length}`);
  }
}

// Global coverage collector instance
export const coverageCollector = new CoverageCollector({
  enabled: process.env.COVERAGE === 'true',
  resetOnNavigation: true,
  reportAnonymousScripts: true,
});