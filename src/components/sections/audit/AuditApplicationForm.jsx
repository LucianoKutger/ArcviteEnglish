import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Controller } from 'react-hook-form';

import { goalOptions } from '../../../data/content';
import FormInput from '../../ui/FormInput';
import PhoneInput from '../../ui/PhoneInput';
import styles from '../AuditSection.module.scss';
import useAuditApplicationForm from './useAuditApplicationForm';

const AuditApplicationForm = () => {
  const form = useAuditApplicationForm();

  return (
    <form
      key={form.formResetKey}
      className={styles.form}
      onSubmit={form.handleSubmit(form.onSubmit, form.onInvalid)}
      noValidate
      autoComplete="off"
    >
      <div className={styles.inputGrid}>
        <div
          className={`${styles.inputWrapper} ${
            form.errors.firstName && !form.clearedErrorStyles.firstName
              ? styles.hasError
              : ''
          }`}
        >
          <FormInput
            label="First Name *"
            placeholder="John"
            {...form.register('firstName', {
              onChange: () => {
                form.clearErrorStyle('firstName');
              },
            })}
          />
        </div>
        <div
          className={`${styles.inputWrapper} ${
            form.errors.lastName && !form.clearedErrorStyles.lastName
              ? styles.hasError
              : ''
          }`}
        >
          <FormInput
            label="Last Name *"
            placeholder="Doe"
            {...form.register('lastName', {
              onChange: () => {
                form.clearErrorStyle('lastName');
              },
            })}
          />
        </div>

        <div
          className={`${styles.inputWrapper} ${
            form.errors.email && !form.clearedErrorStyles.email
              ? styles.hasError
              : ''
          }`}
        >
          <FormInput
            label="E-Mail *"
            type="email"
            placeholder="john@company.com"
            {...form.register('email', {
              onChange: () => {
                form.clearErrorStyle('email');
              },
            })}
          />
        </div>

        <div
          className={`${styles.inputWrapper} ${
            form.errors.phone && !form.clearedErrorStyles.phone
              ? styles.hasError
              : ''
          }`}
        >
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <PhoneInput
                label="Phone Number *"
                countryValue={form.phoneCountry}
                onCountryChange={form.setPhoneCountry}
                phoneValue={field.value}
                onPhoneChange={(value) => {
                  field.onChange(value);
                  form.clearErrorStyle('phone');

                  if (form.isSuccess) {
                    form.setIsSuccess(false);
                  }
                }}
              />
            )}
          />
        </div>
      </div>

      <div
        className={`${styles.goalsSection} ${
          form.errors.goals && !form.clearedErrorStyles.goals
            ? styles.hasError
            : ''
        }`}
      >
        <label className={styles.goalsLabel}>
          Goals * (multiple selection possible)
        </label>
        <Controller
          name="goals"
          control={form.control}
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
                      if (form.isSuccess) {
                        form.setIsSuccess(false);
                      }

                      const nextValue = isActive
                        ? field.value.filter((value) => value !== goal.value)
                        : [...field.value, goal.value];

                      field.onChange(nextValue);
                      form.clearErrorStyle('goals');
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
          form.errors.tos && !form.clearedErrorStyles.tos
            ? styles.hasError
            : ''
        }`}
      >
        <input
          type="checkbox"
          id="tos"
          className={styles.tosCheckbox}
          {...form.register('tos', {
            onChange: () => {
              form.clearErrorStyle('tos');

              if (form.isSuccess) {
                form.setIsSuccess(false);
              }
            },
          })}
        />
        <label htmlFor="tos" className={styles.tosLabel}>
          I have read and agree to the{' '}
          <Link to="/datenschutz" className={styles.tosLink}>
            Privacy Policy
          </Link>{' '}
          and consent to the processing of my data for the purpose of this audit
          request. *
        </label>
      </div>

      {form.hasErrors && form.submitCount > 0 && (
        <p className={styles.errorMessage}>
          Please provide the following:{' '}
          {Object.values(form.errors)
            .map((error) => error.message)
            .join(', ')}
          .
        </p>
      )}

      {form.isSuccess && (
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
        * To guarantee the depth and excellence of our service, we only accept a
        limited number of new clients per quarter. We will get back to you within
        24 hours.
      </p>
    </form>
  );
};

export default AuditApplicationForm;
