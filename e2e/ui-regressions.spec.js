import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const desktopViewport = {
  width: 1440,
  height: 1000,
};

const waitForLayoutToSettle = async (page, delay = 450) => {
  await page.waitForTimeout(delay);

  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      })
  );
};

const getElementGeometry = async (locator) =>
  locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.x,
      y: rect.y,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  });

const expectCloseTo = (actual, expected, tolerance = 2) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

const prepareMethodologySection = async (page) => {
  await page.setViewportSize(desktopViewport);
  await gotoApp(page);

  const methodologySystem = page.getByTestId('methodology-system');

  await expect(methodologySystem).toBeVisible();

  await methodologySystem.evaluate((element) => {
    const targetScrollPosition =
      window.scrollY + element.getBoundingClientRect().top - 50;

    window.scrollTo({
      top: targetScrollPosition,
      behavior: 'auto',
    });
  });

  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);

  await waitForLayoutToSettle(page);

  return {
    methodologySystem,
    textWrapper: page.getByTestId('methodology-text-wrapper'),
  };
};

test.describe('Methodology UI regressions', () => {
  test('keeps the browser scroll position stable while segments are hovered', async ({
    page,
  }) => {
    const { methodologySystem, textWrapper } =
      await prepareMethodologySection(page);

    const baselineScrollY = await page.evaluate(() => window.scrollY);
    const baselineSystemGeometry = await getElementGeometry(methodologySystem);
    const baselineTextGeometry = await getElementGeometry(textWrapper);

    const segmentIds = [1, 2, 3, 4];

    for (const segmentId of segmentIds) {
      const segmentButton = page.locator(
        `[aria-controls="methodology-content-${segmentId}"]`
      );

      await segmentButton.hover();

      await expect(
        page.locator(`#methodology-content-${segmentId}`)
      ).toBeVisible();

      await waitForLayoutToSettle(page);

      const currentScrollY = await page.evaluate(() => window.scrollY);
      const currentSystemGeometry = await getElementGeometry(methodologySystem);
      const currentTextGeometry = await getElementGeometry(textWrapper);

      expectCloseTo(currentScrollY, baselineScrollY);
      expectCloseTo(currentSystemGeometry.top, baselineSystemGeometry.top);
      expectCloseTo(currentTextGeometry.top, baselineTextGeometry.top);
      expectCloseTo(currentTextGeometry.height, baselineTextGeometry.height);
    }
  });

  test('keeps the latest content and scroll position stable during a rapid segment switch', async ({
    page,
  }) => {
    const { methodologySystem } = await prepareMethodologySection(page);

    const baselineScrollY = await page.evaluate(() => window.scrollY);
    const baselineSystemGeometry = await getElementGeometry(methodologySystem);

    const coreSegment = page.locator('[aria-controls="methodology-content-1"]');
    const neuroSegment = page.locator(
      '[aria-controls="methodology-content-2"]'
    );
    const operationalSegment = page.locator(
      '[aria-controls="methodology-content-3"]'
    );
    const dreamSegment = page.locator(
      '[aria-controls="methodology-content-4"]'
    );

    await coreSegment.hover();

    await expect(page.locator('#methodology-content-1')).toBeVisible();

    await neuroSegment.hover();
    await operationalSegment.hover();
    await dreamSegment.hover();

    await expect(page.locator('#methodology-content-4')).toBeVisible();

    await expect(page.locator('#methodology-content-1')).toBeHidden();

    await expect(page.locator('#methodology-content-2')).toBeHidden();

    await expect(page.locator('#methodology-content-3')).toBeHidden();

    await waitForLayoutToSettle(page);

    const currentScrollY = await page.evaluate(() => window.scrollY);
    const currentSystemGeometry = await getElementGeometry(methodologySystem);

    expectCloseTo(currentScrollY, baselineScrollY);
    expectCloseTo(currentSystemGeometry.top, baselineSystemGeometry.top);

    for (const segmentButton of [
      coreSegment,
      neuroSegment,
      operationalSegment,
      dreamSegment,
    ]) {
      await expect(segmentButton).toBeInViewport();
    }
  });
});

test.describe('Navbar UI regressions', () => {
  test('keeps its geometry stable when crossing the scroll threshold', async ({
    page,
  }) => {
    await page.setViewportSize(desktopViewport);
    await gotoApp(page);

    const navigation = page.locator('#nav');
    const logoButton = navigation.getByRole('button', {
      name: 'Go to home',
    });
    const auditButton = navigation.getByRole('button', {
      name: 'Secure Audit',
      exact: true,
    });

    await expect(navigation).toHaveAttribute('data-scrolled', 'false');

    await page.evaluate(() => {
      window.scrollTo({
        top: 19,
        behavior: 'auto',
      });
    });

    await expect(navigation).toHaveAttribute('data-scrolled', 'false');

    await waitForLayoutToSettle(page);

    const navigationBefore = await getElementGeometry(navigation);
    const logoBefore = await getElementGeometry(logoButton);
    const auditBefore = await getElementGeometry(auditButton);

    await page.evaluate(() => {
      window.scrollTo({
        top: 21,
        behavior: 'auto',
      });
    });

    await expect(navigation).toHaveAttribute('data-scrolled', 'true');

    await waitForLayoutToSettle(page);

    const navigationAfter = await getElementGeometry(navigation);
    const logoAfter = await getElementGeometry(logoButton);
    const auditAfter = await getElementGeometry(auditButton);

    expectCloseTo(navigationAfter.height, navigationBefore.height);
    expectCloseTo(navigationAfter.x, navigationBefore.x);
    expectCloseTo(navigationAfter.y, navigationBefore.y);

    expectCloseTo(logoAfter.x, logoBefore.x);
    expectCloseTo(logoAfter.y, logoBefore.y);
    expectCloseTo(logoAfter.width, logoBefore.width);
    expectCloseTo(logoAfter.height, logoBefore.height);

    expectCloseTo(auditAfter.x, auditBefore.x);
    expectCloseTo(auditAfter.y, auditBefore.y);
    expectCloseTo(auditAfter.width, auditBefore.width);
    expectCloseTo(auditAfter.height, auditBefore.height);
  });

  test('uses the correct scrolled state when React mounts at an existing scroll position', async ({
    page,
  }) => {
    await page.setViewportSize(desktopViewport);

    let releaseMainModule;

    const mainModuleGate = new Promise((resolve) => {
      releaseMainModule = resolve;
    });

    await page.route('**/src/main.jsx', async (route) => {
      await mainModuleGate;
      await route.continue();
    });

    await page.goto('/', {
      waitUntil: 'commit',
    });

    await expect(page.locator('#root')).toBeAttached();

    await page.addStyleTag({
      content: `
        body {
          min-height: 3000px !important;
        }
      `,
    });

    await page.evaluate(() => {
      window.scrollTo({
        top: 400,
        behavior: 'auto',
      });
    });

    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(20);

    releaseMainModule();

    const navigation = page.locator('#nav');

    await expect(navigation).toBeVisible();

    await expect(navigation).toHaveAttribute('data-scrolled', 'true');
  });
});

test.describe('Initial page background regression', () => {
  test('uses a black background before the React application loads', async ({
    page,
  }) => {
    let releaseMainModule;

    const mainModuleGate = new Promise((resolve) => {
      releaseMainModule = resolve;
    });

    await page.route('**/src/main.jsx', async (route) => {
      await mainModuleGate;
      await route.continue();
    });

    await page.goto('/', {
      waitUntil: 'commit',
    });

    await expect(page.locator('#root')).toBeAttached();

    await expect(page.locator('#critical-page-background')).toBeAttached();

    const backgroundColors = await page.evaluate(() => ({
      html: getComputedStyle(document.documentElement).backgroundColor,
      body: getComputedStyle(document.body).backgroundColor,
      root: getComputedStyle(document.getElementById('root')).backgroundColor,
    }));

    expect(backgroundColors).toEqual({
      html: 'rgb(0, 0, 0)',
      body: 'rgb(0, 0, 0)',
      root: 'rgb(0, 0, 0)',
    });

    releaseMainModule();

    await expect(page.getByRole('main')).toBeVisible();
  });
});
