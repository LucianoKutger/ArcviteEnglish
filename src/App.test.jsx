import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import App from './App';
import { renderWithRouter } from './test-utils/renderWithRouter';

vi.mock('lenis/react', () => ({
  ReactLenis: ({ children }) => children,
}));

vi.mock('./Home', () => ({
  default: function MockHome() {
    return <main aria-label="Home page" />;
  },
}));

describe('App routing', () => {
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
        name: 'Datenschutz Filler',
      })
    ).toBeInTheDocument();
  });

  test('loads the studies route at "/studies"', async () => {
    renderWithRouter(<App />, {
      route: '/studies',
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Hier kommen die Studien',
      })
    ).toBeInTheDocument();
  });

  test('keeps the global navigation but renders no page for an unknown route', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    renderWithRouter(<App />, {
      route: '/unknown-route',
    });

    expect(screen.getByRole('navigation')).toBeInTheDocument();

    expect(
      screen.queryByRole('main', {
        name: 'Home page',
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Impressum',
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Datenschutz Filler',
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Hier kommen die Studien',
      })
    ).not.toBeInTheDocument();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No routes matched location')
    );
  });
});
