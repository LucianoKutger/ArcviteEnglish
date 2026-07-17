import {
  bioSyncImages,
  founderImage,
  imageSizes,
  logoImage,
  protocolImages,
} from './responsiveImages';

const parseSrcSet = (srcSet) => {
  expect(srcSet).toEqual(expect.any(String));
  expect(srcSet.trim()).not.toBe('');

  return srcSet.split(',').map((candidate) => {
    const match = candidate.trim().match(/^(.+)\s+(\d+)w$/);

    expect(match).not.toBeNull();

    return {
      source: match[1],
      width: Number(match[2]),
    };
  });
};

const getWidths = (srcSet) =>
  parseSrcSet(srcSet).map((candidate) => candidate.width);

const expectAscendingWidths = (srcSet) => {
  const widths = getWidths(srcSet);
  const sortedWidths = [...widths].sort((first, second) => first - second);

  expect(widths).toEqual(sortedWidths);
  expect(new Set(widths).size).toBe(widths.length);
};

const expectValidImageConfiguration = (image) => {
  expect(image).toEqual(
    expect.objectContaining({
      fallback: expect.any(String),
      width: expect.any(Number),
      height: expect.any(Number),
      sources: expect.any(Object),
    })
  );

  expect(image.fallback.trim()).not.toBe('');
  expect(image.width).toBeGreaterThan(0);
  expect(image.height).toBeGreaterThan(0);

  const variants = Object.values(image.sources);

  expect(variants.length).toBeGreaterThan(0);

  variants.forEach((formats) => {
    const sourceSets = Object.values(formats);

    expect(sourceSets.length).toBeGreaterThan(0);

    sourceSets.forEach((srcSet) => {
      expectAscendingWidths(srcSet);
    });
  });
};

describe('responsiveImages data', () => {
  test('defines all responsive size rules as non-empty strings', () => {
    expect(imageSizes).toEqual(
      expect.objectContaining({
        bioSyncCard: expect.any(String),
        bioSyncWide: expect.any(String),
        protocolCard: expect.any(String),
        protocolModal: expect.any(String),
        founder: expect.any(String),
        logo: expect.any(String),
      })
    );

    Object.values(imageSizes).forEach((sizes) => {
      expect(sizes.trim()).not.toBe('');
    });
  });

  test('provides structurally valid configurations for every exported image', () => {
    const allImages = [
      ...Object.values(bioSyncImages),
      ...protocolImages,
      founderImage,
      logoImage,
    ];

    allImages.forEach((image) => {
      expectValidImageConfiguration(image);
    });
  });

  test('uses generated WebP files instead of original images as fallbacks', () => {
    const allImages = [
      ...Object.values(bioSyncImages),
      ...protocolImages,
      founderImage,
      logoImage,
    ];

    allImages.forEach((image) => {
      expect(image.fallback).toContain('/assets/optimized/');
      expect(image.fallback).toMatch(/\.webp$/);
    });
  });

  test('provides the expected BioSync candidates in AVIF and WebP', () => {
    Object.values(bioSyncImages).forEach((image) => {
      expect(Object.keys(image.sources)).toEqual(['card']);

      expect(getWidths(image.sources.card.avif)).toEqual([320, 640, 960]);

      expect(getWidths(image.sources.card.webp)).toEqual([320, 640, 960]);
    });
  });

  test('provides separate card and modal candidates for every protocol image', () => {
    expect(protocolImages).toHaveLength(6);

    protocolImages.forEach((image) => {
      expect(Object.keys(image.sources)).toEqual(['card', 'modal']);

      expect(getWidths(image.sources.card.avif)).toEqual([320, 640, 960]);

      expect(getWidths(image.sources.card.webp)).toEqual([320, 640, 960]);

      expect(getWidths(image.sources.modal.avif)).toEqual([
        320, 640, 960, 1280, 1600,
      ]);

      expect(getWidths(image.sources.modal.webp)).toEqual([
        320, 640, 960, 1280, 1600,
      ]);
    });
  });

  test('provides the expected Founder image candidates', () => {
    expect(Object.keys(founderImage.sources)).toEqual(['display']);

    expect(getWidths(founderImage.sources.display.avif)).toEqual([
      320, 640, 960,
    ]);

    expect(getWidths(founderImage.sources.display.webp)).toEqual([
      320, 640, 960,
    ]);
  });

  test('provides the expected WebP-only logo candidates', () => {
    expect(Object.keys(logoImage.sources)).toEqual(['display']);

    expect(logoImage.sources.display.avif).toBeUndefined();

    expect(getWidths(logoImage.sources.display.webp)).toEqual([170, 340, 510]);
  });
});
