import { screen, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { renderWithRouter } from '../../test-utils/renderWithRouter';
import AuditSection from './AuditSection';
import styles from './AuditSection.module.scss';

vi.mock('../visuals/FadeoutSection', () => ({
  default: function MockFadeOutSection({ id, className, children }) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  },
}));

const getInputWrapper = (input) => {
  const wrapper = input.closest(`.${styles.inputWrapper}`);

  if (!(wrapper instanceof HTMLElement)) {
    throw new Error('Input wrapper was not found');
  }

  return wrapper;
};

const renderAuditSection = () => renderWithRouter(<AuditSection />);

const getSubmitButton = () =>
  screen.getByRole('button', {
    name: 'Check availability',
  });

const getAuditForm = () => {
  const form = getSubmitButton().closest('form');

  if (!form) {
    throw new Error('Audit form was not found');
  }

  return form;
};

const getPhoneInput = () => {
  const phoneInput = getAuditForm().querySelector('input[placeholder=" "]');

  if (!(phoneInput instanceof HTMLInputElement)) {
    throw new Error('Phone input was not found');
  }

  return phoneInput;
};

const getGoalButton = (name) =>
  screen.getByRole('button', {
    name,
  });

const fillValidAuditApplication = async ({
  countryCode = '+43',
  phoneNumber = '0664 123-45-67',
  goalName = 'Performance & Energy',
  email = 'john@example.com',
} = {}) => {
  await userEvent.type(screen.getByPlaceholderText('John'), 'John');

  await userEvent.type(screen.getByPlaceholderText('Doe'), 'Doe');

  await userEvent.type(screen.getByPlaceholderText('john@company.com'), email);

  await userEvent.selectOptions(screen.getByRole('combobox'), countryCode);

  await userEvent.type(getPhoneInput(), phoneNumber);

  await userEvent.click(
    screen.getByRole('button', {
      name: goalName,
    })
  );

  await userEvent.click(screen.getByRole('checkbox'));
};

const submitValidAuditApplication = async (options = {}) => {
  await fillValidAuditApplication(options);
  await userEvent.click(getSubmitButton());

  return screen.findByText('Appointment requested successfully!');
};

describe('AuditSection', () => {
  test('renders the initial empty form with its default values', () => {
    renderAuditSection();

    const submitButton = screen.getByRole('button', {
      name: /check\s+availability/i,
    });

    const form = submitButton.closest('form');

    expect(
      screen.getByRole('heading', {
        name: 'Audit Application',
      })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText('John')).toHaveValue('');
    expect(screen.getByPlaceholderText('Doe')).toHaveValue('');

    expect(screen.getByPlaceholderText('john@company.com')).toHaveValue('');

    const phoneInput = form.querySelector('input[placeholder=" "]');

    expect(phoneInput).toHaveValue('');

    expect(screen.getByRole('combobox')).toHaveValue('+49');
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    expect(form).toHaveAttribute('autocomplete', 'off');
    expect(form.noValidate).toBe(true);

    expect(
      screen.queryByText(/please provide the following/i)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText('Appointment requested successfully!')
    ).not.toBeInTheDocument();
  });

  test('shows all required validation errors after an empty submit', async () => {
    renderAuditSection();

    await userEvent.click(
      screen.getByRole('button', {
        name: /check\s+availability/i,
      })
    );

    const errorMessage = await screen.findByText(
      /please provide the following/i
    );

    expect(errorMessage).toHaveTextContent('First Name (min. 2 characters)');

    expect(errorMessage).toHaveTextContent('Last Name (min. 2 characters)');

    expect(errorMessage).toHaveTextContent('a valid E-Mail address');

    expect(errorMessage).toHaveTextContent('a valid Phone Number');

    expect(errorMessage).toHaveTextContent('Goals');
    expect(errorMessage).toHaveTextContent('Terms of Service');

    expect(
      screen.queryByText('Appointment requested successfully!')
    ).not.toBeInTheDocument();
  });

  test('links the consent text to the privacy route', () => {
    renderAuditSection();

    const privacyLink = screen.getByRole('link', {
      name: 'Privacy Policy',
    });

    expect(privacyLink).toHaveAttribute('href', '/datenschutz');
  });
  test('submits a valid application and resets the complete form', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderAuditSection();

    const performanceGoal = screen.getByRole('button', {
      name: 'Performance & Energy',
    });

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'false');

    await fillValidAuditApplication();

    expect(screen.getByRole('combobox')).toHaveValue('+43');

    expect(getPhoneInput()).toHaveValue('06641234567');

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'true');

    expect(screen.getByRole('checkbox')).toBeChecked();

    await userEvent.click(getSubmitButton());

    expect(
      await screen.findByText('Appointment requested successfully!')
    ).toBeInTheDocument();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    expect(consoleLogSpy).toHaveBeenCalledWith('Form submitted perfectly:', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+436641234567',
      goals: ['performance'],
      tos: true,
    });

    expect(screen.getByPlaceholderText('John')).toHaveValue('');
    expect(screen.getByPlaceholderText('Doe')).toHaveValue('');

    expect(screen.getByPlaceholderText('john@company.com')).toHaveValue('');

    expect(getPhoneInput()).toHaveValue('');

    expect(screen.getByRole('combobox')).toHaveValue('+49');
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    expect(
      screen.getByRole('button', {
        name: 'Performance & Energy',
      })
    ).toHaveAttribute('aria-pressed', 'false');

    expect(
      screen.queryByText(/please provide the following/i)
    ).not.toBeInTheDocument();
  });
  test('hides the success message when a new phone number is entered', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    renderAuditSection();

    await fillValidAuditApplication({
      countryCode: '+49',
      phoneNumber: '01701234567',
    });

    await userEvent.click(getSubmitButton());

    expect(
      await screen.findByText('Appointment requested successfully!')
    ).toBeInTheDocument();

    const resetPhoneInput = getPhoneInput();

    await userEvent.type(resetPhoneInput, '01711234567');

    expect(resetPhoneInput).toHaveValue('01711234567');

    expect(
      screen.queryByText('Appointment requested successfully!')
    ).not.toBeInTheDocument();
  });

  test('allows multiple goals to remain selected independently', async () => {
    renderAuditSection();

    const performanceGoal = getGoalButton('Performance & Energy');

    const longevityGoal = getGoalButton('Longevity & Healthspan');

    const stressGoal = getGoalButton('Stress & Resilience');

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'false');

    expect(longevityGoal).toHaveAttribute('aria-pressed', 'false');

    expect(stressGoal).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(performanceGoal);
    await userEvent.click(longevityGoal);

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'true');

    expect(longevityGoal).toHaveAttribute('aria-pressed', 'true');

    expect(stressGoal).toHaveAttribute('aria-pressed', 'false');
  });

  test('deselects only the goal that is clicked again', async () => {
    renderAuditSection();

    const performanceGoal = getGoalButton('Performance & Energy');

    const longevityGoal = getGoalButton('Longevity & Healthspan');

    await userEvent.click(performanceGoal);
    await userEvent.click(longevityGoal);

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'true');

    expect(longevityGoal).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(performanceGoal);

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'false');

    expect(longevityGoal).toHaveAttribute('aria-pressed', 'true');
  });
  test('handles rapid repeated clicking on the same goal', async () => {
    renderAuditSection();

    const performanceGoal = getGoalButton('Performance & Energy');

    for (let clickIndex = 0; clickIndex < 10; clickIndex += 1) {
      await userEvent.click(performanceGoal);
    }

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(performanceGoal);

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'true');
  });

  test('keeps a consistent state during rapid interaction across all goals', async () => {
    renderAuditSection();

    const performanceGoal = getGoalButton('Performance & Energy');

    const longevityGoal = getGoalButton('Longevity & Healthspan');

    const stressGoal = getGoalButton('Stress & Resilience');

    await userEvent.click(performanceGoal);
    await userEvent.click(longevityGoal);
    await userEvent.click(stressGoal);

    await userEvent.click(performanceGoal);
    await userEvent.click(stressGoal);
    await userEvent.click(performanceGoal);

    expect(performanceGoal).toHaveAttribute('aria-pressed', 'true');

    expect(longevityGoal).toHaveAttribute('aria-pressed', 'true');

    expect(stressGoal).toHaveAttribute('aria-pressed', 'false');
  });
  test('submits every selected goal exactly once after repeated clicking', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderAuditSection();

    await fillValidAuditApplication({
      countryCode: '+49',
      phoneNumber: '01701234567',
      goalName: 'Performance & Energy',
    });

    const performanceGoal = getGoalButton('Performance & Energy');

    const longevityGoal = getGoalButton('Longevity & Healthspan');

    const stressGoal = getGoalButton('Stress & Resilience');

    for (let clickIndex = 0; clickIndex < 3; clickIndex += 1) {
      await userEvent.click(longevityGoal);
    }

    for (let clickIndex = 0; clickIndex < 5; clickIndex += 1) {
      await userEvent.click(stressGoal);
    }

    for (let clickIndex = 0; clickIndex < 2; clickIndex += 1) {
      await userEvent.click(performanceGoal);
    }

    await userEvent.click(getSubmitButton());

    expect(
      await screen.findByText('Appointment requested successfully!')
    ).toBeInTheDocument();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    const submittedData = consoleLogSpy.mock.calls[0][1];

    expect(submittedData.phone).toBe('+491701234567');

    expect(submittedData.goals).toHaveLength(3);

    expect(new Set(submittedData.goals).size).toBe(3);

    expect(submittedData.goals).toEqual(
      expect.arrayContaining(['performance', 'longevity', 'stress'])
    );
  });

  test('hides the success message when a new goal is selected', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    renderAuditSection();

    await submitValidAuditApplication();

    expect(
      screen.getByText('Appointment requested successfully!')
    ).toBeInTheDocument();

    await userEvent.click(getGoalButton('Longevity & Healthspan'));

    expect(
      screen.queryByText('Appointment requested successfully!')
    ).not.toBeInTheDocument();
  });

  test('hides the success message when the consent checkbox changes', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    renderAuditSection();

    await submitValidAuditApplication();

    expect(
      screen.getByText('Appointment requested successfully!')
    ).toBeInTheDocument();

    const consentCheckbox = screen.getByRole('checkbox');

    expect(consentCheckbox).not.toBeChecked();

    await userEvent.click(consentCheckbox);

    expect(consentCheckbox).toBeChecked();

    expect(
      screen.queryByText('Appointment requested successfully!')
    ).not.toBeInTheDocument();
  });

  test('shows validation messages only after the form is submitted', async () => {
    renderAuditSection();

    const emailInput = screen.getByPlaceholderText('john@company.com');

    await userEvent.type(emailInput, 'invalid-email');

    expect(emailInput).toHaveValue('invalid-email');

    expect(
      screen.queryByText(/please provide the following/i)
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(/a valid e-mail address/i)
    ).not.toBeInTheDocument();

    await userEvent.click(getSubmitButton());

    const errorMessage = await screen.findByText(
      /please provide the following/i
    );

    expect(errorMessage).toHaveTextContent('a valid E-Mail address');
  });

  test('updates an existing validation error only after another submit', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    renderAuditSection();

    await fillValidAuditApplication({
      email: 'invalid-email',
    });

    await userEvent.click(getSubmitButton());

    expect(
      await screen.findByText(/please provide the following/i)
    ).toHaveTextContent('a valid E-Mail address');

    const emailInput = screen.getByPlaceholderText('john@company.com');

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'john@example.com');

    expect(emailInput).toHaveValue('john@example.com');

    // Die alte Fehlermeldung bleibt bis zum nächsten Submit bestehen.
    expect(screen.getByText(/please provide the following/i)).toHaveTextContent(
      'a valid E-Mail address'
    );

    expect(
      screen.queryByText('Appointment requested successfully!')
    ).not.toBeInTheDocument();

    await userEvent.click(getSubmitButton());

    expect(
      await screen.findByText('Appointment requested successfully!')
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/please provide the following/i)
    ).not.toBeInTheDocument();
  });

  test('shows a newly created field error only after another submit', async () => {
    renderAuditSection();

    await fillValidAuditApplication({
      email: 'invalid-email',
    });

    await userEvent.click(getSubmitButton());

    const initialErrorMessage = await screen.findByText(
      /please provide the following/i
    );

    expect(initialErrorMessage).toHaveTextContent('a valid E-Mail address');

    expect(initialErrorMessage).not.toHaveTextContent(
      'First Name (min. 2 characters)'
    );

    const firstNameInput = screen.getByPlaceholderText('John');

    await userEvent.clear(firstNameInput);

    expect(firstNameInput).toHaveValue('');

    // Obwohl das Feld jetzt ungültig ist, darf der neue Fehler
    // noch nicht ohne erneuten Submit erscheinen.
    expect(
      screen.getByText(/please provide the following/i)
    ).not.toHaveTextContent('First Name (min. 2 characters)');

    await userEvent.click(getSubmitButton());

    const updatedErrorMessage = await screen.findByText(
      /please provide the following/i
    );

    expect(updatedErrorMessage).toHaveTextContent('a valid E-Mail address');

    expect(updatedErrorMessage).toHaveTextContent(
      'First Name (min. 2 characters)'
    );
  });

  test('removes the red field style when the user edits an invalid field', async () => {
    renderAuditSection();

    const firstNameInput = screen.getByPlaceholderText('John');

    const firstNameWrapper = getInputWrapper(firstNameInput);

    expect(firstNameWrapper).not.toHaveClass(styles.hasError);

    await userEvent.click(getSubmitButton());

    const errorMessage = await screen.findByText(
      /please provide the following/i
    );

    expect(errorMessage).toHaveTextContent('First Name (min. 2 characters)');

    expect(firstNameWrapper).toHaveClass(styles.hasError);

    await userEvent.type(firstNameInput, 'J');

    expect(firstNameInput).toHaveValue('J');

    // Die rote Darstellung verschwindet sofort.
    expect(firstNameWrapper).not.toHaveClass(styles.hasError);

    // Die Validierung selbst wird noch nicht aktualisiert.
    expect(screen.getByText(/please provide the following/i)).toHaveTextContent(
      'First Name (min. 2 characters)'
    );

    await userEvent.click(getSubmitButton());

    // Die Zod-Validierung und das anschließende React-Rendering
    // laufen asynchron.
    await waitFor(() => {
      const updatedFirstNameWrapper = getInputWrapper(
        screen.getByPlaceholderText('John')
      );

      expect(updatedFirstNameWrapper).toHaveClass(styles.hasError);
    });

    expect(screen.getByText(/please provide the following/i)).toHaveTextContent(
      'First Name (min. 2 characters)'
    );
  });

  it('restores the goals label color after a valid goal is submitted again', async () => {
    renderAuditSection();

    const submitButton = screen.getByRole('button', {
      name: /check availability/i,
    });

    const getGoalsSection = () =>
      screen
        .getByText(/goals\s*\*\s*\(multiple selection possible\)/i)
        .closest('div');

    // Erstes Absenden ohne ausgewähltes Ziel
    await userEvent.click(submitButton);

    // Die Validierung durch React Hook Form und Zod ist asynchron
    await waitFor(() => {
      expect(getGoalsSection()?.className).toMatch(/hasError/);
    });

    // Ziel auswählen
    await userEvent.click(
      screen.getByRole('button', {
        name: /performance & energy/i,
      })
    );

    // Der Fehler bleibt bis zum nächsten Submit bestehen
    expect(getGoalsSection()?.className).toMatch(/hasError/);

    // Erneute Validierung
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(getGoalsSection()?.className).not.toMatch(/hasError/);
    });
  });

  it('restores the privacy policy label color after the checkbox is submitted again', async () => {
    renderAuditSection();

    const submitButton = screen.getByRole('button', {
      name: /check availability/i,
    });

    const getPolicyCheckbox = () => screen.getByRole('checkbox');

    const getPolicySection = () => getPolicyCheckbox().closest('div');

    // Erstes Absenden ohne Zustimmung
    await userEvent.click(submitButton);

    // Auf den asynchron gesetzten Fehlerzustand warten
    await waitFor(() => {
      expect(getPolicySection()?.className).toMatch(/hasError/);
    });

    // Privacy Policy akzeptieren
    await userEvent.click(getPolicyCheckbox());

    expect(getPolicyCheckbox()).toBeChecked();

    // Der Fehler bleibt bis zum nächsten Submit bestehen
    expect(getPolicySection()?.className).toMatch(/hasError/);

    // Erneute Validierung
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(getPolicySection()?.className).not.toMatch(/hasError/);
    });
  });
});
