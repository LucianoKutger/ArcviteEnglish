import { render, screen, waitFor } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { MemoryRouter } from 'react-router-dom';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Home from './Home';

const motionPreference = vi.hoisted(() => ({
  reduced: false,
}));

const lenisState = vi.hoisted(() => ({
  instance: null,
}));

vi.mock('framer-motion', () => ({
  useReducedMotion: () => motionPreference.reduced,
}));

vi.mock('lenis/react', () => ({
  useLenis: () => lenisState.instance,
}));

vi.mock('./components/sections/HomeSection', () => ({
  default: ({ scrollToSection }) => (
    <section id="home">
      Home
      <button type="button" onClick={() => scrollToSection('audit')}>
        Scroll to audit
      </button>
      <button type="button" onClick={() => scrollToSection('home')}>
        Scroll to home
      </button>
    </section>
  ),
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
    motionPreference.reduced = false;
    lenisState.instance = null;
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

  test('ignores navigation requests for a section that is not mounted', async () => {
    renderHome();
    vi.spyOn(document, 'getElementById').mockReturnValue(null);
    const scrollToSpy = vi.spyOn(window, 'scrollTo');

    await userEvent.click(
      screen.getByRole('button', { name: 'Scroll to audit' })
    );

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  test('uses instant section scrolling with reduced motion', async () => {
    motionPreference.reduced = true;

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
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
      });
    });
  });

  test('refreshes Lenis dimensions before route-target scrolling', async () => {
    const target = {
      scrollIntoView: vi.fn(),
    };

    lenisState.instance = {
      resize: vi.fn(),
      scrollTo: vi.fn(),
    };

    vi.spyOn(document, 'getElementById').mockImplementation((id) =>
      id === 'vision' ? target : null
    );

    renderHome('vision');

    await waitFor(() => {
      expect(lenisState.instance.resize).toHaveBeenCalledTimes(1);
      expect(lenisState.instance.scrollTo).toHaveBeenCalledWith(target);
    });

    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });

  test('handles direct section and home navigation requests', async () => {
    const originalScrollTo = window.scrollTo;
    const scrollIntoView = vi.fn();

    window.scrollTo = vi.fn();

    renderHome();

    const auditSection = document.getElementById('audit');

    auditSection.scrollIntoView = scrollIntoView;

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Scroll to audit',
      })
    );

    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Scroll to home',
      })
    );

    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });

    window.scrollTo = originalScrollTo;
  });
});
