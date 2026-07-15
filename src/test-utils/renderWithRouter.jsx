import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export const renderWithRouter = (
  ui,
  { route = '/', initialEntries = [route], initialIndex, ...renderOptions } = {}
) =>
  render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      {ui}
    </MemoryRouter>,
    renderOptions
  );
