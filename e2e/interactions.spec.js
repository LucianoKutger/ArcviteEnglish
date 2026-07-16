import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const firstFaqQuestion = 'How much time does the implementation require?';

const secondFaqQuestion = 'Is this program tax-deductible?';

const openSection = async (page, buttonName, sectionId) => {
  await page
    .getByRole('navigation')
    .getByRole('button', {
      name: buttonName,
      exact: true,
    })
    .click();

  await expect(page.locator(`#${sectionId}`)).toBeInViewport({
    timeout: 10_000,
  });
};

const openSolutionsSection = async (page) => {
  await openSection(page, 'Solutions', 'protokolle');
};

test.describe('FAQ interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);

    await openSection(page, 'FAQ', 'faq');
  });

  test('opens and closes a FAQ entry', async ({ page }) => {
    const faqButton = page.getByRole('button', {
      name: firstFaqQuestion,
      exact: true,
    });

    await expect(faqButton).toHaveAttribute('aria-expanded', 'false');

    await expect(
      page.getByRole('region', {
        name: firstFaqQuestion,
      })
    ).toHaveCount(0);

    await faqButton.click();

    await expect(faqButton).toHaveAttribute('aria-expanded', 'true');

    const answerRegion = page.getByRole('region', {
      name: firstFaqQuestion,
    });

    await expect(answerRegion).toBeVisible();

    await expect(answerRegion).toContainText('Virtually none');

    await faqButton.click();

    await expect(faqButton).toHaveAttribute('aria-expanded', 'false');

    await expect(answerRegion).toHaveCount(0);
  });

  test('keeps at most one FAQ entry expanded', async ({ page }) => {
    const firstButton = page.getByRole('button', {
      name: firstFaqQuestion,
      exact: true,
    });

    const secondButton = page.getByRole('button', {
      name: secondFaqQuestion,
      exact: true,
    });

    await firstButton.click();

    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    await secondButton.press('Enter');

    await expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    await expect(secondButton).toHaveAttribute('aria-expanded', 'true');

    await expect(
      page.getByRole('region', {
        name: firstFaqQuestion,
      })
    ).toHaveCount(0);

    await expect(
      page.getByRole('region', {
        name: secondFaqQuestion,
      })
    ).toBeVisible();
  });
});

test.describe('solution modal interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);
    await openSolutionsSection(page);
  });

  test('opens with the correct content and closes with Escape', async ({
    page,
  }) => {
    const solutionCard = page.getByRole('button', {
      name: 'Open Asynchronous Execution',
    });

    await solutionCard.click();

    const dialog = page.getByRole('dialog', {
      name: 'Asynchronous Execution',
    });

    await expect(dialog).toBeVisible();

    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    await expect(dialog).toContainText('No time for implementation');

    await expect(
      dialog.getByText(/rapid on-site implementation/i)
    ).toBeVisible();

    await expect(
      dialog.getByRole('button', {
        name: 'Close modal',
      })
    ).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(dialog).toHaveCount(0);

    await expect(solutionCard).toBeFocused();
  });

  test('keeps keyboard focus inside the modal', async ({ page }) => {
    await page
      .getByRole('button', {
        name: 'Open Cognitive Performance',
      })
      .click();

    const dialog = page.getByRole('dialog', {
      name: 'Cognitive Performance',
    });

    const closeButton = dialog.getByRole('button', {
      name: 'Close modal',
    });

    const studiesButton = dialog.getByRole('button', {
      name: /View related studies/i,
    });

    await expect(closeButton).toBeFocused();

    await page.keyboard.press('Shift+Tab');

    await expect(studiesButton).toBeFocused();

    await page.keyboard.press('Tab');

    await expect(closeButton).toBeFocused();

    await closeButton.click();

    await expect(dialog).toHaveCount(0);
  });

  test('supports keyboard activation and backdrop closing', async ({
    page,
  }) => {
    const solutionCard = page.getByRole('button', {
      name: 'Open Biological Risk Management',
    });

    await solutionCard.focus();

    await expect(solutionCard).toBeFocused();

    await solutionCard.press('Enter');

    let dialog = page.getByRole('dialog', {
      name: 'Biological Risk Management',
    });

    await expect(dialog).toBeVisible();

    await page.getByTestId('solution-modal-backdrop').click({
      position: {
        x: 10,
        y: 10,
      },
    });

    await expect(dialog).toHaveCount(0);

    await expect(solutionCard).toBeFocused();

    await solutionCard.press(' ');

    dialog = page.getByRole('dialog', {
      name: 'Biological Risk Management',
    });

    await expect(dialog).toBeVisible();

    await dialog
      .getByRole('button', {
        name: 'Close modal',
      })
      .click();

    await expect(dialog).toHaveCount(0);
  });
});
