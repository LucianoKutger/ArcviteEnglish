import { render, screen } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

vi.mock(
  'lenis/react',
  () => {
    const React = require('react');

    return {
      ReactLenis: ({ children }) =>
        React.createElement(React.Fragment, null, children),
    };
  },
  { virtual: true }
);

vi.mock(
  'react-router-dom',
  () => {
    const React = require('react');

    return {
      Routes: ({ children }) => {
        const startRoute = React.Children.toArray(children).find(
          (child) => React.isValidElement(child) && child.props.path === '/'
        );

        return startRoute?.props.element ?? null;
      },
      Route: () => null,
      Link: ({ to, children, ...props }) =>
        React.createElement('a', { href: to, ...props }, children),
      useNavigate: () => () => {},
      useLocation: () => ({ pathname: '/' }),
    };
  },
  { virtual: true }
);

vi.mock('./Home', () => {
  const React = require('react');

  return {
    default: function MockHome() {
      return React.createElement('main', {
        'aria-label': 'Home page',
      });
    },
  };
});

test('renders the application navigation and home content', () => {
  render(<App />);

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('main', { name: 'Home page' })).toBeInTheDocument();
});
