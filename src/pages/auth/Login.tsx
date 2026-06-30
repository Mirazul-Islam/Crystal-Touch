import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Logo } from '../../components/layout/Logo';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import { ErrorState } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { signIn, session, role, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already signed in, send to the right dashboard.
  useEffect(() => {
    if (loading || !session) return;
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'cleaner') navigate('/cleaner', { replace: true });
    else navigate('/', { replace: true });
  }, [session, role, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      // Redirect handled by the effect once role loads.
    } catch (err) {
      setError((err as Error).message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Staff login" path="/login" noindex />
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <Card>
            <CardBody className="md:p-8">
              <h1 className="text-xl font-bold">Staff sign in</h1>
              <p className="mt-1 text-sm text-slate-500">
                For Crystal Touch admins and cleaners.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <Field label="Email" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Password" htmlFor="password">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>

                {error && <ErrorState message={error} />}

                <Button type="submit" className="w-full" loading={submitting}>
                  Sign in
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                Are you a client? You don’t need an account — just{' '}
                <a href="/#book" className="text-brand-600 hover:underline">
                  make a booking
                </a>
                .
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
