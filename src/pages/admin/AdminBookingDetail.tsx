import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, Save, Repeat } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { StatusBadge, RecurringBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Field';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Spinner';
import { BookingStatusTimeline } from '../../components/booking/BookingStatusTimeline';
import { BookingSummary } from '../../components/booking/BookingSummary';
import { JobUpdatesFeed } from '../../components/booking/JobUpdatesFeed';
import { ReportView } from '../../components/booking/ReportView';
import { SeriesTimeline } from '../../components/booking/SeriesTimeline';
import { getBookingById, listCleaners, updateBooking } from '../../lib/api';
import { STATUS_LABELS } from '../../lib/constants';
import type { BookingStatus } from '../../lib/types';

const ASSIGNABLE_STATUSES: BookingStatus[] = [
  'new',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
];

export function AdminBookingDetail() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const [price, setPrice] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  const bookingQuery = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingById(id),
    enabled: Boolean(id),
  });

  const cleanersQuery = useQuery({
    queryKey: ['cleaners'],
    queryFn: listCleaners,
  });

  const booking = bookingQuery.data?.booking;

  useEffect(() => {
    if (booking?.estimated_price != null) setPrice(String(booking.estimated_price));
  }, [booking?.estimated_price]);

  const mutation = useMutation({
    mutationFn: (patch: Parameters<typeof updateBooking>[1]) =>
      updateBooking(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    },
  });

  if (bookingQuery.isLoading) return <LoadingState />;
  if (bookingQuery.isError || !booking) {
    return (
      <ErrorState
        message={(bookingQuery.error as Error)?.message || 'Booking not found'}
      />
    );
  }

  const cleaners = cleanersQuery.data?.users ?? [];
  const report = bookingQuery.data?.report ?? null;
  const updates = bookingQuery.data?.job_updates ?? [];
  const series = bookingQuery.data?.series ?? [];

  return (
    <>
      <Seo title={`Booking — ${booking.client_name}`} noindex />

      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dispatch board
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{booking.client_name}</h1>
          <p className="text-sm text-slate-500">Booking #{booking.id.slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <RecurringBadge
            frequency={booking.frequency}
            visitNumber={booking.visit_number}
          />
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody>
              <BookingStatusTimeline status={booking.status} />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-4 text-lg font-semibold">Request details</h2>
              <BookingSummary booking={booking} showContact />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-4 text-lg font-semibold">Cleaner updates</h2>
              <JobUpdatesFeed updates={updates} />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-semibold">Service report</h2>
              </div>
              {report ? (
                <ReportView report={report} />
              ) : (
                <EmptyState
                  title="No report yet"
                  description="The assigned cleaner submits this once the job is complete."
                />
              )}
            </CardBody>
          </Card>

          {series.length > 1 && (
            <Card>
              <CardBody>
                <div className="mb-4 flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-accent-600" />
                  <h2 className="text-lg font-semibold">Recurring schedule</h2>
                </div>
                <SeriesTimeline
                  series={series}
                  currentId={booking.id}
                  hrefFor={(v) => `/admin/bookings/${v.id}`}
                />
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right: dispatch controls */}
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-5">
              <h2 className="text-lg font-semibold">Dispatch</h2>

              <Field label="Assign cleaner" htmlFor="cleaner">
                <Select
                  id="cleaner"
                  value={booking.assigned_cleaner_id ?? ''}
                  disabled={mutation.isPending}
                  onChange={(e) =>
                    mutation.mutate({
                      assigned_cleaner_id: e.target.value || null,
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {cleaners.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || 'Unnamed cleaner'}
                    </option>
                  ))}
                </Select>
                {cleaners.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No cleaners yet —{' '}
                    <Link to="/admin/cleaners" className="underline">
                      add one
                    </Link>
                    .
                  </p>
                )}
              </Field>

              <Field label="Status" htmlFor="status">
                <Select
                  id="status"
                  value={booking.status}
                  disabled={mutation.isPending}
                  onChange={(e) =>
                    mutation.mutate({ status: e.target.value as BookingStatus })
                  }
                >
                  {ASSIGNABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Quote (USD)" htmlFor="price">
                <div className="flex gap-2">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      mutation.mutate({
                        estimated_price: price === '' ? null : Number(price),
                      })
                    }
                    loading={mutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </Field>

              {savedFlash && (
                <p className="text-sm font-medium text-emerald-600">Saved ✓</p>
              )}
              {mutation.isError && (
                <ErrorState message={(mutation.error as Error).message} />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-slate-900">Client link</h3>
              <p className="mt-1 text-xs text-slate-500">
                The client tracks status and views the report here:
              </p>
              <Link
                to={`/booking/${booking.public_token}`}
                className="mt-2 block truncate text-sm text-brand-600 hover:underline"
              >
                /booking/{booking.public_token}
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
