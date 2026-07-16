const StudyDetails = () => {
  const containerStyle = {
    padding: '120px 20px 80px', // Oben 120px Platz für die Navbar
    maxWidth: '900px',
    margin: '0 auto',
    color: '#ffffff', // Weißer Text für den dunklen Hintergrund
    fontFamily: 'sans-serif',
    lineHeight: '1.6',
    zIndex: 2,
    position: 'relative',
  };
  return (
    <div style={containerStyle}>
      <h1>Related Studies</h1>
    </div>
  );
};

export default StudyDetails;
