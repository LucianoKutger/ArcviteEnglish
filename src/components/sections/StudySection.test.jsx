import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import { studiesData } from '../../data/content';
import styles from './StudySection.module.scss';
import StudySection from './StudySection';

const { navigateSpy, studyCardSpy, backgroundGlowSpy } = vi.hoisted(() => ({
  navigateSpy: vi.fn(),
  studyCardSpy: vi.fn(),
  backgroundGlowSpy: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateSpy,
}));

vi.mock('../visuals/FadeoutSection', () => ({
  default: ({ id, className, children }) => (
    <section id={id} className={className}>
      {children}
    </section>
  ),
}));

vi.mock('../visuals/BackgroundGlow', () => ({
  default: (props) => {
    backgroundGlowSpy(props);

    return <div data-testid="background-glow" />;
  },
}));

vi.mock('../cards/StudyCard', () => ({
  default: (props) => {
    studyCardSpy(props);

    return (
      <button
        type="button"
        onClick={() => props.onStudyClick('details', props.data.id)}
      >
        Open study {props.data.titleHighlight}
      </button>
    );
  },
}));

vi.mock('../../data/content', () => ({
  studiesData: [
    {
      id: 'study-one',
      titleHighlight: 'Study One',
    },
    {
      id: 'study-two',
      titleHighlight: 'Study Two',
    },
    {
      id: 'study-three',
      titleHighlight: 'Study Three',
    },
  ],
}));

describe('StudySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders every study and only the required dividers', () => {
    const { container } = render(<StudySection />);

    expect(screen.getByText('The Science we are using')).toBeInTheDocument();

    for (const study of studiesData) {
      expect(
        screen.getByRole('button', {
          name: `Open study ${study.titleHighlight}`,
        })
      ).toBeInTheDocument();
    }

    expect(studyCardSpy).toHaveBeenCalledTimes(studiesData.length);

    expect(container.querySelectorAll(`.${styles.cardDivider}`)).toHaveLength(
      studiesData.length - 1
    );

    expect(
      container.querySelectorAll(`.${styles.cardDividerMobile}`)
    ).toHaveLength(studiesData.length - 1);

    expect(backgroundGlowSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'glow',
        variant: 'study',
      })
    );
  });

  test('navigates to studies when a study card is selected', async () => {
    render(<StudySection />);

    await userEvent.click(
      screen.getByRole('button', {
        name: `Open study ${studiesData[1].titleHighlight}`,
      })
    );

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('/studies');
  });
});
