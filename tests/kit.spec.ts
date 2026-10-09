import { expect, test, type Locator, type Page } from "@playwright/test";

// Every /kit page whole, then the states a whole-page shot can't show: hovers,
// open dialogs, opened text. Elements are found by role and text, not class,
// so the shots survive changes to the markup underneath. A state shot centers
// its element in the viewport and takes the viewport.

const PAGES = ["home", "events", "blog", "about", "partnerships", "404"] as const;

async function open(page: Page, key: string) {
  // Nothing outside the dev server loads (Substack's signup form), so every
  // run draws the same
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
  await page.goto(`/kit/${key}`);
  // PageReveal clears this once hydrated, with fonts and pictures in
  await page.waitForSelector("html:not([data-loading])");
}

// Holds SVG animations (the boils and redraws) on their first frame
async function freeze(page: Page) {
  await page.evaluate(() => {
    for (const svg of document.querySelectorAll("svg")) {
      svg.pauseAnimations();
      svg.setCurrentTime(0);
    }
  });
}

async function center(locator: Locator) {
  await locator.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
}

// Moves the mouse onto the element, even one that lets pointer events through
// to a link underneath (as on the featured event card)
async function hover(page: Page, locator: Locator) {
  await center(locator);
  const box = await locator.boundingBox();
  if (!box) throw new Error("Nothing to hover");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

async function shot(page: Page, name: string, fullPage = false) {
  await freeze(page);
  // The nav and the fade under it are fixed to the viewport, so in a whole
  // page they'd sit over the middle of it; the viewport shots cover them
  if (fullPage) {
    await page.evaluate(() => {
      for (const el of document.querySelectorAll<HTMLElement>("body *")) {
        if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
      }
    });
  }
  // Soft, so a test's later shots are still compared after one differs
  await expect.soft(page).toHaveScreenshot(`${name}.png`, {
    fullPage,
    mask: [page.locator("iframe")],
  });
}

const navBar = (page: Page) => page.locator("nav:not([aria-label])");
const footer = (page: Page) => page.locator("footer");

test.describe("pages", () => {
  for (const key of PAGES) {
    test(key, async ({ page }) => {
      await open(page, key);
      await shot(page, `${key}-top`);
      await shot(page, key, true);
    });
  }
});

test.describe("open states", () => {
  test("events: tickets dialog", async ({ page }) => {
    await open(page, "events");
    await page.getByRole("button", { name: "Get Tickets" }).click();
    await page.getByRole("dialog").waitFor();
    await shot(page, "events-tickets-dialog");
  });

  test("events: read more", async ({ page }) => {
    await open(page, "events");
    await page.getByRole("button", { name: "Read more" }).click();
    await center(page.getByRole("button", { name: "Show less" }));
    await shot(page, "events-read-more");
  });

  test("events: faq open", async ({ page }) => {
    await open(page, "events");
    const question = page.getByText("Screenings", { exact: true });
    await question.click();
    await page.waitForTimeout(500);
    await center(question);
    await shot(page, "events-faq-open");
  });

  test("blog: read more", async ({ page }) => {
    await open(page, "blog");
    await page.getByRole("button", { name: "Read more" }).click();
    await center(page.getByRole("button", { name: "Show less" }));
    await shot(page, "blog-read-more");
  });

  test("blog: subscribe dialog", async ({ page }) => {
    await open(page, "blog");
    await page.getByRole("button", { name: "Subscribe", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    await shot(page, "blog-subscribe-dialog");
  });

  test("about: faq open", async ({ page }) => {
    await open(page, "about");
    const question = page.getByText("Does it cost anything?");
    await question.click();
    await page.waitForTimeout(500);
    await center(question);
    await shot(page, "about-faq-open");
  });

  test("home: more menu", async ({ page }) => {
    await open(page, "home");
    await navBar(page).getByRole("button", { name: "More" }).click();
    await page.getByRole("dialog").waitFor();
    await shot(page, "home-more-menu");
  });
});

// Keyboard focus rings: cream on page colors, rust on cream, wider round
// posters. Focused from script with no pointer used, which Chromium treats
// as keyboard focus.
test.describe("focus", () => {
  test.skip(({ isMobile }) => isMobile, "The same rings as on desktop");

  const focuses: {
    key: (typeof PAGES)[number];
    name: string;
    target: (page: Page) => Locator;
  }[] = [
    { key: "events", name: "corner-action", target: (p) => p.getByRole("button", { name: "Get Tickets" }) },
    { key: "events", name: "event-tile", target: (p) => p.getByRole("link", { name: /Paris, Texas/ }) },
    { key: "events", name: "read-more", target: (p) => p.getByRole("button", { name: "Read more" }) },
    { key: "events", name: "faq-question", target: (p) => p.locator("summary").first() },
    { key: "blog", name: "subscribe", target: (p) => p.getByRole("button", { name: "Subscribe", exact: true }) },
    { key: "blog", name: "post-tile", target: (p) => p.getByRole("link", { name: /keep going back/ }) },
    { key: "about", name: "link-card", target: (p) => p.getByRole("link", { name: /strangers together/ }) },
    { key: "home", name: "outline-link", target: (p) => p.getByRole("link", { name: "View all" }) },
    { key: "home", name: "card-corner-link", target: (p) => p.getByRole("link", { name: "More about us" }) },
    { key: "home", name: "partner-button", target: (p) => p.getByRole("link", { name: "Partner with us" }) },
    { key: "home", name: "follow-button", target: (p) => p.getByRole("link", { name: "Follow us on Letterboxd" }) },
    { key: "home", name: "poster", target: (p) => p.getByRole("img", { name: "Past Lives" }).locator("xpath=ancestor::a[1]") },
    { key: "home", name: "footer-subscribe", target: (p) => p.getByRole("button", { name: "Subscribe to our newsletter" }) },
  ];

  for (const { key, name, target } of focuses) {
    test(`${key}: ${name}`, async ({ page }) => {
      await open(page, key);
      const element = target(page);
      await center(element);
      await element.focus();
      await shot(page, `${key}-focus-${name}`);
    });
  }

  test("events: dialog close", async ({ page }) => {
    await open(page, "events");
    // Opened from the keyboard, so the close button's focus shows
    await page.getByRole("button", { name: "Get Tickets" }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: "Close" }).focus();
    await shot(page, "events-focus-dialog-close");
  });
});

// Only where a pointer can hover
test.describe("hovers", () => {
  test.skip(({ isMobile }) => isMobile, "Phones don't hover");

  const hovers: {
    key: (typeof PAGES)[number];
    name: string;
    target: (page: Page) => Locator;
  }[] = [
    // The footer has a Home link too
    { key: "events", name: "home-link", target: (p) => p.getByRole("link", { name: "Home", exact: true }).first() },
    { key: "events", name: "featured-card", target: (p) => p.getByRole("heading", { name: /In the Mood for Love/ }) },
    { key: "events", name: "corner-action", target: (p) => p.getByRole("button", { name: "Get Tickets" }) },
    { key: "events", name: "event-tile", target: (p) => p.getByRole("link", { name: /Paris, Texas/ }) },
    { key: "events", name: "faq-question", target: (p) => p.getByText("Screenings", { exact: true }) },
    { key: "events", name: "read-more", target: (p) => p.getByRole("button", { name: "Read more" }) },
    { key: "blog", name: "subscribe", target: (p) => p.getByRole("button", { name: "Subscribe", exact: true }) },
    { key: "blog", name: "post-tile", target: (p) => p.getByRole("link", { name: /keep going back/ }) },
    { key: "about", name: "link-card", target: (p) => p.getByRole("link", { name: /strangers together/ }) },
    { key: "partnerships", name: "tag-link", target: (p) => p.getByRole("link", { name: "AFI Silver" }) },
    { key: "partnerships", name: "text-link", target: (p) => p.getByRole("link", { name: "Download our press kit" }) },
    { key: "home", name: "outline-link", target: (p) => p.getByRole("link", { name: "View all" }) },
    { key: "home", name: "markdown-link", target: (p) => p.getByRole("link", { name: "Come to an event" }) },
    { key: "home", name: "card-corner-link", target: (p) => p.getByRole("link", { name: "More about us" }) },
    { key: "home", name: "partner-button", target: (p) => p.getByRole("link", { name: "Partner with us" }) },
    // The first Instagram link on home is the hero's
    { key: "home", name: "hero-social", target: (p) => p.locator('a[href="https://www.instagram.com/dcmovieclub/"]').first() },
    { key: "home", name: "follow-button", target: (p) => p.getByRole("link", { name: "Follow us on Letterboxd" }) },
    { key: "home", name: "poster", target: (p) => p.getByRole("img", { name: "Past Lives" }) },
    { key: "home", name: "footer-subscribe", target: (p) => p.getByRole("button", { name: "Subscribe to our newsletter" }) },
    { key: "home", name: "footer-link", target: (p) => footer(p).getByRole("link", { name: "Blog" }) },
    { key: "home", name: "footer-social", target: (p) => footer(p).getByRole("link", { name: "Instagram" }) },
    { key: "home", name: "nav-item", target: (p) => navBar(p).getByRole("link", { name: "Events" }) },
    { key: "home", name: "nav-logo", target: (p) => navBar(p).getByRole("link", { name: "DC Movie Club" }) },
  ];

  for (const { key, name, target } of hovers) {
    test(`${key}: ${name}`, async ({ page }) => {
      await open(page, key);
      await hover(page, target(page));
      await shot(page, `${key}-hover-${name}`);
    });
  }
});
