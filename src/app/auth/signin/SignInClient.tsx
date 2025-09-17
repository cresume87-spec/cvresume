'use client';

import { Button, Card, Input } from '@/components';
import Section from '@/components/layout/Section';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SignInClient() {
  const search = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = search.get('callbackUrl') || '/dashboard';
  const mode = search.get('mode') || 'login';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // --- ЛОГИКА РЕГИСТРАЦИИ ---
    if (mode === 'signup') {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Registration failed');
        }

        // После успешной регистрации, автоматически входим в систему
        await signIn('credentials', { email, password, redirect: true, callbackUrl });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- ЛОГИКА ВХОДА ---
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <main className="bg-[#F8FAFC]">
      <Section className="pt-6 pb-0 max-w-md">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">{mode === 'signup' ? 'Create Account' : 'Log in'}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {mode === 'signup' ? 'Create your account to get started.' : 'Welcome back! Please sign in.'}
          </p>

          {error && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-sm p-3">{error}</div>
          )}
          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <div className="mt-2">
              <Button type="submit" disabled={loading} variant="primary">
                {loading ? (mode === 'signup' ? 'Creating…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Log in')}
              </Button>
            </div>
          </form>
        </Card>
      </Section>
    </main>
  );
}
