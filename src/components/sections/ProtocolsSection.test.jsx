import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import { solutions } from '../../data/content';
import ProtocolsSection from './ProtocolsSection';

const { animationState, navigateSpy, solutionCardSpy, solutionModalSpy } =
  vi.hoisted(() => ({
    animationState: {
      defer: false,
      completions: [],
      targets: [],
      motionValue: null,
    },
    navigateSpy: vi.fn(),
    solutionCardSpy: vi.fn(),
    solutionModalSpy: vi.fn(),
  }));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateSpy,
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({ children, style: _style, ...props }) => (
      <div {...props}>{children}</div>
    ),
  },
  useMotionValue: (initialValue) => {
    if (animationState.motionValue !== null) {
      return animationState.motionValue;
    }

    let value = initialValue;
    const listeners = new Set();

    animationState.motionValue = {
      get: () => value,
      getVelocity: () => 0,
      set: (nextValue) => {
        value = nextValue;
        listeners.forEach((listener) => listener(nextValue));
      },
      on: (_eventName, listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };

    return animationState.motionValue;
  },
  animate: (motionValue, target) => {
    animationState.targets.push(target);
    motionValue.set(target);

    return {
      stop: vi.fn(),
      then: (onComplete) => {
        if (animationState.defer) {
          animationState.completions.push(onComplete);
        } else {
          onComplete();
        }

        return Promise.resolve();
      },
    };
  },
}));

vi.mock('../visuals/FadeoutSection', () => ({
  default: ({ id, className, children }) => (
    <section id={id} className={className}>
      {children}
    </section>
  ),
}));

vi.mock('../cards/SolutionCard', () => ({
  default: (props) => {
    solutionCardSpy(props);

    return (
      <button
        type="button"
        aria-label={props.ariaLabel}
        aria-hidden={props.ariaHidden || undefined}
        tabIndex={props.tabIndex}
        onClick={() => props.onOpen(props.item)}
      >
        Open {props.item.title}
      </button>
    );
  },
}));

vi.mock('../ui/SolutionModal', () => ({
  default: (props) => {
    solutionModalSpy(props);

    return (
      <div role="dialog" aria-label={props.item.title}>
        <button type="button" onClick={props.onClose}>
          Close modal
        </button>

        <button type="button" onClick={props.onViewStudies}>
          View related studies
        </button>
      </div>
    );
  },
}));

vi.mock('../../data/content', () => ({
  solutions: [
    {
      id: 'solution-one',
      title: 'Solution One',
      image: {
        fallback: '/solution-one.png',
      },
    },
    {
      id: 'solution-two',
      title: 'Solution Two',
      image: {
        fallback: '/solution-two.png',
      },
    },
  ],
}));

describe('ProtocolsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationState.defer = false;
    animationState.completions.length = 0;
    animationState.targets.length = 0;
    animationState.motionValue = null;
  });

  test('renders every solution and forwards the audit action', async () => {
    const scrollToSection = vi.fn();

    render(<ProtocolsSection scrollToSection={scrollToSection} />);

    expect(
      screen.getByRole('heading', {
        name: /The Arcvite Full-Spectrum Solution/i,
      })
    ).toBeInTheDocument();

    for (const solution of solutions) {
      expect(
        screen.getByRole('button', {
          name: `Open ${solution.title}`,
        })
      ).toBeInTheDocument();
    }

    expect(solutionCardSpy).toHaveBeenCalledTimes(solutions.length);

    expect(solutionCardSpy.mock.calls[0][0].image).toBe(solutions[0].image);

    await userEvent.click(
      screen.getByRole('button', {
        name: /Secure audit/i,
      })
    );

    expect(scrollToSection).toHaveBeenCalledTimes(1);
    expect(scrollToSection).toHaveBeenCalledWith('audit');
  });

  test('opens and closes a selected solution modal', async () => {
    render(<ProtocolsSection scrollToSection={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: `Open ${solutions[0].title}`,
      })
    );

    expect(
      screen.getByRole('dialog', {
        name: solutions[0].title,
      })
    ).toBeInTheDocument();

    expect(solutionModalSpy).toHaveBeenCalled();

    expect(solutionModalSpy.mock.calls.at(-1)[0].item).toEqual(solutions[0]);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Close modal',
      })
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('navigates from the modal to the studies route', async () => {
    render(<ProtocolsSection scrollToSection={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: `Open ${solutions[1].title}`,
      })
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: 'View related studies',
      })
    );

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('/studies');
  });

  test('previews the next indicator at halfway without changing the card', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );

    render(<ProtocolsSection scrollToSection={vi.fn()} />);

    const carousel = screen.getByRole('region', {
      name: 'Arcvite protocols',
    });
    const grid = carousel.firstElementChild;
    const firstIndicator = screen.getByRole('button', {
      name: `Show ${solutions[0].title} protocol`,
    });
    const secondIndicator = screen.getByRole('button', {
      name: `Show ${solutions[1].title} protocol`,
    });

    expect(firstIndicator).toHaveAttribute('aria-current', 'true');

    fireEvent.pointerDown(grid, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(grid, {
      pointerId: 1,
      clientX: 80,
      clientY: 100,
    });

    expect(firstIndicator).not.toHaveAttribute('aria-current');
    expect(secondIndicator).toHaveAttribute('aria-current', 'true');

    const latestCardProps = new Map(
      solutionCardSpy.mock.calls
        .slice(-solutions.length)
        .map(([props]) => [props.item.id, props])
    );

    expect(latestCardProps.get(solutions[0].id).ariaLabel).toBe(
      `Open ${solutions[0].title}`
    );
    expect(latestCardProps.get(solutions[1].id).ariaLabel).toBe(
      `Show ${solutions[1].title}`
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.pointerCancel(grid, { pointerId: 1 });
    vi.unstubAllGlobals();
  });

  test('opens the newly swiped card on the first immediate tap', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    animationState.defer = true;

    render(<ProtocolsSection scrollToSection={vi.fn()} />);

    const carousel = screen.getByRole('region', {
      name: 'Arcvite protocols',
    });
    const grid = carousel.firstElementChild;
    const setPointerCapture = vi.fn();
    grid.setPointerCapture = setPointerCapture;

    fireEvent.pointerDown(grid, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(grid, {
      pointerId: 1,
      clientX: -1000,
      clientY: 100,
    });
    fireEvent.pointerUp(grid, {
      pointerId: 1,
      clientX: -1000,
      clientY: 100,
    });

    expect(animationState.completions).toHaveLength(1);
    expect(animationState.targets[0]).toBeLessThan(0);
    expect(setPointerCapture).toHaveBeenCalledWith(1);

    setPointerCapture.mockClear();
    const incomingCard = screen.getByRole('button', {
      name: `Show ${solutions[1].title}`,
    });

    fireEvent.pointerDown(incomingCard, {
      button: 0,
      pointerId: 2,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerUp(incomingCard, {
      button: 0,
      pointerId: 2,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.click(incomingCard);

    expect(setPointerCapture).not.toHaveBeenCalled();

    expect(
      screen.getByRole('dialog', {
        name: solutions[1].title,
      })
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  test('keeps a slightly moving tap clickable without capturing it', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );

    render(<ProtocolsSection scrollToSection={vi.fn()} />);

    const carousel = screen.getByRole('region', {
      name: 'Arcvite protocols',
    });
    const grid = carousel.firstElementChild;
    const activeCard = screen.getByRole('button', {
      name: `Open ${solutions[0].title}`,
    });
    const setPointerCapture = vi.fn();
    grid.setPointerCapture = setPointerCapture;

    fireEvent.pointerDown(activeCard, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(activeCard, {
      pointerId: 1,
      clientX: 94,
      clientY: 100,
    });
    fireEvent.pointerUp(activeCard, {
      button: 0,
      pointerId: 1,
      clientX: 94,
      clientY: 100,
    });
    fireEvent.click(activeCard);

    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', {
        name: solutions[0].title,
      })
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  test('accepts another swipe while the previous swipe is settling', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    animationState.defer = true;

    render(<ProtocolsSection scrollToSection={vi.fn()} />);

    const carousel = screen.getByRole('region', {
      name: 'Arcvite protocols',
    });
    const grid = carousel.firstElementChild;

    const swipeLeft = (pointerId) => {
      fireEvent.pointerDown(grid, {
        button: 0,
        pointerId,
        clientX: 100,
        clientY: 100,
      });
      fireEvent.pointerMove(grid, {
        pointerId,
        clientX: -1000,
        clientY: 100,
      });
      fireEvent.pointerUp(grid, {
        pointerId,
        clientX: -1000,
        clientY: 100,
      });
    };

    swipeLeft(1);
    swipeLeft(2);

    expect(animationState.completions).toHaveLength(2);

    animationState.completions.at(-1)();

    expect(
      screen.getByRole('button', {
        name: `Show ${solutions[0].title} protocol`,
      })
    ).toHaveAttribute('aria-current', 'true');

    vi.unstubAllGlobals();
  });
});
