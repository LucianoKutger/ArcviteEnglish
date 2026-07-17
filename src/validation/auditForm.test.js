import { auditSchema, normalizePhoneNumber } from './auditForm';

const validAuditData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@gmail.com',
  phone: '123456',
  goals: ['performance'],
  tos: true,
};

const isFieldValueValid = (fieldName, value) =>
  auditSchema.safeParse({
    ...validAuditData,
    [fieldName]: value,
  }).success;

describe('auditSchema', () => {
  test.each([
    ['rejects an empty first name', '', false],
    ['rejects a one-character first name', 'J', false],
    ['accepts a two-character first name', 'Jo', true],
    ['accepts a twenty-character first name', 'J'.repeat(20), true],
    [
      'rejects a first name longer than twenty characters',
      'J'.repeat(21),
      false,
    ],
  ])('%s', (_description, value, expectedResult) => {
    expect(isFieldValueValid('firstName', value)).toBe(expectedResult);
  });

  test.each([
    ['rejects an empty last name', '', false],
    ['rejects a one-character last name', 'D', false],
    ['accepts a two-character last name', 'Do', true],
    ['accepts a twenty-character last name', 'D'.repeat(20), true],
    [
      'rejects a last name longer than twenty characters',
      'D'.repeat(21),
      false,
    ],
  ])('%s', (_description, value, expectedResult) => {
    expect(isFieldValueValid('lastName', value)).toBe(expectedResult);
  });

  test.each([
    ['accepts a Gmail address', 'john@gmail.com', true],
    ['accepts a German GMX address', 'john@gmx.de', true],
    ['accepts a WEB.DE address case-insensitively', 'john@WEB.DE', true],
    ['accepts a Microsoft address', 'john@outlook.com', true],
    ['accepts an Apple address', 'john@icloud.com', true],
    ['rejects an invalid email address', 'not-an-email', false],
    [
      'rejects a syntactically valid address with an unknown provider',
      'ashdgasuzd@asjdhaisud.de',
      false,
    ],
    ['rejects a reserved example domain', 'john@example.com', false],
    [
      'rejects an email address longer than forty characters',
      `${'a'.repeat(31)}@gmail.com`,
      false,
    ],
  ])('%s', (_description, value, expectedResult) => {
    expect(isFieldValueValid('email', value)).toBe(expectedResult);
  });

  test.each([
    ['rejects a phone number shorter than six characters', '12345', false],
    ['accepts a phone number with six characters', '123456', true],
    ['accepts a phone number with twenty characters', '1'.repeat(20), true],
    [
      'rejects a phone number longer than twenty characters',
      '1'.repeat(21),
      false,
    ],
  ])('%s', (_description, value, expectedResult) => {
    expect(isFieldValueValid('phone', value)).toBe(expectedResult);
  });

  test('rejects an empty goal selection', () => {
    expect(isFieldValueValid('goals', [])).toBe(false);
  });

  test('accepts at least one selected goal', () => {
    expect(isFieldValueValid('goals', ['performance'])).toBe(true);
  });

  test('rejects unconfirmed terms of service', () => {
    expect(isFieldValueValid('tos', false)).toBe(false);
  });

  test('accepts confirmed terms of service', () => {
    expect(isFieldValueValid('tos', true)).toBe(true);
  });

  test('accepts a completely valid audit application', () => {
    expect(auditSchema.safeParse(validAuditData).success).toBe(true);
  });
});

describe('normalizePhoneNumber', () => {
  describe('Germany', () => {
    const normalizeGermanNumber = (phoneNumber) =>
      normalizePhoneNumber({
        countryCode: '+49',
        phoneNumber,
        trunkPrefix: '0',
      });

    test('removes the national trunk prefix', () => {
      expect(normalizeGermanNumber('01701234567')).toBe('+491701234567');
    });

    test('accepts a number without the national trunk prefix', () => {
      expect(normalizeGermanNumber('1701234567')).toBe('+491701234567');
    });

    test('normalizes a minimal valid input', () => {
      expect(normalizeGermanNumber('012345')).toBe('+4912345');
    });

    test('normalizes a long input', () => {
      expect(normalizeGermanNumber(`0${'1'.repeat(19)}`)).toBe(
        `+49${'1'.repeat(19)}`
      );
    });
  });

  describe('Austria', () => {
    const normalizeAustrianNumber = (phoneNumber) =>
      normalizePhoneNumber({
        countryCode: '+43',
        phoneNumber,
        trunkPrefix: '0',
      });

    test('removes the Austrian trunk prefix', () => {
      expect(normalizeAustrianNumber('06641234567')).toBe('+436641234567');
    });

    test('accepts an Austrian number without trunk prefix', () => {
      expect(normalizeAustrianNumber('6641234567')).toBe('+436641234567');
    });
  });

  describe('Switzerland', () => {
    const normalizeSwissNumber = (phoneNumber) =>
      normalizePhoneNumber({
        countryCode: '+41',
        phoneNumber,
        trunkPrefix: '0',
      });

    test('removes the Swiss trunk prefix', () => {
      expect(normalizeSwissNumber('0791234567')).toBe('+41791234567');
    });

    test('accepts a Swiss number without trunk prefix', () => {
      expect(normalizeSwissNumber('791234567')).toBe('+41791234567');
    });
  });

  describe('edge cases', () => {
    test('handles an empty phone body', () => {
      expect(
        normalizePhoneNumber({
          countryCode: '+49',
          phoneNumber: '',
          trunkPrefix: '0',
        })
      ).toBe('+49');
    });

    test('handles a phone body containing only the trunk prefix', () => {
      expect(
        normalizePhoneNumber({
          countryCode: '+49',
          phoneNumber: '0',
          trunkPrefix: '0',
        })
      ).toBe('+49');
    });

    test('removes only one configured trunk prefix', () => {
      expect(
        normalizePhoneNumber({
          countryCode: '+49',
          phoneNumber: '000123456',
          trunkPrefix: '0',
        })
      ).toBe('+4900123456');
    });

    test('supports an unknown country code without guessing a trunk prefix', () => {
      expect(
        normalizePhoneNumber({
          countryCode: '+99',
          phoneNumber: '0123456',
        })
      ).toBe('+990123456');
    });

    test('removes spaces and formatting characters', () => {
      expect(
        normalizePhoneNumber({
          countryCode: '+49',
          phoneNumber: ' 0170 123-45-67 ',
          trunkPrefix: '0',
        })
      ).toBe('+491701234567');
    });

    test('keeps an already cleaned national number unchanged', () => {
      expect(
        normalizePhoneNumber({
          countryCode: '+49',
          phoneNumber: '1701234567',
          trunkPrefix: '0',
        })
      ).toBe('+491701234567');
    });

    test('does not guess whether the phone body already contains an international prefix', () => {
      expect(
        normalizePhoneNumber({
          countryCode: '+49',
          phoneNumber: '+49 1701234567',
          trunkPrefix: '0',
        })
      ).toBe('+49491701234567');
    });
  });
});
