import { z } from 'zod';

export const COMMON_EMAIL_PROVIDER_DOMAINS = Object.freeze([
  'gmail.com',
  'gmail.de',
  'googlemail.com',
  'web.de',
  'gmx.de',
  'gmx.net',
  'gmx.com',
  'outlook.com',
  'outlook.de',
  'hotmail.com',
  'hotmail.de',
  'live.com',
  'live.de',
  'msn.com',
  't-online.de',
  'yahoo.com',
  'yahoo.de',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'freenet.de',
  'mail.de',
  'mail.com',
  'proton.me',
  'protonmail.com',
  'posteo.de',
  'mailbox.org',
  'tuta.com',
  'tutanota.com',
  'tutanota.de',
  'zoho.com',
]);

const commonEmailProviderDomains = new Set(COMMON_EMAIL_PROVIDER_DOMAINS);

export const hasCommonEmailProvider = (email) => {
  const domain = String(email).split('@').pop()?.toLowerCase();

  return commonEmailProviderDomains.has(domain);
};

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
    .max(40, 'a Valid Email (max. 40 characters)')
    .refine(hasCommonEmailProvider, 'a valid E-Mail address'),

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
