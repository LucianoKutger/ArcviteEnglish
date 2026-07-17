import { screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import App from './App';
import { renderWithRouter } from './test-utils/renderWithRouter';
import userEvent from '@testing-library/user-event';

const motionPreference = vi.hoisted(() => ({
  reduced: false,
}));

vi.mock('lenis/react', () => ({
  ReactLenis: ({ children }) => <div data-testid="lenis-root">{children}</div>,
  useLenis: () => null,
}));

vi.mock('./Home', () => ({
  default: function MockHome() {
    return <main aria-label="Home page" />;
  },
}));

vi.mock('framer-motion', () => ({
  useReducedMotion: () => motionPreference.reduced,
}));

describe('App routing', () => {
  beforeEach(() => {
    motionPreference.reduced = false;
  });

  test('renders navigation and the home route at "/"', () => {
    renderWithRouter(<App />, {
      route: '/',
    });

    expect(screen.getByRole('navigation')).toBeInTheDocument();

    expect(
      screen.getByRole('main', {
        name: 'Home page',
      })
    ).toBeInTheDocument();
  });

  test('loads the legal notice route at "/impressum"', async () => {
    renderWithRouter(<App />, {
      route: '/impressum',
    });

    expect(screen.getByRole('navigation')).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Impressum',
      })
    ).not.toBeInTheDocument();

    expect(
      await screen.findByRole('heading', {
        name: 'Impressum',
      })
    ).toBeInTheDocument();
  });

  test('loads the privacy route at "/datenschutz"', async () => {
    renderWithRouter(<App />, {
      route: '/datenschutz',
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Privacy Policy',
      })
    ).toBeInTheDocument();
  });

  test('loads the studies route at "/studies"', async () => {
    renderWithRouter(<App />, {
      route: '/studies',
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Related Studies',
      })
    ).toBeInTheDocument();
  });

  test('renders a not-found page and returns to the home route', async () => {
    renderWithRouter(<App />, {
      route: '/unknown-route',
    });

    expect(screen.getByRole('navigation')).toBeInTheDocument();

    expect(
      await screen.findByRole('heading', {
        name: 'Page not found',
      })
    ).toBeInTheDocument();

    const homeLink = screen.getByRole('link', {
      name: 'Return home',
    });

    await userEvent.click(homeLink);

    expect(
      screen.getByRole('main', {
        name: 'Home page',
      })
    ).toBeInTheDocument();
  });

  test('disables smooth scrolling when reduced motion is requested', () => {
    motionPreference.reduced = true;

    renderWithRouter(<App />, {
      route: '/',
    });

    expect(
      document.querySelector('[data-smooth-scroll="disabled"]')
    ).toBeInTheDocument();

    expect(screen.queryByTestId('lenis-root')).not.toBeInTheDocument();
  });
});
