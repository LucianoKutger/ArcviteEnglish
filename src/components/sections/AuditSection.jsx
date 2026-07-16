import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { auditSchema, normalizePhoneNumber } from '../../validation/auditForm';

import FadeOutSection from '../visuals/FadeoutSection';
import FormInput from '../ui/FormInput';
import PhoneInput, { COUNTRIES } from '../ui/PhoneInput';
import { goalOptions } from '../../data/content';
import styles from './AuditSection.module.scss';

const AuditSection = () => {
  const [phoneCountry, setPhoneCountry] = useState('+49');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [clearedErrorStyles, setClearedErrorStyles] = useState({});

  const clearErrorStyle = (fieldName) => {
    setClearedErrorStyles((currentStyles) => ({
      ...currentStyles,
      [fieldName]: true,
    }));
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(auditSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      goals: [],
      tos: false,
    },
  });

  const onSubmit = (data) => {
    setIsSuccess(true);

    const currentCountry = COUNTRIES.find(
      (country) => country.code === phoneCountry
    );

    const fullPhoneNumber = normalizePhoneNumber({
      countryCode: phoneCountry,
      phoneNumber: data.phone,
      trunkPrefix: currentCountry?.trunkPrefix ?? '',
    });

    console.log('Form submitted perfectly:', {
      ...data,
      phone: fullPhoneNumber,
    });

    // 1. React-Hook-Form-Zustände zurücksetzen
    reset();
    setClearedErrorStyles({});
    setPhoneCountry('+49');

    // 2. NEU: Key hochzählen, um die Autofill-Farbblöcke im Browser wegzusprengen!
    setFormResetKey((prev) => prev + 1);
  };

  const hasErrors = Object.keys(errors).length > 0;

  const onInvalid = () => {
    setClearedErrorStyles({});
  };

  return (
    <FadeOutSection id="audit" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.auditCard}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              <span className={styles.titleBold}>Audit Application</span>
            </h2>
          </div>

          {/* NEU: key={formResetKey} zwingt das Formular zum sauberen Remount */}
          <form
            key={formResetKey}
            className={styles.form}
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
            autoComplete="off"
          >
            <div className={styles.inputGrid}>
              <div
                className={`${styles.inputWrapper} ${
                  errors.firstName && !clearedErrorStyles.firstName
                    ? styles.hasError
                    : ''
                }`}
              >
                <FormInput
                  label="First Name *"
                  placeholder="John"
                  {...register('firstName', {
                    onChange: () => {
                      clearErrorStyle('firstName');
                    },
                  })}
                />
              </div>
              <div
                className={`${styles.inputWrapper} ${
                  errors.lastName && !clearedErrorStyles.lastName
                    ? styles.hasError
                    : ''
                }`}
              >
                <FormInput
                  label="Last Name *"
                  placeholder="Doe"
                  {...register('lastName', {
                    onChange: () => {
                      clearErrorStyle('lastName');
                    },
                  })}
                />
              </div>
            </div>

            <div className={styles.inputGrid}>
              <div
                className={`${styles.inputWrapper} ${
                  errors.email && !clearedErrorStyles.email
                    ? styles.hasError
                    : ''
                }`}
              >
                <FormInput
                  label="E-Mail *"
                  type="email"
                  placeholder="john@company.com"
                  {...register('email', {
                    onChange: () => {
                      clearErrorStyle('email');
                    },
                  })}
                />
              </div>

              <div
                className={`${styles.inputWrapper} ${
                  errors.phone && !clearedErrorStyles.phone
                    ? styles.hasError
                    : ''
                }`}
              >
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      label="Phone Number *"
                      countryValue={phoneCountry}
                      onCountryChange={setPhoneCountry}
                      phoneValue={field.value}
                      onPhoneChange={(value) => {
                        field.onChange(value);
                        clearErrorStyle('phone');

                        if (isSuccess) {
                          setIsSuccess(false);
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div
              className={`${styles.goalsSection} ${
                errors.goals && !clearedErrorStyles.goals ? styles.hasError : ''
              }`}
            >
              <label className={styles.goalsLabel}>
                Goals * (multiple selection possible)
              </label>
              <Controller
                name="goals"
                control={control}
                render={({ field }) => (
                  <div className={styles.goalsContainer}>
                    {goalOptions.map((goal) => {
                      const isActive = field.value.includes(goal.value);
                      return (
                        <button
                          key={goal.value}
                          type="button"
                          aria-pressed={isActive}
                          className={`${styles.goalButton} ${isActive ? styles.active : styles.inactive}`}
                          onClick={() => {
                            if (isSuccess) {
                              setIsSuccess(false);
                            }

                            const nextValue = isActive
                              ? field.value.filter(
                                  (value) => value !== goal.value
                                )
                              : [...field.value, goal.value];

                            field.onChange(nextValue);
                            clearErrorStyle('goals');
                          }}
                        >
                          {goal.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div
              className={`${styles.tosSection} ${
                errors.tos && !clearedErrorStyles.tos ? styles.hasError : ''
              }`}
            >
              <input
                type="checkbox"
                id="tos"
                className={styles.tosCheckbox}
                {...register('tos', {
                  onChange: () => {
                    clearErrorStyle('tos');

                    if (isSuccess) {
                      setIsSuccess(false);
                    }
                  },
                })}
              />
              <label htmlFor="tos" className={styles.tosLabel}>
                I have read and agree to the{' '}
                <Link to="/datenschutz" className={styles.tosLink}>
                  Privacy Policy
                </Link>{' '}
                and consent to the processing of my data for the purpose of this
                audit request. *
              </label>
            </div>

            {hasErrors && submitCount > 0 && (
              <p className={styles.errorMessage}>
                Please provide the following:{' '}
                {Object.values(errors)
                  .map((e) => e.message)
                  .join(', ')}
                .
              </p>
            )}

            {isSuccess && (
              <p className={styles.successMessage}>
                Appointment requested successfully!
              </p>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              aria-label="Check availability"
            >
              <span className={styles.submitButtonContent}>
                <span className={styles.submitButtonText}>
                  <span>Check</span>
                  <span>availability</span>
                </span>

                <Send className={styles.sendIcon} />
              </span>
            </button>

            <p className={styles.disclaimer}>
              * To guarantee the depth and excellence of our service, we only
              accept a limited number of new clients per quarter. We will get
              back to you within 24 hours.
            </p>
          </form>
        </div>
      </div>
    </FadeOutSection>
  );
};

export default AuditSection;
