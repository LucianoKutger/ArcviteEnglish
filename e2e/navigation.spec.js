import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const directRoutes = [
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

const expectSectionInViewport = async (page, sectionId) => {
  await expect(page.locator(`#${sectionId}`)).toBeInViewport({
    timeout: 10_000,
  });
};

test.describe('direct application routes', () => {
  directRoutes.forEach(({ path, heading }) => {
    test(`loads ${path} directly`, async ({ page }) => {
      await gotoApp(page, path);

      await expect(page).toHaveURL(new RegExp(`${path}$`));

      await expect(page.getByRole('navigation')).toBeVisible();

      await expect(
        page.getByRole('heading', {
          level: 1,
          name: heading,
        })
      ).toBeVisible();
    });
  });

  test('returns from a subroute to a home section through desktop navigation', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page, '/impressum');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Impressum',
      })
    ).toBeVisible();

    await page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Vision',
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(/\/$/);

    await expectSectionInViewport(page, 'vision');

    await expect(
      page.getByRole('heading', {
        name: 'The New Standard of Leadership',
      })
    ).toBeVisible();
  });
});

test.describe('desktop navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);
  });

  test('scrolls to the Vision and Audit sections', async ({ page }) => {
    const navigation = page.getByRole('navigation');

    await navigation
      .getByRole('button', {
        name: 'Vision',
        exact: true,
      })
      .click();

    await expectSectionInViewport(page, 'vision');

    await expect(
      page.getByRole('heading', {
        name: 'The New Standard of Leadership',
      })
    ).toBeVisible();

    await navigation
      .getByRole('button', {
        name: 'Secure Audit',
        exact: true,
      })
      .click();

    await expectSectionInViewport(page, 'audit');

    await expect(
      page.getByRole('heading', {
        name: 'Audit Application',
      })
    ).toBeVisible();
  });
});

test.describe('mobile navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await gotoApp(page);
  });

  test('opens the menu, focuses the first item and restores focus after Escape', async ({
    page,
  }) => {
    const mobileNavigation = page.locator('#mobile-navigation');

    const openMenuButton = page.getByRole('button', {
      name: 'Open navigation menu',
    });

    await expect(openMenuButton).toHaveAttribute('aria-expanded', 'false');

    await expect(mobileNavigation).toBeHidden();

    await openMenuButton.click();

    const closeMenuButton = page.getByRole('button', {
      name: 'Close navigation menu',
    });

    await expect(closeMenuButton).toHaveAttribute('aria-expanded', 'true');

    await expect(mobileNavigation).toBeVisible();

    await expect(
      mobileNavigation.getByRole('button', {
        name: 'Vision',
        exact: true,
      })
    ).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(mobileNavigation).toBeHidden();

    const restoredMenuButton = page.getByRole('button', {
      name: 'Open navigation menu',
    });

    await expect(restoredMenuButton).toHaveAttribute('aria-expanded', 'false');

    await expect(restoredMenuButton).toBeFocused();
  });

  test('closes the menu after selecting FAQ and scrolls to the section', async ({
    page,
  }) => {
    const mobileNavigation = page.locator('#mobile-navigation');

    await page
      .getByRole('button', {
        name: 'Open navigation menu',
      })
      .click();

    await expect(mobileNavigation).toBeVisible();

    await mobileNavigation
      .getByRole('button', {
        name: 'FAQ',
        exact: true,
      })
      .click();

    await expect(mobileNavigation).toBeHidden();

    await expectSectionInViewport(page, 'faq');

    await expect(
      page.getByRole('heading', {
        name: 'Frequently Asked Questions',
      })
    ).toBeVisible();
  });
});
