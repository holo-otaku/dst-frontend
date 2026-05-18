import { test, expect, Page } from "@playwright/test";

const REACT_CRASH_PATTERNS = [
  /Element type is invalid/,
  /Objects are not valid as a React child/,
  /Minified React error/,
];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

function reactCrashes(errors: string[]) {
  return errors.filter((e) => REACT_CRASH_PATTERNS.some((p) => p.test(e)));
}

// Fake JWT: sub=1, exp far in the future, wide permissions list
const FAKE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJmcmVzaCI6dHJ1ZSwiaWF0IjoxLCJqdGkiOiJ0ZXN0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxLCJleHAiOjk5OTk5OTk5OTksInBlcm1pc3Npb25zIjpbInNlcmllcy52aWV3IiwicHJvZHVjdC52aWV3IiwiYWNjb3VudC52aWV3Iiwicm9sZS52aWV3IiwiYWN0aXZpdHkudmlldyJdfQ" +
  ".fake-signature";

test.describe("Smoke — unauthenticated", () => {
  test("login page renders without React crash", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Unexpected Application Error!")).not.toBeVisible();
    const crashes = reactCrashes(errors);
    expect(crashes, `React crashes:\n${crashes.join("\n")}`).toHaveLength(0);
  });

  test("root redirects to /login without React crash", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/");
    await page.waitForURL("**/login", { timeout: 5000 });

    await expect(page.getByText("Unexpected Application Error!")).not.toBeVisible();
    const crashes = reactCrashes(errors);
    expect(crashes, `React crashes:\n${crashes.join("\n")}`).toHaveLength(0);
  });
});

test.describe("Smoke — authenticated routes (no API)", () => {
  test.beforeEach(async ({ page }) => {
    // Stub all API/fetch calls so pages don't hard-crash on network errors
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (type === "fetch" || type === "xhr") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [], totalCount: 0 }),
        });
      }
      return route.continue();
    });

    await page.goto("/login");
    await page.evaluate((token) => {
      localStorage.setItem("accessToken", token);
      localStorage.setItem(
        "accessTokenExpiration",
        String(Math.floor(Date.now() / 1000) + 86400 * 30)
      );
    }, FAKE_JWT);
  });

  const ROUTES = [
    // /series renders Management which contains <RingLoader> — the component
    // that was broken by the vite 8 + react-spinners CJS/ESM interop regression.
    { path: "/series", label: "Series Management" },
    { path: "/products", label: "Product Search" },
    { path: "/accounts", label: "Account Search" },
    { path: "/roles", label: "Role Search" },
    { path: "/activity-log", label: "Activity Log" },
  ];

  for (const { path, label } of ROUTES) {
    test(`${label} (${path}) renders without React crash`, async ({ page }) => {
      const errors = watchErrors(page);

      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(300);

      await expect(page.getByText("Unexpected Application Error!")).not.toBeVisible();
      const crashes = reactCrashes(errors);
      expect(
        crashes,
        `[${path}] React crashes:\n${crashes.join("\n")}`
      ).toHaveLength(0);
    });
  }
});
