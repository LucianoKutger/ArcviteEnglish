import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { faqs } from '../../data/content';
import FaqSection from './FaqSection';

vi.mock('../ui/ResponsiveImage', () => ({
  default: ({ alt }) => <img alt={alt} />,
}));

const renderSection = (scrollToSection = vi.fn()) => {
  render(
    <MemoryRouter>
      <FaqSection scrollToSection={scrollToSection} />
    </MemoryRouter>
  );

  return scrollToSection;
};

describe('FaqSection', () => {
  test('keeps at most one FAQ entry expanded', async () => {
    renderSection();

    const firstButton = screen.getByRole('button', {
      name: faqs[0].question,
    });

    const secondButton = screen.getByRole('button', {
      name: faqs[1].question,
    });

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(secondButton).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(firstButton);

    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(secondButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(faqs[0].answer)).toBeInTheDocument();

    await userEvent.click(secondButton);

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(screen.queryByText(faqs[0].answer)).not.toBeInTheDocument();
    });

    expect(screen.getByText(faqs[1].answer)).toBeInTheDocument();

    await userEvent.click(secondButton);

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    expect(secondButton).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => {
      expect(screen.queryByText(faqs[1].answer)).not.toBeInTheDocument();
    });
  });

  test('renders the footer links and sends the CTA to the audit section', async () => {
    const scrollToSection = renderSection();

    expect(
      screen.getByRole('heading', {
        name: 'Frequently Asked Questions',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Legal Notice',
      })
    ).toHaveAttribute('href', '/impressum');

    expect(
      screen.getByRole('link', {
        name: 'Privacy Policy',
      })
    ).toHaveAttribute('href', '/datenschutz');

    await userEvent.click(
      screen.getByRole('button', {
        name: /secure audit/i,
      })
    );

    expect(scrollToSection).toHaveBeenCalledTimes(1);
    expect(scrollToSection).toHaveBeenCalledWith('audit');
  });

  test('provides an accessible keyboard control for returning home', async () => {
    const scrollToSection = renderSection();

    const homeButton = screen.getByRole('button', {
      name: /go to home/i,
    });

    expect(homeButton).toHaveProperty('tabIndex', 0);

    await userEvent.click(homeButton);

    expect(scrollToSection).toHaveBeenCalledTimes(1);
    expect(scrollToSection).toHaveBeenCalledWith('home');

    homeButton.focus();

    await userEvent.keyboard('{Enter}');

    expect(scrollToSection).toHaveBeenCalledTimes(2);

    await userEvent.keyboard(' ');

    expect(scrollToSection).toHaveBeenCalledTimes(3);
  });
});
