'use client';

import { Button, Card, Input, Select } from '@/components';
import Section from '@/components/layout/Section';
import { ALLOWED_COUNTRIES } from '@/lib/countries';
import { getMaximumDateOfBirthValue } from '@/lib/signupProfile';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type SignupFormState = {
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  addressCity: string;
  addressCountryCode: string;
  addressPostalCode: string;
};

const EMPTY_SIGNUP_FORM: SignupFormState = {
  phone: '',
  dateOfBirth: '',
  addressLine1: '',
  addressCity: '',
  addressCountryCode: '',
  addressPostalCode: '',
};

export default function SignInClient() {
  const search = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupForm, setSignupForm] = useState<SignupFormState>(EMPTY_SIGNUP_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = search.get('callbackUrl') || '/dashboard';
  const mode = search.get('mode') || 'login';
  const isSignup = mode === 'signup';

  const updateSignupField = (field: keyof SignupFormState, value: string) => {
    setSignupForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignup) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            ...signupForm,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(payload?.message || 'Registration failed');
        }

        await signIn('credentials', { email, password, redirect: true, callbackUrl });
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Registration failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.ok) {
      router.push(callbackUrl);
      return;
    }

    setError('Invalid email or password');
  };

  return (
    <main className="bg-[#F8FAFC]">
      <Section className="pt-6 pb-0 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">{isSignup ? 'Create Account' : 'Log in'}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isSignup ? 'Create your account to get started.' : 'Welcome back! Please sign in.'}
          </p>

          {error ? (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
          ) : null}

          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                wrapperClassName={isSignup ? '' : 'sm:col-span-2'}
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                wrapperClassName={isSignup ? '' : 'sm:col-span-2'}
              />
            </div>

            {isSignup ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Phone number"
                    type="tel"
                    value={signupForm.phone}
                    onChange={(event) => updateSignupField('phone', event.target.value)}
                    required
                  />
                  <Input
                    label="Date of birth"
                    type="date"
                    max={getMaximumDateOfBirthValue()}
                    value={signupForm.dateOfBirth}
                    onChange={(event) => updateSignupField('dateOfBirth', event.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Street, house number, apartment"
                  value={signupForm.addressLine1}
                  onChange={(event) => updateSignupField('addressLine1', event.target.value)}
                  required
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="City"
                    value={signupForm.addressCity}
                    onChange={(event) => updateSignupField('addressCity', event.target.value)}
                    required
                  />
                  <Input
                    label="Post code"
                    value={signupForm.addressPostalCode}
                    onChange={(event) => updateSignupField('addressPostalCode', event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-[#475569]">Country</label>
                  <Select
                    value={signupForm.addressCountryCode}
                    onChange={(event) => updateSignupField('addressCountryCode', event.target.value)}
                    required
                  >
                    <option value="">Select a country</option>
                    {ALLOWED_COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            ) : null}

            <div className="mt-2">
              <Button type="submit" disabled={loading} variant="primary">
                {loading ? (isSignup ? 'Creating...' : 'Signing in...') : isSignup ? 'Create account' : 'Log in'}
              </Button>
            </div>
          </form>
        </Card>
      </Section>
    </main>
  );
}
