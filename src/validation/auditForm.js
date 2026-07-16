import { z } from 'zod';

export const auditSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First Name (min. 2 characters)')
    .max(20, 'First Name (max. 20 characters)'),

  lastName: z
    .string()
    .min(2, 'Last Name (min. 2 characters)')
    .max(20, 'Last Name (max. 20 characters)'),

  email: z
    .string()
    .email('a valid E-Mail address')
    .max(40, 'a Valid Email (max. 40 characters)'),

  phone: z
    .string()
    .min(6, 'a valid Phone Number')
    .max(20, 'a Valif Phone Number (max. 20 characters)'),

  goals: z.array(z.string()).min(1, 'Goals'),

  tos: z.boolean().refine((value) => value === true, 'Terms of Service'),
});

export const normalizePhoneNumber = ({
  countryCode = '',
  phoneNumber = '',
  trunkPrefix = '',
} = {}) => {
  const normalizedCountryCode = String(countryCode).trim();

  const normalizedTrunkPrefix = String(trunkPrefix).replace(/\D/g, '');

  let normalizedPhoneBody = String(phoneNumber).trim().replace(/\D/g, '');

  if (
    normalizedTrunkPrefix &&
    normalizedPhoneBody.startsWith(normalizedTrunkPrefix)
  ) {
    normalizedPhoneBody = normalizedPhoneBody.slice(
      normalizedTrunkPrefix.length
    );
  }

  return `${normalizedCountryCode}${normalizedPhoneBody}`;
};
