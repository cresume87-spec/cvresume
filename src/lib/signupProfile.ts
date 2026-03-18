import { z } from 'zod';
import { isAllowedCountryCode } from '@/lib/countries';

export const MINIMUM_SIGNUP_AGE = 18;

function parseDateOfBirth(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isAdultOn(dateOfBirth: Date, minimumAge: number): boolean {
  const today = new Date();
  const adultDate = new Date(
    today.getUTCFullYear() - minimumAge,
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  return dateOfBirth <= adultDate;
}

export const signupProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'Name is required.').max(100, 'Name is too long.'),
  lastName: z.string().trim().min(1, 'Surname is required.').max(100, 'Surname is too long.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  phone: z.string().trim().min(5, 'Phone number is required.').max(30, 'Phone number is too long.'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required.')
    .refine((value) => parseDateOfBirth(value) !== null, 'Please enter a valid date of birth.')
    .refine((value) => {
      const parsed = parseDateOfBirth(value);
      return parsed !== null && isAdultOn(parsed, MINIMUM_SIGNUP_AGE);
    }, 'You must be at least 18 years old to create an account.'),
  addressLine1: z.string().trim().min(3, 'Street and house number are required.').max(160),
  addressCity: z.string().trim().min(2, 'City is required.').max(100),
  addressCountryCode: z
    .string()
    .trim()
    .refine((value) => isAllowedCountryCode(value), 'Please choose an allowed country.'),
  addressPostalCode: z.string().trim().min(2, 'Post code is required.').max(20),
});

export type SignupProfileInput = z.infer<typeof signupProfileSchema>;

export function normalizeSignupProfile(input: SignupProfileInput) {
  const parsedDate = parseDateOfBirth(input.dateOfBirth);

  if (!parsedDate) {
    throw new Error('Invalid date of birth');
  }

  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    phone: input.phone.trim(),
    dateOfBirth: parsedDate,
    addressLine1: input.addressLine1.trim(),
    addressCity: input.addressCity.trim(),
    addressCountryCode: input.addressCountryCode.trim().toUpperCase(),
    addressPostalCode: input.addressPostalCode.trim(),
  };
}

export function getMaximumDateOfBirthValue(minimumAge: number = MINIMUM_SIGNUP_AGE): string {
  const today = new Date();
  const year = today.getUTCFullYear() - minimumAge;
  const month = `${today.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${today.getUTCDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
