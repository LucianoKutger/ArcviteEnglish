import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import navBarStyles from './NavBar.module.scss';

import Navbar from './Navbar';
import { navItems } from '../../data/content';

vi.mock('./ArcviteLogo', () => ({
  default: () => <img alt="Arcvite Logo" />,
}));

const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="current-location">{location.pathname}</div>;
};

const renderNavbar = (initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Navbar />
      <LocationDisplay />
    </MemoryRouter>
  );

describe('Navbar', () => {
  test('provides accessible controls for the logo and mobile navigation', async () => {
    renderNavbar();

    const navigation = screen.getByRole('navigation');

    expect(navigation).toBeInTheDocument();

    const homeButton = screen.getByRole('button', {
      name: /go to home/i,
    });

    expect(homeButton).toHaveProperty('tabIndex', 0);

    const menuButton = screen.getByRole('button', {
      name: /open navigation menu/i,
    });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-controls');

    await userEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(menuButton).toHaveAccessibleName(/close navigation menu/i);
  });
  test('opens the mobile menu, navigates to a section, and closes again', async () => {
    const targetSection = document.createElement('section');

    targetSection.id = navItems[0].targetId;
    targetSection.scrollIntoView = vi.fn();

    document.body.appendChild(targetSection);

    renderNavbar();

    const menuButton = screen.getByRole('button', {
      name: /open navigation menu/i,
    });

    const mobileNavigation = document.getElementById('mobile-navigation');

    expect(mobileNavigation).toHaveAttribute('hidden');

    await userEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(mobileNavigation).not.toHaveAttribute('hidden');

    const mobileVisionButton = within(mobileNavigation).getByRole('button', {
      name: navItems[0].label,
    });

    await userEvent.click(mobileVisionButton);

    expect(targetSection.scrollIntoView).toHaveBeenCalledTimes(1);

    expect(targetSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNavigation).toHaveAttribute('hidden');

    targetSection.remove();
  });
  test('navigates through the desktop controls on the home page', async () => {
    const sections = navItems.map((item) => {
      const section = document.createElement('section');

      section.id = item.targetId;
      section.scrollIntoView = vi.fn();

      document.body.appendChild(section);

      return section;
    });

    const auditSection = document.createElement('section');

    auditSection.id = 'audit';
    auditSection.scrollIntoView = vi.fn();

    document.body.appendChild(auditSection);

    const originalScrollTo = window.scrollTo;
    window.scrollTo = vi.fn();

    renderNavbar();

    const navigation = screen.getByRole('navigation');

    const desktopNavigation = navigation.querySelector(
      `.${navBarStyles.lpNavLinks}`
    );

    expect(desktopNavigation).not.toBeNull();

    for (const item of navItems) {
      const navigationButton = within(desktopNavigation).getByRole('button', {
        name: item.label,
        hidden: true,
      });

      await userEvent.click(navigationButton);

      const targetSection = document.getElementById(item.targetId);

      expect(targetSection.scrollIntoView).toHaveBeenCalledTimes(1);
      expect(targetSection.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
    }

    const desktopActions = navigation.querySelector(
      `.${navBarStyles.lpNavActions}`
    );

    expect(desktopActions).not.toBeNull();

    const auditButton = desktopActions.querySelector(
      `.${navBarStyles.lpHeaderAuditBtn}`
    );

    expect(auditButton).not.toBeNull();
    expect(auditButton).toHaveTextContent(/secure audit/i);

    await userEvent.click(auditButton);

    expect(auditSection.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(auditSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: /go to home/i,
      })
    );

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });

    sections.forEach((section) => section.remove());
    auditSection.remove();
    window.scrollTo = originalScrollTo;
  });

  test('returns from a subpage and scrolls to the requested section after navigation', () => {
    vi.useFakeTimers();

    const targetSection = document.createElement('section');

    targetSection.id = navItems[0].targetId;
    targetSection.scrollIntoView = vi.fn();

    document.body.appendChild(targetSection);

    renderNavbar('/impressum');

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/impressum'
    );

    const navigation = screen.getByRole('navigation');

    const desktopNavigation = navigation.querySelector(
      `.${navBarStyles.lpNavLinks}`
    );

    expect(desktopNavigation).not.toBeNull();

    const visionButton = within(desktopNavigation).getByRole('button', {
      name: navItems[0].label,
      hidden: true,
    });

    fireEvent.click(visionButton);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/');

    expect(targetSection.scrollIntoView).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(99);
    });

    expect(targetSection.scrollIntoView).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(targetSection.scrollIntoView).toHaveBeenCalledTimes(1);

    expect(targetSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });

    targetSection.remove();
    vi.useRealTimers();
  });

  test('returns from a subpage and scrolls to the top when the logo is activated', () => {
    vi.useFakeTimers();

    const originalScrollTo = window.scrollTo;
    window.scrollTo = vi.fn();

    renderNavbar('/datenschutz');

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/datenschutz'
    );

    const homeButton = screen.getByRole('button', {
      name: /go to home/i,
    });

    fireEvent.click(homeButton);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/');

    expect(window.scrollTo).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });

    window.scrollTo = originalScrollTo;
    vi.useRealTimers();
  });

  test('updates its appearance on scroll and removes the scroll listener on unmount', () => {
    const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'scrollY'
    );

    let currentScrollY = 0;

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => currentScrollY,
    });

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderNavbar();

    const navigation = screen.getByRole('navigation');

    expect(navigation).not.toHaveClass(navBarStyles.scrolled);

    const scrollRegistration = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'scroll'
    );

    expect(scrollRegistration).toBeDefined();

    const scrollHandler = scrollRegistration[1];

    currentScrollY = 21;
    fireEvent.scroll(window);

    expect(navigation).toHaveClass(navBarStyles.scrolled);

    currentScrollY = 20;
    fireEvent.scroll(window);

    expect(navigation).not.toHaveClass(navBarStyles.scrolled);

    currentScrollY = 100;
    fireEvent.scroll(window);

    expect(navigation).toHaveClass(navBarStyles.scrolled);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      scrollHandler
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();

    if (originalScrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', originalScrollYDescriptor);
    } else {
      delete window.scrollY;
    }
  });

  test('closes the mobile menu manually and after selecting the audit action', async () => {
    const auditSection = document.createElement('section');

    auditSection.id = 'audit';
    auditSection.scrollIntoView = vi.fn();

    document.body.appendChild(auditSection);

    renderNavbar();

    let menuButton = screen.getByRole('button', {
      name: /open navigation menu/i,
    });

    const mobileNavigation = document.getElementById('mobile-navigation');

    await userEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(mobileNavigation).not.toHaveAttribute('hidden');

    menuButton = screen.getByRole('button', {
      name: /close navigation menu/i,
    });

    await userEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNavigation).toHaveAttribute('hidden');

    menuButton = screen.getByRole('button', {
      name: /open navigation menu/i,
    });

    await userEvent.click(menuButton);

    const mobileAuditButton = within(mobileNavigation).getByRole('button', {
      name: /secure audit/i,
    });

    await userEvent.click(mobileAuditButton);

    expect(auditSection.scrollIntoView).toHaveBeenCalledTimes(1);

    expect(auditSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNavigation).toHaveAttribute('hidden');

    auditSection.remove();
  });

  test('moves focus into the mobile menu and closes it with Escape', async () => {
    renderNavbar();

    const menuButton = screen.getByRole('button', {
      name: /open navigation menu/i,
    });

    await userEvent.click(menuButton);

    const mobileNavigation = document.getElementById('mobile-navigation');

    expect(mobileNavigation).not.toHaveAttribute('hidden');

    const firstMobileButton = within(mobileNavigation).getByRole('button', {
      name: navItems[0].label,
    });

    expect(firstMobileButton).toHaveFocus();

    await userEvent.keyboard('{Escape}');

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNavigation).toHaveAttribute('hidden');
    expect(menuButton).toHaveFocus();
  });
});
