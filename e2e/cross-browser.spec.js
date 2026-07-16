import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const monitorBrowserErrors = (page) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  return {
    consoleErrors,
    pageErrors,
  };
};

test.describe('cross-browser smoke coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });
  });

  test('loads the home page and critical visual elements', async ({
    page,
    browserName,
  }) => {
    const browserErrors = monitorBrowserErrors(page);

    await gotoApp(page);

    await expect(
      page.getByRole('heading', {
        level: 1,
      })
    ).toContainText('Your medical');

    await expect(page.getByRole('navigation')).toBeVisible();

    const canvas = page.locator('canvas').first();

    await expect(canvas).toBeVisible();

    await expect
      .poll(() =>
        canvas.evaluate((element) => ({
          width: element.width,
          height: element.height,
        }))
      )
      .toEqual({
        width: expect.any(Number),
        height: expect.any(Number),
      });

    const canvasDimensions = await canvas.evaluate((element) => ({
      width: element.width,
      height: element.height,
    }));

    expect(
      canvasDimensions.width,
      `${browserName}: canvas width`
    ).toBeGreaterThan(0);

    expect(
      canvasDimensions.height,
      `${browserName}: canvas height`
    ).toBeGreaterThan(0);

    expect(
      browserErrors.consoleErrors,
      `${browserName} console errors:\n${browserErrors.consoleErrors.join('\n')}`
    ).toEqual([]);

    expect(
      browserErrors.pageErrors,
      `${browserName} page errors:\n${browserErrors.pageErrors.join('\n')}`
    ).toEqual([]);
  });

  test('supports audit navigation, validation, and form controls', async ({
    page,
  }) => {
    await gotoApp(page);

    await page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Secure Audit',
        exact: true,
      })
      .click();

    const auditSection = page.locator('#audit');

    await expect(auditSection).toBeInViewport({
      timeout: 10_000,
    });

    await page
      .getByRole('button', {
        name: 'Check availability',
      })
      .click();

    await expect(
      page.getByText(/Please provide the following:/i)
    ).toBeVisible();

    const firstNameInput = page.getByLabel('First Name *');

    await firstNameInput.fill('Luciano');
    await expect(firstNameInput).toHaveValue('Luciano');

    const countrySelect = page.getByLabel('Phone country code');

    await countrySelect.selectOption('+43');
    await expect(countrySelect).toHaveValue('+43');

    const phoneInput = page.getByLabel('Phone Number *');

    await phoneInput.fill('0664 abc 123-45');
    await expect(phoneInput).toHaveValue('066412345');

    const goalButton = page.getByRole('button', {
      name: 'Performance & Energy',
    });

    await goalButton.click();

    await expect(goalButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('navigates from a solution modal to related studies', async ({
    page,
  }) => {
    await gotoApp(page);

    const solutionsSection = page.locator('#protokolle');

    await solutionsSection.scrollIntoViewIfNeeded();
    await expect(solutionsSection).toBeInViewport();

    await page
      .getByRole('button', {
        name: 'Open Asynchronous Execution',
      })
      .click();

    const dialog = page.getByRole('dialog', {
      name: 'Asynchronous Execution',
    });

    await expect(dialog).toBeVisible();

    await dialog
      .getByRole('button', {
        name: 'View related studies',
      })
      .click();

    await expect(page).toHaveURL(/\/studies$/);

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Related Studies',
      })
    ).toBeVisible();

    await expect(dialog).toHaveCount(0);
  });

  test('recovers from an unknown application route', async ({ page }) => {
    await gotoApp(page, '/unknown-route');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Page not found',
      })
    ).toBeVisible();

    await expect(page.getByText('Error 404')).toBeVisible();

    await page
      .getByRole('link', {
        name: 'Return home',
      })
      .click();

    await expect(page).toHaveURL(/\/$/);

    await expect(
      page.getByRole('heading', {
        level: 1,
      })
    ).toContainText('Your medical');
  });
});
