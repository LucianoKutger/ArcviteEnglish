import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const layoutViewports = [
  {
    name: 'small mobile',
    width: 360,
    height: 800,
  },
  {
    name: 'tablet below desktop breakpoint',
    width: 820,
    height: 1180,
  },
  {
    name: 'desktop breakpoint',
    width: 1024,
    height: 768,
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
  const mobileNavigation = page.locator('#mobile-navigation');

  await page
    .getByRole('button', {
      name: 'Open navigation menu',
    })
    .click();

  await expect(mobileNavigation).toBeVisible();

  await mobileNavigation
    .getByRole('button', {
      name: buttonName,
      exact: true,
    })
    .click();

  await expect(mobileNavigation).toBeHidden();

  await expect(page.locator(`#${sectionId}`)).toBeInViewport({
    timeout: 10_000,
  });
};

test.describe('responsive layout boundaries', () => {
  for (const viewport of layoutViewports) {
    test(`does not overflow horizontally at ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await gotoApp(page);

      await expect(
        page.getByRole('heading', {
          level: 1,
        })
      ).toBeVisible();

      await expectNoHorizontalOverflow(page);
    });
  }

  test('switches from mobile to desktop navigation at 1024 pixels', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 1023,
      height: 900,
    });

    await gotoApp(page);

    const navigation = page.getByRole('navigation');

    const mobileMenuButton = page.getByRole('button', {
      name: 'Open navigation menu',
    });

    await expect(mobileMenuButton).toBeVisible();

    await expect(
      navigation.getByRole('button', {
        name: 'Solutions',
        exact: true,
      })
    ).toHaveCount(0);

    await page.setViewportSize({
      width: 1024,
      height: 900,
    });

    await waitForLayout(page);

    await expect(mobileMenuButton).toBeHidden();

    await expect(
      navigation.getByRole('button', {
        name: 'Solutions',
        exact: true,
      })
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});

test.describe('mobile application flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await gotoApp(page);
  });

  test('keeps the audit form usable on mobile', async ({ page }) => {
    await openMobileSection(page, 'Secure Audit', 'audit');

    const firstNameInput = page.getByLabel('First Name *');

    await expect(firstNameInput).toBeVisible();

    await firstNameInput.fill('Luciano');

    await expect(firstNameInput).toHaveValue('Luciano');

    const submitButton = page.getByRole('button', {
      name: 'Check availability',
    });

    await submitButton.scrollIntoViewIfNeeded();

    await expect(submitButton).toBeInViewport();

    await expectNoHorizontalOverflow(page);
  });

  test('keeps the solution modal inside the viewport and scrolls its content', async ({
    page,
  }) => {
    await openMobileSection(page, 'Solutions', 'protokolle');

    await page
      .getByRole('button', {
        name: 'Open Asynchronous Execution',
      })
      .click();

    const dialog = page.getByRole('dialog', {
      name: 'Asynchronous Execution',
    });

    await expect(dialog).toBeVisible();

    const dialogBox = await dialog.boundingBox();

    expect(dialogBox).not.toBeNull();

    expect(dialogBox.x).toBeGreaterThanOrEqual(-1);

    expect(dialogBox.y).toBeGreaterThanOrEqual(-1);

    expect(dialogBox.x + dialogBox.width).toBeLessThanOrEqual(391);

    expect(dialogBox.y + dialogBox.height).toBeLessThanOrEqual(845);

    const modalContent = dialog.locator('[data-lenis-prevent="true"]');

    await expect(modalContent).toBeVisible();

    const pageScrollBefore = await page.evaluate(() => window.scrollY);

    await modalContent.hover();

    await page.mouse.wheel(0, 600);

    await expect
      .poll(() => modalContent.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);

    const pageScrollAfter = await page.evaluate(() => window.scrollY);

    expect(Math.abs(pageScrollAfter - pageScrollBefore)).toBeLessThanOrEqual(1);

    await dialog
      .getByRole('button', {
        name: 'Close modal',
      })
      .click();

    await expect(dialog).toHaveCount(0);

    await expectNoHorizontalOverflow(page);
  });
});
