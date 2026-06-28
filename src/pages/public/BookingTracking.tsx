import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/Spinner';
import { BookingStatusTimeline } from '../../components/booking/BookingStatusTimeline';
import { BookingSummary } from '../../components/booking/BookingSummary';
import { JobUpdatesFeed } from '../../components/booking/JobUpdatesFeed';
import { ReportView } from '../../components/booking/ReportView';
import { getBookingByToken } from '../../lib/api';
import { formatDate } from '../../lib/format';

export function BookingTracking() {
  const { token = '' } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['booking-track', token],
    queryFn: () => getBookingByToken(token),
    enabled: Boolean(token),
  });

  return (
    <>
      <Seo title="Track your booking" path={`/booking/${token}`} noindex />

      <section className="section bg-slate-50 min-h-[60vh]">
        <div className="container-page max-w-3xl">
          {isLoading && <LoadingState label="Loading your booking…" />}

          {isError && (
            <ErrorState
              message={
                (error as Error)?.message ||
                'We couldn’t find that booking. Please check your link.'
              }
            />
          )}

          {data && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">
                    Hi {data.booking.client_name.split(' ')[0]}, here’s your booking
                  </h1>
                  <p className="text-sm text-slate-500">
                    Requested on {formatDate(data.booking.created_at)}
                  </p>
                </div>
                <StatusBadge status={data.booking.status} />
              </div>

              <Card>
                <CardBody>
                  <BookingStatusTimeline status={data.booking.status} />
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2 className="mb-4 text-lg font-semibold">Booking details</h2>
                  <BookingSummary booking={data.booking} />
                </CardBody>
              </Card>

              {data.report ? (
                <Card>
                  <CardBody>
                    <div className="mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-600" />
                      <h2 className="text-lg font-semibold">Your service report</h2>
                    </div>
                    <ReportView report={data.report} />
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody>
                    <h2 className="mb-4 text-lg font-semibold">Service report</h2>
                    <EmptyState
                      title="Report not ready yet"
                      description="Your cleaner will publish a detailed report with photos once the job is complete."
                    />
                  </CardBody>
                </Card>
              )}

              {data.job_updates.length > 0 && (
                <Card>
                  <CardBody>
                    <h2 className="mb-4 text-lg font-semibold">Progress updates</h2>
                    <JobUpdatesFeed updates={data.job_updates} />
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
