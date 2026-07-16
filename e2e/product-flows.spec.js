import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

test.describe('solution studies flow', () => {
  test('navigates from a solution modal to the related studies page', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

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

    await expect(dialog).toHaveCount(0);

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Related Studies',
      })
    ).toBeVisible();
  });
});

test.describe('unknown route recovery', () => {
  test('shows a not-found page and returns to the home route', async ({
    page,
  }) => {
    await gotoApp(page, '/unknown-route');

    await expect(page.getByRole('navigation')).toBeVisible();

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
