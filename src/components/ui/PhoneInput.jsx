import React, { useId } from 'react';
import inputStyles from './FormInput.module.scss';
import styles from './PhoneInput.module.scss';

// Eine Auswahl gängiger Länder. Du kannst die Liste beliebig mit allen ISO-Codes erweitern.
export const COUNTRIES = [
  { code: '+49', flag: '🇩🇪', name: 'Germany', trunkPrefix: '0' },
  { code: '+43', flag: '🇦🇹', name: 'Austria', trunkPrefix: '0' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland', trunkPrefix: '0' },
];

const PhoneInput = ({
  id,
  label,
  countryValue,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const countrySelectId = `${inputId}-country`;

  const handleInputChange = (event) => {
    const onlyNumbers = event.target.value.replace(/\D/g, '');

    onPhoneChange(onlyNumbers);
  };

  return (
    <div className={styles.phoneFieldGroup}>
      <select
        id={countrySelectId}
        aria-label="Phone country code"
        value={countryValue}
        onChange={(event) => onCountryChange(event.target.value)}
        className={styles.countrySelect}
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.code}
          </option>
        ))}
      </select>

      <div className={inputStyles.group} style={{ flex: 1 }}>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={phoneValue}
          onChange={handleInputChange}
          placeholder=" "
          className={`${inputStyles.input} ${styles.customInputOverride}`}
          {...props}
        />

        <label htmlFor={inputId} className={inputStyles.label}>
          {label}
        </label>
      </div>
    </div>
  );
};

export default PhoneInput;
