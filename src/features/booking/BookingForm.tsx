import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import {
  bookingFormSchema,
  bookingFormDefaults,
  type BookingFormValues,
} from './bookingSchema';
import {
  SERVICE_OPTIONS,
  FREQUENCY_OPTIONS,
  TIME_SLOT_OPTIONS,
  EXTRA_OPTIONS,
  SUPPLIES_OPTIONS,
} from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import { ErrorState } from '../../components/ui/Spinner';
import { createBooking, ApiError } from '../../lib/api';

function SectionTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {step}
      </span>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

export function BookingForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: bookingFormDefaults,
  });

  const serviceType = watch('service_type');
  const extras = watch('extras');
  const companySupplies = watch('company_supplies');

  function toggleExtra(extra: string) {
    const set = new Set(extras);
    if (set.has(extra)) set.delete(extra);
    else set.add(extra);
    setValue('extras', Array.from(set), { shouldDirty: true });
  }

  async function onSubmit(values: BookingFormValues) {
    setServerError(null);
    try {
      const { token, reference_code } = await createBooking({
        ...values,
        postal_code: values.postal_code || null,
        buzz_code: values.buzz_code || null,
        preferred_date: values.preferred_date || null,
        preferred_time: values.preferred_time ?? null,
        notes: values.notes || null,
      });
      navigate('/thank-you', {
        state: { token, reference_code, name: values.client_name },
      });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong submitting your request. Please try again.';
      setServerError(msg);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
      {/* 1. Service type */}
      <section>
        <SectionTitle step={1} title="What do you need cleaned?" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SERVICE_OPTIONS.map((opt) => {
            const selected = serviceType === opt.value;
            const Icon = opt.icon;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setValue('service_type', opt.value)}
                className={clsx(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition',
                  selected
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50',
                )}
              >
                <Icon
                  className={clsx('h-6 w-6', selected ? 'text-brand-600' : 'text-slate-500')}
                />
                <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Size & frequency */}
      <section>
        <SectionTitle step={2} title="Size & frequency" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bedrooms" htmlFor="bedrooms">
            <Select id="bedrooms" {...register('bedrooms')}>
              <option value={0}>Studio</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'bedroom' : 'bedrooms'}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bathrooms" htmlFor="bathrooms">
            <Select id="bathrooms" {...register('bathrooms')}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'bathroom' : 'bathrooms'}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="How often?" htmlFor="frequency">
            <Select id="frequency" {...register('frequency')}>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      {/* 3. Extras */}
      <section>
        <SectionTitle step={3} title="Add extras (optional)" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EXTRA_OPTIONS.map((extra) => {
            const selected = extras.includes(extra);
            return (
              <button
                type="button"
                key={extra}
                onClick={() => toggleExtra(extra)}
                className={clsx(
                  'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition',
                  selected
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                )}
              >
                <span
                  className={clsx(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300',
                  )}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                {extra}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Schedule */}
      <section>
        <SectionTitle step={4} title="Preferred date & time" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred date" htmlFor="preferred_date">
            <Input id="preferred_date" type="date" min={today} {...register('preferred_date')} />
          </Field>
          <Field label="Preferred time" htmlFor="preferred_time">
            <Select id="preferred_time" {...register('preferred_time')}>
              <option value="">No preference</option>
              {TIME_SLOT_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      {/* 5. Location */}
      <section>
        <SectionTitle step={5} title="Where is the property?" />
        <div className="grid gap-4 sm:grid-cols-6">
          <Field
            label="Street address"
            htmlFor="address"
            required
            error={errors.address?.message}
            className="sm:col-span-4"
          >
            <Input id="address" placeholder="123 Main St, Apt 4B" {...register('address')} />
          </Field>
          <Field
            label="City"
            htmlFor="city"
            required
            error={errors.city?.message}
            className="sm:col-span-2"
          >
            <Input id="city" {...register('city')} />
          </Field>
          <Field label="Postal / ZIP" htmlFor="postal_code" className="sm:col-span-2">
            <Input id="postal_code" {...register('postal_code')} />
          </Field>
          <Field
            label="Buzz / access code"
            htmlFor="buzz_code"
            hint="Door buzzer, gate, lockbox or entry code (if any)."
            className="sm:col-span-4"
          >
            <Input
              id="buzz_code"
              placeholder="e.g. #1234 or buzz 102"
              {...register('buzz_code')}
            />
          </Field>
        </div>
      </section>

      {/* 6. Supplies */}
      <section>
        <SectionTitle step={6} title="Cleaning supplies" />
        <p className="-mt-2 mb-4 text-sm text-slate-500">
          Will you provide the cleaning supplies, or should we bring them?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SUPPLIES_OPTIONS.map((opt) => {
            const selected = companySupplies === opt.value;
            return (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => setValue('company_supplies', opt.value)}
                className={clsx(
                  'rounded-xl border p-4 text-left transition',
                  selected
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                    : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50',
                )}
              >
                <span className="block text-sm font-semibold text-slate-800">
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-sm text-brand-600">{opt.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. Contact */}
      <section>
        <SectionTitle step={7} title="Your contact details" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Full name"
            htmlFor="client_name"
            required
            error={errors.client_name?.message}
          >
            <Input id="client_name" autoComplete="name" {...register('client_name')} />
          </Field>
          <Field
            label="Email"
            htmlFor="client_email"
            required
            error={errors.client_email?.message}
          >
            <Input
              id="client_email"
              type="email"
              autoComplete="email"
              {...register('client_email')}
            />
          </Field>
          <Field
            label="Phone"
            htmlFor="client_phone"
            required
            error={errors.client_phone?.message}
          >
            <Input
              id="client_phone"
              type="tel"
              autoComplete="tel"
              {...register('client_phone')}
            />
          </Field>
        </div>
        <Field label="Anything we should know?" htmlFor="notes" className="mt-4">
          <Textarea
            id="notes"
            rows={3}
            placeholder="Pets, parking, access instructions, areas to focus on…"
            {...register('notes')}
          />
        </Field>
      </section>

      {serverError && <ErrorState message={serverError} />}

      <div className="flex flex-col items-start gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          No payment now — we’ll confirm your booking by email or phone. Final price
          is set after the clean at{' '}
          <span className="font-semibold text-slate-700">
            {companySupplies ? '$40' : '$25'}/hr per cleaner
          </span>
          .
        </p>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Submit booking request
        </Button>
      </div>
    </form>
  );
}
