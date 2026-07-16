import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { imageSizes } from '../../data/responsiveImages';
import SolutionModal from './SolutionModal';

const { responsiveImageSpy } = vi.hoisted(() => ({
  responsiveImageSpy: vi.fn(),
}));

vi.mock('./ResponsiveImage', () => ({
  default: (props) => {
    responsiveImageSpy(props);

    return (
      <img
        data-testid="responsive-image"
        data-variant={props.variant}
        data-sizes={props.sizes}
        alt={props.alt ?? ''}
      />
    );
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }) => (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    ),
  },
}));

const testImage = {
  fallback: '/assets/protocol.png',
  width: 1600,
  height: 1000,
  sources: {},
};

const testItem = {
  id: 'protocol-1',
  title: 'Metabolic Optimization',
  problem: 'The original problem',
  solution: 'The proposed solution',
  details: 'Detailed protocol information',
  image: testImage,
};

describe('SolutionModal', () => {
  test('renders nothing when no item is selected', () => {
    const { container } = render(
      <SolutionModal item={null} onClose={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('uses the modal image variant with the protocol modal size rule', () => {
    render(<SolutionModal item={testItem} onClose={vi.fn()} />);

    const renderedImage = screen.getByTestId('responsive-image');

    expect(renderedImage).toHaveAttribute('data-variant', 'modal');

    expect(renderedImage).toHaveAttribute(
      'data-sizes',
      imageSizes.protocolModal
    );

    expect(responsiveImageSpy).toHaveBeenCalledTimes(1);

    const responsiveImageProps = responsiveImageSpy.mock.calls[0][0];

    expect(responsiveImageProps.image).toBe(testImage);
    expect(responsiveImageProps.variant).toBe('modal');
    expect(responsiveImageProps.sizes).toBe(imageSizes.protocolModal);
  });

  test('renders the complete selected protocol content', () => {
    render(<SolutionModal item={testItem} onClose={vi.fn()} />);

    expect(
      screen.getByRole('heading', {
        name: testItem.title,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(`"${testItem.problem}"`)).toBeInTheDocument();

    expect(screen.getByText(testItem.solution)).toBeInTheDocument();

    expect(screen.getByText(testItem.details)).toBeInTheDocument();
  });

  test('closes through both the backdrop and the close button', async () => {
    const onClose = vi.fn();

    const { container } = render(
      <SolutionModal item={testItem} onClose={onClose} />
    );

    const overlay = container.firstElementChild;
    const backdrop = overlay?.firstElementChild;

    if (!(backdrop instanceof HTMLElement)) {
      throw new Error('Modal backdrop was not found');
    }

    await userEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);

    const buttons = screen.getAllByRole('button');

    await userEvent.click(buttons[0]);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('prevents wheel and touch movement from propagating outside the modal content', () => {
    const parentWheelHandler = vi.fn();
    const parentTouchHandler = vi.fn();

    const { container } = render(
      <div onWheel={parentWheelHandler} onTouchMove={parentTouchHandler}>
        <SolutionModal item={testItem} onClose={vi.fn()} />
      </div>
    );

    const contentContainer = container.querySelector(
      '[data-lenis-prevent="true"]'
    );

    if (!(contentContainer instanceof HTMLElement)) {
      throw new Error('Modal content container was not found');
    }

    fireEvent.wheel(contentContainer);
    fireEvent.touchMove(contentContainer);

    expect(parentWheelHandler).not.toHaveBeenCalled();
    expect(parentTouchHandler).not.toHaveBeenCalled();
  });
});
