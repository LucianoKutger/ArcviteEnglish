import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import { solutions } from '../../../data/content';
import ProtocolCarousel from './ProtocolCarousel';

const solutionCardSpy = vi.hoisted(() => vi.fn());

vi.mock('framer-motion', async () => {
  const React = await vi.importActual('react');
  return {
    motion: {
      div: React.forwardRef(function MotionDiv(
        { children, style: _style, ...props },
        ref
      ) {
        return (
          <div ref={ref} {...props}>
            {children}
          </div>
        );
      }),
    },
  };
});

vi.mock('../../cards/SolutionCard', () => ({
  default: (props) => {
    solutionCardSpy(props);
    return (
      <button
        type="button"
        aria-label={props.ariaLabel}
        aria-hidden={props.ariaHidden || undefined}
        tabIndex={props.tabIndex}
        onClick={props.onOpen}
      />
    );
  },
}));

const createCarousel = (overrides = {}) => ({
  carouselMaxHeight: 360,
  cardRefs: { current: [] },
  dragX: {},
  getCardState: vi.fn((index) => {
    if (index === 0) return 'active';
    if (index === solutions.length - 1) return 'previous';
    if (index === 1) return 'next';
    if (index === solutions.length - 2) return 'previousFar';
    if (index === 2) return 'nextFar';
    return 'hidden';
  }),
  gridRef: { current: null },
  handleCardActivation: vi.fn(),
  handleCarouselClickCapture: vi.fn(),
  handlePointerCancel: vi.fn(),
  handlePointerDown: vi.fn(),
  handlePointerMove: vi.fn(),
  handlePointerUp: vi.fn(),
  isDesktop: false,
  selectActiveIndex: vi.fn(),
  showNext: vi.fn(),
  showPrevious: vi.fn(),
  trackRef: { current: null },
  visualIndicatorIndex: 0,
  ...overrides,
});

beforeEach(() => {
  solutionCardSpy.mockClear();
});

test('renders mobile carousel state and forwards every interaction', () => {
  const carousel = createCarousel();
  const { container } = render(<ProtocolCarousel carousel={carousel} />);
  const grid = screen.getByRole('region', {
    name: 'Arcvite protocols',
  }).firstElementChild;

  expect(grid).toHaveStyle({ height: '360px' });
  expect(carousel.cardRefs.current.filter(Boolean)).toHaveLength(
    solutions.length
  );
  expect(solutionCardSpy).toHaveBeenCalledTimes(solutions.length);

  fireEvent.pointerDown(grid);
  fireEvent.pointerMove(grid);
  fireEvent.pointerUp(grid);
  fireEvent.pointerCancel(grid);
  fireEvent.click(grid);
  expect(carousel.handlePointerDown).toHaveBeenCalled();
  expect(carousel.handlePointerMove).toHaveBeenCalled();
  expect(carousel.handlePointerUp).toHaveBeenCalled();
  expect(carousel.handlePointerCancel).toHaveBeenCalled();
  expect(carousel.handleCarouselClickCapture).toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Previous protocol' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next protocol' }));
  fireEvent.click(
    screen.getByRole('button', {
      name: `Show ${solutions[2].title} protocol`,
    })
  );
  fireEvent.click(
    screen.getByRole('button', { name: `Open ${solutions[0].title}` })
  );

  expect(carousel.showPrevious).toHaveBeenCalledTimes(1);
  expect(carousel.showNext).toHaveBeenCalledTimes(1);
  expect(carousel.selectActiveIndex).toHaveBeenCalledWith(2);
  expect(carousel.handleCardActivation).toHaveBeenCalledWith(
    solutions[0],
    0
  );
  expect(container.querySelector('[aria-current="true"]')).toHaveAccessibleName(
    `Show ${solutions[0].title} protocol`
  );
});

test('does not force a fixed height or hide cards on desktop', () => {
  const carousel = createCarousel({ isDesktop: true });
  render(<ProtocolCarousel carousel={carousel} />);
  const grid = screen.getByRole('region', {
    name: 'Arcvite protocols',
  }).firstElementChild;

  expect(grid.style.height).toBe('');
  solutionCardSpy.mock.calls.forEach(([props]) => {
    expect(props.tabIndex).toBe(0);
    expect(props.ariaHidden).toBe(false);
    expect(props.ariaLabel).toMatch(/^Open /);
  });
});
