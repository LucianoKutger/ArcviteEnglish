import { devices, expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const deviceProfiles = [
  {
    name: 'iPhone 13 portrait',
    descriptor: devices['iPhone 13'],
  },
  {
    name: 'iPhone 13 landscape',
    descriptor: devices['iPhone 13 landscape'],
  },
  {
    name: 'Pixel 5',
    descriptor: devices['Pixel 5'],
  },
  {
    name: 'iPad Mini',
    descriptor: devices['iPad Mini'],
  },
];

const waitForLayout = async (page) => {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      })
  );
};

const expectNoHorizontalOverflow = async (page) => {
  await waitForLayout(page);

  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));

  const widestContent = Math.max(
    dimensions.documentWidth,
    dimensions.bodyWidth
  );

  expect(widestContent).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
};

const openMobileSection = async (page, buttonName, sectionId) => {
  const menuButton = page.getByRole('button', {
    name: 'Open navigation menu',
  });

  await menuButton.tap();

  const mobileNavigation = page.locator('#mobile-navigation');

  await expect(mobileNavigation).toBeVisible();

  await mobileNavigation
    .getByRole('button', {
      name: buttonName,
      exact: true,
    })
    .tap();

  await expect(mobileNavigation).toBeHidden();

  await expect(page.locator(`#${sectionId}`)).toBeInViewport({
    timeout: 10_000,
  });
};

for (const profile of deviceProfiles) {
  const deviceOptions = {
    ...profile.descriptor,
  };

  delete deviceOptions.defaultBrowserType;

  test.describe(profile.name, () => {
    test.use(deviceOptions);

    test('uses the expected mobile device context without layout overflow', async ({
      page,
    }) => {
      await gotoApp(page);

      await expect(
        page.getByRole('heading', {
          level: 1,
        })
      ).toBeVisible();

      expect(page.viewportSize()).toEqual(profile.descriptor.viewport);

      const browserContext = await page.evaluate(() => ({
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        maxTouchPoints: navigator.maxTouchPoints,
        coarsePointer: window.matchMedia('(pointer: coarse)').matches,
      }));

      expect(browserContext.userAgent).toBe(profile.descriptor.userAgent);

      expect(browserContext.devicePixelRatio).toBe(
        profile.descriptor.deviceScaleFactor
      );

      expect(browserContext.maxTouchPoints).toBeGreaterThan(0);
      expect(browserContext.coarsePointer).toBe(true);

      await expect(
        page.getByRole('button', {
          name: 'Open navigation menu',
        })
      ).toBeVisible();

      await expectNoHorizontalOverflow(page);
    });

    test('supports the audit and solution touch flows', async ({ page }) => {
      await gotoApp(page);

      await openMobileSection(page, 'Secure Audit', 'audit');

      const firstNameInput = page.getByLabel('First Name *');

      await firstNameInput.scrollIntoViewIfNeeded();
      await expect(firstNameInput).toBeVisible();

      await firstNameInput.fill('Luciano');
      await expect(firstNameInput).toHaveValue('Luciano');

      const performanceGoal = page.getByRole('button', {
        name: 'Performance & Energy',
      });

      await performanceGoal.scrollIntoViewIfNeeded();
      await performanceGoal.tap();

      await expect(performanceGoal).toHaveAttribute('aria-pressed', 'true');

      await openMobileSection(page, 'Solutions', 'protokolle');

      const solutionButton = page.getByRole('button', {
        name: 'Open Asynchronous Execution',
      });

      await solutionButton.scrollIntoViewIfNeeded();
      await solutionButton.tap();

      const dialog = page.getByRole('dialog', {
        name: 'Asynchronous Execution',
      });

      await expect(dialog).toBeVisible();

      const dialogBox = await dialog.boundingBox();
      const viewport = page.viewportSize();

      expect(dialogBox).not.toBeNull();
      expect(viewport).not.toBeNull();

      expect(dialogBox.x).toBeGreaterThanOrEqual(-1);
      expect(dialogBox.y).toBeGreaterThanOrEqual(-1);

      expect(dialogBox.x + dialogBox.width).toBeLessThanOrEqual(
        viewport.width + 1
      );

      expect(dialogBox.y + dialogBox.height).toBeLessThanOrEqual(
        viewport.height + 1
      );

      await dialog
        .getByRole('button', {
          name: 'Close modal',
        })
        .tap();

      await expect(dialog).toHaveCount(0);

      await expectNoHorizontalOverflow(page);
    });
  });
}
