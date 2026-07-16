import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const appOrigin = 'http://127.0.0.1:3000';

const routes = [
  {
    path: '/',
    heading: 'Your medical',
  },
  {
    path: '/impressum',
    heading: 'Impressum',
  },
  {
    path: '/datenschutz',
    heading: 'Datenschutz Filler',
  },
  {
    path: '/studies',
    heading: 'Hier kommen die Studien',
  },
];

const isApplicationUrl = (url) => {
  try {
    return new URL(url).origin === new URL(appOrigin).origin;
  } catch {
    return false;
  }
};

const waitForBrowserSettled = async (page) => {
  await page.waitForLoadState('load');

  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      })
  );
};

const monitorBrowserHealth = (page) => {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const errorResponses = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    consoleErrors.push(message.text());
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  page.on('requestfailed', (request) => {
    if (!isApplicationUrl(request.url())) {
      return;
    }

    failedRequests.push({
      url: request.url(),
      method: request.method(),
      error: request.failure()?.errorText ?? 'Unknown request failure',
    });
  });

  page.on('response', (response) => {
    if (!isApplicationUrl(response.url())) {
      return;
    }

    if (response.status() < 400) {
      return;
    }

    errorResponses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
    });
  });

  return {
    consoleErrors,
    pageErrors,
    failedRequests,
    errorResponses,
  };
};

const expectHealthyBrowser = (health) => {
  expect(
    health.consoleErrors,
    `Browser console errors:\n${health.consoleErrors.join('\n')}`
  ).toEqual([]);

  expect(
    health.pageErrors,
    `Uncaught page errors:\n${health.pageErrors.join('\n')}`
  ).toEqual([]);

  expect(
    health.failedRequests,
    `Failed application requests:\n${JSON.stringify(
      health.failedRequests,
      null,
      2
    )}`
  ).toEqual([]);

  expect(
    health.errorResponses,
    `Application HTTP errors:\n${JSON.stringify(
      health.errorResponses,
      null,
      2
    )}`
  ).toEqual([]);
};

test.describe('browser runtime health', () => {
  for (const route of routes) {
    test(`loads ${route.path} without browser errors`, async ({ page }) => {
      const health = monitorBrowserHealth(page);

      await gotoApp(page, route.path);

      await expect(
        page.getByRole('heading', {
          level: 1,
        })
      ).toContainText(route.heading);

      await waitForBrowserSettled(page);

      expectHealthyBrowser(health);
    });
  }

  test('remains functional after repeated reloads', async ({ page }) => {
    await gotoApp(page);

    const navigation = page.getByRole('navigation');

    const mainContent = page.getByRole('main');

    const heading = page.getByRole('heading', {
      level: 1,
    });

    await expect(navigation).toBeVisible();

    await expect(mainContent).toBeVisible();

    await expect(heading).toContainText('Your medical');

    for (let reload = 0; reload < 2; reload += 1) {
      await page.reload({
        waitUntil: 'domcontentloaded',
      });

      await expect(page).toHaveURL(/\/$/);

      await expect(navigation).toBeVisible();

      await expect(mainContent).toBeVisible();

      await expect(heading).toContainText('Your medical');
    }
  });
});

test.describe('application image health', () => {
  test('loads all visible home-page images successfully', async ({ page }) => {
    test.setTimeout(60_000);

    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);

    const images = page.locator('img:visible');

    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);

    for (let index = 0; index < imageCount; index += 1) {
      const image = images.nth(index);

      await image.scrollIntoViewIfNeeded();

      await expect
        .poll(() => image.evaluate((element) => element.complete), {
          message: `Image ${index + 1} did not finish loading`,
        })
        .toBe(true);

      const imageState = await image.evaluate((element) => ({
        source: element.currentSrc || element.src,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight,
      }));

      expect(
        imageState.naturalWidth,
        `Broken image: ${imageState.source}`
      ).toBeGreaterThan(0);

      expect(
        imageState.naturalHeight,
        `Image has no height: ${imageState.source}`
      ).toBeGreaterThan(0);
    }
  });
});
