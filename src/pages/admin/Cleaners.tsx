import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Mail, Phone } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../components/ui/Spinner';
import { listCleaners, createUser, ApiError } from '../../lib/api';
import { formatDate } from '../../lib/format';

const emptyForm = { full_name: '', email: '', phone: '', password: '' };

export function Cleaners() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [createdFlash, setCreatedFlash] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['cleaners'],
    queryFn: listCleaners,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
        role: 'cleaner',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaners'] });
      setCreatedFlash(`${form.full_name} can now sign in with their email.`);
      setForm(emptyForm);
      setTimeout(() => setCreatedFlash(null), 4000);
    },
  });

  const cleaners = data?.users ?? [];

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  return (
    <>
      <Seo title="Cleaners | Crystal Touch" noindex />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cleaners</h1>
        <p className="text-sm text-slate-500">
          Create and manage cleaner accounts. They sign in at the staff login.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-2">
          {isLoading && <LoadingState />}
          {isError && <ErrorState message={(error as Error).message} />}
          {data && cleaners.length === 0 && (
            <EmptyState
              title="No cleaners yet"
              description="Add your first cleaner using the form."
            />
          )}
          {cleaners.length > 0 && (
            <Card>
              <ul className="divide-y divide-slate-100">
                {cleaners.map((c) => (
                  <li key={c.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {c.full_name || 'Unnamed cleaner'}
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        {c.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </span>
                        )}
                        <span>Joined {formatDate(c.created_at)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Create form */}
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-semibold">Add a cleaner</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
              className="space-y-4"
            >
              <Field label="Full name" htmlFor="full_name" required>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={update('full_name')}
                  required
                />
              </Field>
              <Field label="Email" htmlFor="email" required>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <Input id="phone" value={form.phone} onChange={update('phone')} />
              </Field>
              <Field
                label="Temporary password"
                htmlFor="password"
                hint="At least 8 characters. Share it with the cleaner."
                required
              >
                <Input
                  id="password"
                  type="text"
                  value={form.password}
                  onChange={update('password')}
                  minLength={8}
                  required
                />
              </Field>

              {createdFlash && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <Mail className="h-4 w-4" /> {createdFlash}
                </div>
              )}
              {mutation.isError && (
                <ErrorState
                  message={
                    mutation.error instanceof ApiError
                      ? mutation.error.message
                      : 'Could not create cleaner'
                  }
                />
              )}

              <Button type="submit" className="w-full" loading={mutation.isPending}>
                Create cleaner account
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
