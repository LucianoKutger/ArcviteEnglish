import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { founderImage, imageSizes } from '../../data/responsiveImages';
import FounderSection from './FounderSection';

const { responsiveImageSpy, backgroundGlowSpy } = vi.hoisted(() => ({
  responsiveImageSpy: vi.fn(),
  backgroundGlowSpy: vi.fn(),
}));

vi.mock('../visuals/FadeoutSection', () => ({
  default: function MockFadeOutSection({ id, className, children }) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  },
}));

vi.mock('../visuals/BackgroundGlow', () => ({
  default: (props) => {
    backgroundGlowSpy(props);

    return (
      <div
        data-testid="background-glow"
        data-variant={props.variant}
        className={props.className}
      />
    );
  },
}));

vi.mock('../ui/ResponsiveImage', () => ({
  default: (props) => {
    responsiveImageSpy(props);

    return (
      <img
        data-testid="founder-responsive-image"
        data-variant={props.variant}
        data-sizes={props.sizes}
        data-loading={props.loading ?? ''}
        alt={props.alt ?? ''}
      />
    );
  },
}));

describe('FounderSection', () => {
  test('renders the founder section with its central content', () => {
    const { container } = render(<FounderSection />);

    expect(container.querySelector('#founder')).toBeInTheDocument();

    expect(screen.getByText('Our Founder')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /human biology\.\s*mathematically\.\s*optimized\./i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /the arc model is the distillate of intensive systems theory/i
      )
    ).toBeInTheDocument();

    expect(screen.getByText(/friedrich nietzsche/i)).toBeInTheDocument();

    expect(screen.getByText(/andreas, founder arcvite/i)).toBeInTheDocument();
  });

  test('renders the founder glow with the expected variant', () => {
    render(<FounderSection />);

    const glow = screen.getByTestId('background-glow');

    expect(glow).toHaveAttribute('data-variant', 'founder');

    expect(glow).toHaveClass('glow');

    expect(backgroundGlowSpy).toHaveBeenCalledTimes(1);
    expect(backgroundGlowSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'founder',
        className: 'glow',
      })
    );
  });

  test('renders mobile and desktop founder images with identical responsive settings', () => {
    render(<FounderSection />);

    const renderedImages = screen.getAllByTestId('founder-responsive-image');

    expect(renderedImages).toHaveLength(2);

    renderedImages.forEach((image) => {
      expect(image).toHaveAttribute('data-variant', 'display');

      expect(image).toHaveAttribute('data-sizes', imageSizes.founder);

      expect(image).toHaveAttribute('data-loading', 'lazy');

      expect(image).toHaveAttribute('alt', 'founder');
    });

    expect(responsiveImageSpy).toHaveBeenCalledTimes(2);

    responsiveImageSpy.mock.calls.forEach(([props]) => {
      expect(props.image).toBe(founderImage);
      expect(props.variant).toBe('display');
      expect(props.sizes).toBe(imageSizes.founder);
      expect(props.loading).toBe('lazy');
      expect(props.alt).toBe('founder');
    });
  });
});
