const PrivacySettings = () => {
    const containerStyle = {
        padding: '120px 20px 80px', // Oben 120px Platz für die Navbar
        maxWidth: '900px',
        margin: '0 auto',
        color: '#ffffff', // Weißer Text für den dunklen Hintergrund
        fontFamily: 'sans-serif',
        lineHeight: '1.6',
        zIndex: 2,
        position: 'relative'
    };

    const sectionStyle = {
        marginBottom: '40px'
    };

    const heading1Style = {
        fontSize: '2.5rem',
        marginBottom: '30px',
        fontWeight: '700'
    };

    const heading2Style = {
        fontSize: '1.5rem',
        marginBottom: '15px',
        color: '#f0f0f0', // Leicht abgesetztes Weiß für Unterüberschriften
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '10px'
    };

    const linkStyle = {
        color: '#3498db', // Ein dezentes Blau für Links
        textDecoration: 'none'
    };

    return (
        <div style={containerStyle}>
            <section style={sectionStyle}>
                <h1 style={heading1Style}>Datenschutz Filler</h1>
                <p>
                    <strong>Andreas Seitz</strong><br />
                    Arcvite<br />
                    STRAẞe 25908<br />
                    97078 Würzburg
                </p>
            </section>

            <section style={sectionStyle}>
                <h2 style={heading2Style}>Rechtliche Hinweise</h2>
                <p>
                    Arcvite erbringt keine medizinischen Leistungen, Diagnosen oder Heilbehandlungen im 
                    Sinne des Heilpraktikergesetzes. Die von Arcvite angebotenen Dienstleistungen dienen 
                    ausschließlich der datengestützten Prävention und Leistungsoptimierung. Alle 
                    medizinischen Analysen (insb. Blut- und Genanalysen) sowie deren medizinische 
                    Auswertung werden durch unabhängige, staatlich zugelassene Labore und Partnerärzte 
                    durchgeführt.
                </p>
            </section>

            <section style={sectionStyle}>
                <h2 style={heading2Style}>Kontakt</h2>
                <p>
                    Telefon: 0179 / 5284590<br />
                    E-Mail: <a href="mailto:seitz.andreas10@gmail.com" style={linkStyle}>seitz.andreas10@gmail.com</a><br />
                    Website: <a href="http://www.arcvite.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.arcvite.de</a>
                </p>
            </section>

            <section style={sectionStyle}>
                <h2 style={heading2Style}>Redaktionell verantwortlich</h2>
                <p>
                    Andreas Seitz<br />
                    STRAẞe 25908<br />
                    97078 Würzburg
                </p>
            </section>

            <section style={sectionStyle}>
                <h2 style={heading2Style}>EU-Streitbeilegung</h2>
                <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                    <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={linkStyle}> https://ec.europa.eu/consumers/odr/</a>.<br />
                    Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
            </section>

            <section style={sectionStyle}>
                <h2 style={heading2Style}>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
                <p>
                    Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                    Verbraucherschlichtungsstelle teilzunehmen.
                </p>
            </section>
        </div>
    );
}


export default PrivacySettings;