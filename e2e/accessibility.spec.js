import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const deferredViolationIds = new Set(['color-contrast']);

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
    heading: 'Privacy Policy',
  },
  {
    path: '/studies',
    heading: 'Related Studies',
  },
  {
    path: '/unknown-route',
    heading: 'Page not found',
  },
];

const formatViolations = (violations) =>
  violations
    .map((violation) => {
      const affectedElements = violation.nodes
        .map((node) => `  - ${node.target.join(' ')}`)
        .join('\n');

      return [
        `${violation.id} (${violation.impact ?? 'unknown impact'})`,
        violation.help,
        violation.helpUrl,
        affectedElements,
      ].join('\n');
    })
    .join('\n\n');

const runAccessibilityScan = async ({
  page,
  testInfo,
  include,
  attachmentName,
}) => {
  let axeBuilder = new AxeBuilder({
    page,
  }).withTags(wcagTags);

  if (include) {
    axeBuilder = axeBuilder.include(include);
  }

  const results = await axeBuilder.analyze();

  await testInfo.attach(attachmentName, {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  const deferredViolations = results.violations.filter((violation) =>
    deferredViolationIds.has(violation.id)
  );

  const blockingViolations = results.violations.filter(
    (violation) => !deferredViolationIds.has(violation.id)
  );

  if (deferredViolations.length > 0) {
    testInfo.annotations.push({
      type: 'known-accessibility-debt',
      description: formatViolations(deferredViolations),
    });
  }

  expect(blockingViolations, formatViolations(blockingViolations)).toEqual([]);
};

test.describe('page accessibility', () => {
  for (const route of routes) {
    test(`${route.path} has no automatically detectable WCAG A or AA violations`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({
        width: 1440,
        height: 1000,
      });

      await gotoApp(page, route.path);

      await expect(
        page.getByRole('heading', {
          level: 1,
        })
      ).toContainText(route.heading);

      await runAccessibilityScan({
        page,
        testInfo,
        attachmentName: `axe-route-${route.path.replaceAll('/', '-') || 'home'}`,
      });
    });
  }
});

test.describe('interactive state accessibility', () => {
  test('open mobile navigation has no WCAG A or AA violations', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await gotoApp(page);

    await page
      .getByRole('button', {
        name: 'Open navigation menu',
      })
      .click();

    const mobileNavigation = page.locator('#mobile-navigation');

    await expect(mobileNavigation).toBeVisible();

    await runAccessibilityScan({
      page,
      testInfo,
      include: '#mobile-navigation',
      attachmentName: 'axe-mobile-navigation',
    });
  });

  test('open solution modal has no WCAG A or AA violations', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);

    const solutionsSection = page.locator('#protokolle');

    await solutionsSection.scrollIntoViewIfNeeded();

    await page
      .getByRole('button', {
        name: 'Open Cognitive Performance',
      })
      .click();

    const dialog = page.getByRole('dialog', {
      name: 'Cognitive Performance',
    });

    await expect(dialog).toBeVisible();

    await runAccessibilityScan({
      page,
      testInfo,
      include: '[role="dialog"]',
      attachmentName: 'axe-solution-modal',
    });
  });

  test('audit validation state has no WCAG A or AA violations', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);

    const auditSection = page.locator('#audit');

    await auditSection.scrollIntoViewIfNeeded();

    await page
      .getByRole('button', {
        name: 'Check availability',
      })
      .click();

    await expect(
      auditSection.getByText(/Please provide the following:/i)
    ).toBeVisible();

    await runAccessibilityScan({
      page,
      testInfo,
      include: '#audit',
      attachmentName: 'axe-audit-validation',
    });
  });
});
