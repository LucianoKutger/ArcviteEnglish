import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';

import FAQItem from './Faq';

const question = 'How does the audit process work?';
const answer = 'The audit evaluates the available health and performance data.';

describe('FAQItem', () => {
  test('exposes its accordion state and connects the question with the answer', () => {
    const { rerender } = render(
      <FAQItem
        question={question}
        answer={answer}
        isOpen={false}
        onToggle={vi.fn()}
      />
    );

    let button = screen.getByRole('button', {
      name: question,
    });

    expect(button).toHaveAttribute('aria-expanded', 'false');

    const answerId = button.getAttribute('aria-controls');

    expect(answerId).toBeTruthy();
    expect(document.getElementById(answerId)).not.toBeInTheDocument();
    expect(screen.queryByText(answer)).not.toBeInTheDocument();

    rerender(
      <FAQItem question={question} answer={answer} isOpen onToggle={vi.fn()} />
    );

    button = screen.getByRole('button', {
      name: question,
    });

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', answerId);

    const answerRegion = screen.getByRole('region', {
      name: question,
    });

    expect(answerRegion).toHaveAttribute('id', answerId);
    expect(within(answerRegion).getByText(answer)).toBeInTheDocument();
  });
});
