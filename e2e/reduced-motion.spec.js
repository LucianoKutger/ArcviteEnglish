import { expect, test } from '@playwright/test';

import { gotoApp } from './test-utils';

const parseDurations = (value) =>
  value.split(',').map((duration) => {
    const trimmedDuration = duration.trim();

    if (trimmedDuration.endsWith('ms')) {
      return Number.parseFloat(trimmedDuration);
    }

    return Number.parseFloat(trimmedDuration) * 1000;
  });

test.describe('reduced motion preference', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({
      reducedMotion: 'reduce',
    });
  });

  test('disables application smooth scrolling', async ({ page }) => {
    await gotoApp(page);

    const prefersReducedMotion = await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    expect(prefersReducedMotion).toBe(true);

    await expect(page.locator('[data-smooth-scroll="disabled"]')).toBeVisible();
  });

  test('reduces CSS animations and transitions', async ({ page }) => {
    await gotoApp(page);

    const auditSection = page.locator('#audit');

    await auditSection.scrollIntoViewIfNeeded();

    await page
      .getByRole('button', {
        name: 'Check availability',
      })
      .click();

    const errorMessage = auditSection.getByText(
      /Please provide the following:/i
    );

    await expect(errorMessage).toBeVisible();

    const animationDuration = await errorMessage.evaluate(
      (element) => getComputedStyle(element).animationDuration
    );

    const transitionDuration = await page
      .getByRole('navigation')
      .evaluate((element) => getComputedStyle(element).transitionDuration);

    expect(Math.max(...parseDurations(animationDuration))).toBeLessThanOrEqual(
      1
    );

    expect(Math.max(...parseDurations(transitionDuration))).toBeLessThanOrEqual(
      1
    );
  });

  test('uses instant section navigation', async ({ page }) => {
    await page.addInitScript(() => {
      window.__scrollIntoViewCalls = [];

      const originalScrollIntoView = Element.prototype.scrollIntoView;

      Element.prototype.scrollIntoView = function scrollIntoView(options) {
        window.__scrollIntoViewCalls.push(options);

        return originalScrollIntoView.call(this, options);
      };
    });

    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);

    await page
      .getByRole('navigation')
      .getByRole('button', {
        name: 'Vision',
        exact: true,
      })
      .click();

    await expect
      .poll(() =>
        page.evaluate(
          () => window.__scrollIntoViewCalls.at(-1)?.behavior ?? null
        )
      )
      .toBe('auto');

    await expect(page.locator('#vision')).toBeInViewport();
  });

  test('keeps fadeout sections static and visible', async ({ page }) => {
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });

    await gotoApp(page);

    await page.locator('#methodik').scrollIntoViewIfNeeded();

    const visionContent = page.locator('#vision [data-motion-layer="content"]');

    await expect(visionContent).toHaveCSS('opacity', '1');
    await expect(visionContent).toHaveCSS('transform', 'none');

    await expect(
      page.locator('#vision [data-motion-layer="overlay"]')
    ).toHaveCount(0);
  });

  test('keeps the hero canvas on a static frame', async ({ page }) => {
    await gotoApp(page);

    const canvas = page.locator('canvas').first();

    await expect(canvas).toBeVisible();

    await expect
      .poll(() =>
        canvas.evaluate((element) => ({
          width: element.width,
          height: element.height,
        }))
      )
      .toMatchObject({
        width: expect.any(Number),
        height: expect.any(Number),
      });

    await page.waitForTimeout(100);

    const firstFrame = await canvas.evaluate((element) => element.toDataURL());

    await page.waitForTimeout(250);

    const secondFrame = await canvas.evaluate((element) => element.toDataURL());

    expect(secondFrame).toBe(firstFrame);
  });
});
