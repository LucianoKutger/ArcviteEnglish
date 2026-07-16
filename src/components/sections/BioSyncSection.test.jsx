import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { syncCardsData } from '../../data/content';
import { imageSizes } from '../../data/responsiveImages';
import cardStyles from '../cards/ExpandableCards.module.scss';
import BioSyncSection from './BioSyncSection';

vi.mock('../visuals/FadeoutSection', () => ({
  default: function MockFadeOutSection({ id, className, children }) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  },
}));

vi.mock('../visuals/HeroFlowLines', () => ({
  default: function MockHeroFlowLines({ direction }) {
    return <div data-testid="hero-flow-lines" data-direction={direction} />;
  },
}));

describe('BioSyncSection', () => {
  test('renders the section and every configured biometric card', () => {
    const { container } = render(<BioSyncSection />);

    expect(container.querySelector('#biosync')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Biometric Sync',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Seamless Hardware & Laboratory Interfaces')
    ).toBeInTheDocument();

    expect(screen.getByTestId('hero-flow-lines')).toHaveAttribute(
      'data-direction',
      'left'
    );

    const cards = screen.getAllByRole('button');

    expect(cards).toHaveLength(syncCardsData.length);

    syncCardsData.forEach((cardData) => {
      const card = screen.getByRole('button', {
        name: new RegExp(cardData.title, 'i'),
      });

      expect(card).toHaveAttribute('aria-expanded', 'false');

      expect(
        within(card).getByRole('heading', {
          name: cardData.title,
        })
      ).toBeInTheDocument();

      expect(within(card).getByText(cardData.category)).toBeInTheDocument();
      if (cardData.focusTitle) {
        expect(
          within(card).getByRole('heading', {
            name: cardData.focusTitle,
          })
        ).toBeInTheDocument();
      }
      expect(within(card).getByText(cardData.focusDesc)).toBeInTheDocument();

      const wrapper = card.parentElement;

      expect(wrapper).toHaveClass(cardStyles.cardWrapper);

      if (cardData.wide) {
        expect(wrapper).toHaveClass(cardStyles.cardWide);
      } else {
        expect(wrapper).not.toHaveClass(cardStyles.cardWide);
      }

      if (cardData.appearance === 'foreground') {
        expect(wrapper).toHaveClass(cardStyles.cardForeground);
        expect(wrapper).not.toHaveClass(cardStyles.cardElevated);
      } else {
        expect(wrapper).toHaveClass(cardStyles.cardElevated);
        expect(wrapper).not.toHaveClass(cardStyles.cardForeground);
      }

      if (cardData.image) {
        const image = within(card).getByRole('img', {
          name: cardData.title,
        });

        expect(image).toHaveAttribute('loading', 'lazy');
        expect(image).toHaveAttribute('decoding', 'async');

        const picture = image.closest('picture');

        expect(picture).toBeInTheDocument();

        const avifSource = picture.querySelector('source[type="image/avif"]');
        const webpSource = picture.querySelector('source[type="image/webp"]');

        expect(avifSource).toBeInTheDocument();
        expect(webpSource).toBeInTheDocument();

        const expectedSizes = cardData.wide
          ? imageSizes.bioSyncWide
          : imageSizes.bioSyncCard;

        expect(avifSource).toHaveAttribute('sizes', expectedSizes);
        expect(webpSource).toHaveAttribute('sizes', expectedSizes);
      } else {
        expect(
          within(card).getByText(`[Bild: ${cardData.imageLabel}]`)
        ).toBeInTheDocument();
      }
    });
  });

  test('keeps at most one card expanded and supports switching and closing', async () => {
    render(<BioSyncSection />);

    const firstCardData = syncCardsData[0];
    const secondCardData = syncCardsData[1];

    const firstCard = screen.getByRole('button', {
      name: new RegExp(firstCardData.title, 'i'),
    });

    const secondCard = screen.getByRole('button', {
      name: new RegExp(secondCardData.title, 'i'),
    });

    expect(firstCard).toHaveAttribute('aria-expanded', 'false');
    expect(secondCard).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(firstCard);

    expect(firstCard).toHaveAttribute('aria-expanded', 'true');
    expect(secondCard).toHaveAttribute('aria-expanded', 'false');

    firstCardData.details.forEach((detail) => {
      expect(within(firstCard).getByText(detail)).toBeInTheDocument();
    });

    await userEvent.click(secondCard);

    expect(firstCard).toHaveAttribute('aria-expanded', 'false');
    expect(secondCard).toHaveAttribute('aria-expanded', 'true');

    secondCardData.details.forEach((detail) => {
      expect(within(secondCard).getByText(detail)).toBeInTheDocument();
    });

    await userEvent.click(secondCard);

    expect(firstCard).toHaveAttribute('aria-expanded', 'false');
    expect(secondCard).toHaveAttribute('aria-expanded', 'false');
  });

  test('supports switching cards through keyboard interaction', async () => {
    render(<BioSyncSection />);

    const firstCard = screen.getByRole('button', {
      name: new RegExp(syncCardsData[0].title, 'i'),
    });

    const secondCard = screen.getByRole('button', {
      name: new RegExp(syncCardsData[1].title, 'i'),
    });

    firstCard.focus();

    await userEvent.keyboard('{Enter}');

    expect(firstCard).toHaveAttribute('aria-expanded', 'true');

    secondCard.focus();

    await userEvent.keyboard(' ');

    expect(firstCard).toHaveAttribute('aria-expanded', 'false');
    expect(secondCard).toHaveAttribute('aria-expanded', 'true');
  });
});
