import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Check, Send, CheckCheck, Coffee } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Field, Input, Textarea } from '../../components/ui/Field';
import { LoadingState, ErrorState } from '../../components/ui/Spinner';
import { BookingSummary } from '../../components/booking/BookingSummary';
import { JobUpdatesFeed } from '../../components/booking/JobUpdatesFeed';
import { PhotoUploader } from '../../components/booking/PhotoUploader';
import {
  getBookingById,
  createJobUpdate,
  createReport,
} from '../../lib/api';
import { formatDate } from '../../lib/format';
import {
  DEFAULT_CLOSING_CHECKLIST,
  AIRBNB_SUPPLY_ITEMS,
  isAirbnb,
} from '../../lib/constants';
import type { ChecklistItem, SupplyAlert } from '../../lib/types';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { label: 'Kitchen cleaned', done: false },
  { label: 'Bathrooms cleaned', done: false },
  { label: 'Bedrooms tidied', done: false },
  { label: 'Floors vacuumed & mopped', done: false },
  { label: 'Surfaces dusted', done: false },
  { label: 'Trash removed', done: false },
];

const DEFAULT_CLOSING: ChecklistItem[] = DEFAULT_CLOSING_CHECKLIST.map((label) => ({
  label,
  done: false,
}));

export function JobDetail() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();

  // progress update state
  const [comment, setComment] = useState('');
  const [updatePhotos, setUpdatePhotos] = useState<string[]>([]);

  // report state
  const [summary, setSummary] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [closing, setClosing] = useState<ChecklistItem[]>(DEFAULT_CLOSING);
  const [supplyAlerts, setSupplyAlerts] = useState<SupplyAlert[]>([]);
  const [newItem, setNewItem] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [reportMsg, setReportMsg] = useState<string | null>(null);

  const jobQuery = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingById(id),
    enabled: Boolean(id),
  });

  const booking = jobQuery.data?.booking;
  const existingReport = jobQuery.data?.report ?? null;

  // Prefill the report form if one already exists.
  useEffect(() => {
    if (existingReport) {
      setSummary(existingReport.summary);
      setChecklist(
        existingReport.checklist.length ? existingReport.checklist : DEFAULT_CHECKLIST,
      );
      setClosing(
        existingReport.closing_checklist?.length
          ? existingReport.closing_checklist
          : DEFAULT_CLOSING,
      );
      setSupplyAlerts(existingReport.supply_alerts ?? []);
      setBeforePhotos(existingReport.before_photos);
      setAfterPhotos(existingReport.after_photos);
    }
  }, [existingReport]);

  const updateMutation = useMutation({
    mutationFn: () =>
      createJobUpdate({
        booking_id: id,
        comment: comment.trim() || null,
        photo_urls: updatePhotos,
      }),
    onSuccess: () => {
      setComment('');
      setUpdatePhotos([]);
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      createReport({
        booking_id: id,
        summary: summary.trim(),
        checklist,
        closing_checklist: closing,
        supply_alerts: supplyAlerts,
        before_photos: beforePhotos,
        after_photos: afterPhotos,
      }),
    onSuccess: (data) => {
      setReportMsg(
        data.next_visit
          ? `Report saved & job completed. Next visit auto-scheduled for ${formatDate(
              data.next_visit.preferred_date,
            )}.`
          : 'Report saved — the client can now see it.',
      );
      setTimeout(() => setReportMsg(null), 6000);
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    },
  });

  if (jobQuery.isLoading) return <LoadingState />;
  if (jobQuery.isError || !booking) {
    return (
      <ErrorState message={(jobQuery.error as Error)?.message || 'Job not found'} />
    );
  }

  const updates = jobQuery.data?.job_updates ?? [];
  const canPostUpdate = comment.trim().length > 0 || updatePhotos.length > 0;

  function toggleItem(idx: number) {
    setChecklist((list) =>
      list.map((it, i) => (i === idx ? { ...it, done: !it.done } : it)),
    );
  }
  function removeItem(idx: number) {
    setChecklist((list) => list.filter((_, i) => i !== idx));
  }
  function addItem() {
    const label = newItem.trim();
    if (!label) return;
    setChecklist((list) => [...list, { label, done: true }]);
    setNewItem('');
  }

  function toggleClosing(idx: number) {
    setClosing((list) =>
      list.map((it, i) => (i === idx ? { ...it, done: !it.done } : it)),
    );
  }
  function selectAllClosing() {
    const allDone = closing.every((c) => c.done);
    setClosing((list) => list.map((c) => ({ ...c, done: !allDone })));
  }

  function supplyStatus(item: string): 'low' | 'out' | null {
    return supplyAlerts.find((a) => a.item === item)?.status ?? null;
  }
  function setSupply(item: string, status: 'low' | 'out' | null) {
    setSupplyAlerts((list) => {
      const without = list.filter((a) => a.item !== item);
      return status ? [...without, { item, status }] : without;
    });
  }

  const showSupplies = isAirbnb(booking.service_type);

  return (
    <>
      <Seo title={`Job — ${booking.reference_code ?? booking.address}`} noindex />

      <Link
        to="/cleaner"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to my jobs
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{booking.address}</h1>
          <p className="text-sm text-slate-500">
            {booking.city}
            {booking.reference_code ? ` · Ref ${booking.reference_code}` : ''}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Post update */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold">Post a progress update</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add comments and photos while you work. The client and admin can see these.
              </p>
              <div className="mt-4 space-y-4">
                <Field label="Comment" htmlFor="comment">
                  <Textarea
                    id="comment"
                    rows={3}
                    placeholder="e.g. Started in the kitchen, fridge was heavily soiled…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Field>
                <Field label="Photos">
                  <PhotoUploader
                    bookingId={id}
                    value={updatePhotos}
                    onChange={setUpdatePhotos}
                  />
                </Field>
                {updateMutation.isError && (
                  <ErrorState message={(updateMutation.error as Error).message} />
                )}
                <Button
                  onClick={() => updateMutation.mutate()}
                  disabled={!canPostUpdate}
                  loading={updateMutation.isPending}
                >
                  Post update
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Final report */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold">
                {existingReport ? 'Update final report' : 'Submit final report'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Submitting marks the job complete and shares the report with the client.
              </p>

              <div className="mt-4 space-y-5">
                <Field label="Summary" htmlFor="summary" required>
                  <Textarea
                    id="summary"
                    rows={4}
                    placeholder="Describe the work completed and anything the client should know."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </Field>

                <div>
                  <p className="label-base">Checklist</p>
                  <ul className="space-y-2">
                    {checklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleItem(idx)}
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            item.done
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {item.done && <Check className="h-3.5 w-3.5" />}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            item.done ? 'text-slate-700' : 'text-slate-400'
                          }`}
                        >
                          {item.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-300 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Input
                      placeholder="Add a checklist item"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Closing / security checklist */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="label-base mb-0">Before you leave</p>
                    <button
                      type="button"
                      onClick={selectAllClosing}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      <CheckCheck className="h-4 w-4" />
                      {closing.every((c) => c.done) ? 'Clear all' : 'Select all'}
                    </button>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {closing.map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => toggleClosing(idx)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                          item.done
                            ? 'border-brand-500 bg-brand-50 text-brand-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            item.done
                              ? 'border-brand-600 bg-brand-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {item.done && <Check className="h-3 w-3" />}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Airbnb restock alerts */}
                {showSupplies && (
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-accent-600" />
                      <p className="label-base mb-0">Let the host know what’s running low</p>
                    </div>
                    <p className="mb-2 text-xs text-slate-500">
                      Tap an item to flag it as Low or Out (for Airbnb restocking).
                    </p>
                    <div className="space-y-1.5">
                      {AIRBNB_SUPPLY_ITEMS.map((item) => {
                        const status = supplyStatus(item);
                        return (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5"
                          >
                            <span className="text-sm text-slate-700">{item}</span>
                            <div className="flex gap-1">
                              {(['low', 'out'] as const).map((s) => (
                                <button
                                  type="button"
                                  key={s}
                                  onClick={() => setSupply(item, status === s ? null : s)}
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                                    status === s
                                      ? s === 'out'
                                        ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                        : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {s === 'out' ? 'Out' : 'Low'}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Before photos (at start)">
                    <PhotoUploader
                      bookingId={id}
                      value={beforePhotos}
                      onChange={setBeforePhotos}
                      label="Add before"
                    />
                  </Field>
                  <Field label="After photos (when finished)">
                    <PhotoUploader
                      bookingId={id}
                      value={afterPhotos}
                      onChange={setAfterPhotos}
                      label="Add after"
                    />
                  </Field>
                </div>

                {reportMutation.isError && (
                  <ErrorState message={(reportMutation.error as Error).message} />
                )}
                {reportMsg && (
                  <p className="text-sm font-medium text-emerald-600">
                    {reportMsg} ✓
                  </p>
                )}

                <Button
                  onClick={() => reportMutation.mutate()}
                  disabled={summary.trim().length < 5}
                  loading={reportMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                  {existingReport ? 'Update report' : 'Submit report & complete'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: job info + history */}
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h2 className="mb-4 text-lg font-semibold">Job details</h2>
              <BookingSummary booking={booking} />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h2 className="mb-4 text-lg font-semibold">Update history</h2>
              <JobUpdatesFeed updates={updates} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
