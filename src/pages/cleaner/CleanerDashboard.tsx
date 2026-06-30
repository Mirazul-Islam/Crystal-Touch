import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, CalendarClock, ArrowRight, KeyRound } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { StatusBadge, RecurringBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Spinner';
import { listMyJobs } from '../../lib/api';
import { SERVICE_LABELS, TIME_SLOT_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import type { Booking } from '../../lib/types';

export function CleanerDashboard() {
  const { profile } = useAuth();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: listMyJobs,
  });

  const jobs = data?.bookings ?? [];
  const active = jobs.filter((j) => j.status !== 'completed');
  const done = jobs.filter((j) => j.status === 'completed');

  return (
    <>
      <Seo title="My jobs | Crystal Touch" noindex />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Hi {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-slate-500">Here are the jobs assigned to you.</p>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && jobs.length === 0 && (
        <EmptyState
          title="No jobs assigned yet"
          description="When an admin dispatches you to a cleaning, it’ll appear here."
        />
      )}

      {active.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Active ({active.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Completed ({done.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {done.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function JobCard({ job }: { job: Booking }) {
  return (
    <Link to={`/cleaner/jobs/${job.id}`}>
      <Card className="h-full transition hover:shadow-md">
        <CardBody>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">
                {SERVICE_LABELS[job.service_type]} clean
              </p>
              <p className="text-sm text-slate-500">{job.reference_code}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={job.status} />
              <RecurringBadge frequency={job.frequency} visitNumber={job.visit_number} />
            </div>
          </div>
          <div className="mt-4 space-y-1.5 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" /> {job.address}, {job.city}
            </p>
            {job.buzz_code && (
              <p className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-slate-400" /> Buzz: {job.buzz_code}
              </p>
            )}
            <p className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-slate-400" />
              {job.preferred_date ? formatDate(job.preferred_date) : 'Flexible'}
              {job.preferred_time ? ` · ${TIME_SLOT_LABELS[job.preferred_time]}` : ''}
            </p>
          </div>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            Open job <ArrowRight className="h-4 w-4" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
