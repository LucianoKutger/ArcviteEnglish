import { describe, expect, test } from 'vitest';

import { getPointyArcPath, polarToCartesian } from './methodologyGeometry';

describe('methodologyGeometry', () => {
  describe('polarToCartesian', () => {
    test('places a zero-degree point above the center', () => {
      const point = polarToCartesian(100, 200, 50, 0);

      expect(point.x).toBeCloseTo(100);
      expect(point.y).toBeCloseTo(150);
    });

    test('places a 90-degree point to the right of the center', () => {
      const point = polarToCartesian(100, 200, 50, 90);

      expect(point.x).toBeCloseTo(150);
      expect(point.y).toBeCloseTo(200);
    });

    test('places a 180-degree point below the center', () => {
      const point = polarToCartesian(100, 200, 50, 180);

      expect(point.x).toBeCloseTo(100);
      expect(point.y).toBeCloseTo(250);
    });

    test('supports negative angles', () => {
      const point = polarToCartesian(0, 0, 20, -90);

      expect(point.x).toBeCloseTo(-20);
      expect(point.y).toBeCloseTo(0);
    });
  });

  describe('getPointyArcPath', () => {
    test('creates a closed SVG path', () => {
      const path = getPointyArcPath(120, 580, 180, 10, 80, 6);

      expect(path).toMatch(/^M /);
      expect(path).toMatch(/ Z$/);
      expect(path).not.toMatch(/NaN|Infinity/);
    });

    test('uses the calculated outer and inner radii', () => {
      const path = getPointyArcPath(0, 0, 100, 10, 80, 20);

      expect(path).toContain('A 110 110 0 0 1');
      expect(path).toContain('A 90 90 0 0 0');
    });

    test('returns an identical path for identical parameters', () => {
      const firstPath = getPointyArcPath(120, 580, 300, -5, 100, 26);

      const secondPath = getPointyArcPath(120, 580, 300, -5, 100, 26);

      expect(firstPath).toBe(secondPath);
    });

    test('returns different paths for different segment radii', () => {
      const innerPath = getPointyArcPath(120, 580, 180, 10, 80, 6);

      const outerPath = getPointyArcPath(120, 580, 540, 10, 80, 6);

      expect(innerPath).not.toBe(outerPath);
    });
  });
});
