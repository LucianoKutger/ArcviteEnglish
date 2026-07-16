import { render, screen } from '@testing-library/react';

import ResponsiveImage from './ResponsiveImage';

const testImage = {
  fallback: '/assets/fallback-image.png',
  width: 1200,
  height: 800,
  sources: {
    complete: {
      avif: '/assets/image-320.avif 320w, /assets/image-640.avif 640w',
      webp: '/assets/image-320.webp 320w, /assets/image-640.webp 640w',
    },
    webpOnly: {
      webp: '/assets/image-320.webp 320w, /assets/image-640.webp 640w',
    },
    avifOnly: {
      avif: '/assets/image-320.avif 320w, /assets/image-640.avif 640w',
    },
  },
};

describe('ResponsiveImage', () => {
  test('renders AVIF, WebP and the fallback image with the expected attributes', () => {
    const { container } = render(
      <ResponsiveImage
        image={testImage}
        variant="complete"
        sizes="(min-width: 768px) 50vw, 100vw"
        pictureClassName="responsive-picture"
        className="responsive-image"
        alt="Test visual"
        loading="lazy"
      />
    );

    const image = screen.getByRole('img', {
      name: 'Test visual',
    });

    const picture = image.closest('picture');

    expect(picture).toHaveClass('responsive-picture');

    const avifSource = container.querySelector('source[type="image/avif"]');

    const webpSource = container.querySelector('source[type="image/webp"]');

    expect(avifSource).toHaveAttribute(
      'srcset',
      '/assets/image-320.avif 320w, /assets/image-640.avif 640w'
    );

    expect(avifSource).toHaveAttribute(
      'sizes',
      '(min-width: 768px) 50vw, 100vw'
    );

    expect(webpSource).toHaveAttribute(
      'srcset',
      '/assets/image-320.webp 320w, /assets/image-640.webp 640w'
    );

    expect(webpSource).toHaveAttribute(
      'sizes',
      '(min-width: 768px) 50vw, 100vw'
    );

    expect(image).toHaveAttribute('src', '/assets/fallback-image.png');

    expect(image).toHaveAttribute('width', '1200');
    expect(image).toHaveAttribute('height', '800');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveClass('responsive-image');
  });

  test('omits the AVIF source when the selected variant only contains WebP', () => {
    const { container } = render(
      <ResponsiveImage
        image={testImage}
        variant="webpOnly"
        sizes="100vw"
        alt="WebP only visual"
      />
    );

    expect(
      container.querySelector('source[type="image/avif"]')
    ).not.toBeInTheDocument();

    const webpSource = container.querySelector('source[type="image/webp"]');

    expect(webpSource).toHaveAttribute(
      'srcset',
      '/assets/image-320.webp 320w, /assets/image-640.webp 640w'
    );

    expect(
      screen.getByRole('img', {
        name: 'WebP only visual',
      })
    ).toHaveAttribute('src', '/assets/fallback-image.png');
  });

  test('omits the WebP source when the selected variant only contains AVIF', () => {
    const { container } = render(
      <ResponsiveImage
        image={testImage}
        variant="avifOnly"
        sizes="100vw"
        alt="AVIF only visual"
      />
    );

    const avifSource = container.querySelector('source[type="image/avif"]');

    expect(avifSource).toHaveAttribute(
      'srcset',
      '/assets/image-320.avif 320w, /assets/image-640.avif 640w'
    );

    expect(
      container.querySelector('source[type="image/webp"]')
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('img', {
        name: 'AVIF only visual',
      })
    ).toHaveAttribute('src', '/assets/fallback-image.png');
  });
});
