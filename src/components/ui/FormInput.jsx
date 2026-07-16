import { useId } from 'react';

import inputStyles from './FormInput.module.scss';

const FormInput = ({ id, label, placeholder, type = 'text', ...props }) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={inputStyles.group}>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        className={inputStyles.input}
        {...props}
      />

      <label htmlFor={inputId} className={inputStyles.label}>
        {label}
      </label>
    </div>
  );
};

export default FormInput;
