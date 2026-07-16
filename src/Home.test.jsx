import { render, waitFor } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Home from './Home';

vi.mock('./components/sections/HomeSection', () => ({
  default: () => <section id="home">Home</section>,
}));

vi.mock('./components/sections/VisionSection', () => ({
  default: () => <section id="vision">Vision</section>,
}));

vi.mock('./components/sections/MethodologySection', () => ({
  default: () => <section id="methodik">Methodology</section>,
}));

vi.mock('./components/sections/StudySection', () => ({
  default: () => <section id="studies">Studies</section>,
}));

vi.mock('./components/sections/FounderSection', () => ({
  default: () => <section id="founder">Founder</section>,
}));

vi.mock('./components/sections/BioSyncSection', () => ({
  default: () => <section id="biosync">BioSync</section>,
}));

vi.mock('./components/sections/ProtocolsSection', () => ({
  default: () => <section id="protokolle">Protocols</section>,
}));

vi.mock('./components/sections/AuditSection', () => ({
  default: () => <section id="audit">Audit</section>,
}));

vi.mock('./components/sections/FaqSection', () => ({
  default: () => <section id="faq">FAQ</section>,
}));

const renderHome = (scrollTarget) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/',
          state: scrollTarget
            ? {
                scrollTarget,
              }
            : null,
        },
      ]}
    >
      <Home />
    </MemoryRouter>
  );

describe('Home route scrolling', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      callback(0);
      return 1;
    });

    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('scrolls to the requested section after mounting', async () => {
    const scrollIntoView = vi.fn();

    vi.spyOn(document, 'getElementById').mockImplementation((id) =>
      id === 'vision'
        ? {
            scrollIntoView,
          }
        : null
    );

    renderHome('vision');

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  test('scrolls to the top for the home target', async () => {
    const originalScrollTo = window.scrollTo;

    window.scrollTo = vi.fn();

    renderHome('home');

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    window.scrollTo = originalScrollTo;
  });

  test('does not scroll without a navigation target', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');

    const getElementSpy = vi.spyOn(document, 'getElementById');

    renderHome();

    expect(scrollToSpy).not.toHaveBeenCalled();

    expect(getElementSpy).not.toHaveBeenCalled();
  });
});
