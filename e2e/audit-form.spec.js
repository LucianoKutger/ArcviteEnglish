import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const fillValidApplication = async (page) => {
  await page.getByLabel('First Name *').fill('Luciano');

  await page.getByLabel('Last Name *').fill('Kutger');

  await page.getByLabel('E-Mail *').fill('luciano@example.com');

  await page.getByLabel('Phone country code').selectOption('+49');

  await page.getByLabel('Phone Number *').fill('017612345678');

  await page
    .getByRole('button', {
      name: 'Performance & Energy',
    })
    .click();

  await page.getByLabel(/I have read and agree to the Privacy Policy/i).check();
};

test.describe('audit application form', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);

    await page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Secure Audit',
        exact: true,
      })
      .click();

    await expect(page.locator('#audit')).toBeInViewport({
      timeout: 10_000,
    });
  });

  test('shows validation feedback for an empty submission', async ({
    page,
  }) => {
    await page
      .getByRole('button', {
        name: 'Check availability',
      })
      .click();

    const errorMessage = page.getByText(/Please provide the following:/i);

    await expect(errorMessage).toBeVisible();

    await expect(errorMessage).toContainText('First Name');

    await expect(errorMessage).toContainText('Last Name');

    await expect(errorMessage).toContainText('a valid E-Mail address');

    await expect(errorMessage).toContainText('a valid Phone Number');

    await expect(errorMessage).toContainText('Goals');

    await expect(errorMessage).toContainText('Terms of Service');
  });

  test('accepts multiple goals and allows deselection', async ({ page }) => {
    const performanceGoal = page.getByRole('button', {
      name: 'Performance & Energy',
    });

    const longevityGoal = page.getByRole('button', {
      name: 'Longevity & Healthspan',
    });

    await expect(performanceGoal).toHaveAttribute('aria-pressed', 'false');

    await performanceGoal.click();
    await longevityGoal.click();

    await expect(performanceGoal).toHaveAttribute('aria-pressed', 'true');

    await expect(longevityGoal).toHaveAttribute('aria-pressed', 'true');

    await performanceGoal.click();

    await expect(performanceGoal).toHaveAttribute('aria-pressed', 'false');

    await expect(longevityGoal).toHaveAttribute('aria-pressed', 'true');
  });

  test('filters non-numeric characters from the phone number', async ({
    page,
  }) => {
    const phoneInput = page.getByLabel('Phone Number *');

    await phoneInput.fill('0176 abc 123-45');

    await expect(phoneInput).toHaveValue('017612345');
  });

  test('submits a complete application and resets the form', async ({
    page,
  }) => {
    await fillValidApplication(page);

    await page
      .getByRole('button', {
        name: 'Check availability',
      })
      .click();

    await expect(
      page.getByText('Appointment requested successfully!')
    ).toBeVisible();

    await expect(page.getByLabel('First Name *')).toHaveValue('');

    await expect(page.getByLabel('Last Name *')).toHaveValue('');

    await expect(page.getByLabel('E-Mail *')).toHaveValue('');

    await expect(page.getByLabel('Phone Number *')).toHaveValue('');

    await expect(page.getByLabel('Phone country code')).toHaveValue('+49');

    await expect(
      page.getByRole('button', {
        name: 'Performance & Energy',
      })
    ).toHaveAttribute('aria-pressed', 'false');

    await expect(
      page.getByLabel(/I have read and agree to the Privacy Policy/i)
    ).not.toBeChecked();
  });

  test('hides the success message when the form is changed again', async ({
    page,
  }) => {
    await fillValidApplication(page);

    await page
      .getByRole('button', {
        name: 'Check availability',
      })
      .click();

    const successMessage = page.getByText(
      'Appointment requested successfully!'
    );

    await expect(successMessage).toBeVisible();

    await page.getByLabel('Phone Number *').fill('017611111111');

    await expect(successMessage).not.toBeVisible();
  });

  test('opens the privacy route from the consent label', async ({ page }) => {
    await page
      .locator('#audit')
      .getByRole('link', {
        name: 'Privacy Policy',
      })
      .click();

    await expect(page).toHaveURL(/\/datenschutz$/);

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Datenschutz Filler',
      })
    ).toBeVisible();
  });
});
