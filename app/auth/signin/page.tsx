'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dumbbell } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none mb-4">
            <Dumbbell size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            GainLog
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full mt-1">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-semibold text-violet-600 dark:text-violet-400 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
