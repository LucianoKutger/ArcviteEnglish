import { Link } from 'react-router-dom';

const NotFound = () => {
  const containerStyle = {
    minHeight: '100vh',
    padding: '160px 24px 80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#ffffff',
  };

  const codeStyle = {
    margin: 0,
    color: '#2dd4bf',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
  };

  const headingStyle = {
    margin: '16px 0',
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    fontWeight: 300,
  };

  const descriptionStyle = {
    maxWidth: '560px',
    margin: '0 0 32px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.6,
  };

  const linkStyle = {
    padding: '12px 24px',
    border: '1px solid rgba(45, 212, 191, 0.6)',
    borderRadius: '9999px',
    color: '#ffffff',
    textDecoration: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  };

  return (
    <main style={containerStyle} aria-labelledby="not-found-title">
      <p style={codeStyle}>Error 404</p>

      <h1 id="not-found-title" style={headingStyle}>
        Page not found
      </h1>

      <p style={descriptionStyle}>
        The page you requested does not exist or may have been moved.
      </p>

      <Link to="/" style={linkStyle}>
        Return home
      </Link>
    </main>
  );
};

export default NotFound;
