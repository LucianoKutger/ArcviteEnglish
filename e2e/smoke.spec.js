import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

test.describe('application smoke test', () => {
  test('loads the home route and renders the application shell', async ({
    page,
  }) => {
    await gotoApp(page);

    await expect(page).toHaveURL(/\/$/);

    await expect(page.getByRole('navigation')).toBeVisible();

    await expect(page.getByRole('main')).toBeVisible();

    const heroHeading = page.getByRole('heading', {
      level: 1,
    });

    await expect(heroHeading).toBeVisible();

    await expect(heroHeading).toContainText('Your medical');

    await expect(heroHeading).toContainText('peak performance');

    await expect(
      page
        .getByRole('navigation')
        .getByRole('button', {
          name: 'Secure Audit',
          exact: true,
        })
        .first()
    ).toBeVisible();
  });
});
