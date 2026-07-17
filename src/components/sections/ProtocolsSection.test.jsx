import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import { solutions } from '../../data/content';
import ProtocolsSection from './ProtocolsSection';

const { navigateSpy, solutionCardSpy, solutionModalSpy } = vi.hoisted(() => ({
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
    let value = initialValue;
    const listeners = new Set();

    return {
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
  },
  animate: (motionValue, target) => {
    motionValue.set(target);

    return {
      stop: vi.fn(),
      then: (onComplete) => {
        onComplete();
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
      <button type="button" onClick={() => props.onOpen(props.item)}>
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
});
