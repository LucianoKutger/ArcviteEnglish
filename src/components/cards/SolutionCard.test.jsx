import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { imageSizes } from '../../data/responsiveImages';
import SolutionCard from './SolutionCard';

const { responsiveImageSpy } = vi.hoisted(() => ({
  responsiveImageSpy: vi.fn(),
}));

vi.mock('../ui/ResponsiveImage', () => ({
  default: (props) => {
    responsiveImageSpy(props);

    return (
      <img
        data-testid="responsive-image"
        data-variant={props.variant}
        data-sizes={props.sizes}
        data-loading={props.loading ?? ''}
        alt={props.alt ?? ''}
      />
    );
  },
}));

const testItem = {
  id: 'protocol-1',
  title: 'Metabolic Optimization',
  problem: 'The original problem',
  solution: 'The proposed solution',
};

const testImage = {
  fallback: '/assets/protocol.png',
  width: 1200,
  height: 800,
  sources: {},
};

describe('SolutionCard', () => {
  test('uses the card image variant with the protocol card size rule', () => {
    render(<SolutionCard item={testItem} image={testImage} onOpen={vi.fn()} />);

    const renderedImage = screen.getByTestId('responsive-image');

    expect(renderedImage).toHaveAttribute('data-variant', 'card');

    expect(renderedImage).toHaveAttribute(
      'data-sizes',
      imageSizes.protocolCard
    );

    expect(renderedImage).toHaveAttribute('data-loading', 'lazy');

    expect(responsiveImageSpy).toHaveBeenCalledTimes(1);

    const responsiveImageProps = responsiveImageSpy.mock.calls[0][0];

    expect(responsiveImageProps.image).toBe(testImage);
    expect(responsiveImageProps.variant).toBe('card');
    expect(responsiveImageProps.sizes).toBe(imageSizes.protocolCard);
    expect(responsiveImageProps.loading).toBe('lazy');
  });

  test('renders the protocol content and opens the selected item', async () => {
    const onOpen = vi.fn();

    render(<SolutionCard item={testItem} image={testImage} onOpen={onOpen} />);

    expect(
      screen.getByRole('heading', {
        name: testItem.title,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(`"${testItem.problem}"`)).toBeInTheDocument();

    expect(screen.getByText(testItem.solution)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('heading', {
        name: testItem.title,
      })
    );

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(testItem);
  });
  test('is an accessible control that opens exactly once per mouse or keyboard activation', async () => {
    const onOpen = vi.fn();

    render(<SolutionCard item={testItem} image={testImage} onOpen={onOpen} />);

    const card = screen.getByRole('button', {
      name: `Open ${testItem.title}`,
    });

    expect(card).toHaveAttribute('tabindex', '0');

    await userEvent.click(card);

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenLastCalledWith(testItem);

    card.focus();

    expect(card).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenLastCalledWith(testItem);

    await userEvent.keyboard(' ');

    expect(onOpen).toHaveBeenCalledTimes(3);
    expect(onOpen).toHaveBeenLastCalledWith(testItem);
  });
});
