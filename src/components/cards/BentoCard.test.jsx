import { render, screen } from '@testing-library/react';

import BentoCard from './BentoCard';
import styles from './BentoCard.module.scss';

describe('BentoCard', () => {
  test('renders title, subtitle, icon, children, and custom class', () => {
    const { container } = render(
      <BentoCard
        title="Biological resilience"
        subtitle="Supporting information"
        icon={<span data-testid="card-icon">Icon</span>}
        className="custom-card"
      >
        <p>Card content</p>
      </BentoCard>
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Biological resilience',
      })
    ).toBeInTheDocument();

    expect(screen.getByText('Supporting information')).toBeInTheDocument();

    expect(screen.getByTestId('card-icon')).toBeInTheDocument();

    expect(screen.getByText('Card content')).toBeInTheDocument();

    const card = container.querySelector(`.${styles.card}`);

    expect(card).toHaveClass('custom-card');
  });

  test('omits optional subtitle and icon', () => {
    render(
      <BentoCard title="Minimal card">
        <span>Required child</span>
      </BentoCard>
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Minimal card',
      })
    ).toBeInTheDocument();

    expect(screen.queryByTestId('card-icon')).not.toBeInTheDocument();

    expect(
      screen.queryByText('Supporting information')
    ).not.toBeInTheDocument();

    expect(screen.getByText('Required child')).toBeInTheDocument();
  });
});
