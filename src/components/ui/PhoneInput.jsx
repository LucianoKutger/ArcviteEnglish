import React from 'react';
import inputStyles from './FormInput.module.scss';
import styles from './PhoneInput.module.scss';

// Eine Auswahl gängiger Länder. Du kannst die Liste beliebig mit allen ISO-Codes erweitern.
export const COUNTRIES = [
    { code: '+49', flag: '🇩🇪', name: 'Germany', trunkPrefix: '0' },
    { code: '+43', flag: '🇦🇹', name: 'Austria', trunkPrefix: '0' },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland', trunkPrefix: '0' },
];

const PhoneInput = ({ label, countryValue, onCountryChange, phoneValue, onPhoneChange, ...props }) => {
  
  const handleInputChange = (e) => {
    // Entfernt alles, was KEINE Zahl ist (erlaubt nur 0-9)
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    onPhoneChange(onlyNumbers);
  };

  return (
    <div className={styles.phoneFieldGroup}>
      {/* Länder-Auswahl links */}
      <select 
        value={countryValue} 
        onChange={(e) => onCountryChange(e.target.value)}
        className={styles.countrySelect}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>

      {/* Eigentliches Input-Feld rechts daneben */}
      <div className={inputStyles.group} style={{ flex: 1 }}>
        <input 
          type="text" 
          value={phoneValue}
          onChange={handleInputChange}
          placeholder=" " // Wichtig für die CSS-Validierung :not(:placeholder-shown)
          className={`${inputStyles.input} ${styles.customInputOverride}`}
          {...props}
        />
        <label className={inputStyles.label}>
          {label}
        </label>
      </div>
    </div>
  );
};

export default PhoneInput