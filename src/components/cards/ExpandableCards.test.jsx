import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { imageSizes } from '../../data/responsiveImages';
import styles from './ExpandableCards.module.scss';

import ExpandableCard from './ExpandableCards';

vi.mock('../ui/ResponsiveImage', () => ({
  default: ({ alt, variant, sizes, loading }) => (
    <img
      alt={alt}
      data-testid="responsive-image"
      data-variant={variant}
      data-sizes={sizes}
      data-loading={loading}
    />
  ),
}));

const defaultProps = {
  title: 'Sleep Recovery',
  category: 'Recovery',
  focusTitle: 'Regeneration and sleep',
  focusDesc: 'Improve sleep quality and daily recovery.',
  imageLabel: 'Sleep visualization',
  image: {
    fallback: '/assets/sleep.png',
    width: 1200,
    height: 800,
    sources: {},
  },
  details: ['Sleep duration', 'Sleep regularity'],
  appearance: 'foreground',
  isOpen: false,
  onToggle: vi.fn(),
  opacity: 0.8,
  wide: false,
};

const renderCard = (overrides = {}) =>
  render(<ExpandableCard {...defaultProps} {...overrides} />);

describe('ExpandableCard', () => {
  test('is an accessible collapsed control that supports mouse and keyboard activation', async () => {
    const onToggle = vi.fn();

    renderCard({
      onToggle,
    });

    const card = screen.getByRole('button', {
      name: /sleep recovery/i,
    });

    expect(card).toHaveAttribute('aria-expanded', 'false');
    expect(card).toHaveAttribute('tabindex', '0');

    await userEvent.click(card);

    expect(onToggle).toHaveBeenCalledTimes(1);

    card.focus();

    expect(card).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(onToggle).toHaveBeenCalledTimes(2);

    await userEvent.keyboard(' ');

    expect(onToggle).toHaveBeenCalledTimes(3);
  });
  test('exposes the expanded state and connects the control with its details', () => {
    renderCard({
      isOpen: true,
    });

    const card = screen.getByRole('button', {
      name: /sleep recovery/i,
    });

    expect(card).toHaveAttribute('aria-expanded', 'true');

    const detailsId = card.getAttribute('aria-controls');

    expect(detailsId).toBeTruthy();

    const detailsContainer = document.getElementById(detailsId);

    expect(detailsContainer).toBeInTheDocument();

    expect(screen.getByText('Sleep duration')).toBeInTheDocument();
    expect(screen.getByText('Sleep regularity')).toBeInTheDocument();

    expect(card).toHaveClass(styles.cardOpen);
  });

  test('renders the responsive card image with the expected configuration', () => {
    renderCard();

    const image = screen.getByRole('img', {
      name: 'Sleep Recovery',
    });

    expect(image).toHaveAttribute('data-variant', 'card');
    expect(image).toHaveAttribute('data-sizes', imageSizes.bioSyncCard);
    expect(image).toHaveAttribute('data-loading', 'lazy');
  });

  test('uses the wide image size and the configured wrapper appearance', () => {
    renderCard({
      wide: true,
      appearance: 'elevated',
    });

    const card = screen.getByRole('button', {
      name: /sleep recovery/i,
    });

    const wrapper = card.parentElement;

    expect(wrapper).toHaveClass(
      styles.cardWrapper,
      styles.cardWide,
      styles.cardElevated
    );

    expect(wrapper).not.toHaveClass(styles.cardForeground);

    expect(
      screen.getByRole('img', {
        name: 'Sleep Recovery',
      })
    ).toHaveAttribute('data-sizes', imageSizes.bioSyncWide);
  });

  test('renders the configured fallback when no image is available', () => {
    renderCard({
      image: null,
    });

    expect(screen.queryByTestId('responsive-image')).not.toBeInTheDocument();

    expect(screen.getByText('[Bild: Sleep visualization]')).toBeInTheDocument();

    const card = screen.getByRole('button', {
      name: /sleep recovery/i,
    });

    expect(card.parentElement).toHaveClass(
      styles.cardWrapper,
      styles.cardForeground
    );

    expect(card.parentElement).not.toHaveClass(styles.cardWide);
  });
});
