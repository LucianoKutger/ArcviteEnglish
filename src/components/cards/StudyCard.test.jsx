import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import StudyCard from './StudyCard';

const studyData = {
  id: 'ribosomal-clock',
  tag: 'BIOLOGICAL AGING',
  titlePre: 'THE',
  titleHighlight: 'RIBOSOMAL',
  titlePost: 'CLOCK',
  description: 'A description of the study.',
  quote: 'A relevant scientific quote.',
  kpis: [
    {
      id: 'methylation',
      value: '9%-69%',
      labelLine1: 'METHYLATION',
      labelLine2: 'SPECTRUM',
    },
    {
      id: 'minimum',
      value: '15%',
      labelLine1: 'BASAL MINIMUM',
      labelLine2: 'METHYLATION',
    },
  ],
};

describe('StudyCard', () => {
  test('renders study content and optional KPI values', () => {
    render(<StudyCard data={studyData} onStudyClick={vi.fn()} />);

    expect(screen.getByText(studyData.tag)).toBeInTheDocument();

    expect(screen.getByText(studyData.titleHighlight)).toBeInTheDocument();

    expect(screen.getByText(studyData.description)).toBeInTheDocument();

    expect(screen.getByText(`"${studyData.quote}"`)).toBeInTheDocument();

    for (const kpi of studyData.kpis) {
      const kpiValue = screen.getByText(kpi.value);
      const kpiBox = kpiValue.parentElement;

      expect(kpiValue).toBeInTheDocument();
      expect(kpiBox).toHaveTextContent(kpi.labelLine1);
      expect(kpiBox).toHaveTextContent(kpi.labelLine2);
    }
  });

  test('forwards the selected study and supports missing KPIs', async () => {
    const onStudyClick = vi.fn();

    const dataWithoutKpis = {
      ...studyData,
      id: 'without-kpis',
      kpis: undefined,
    };

    render(<StudyCard data={dataWithoutKpis} onStudyClick={onStudyClick} />);

    expect(screen.queryByText('9%-69%')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'VIEW STUDIES',
      })
    );

    expect(onStudyClick).toHaveBeenCalledTimes(1);

    expect(onStudyClick).toHaveBeenCalledWith('details', dataWithoutKpis.id);
  });
});
