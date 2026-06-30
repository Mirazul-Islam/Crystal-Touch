import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { ArrowLeft, Printer, Mail, Phone } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Field';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingState, ErrorState } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Invoice, type InvoiceLine } from '../../components/admin/Invoice';
import { listBookingsByEmail } from '../../lib/api';
import { SERVICE_LABELS } from '../../lib/constants';
import { formatDate, formatPrice } from '../../lib/format';
import {
  presetRange,
  groupOf,
  RANGE_LABELS,
  type GroupBy,
  type RangePreset,
} from '../../lib/period';
import type { Booking } from '../../lib/types';

const PRESETS: RangePreset[] = ['today', 'this_week', 'this_month', 'last_month', 'all'];
const GROUPS: GroupBy[] = ['day', 'week', 'month'];
const GROUP_LABELS: Record<GroupBy, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
};

const serviceDate = (b: Booking) => b.preferred_date ?? b.created_at.slice(0, 10);

export function AdminClientDetail() {
  const { email = '' } = useParams();
  const clientEmail = decodeURIComponent(email);

  const [preset, setPreset] = useState<RangePreset>('this_month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('month');

  const custom = Boolean(from || to);
  const range = custom ? { from, to } : presetRange(preset);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['client-bookings', clientEmail],
    queryFn: () => listBookingsByEmail(clientEmail),
  });

  const all = data?.bookings ?? [];

  const inRange = (d: string) =>
    (!range.from || d >= range.from) && (!range.to || d <= range.to);

  const filtered = useMemo(
    () => all.filter((b) => inRange(serviceDate(b))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, range.from, range.to],
  );

  const completed = filtered.filter((b) => b.status === 'completed');
  const total = completed.reduce((s, b) => s + Number(b.estimated_price ?? 0), 0);

  // grouped work list (most recent first)
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: Booking[] }>();
    for (const b of filtered) {
      const { key, label } = groupOf(serviceDate(b), groupBy);
      if (!map.has(key)) map.set(key, { label, items: [] });
      map.get(key)!.items.push(b);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, v]) => ({ key, ...v }));
  }, [filtered, groupBy]);

  const periodLabel = custom
    ? `${from ? formatDate(from) : 'start'} – ${to ? formatDate(to) : 'today'}`
    : RANGE_LABELS[preset];

  const invoiceLines: InvoiceLine[] = completed
    .slice()
    .sort((a, b) => (serviceDate(a) < serviceDate(b) ? -1 : 1))
    .map((b) => ({ date: serviceDate(b), amount: Number(b.estimated_price ?? 0) }));

  const client = data?.client;
  const sample = all[0];
  const clientAddress = sample
    ? `${sample.address}, ${sample.city}${sample.postal_code ? ' ' + sample.postal_code : ''}`
    : null;
  const invoiceNumber = useMemo(() => {
    const ym = (range.to || new Date().toISOString().slice(0, 10)).replace(/-/g, '').slice(2, 6);
    let h = 0;
    for (const ch of clientEmail) h = (h * 31 + ch.charCodeAt(0)) % 9000;
    return `${1000 + (h % 9000)}-${ym.slice(0, 2)}`;
  }, [clientEmail, range.to]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as Error).message} />;

  return (
    <>
      <Seo title={`Client — ${client?.name || clientEmail}`} noindex />

      <div className="print:hidden">
        <Link
          to="/admin/clients"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to clients
        </Link>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{client?.name || clientEmail}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-4 w-4" /> {clientEmail}
              </span>
              {client?.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-4 w-4" /> {client.phone}
                </span>
              )}
            </div>
          </div>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / download invoice
          </Button>
        </div>

        {/* Controls */}
        <Card className="mb-5">
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Period:</span>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPreset(p);
                    setFrom('');
                    setTo('');
                  }}
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm font-medium transition',
                    !custom && preset === p
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {RANGE_LABELS[p]}
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-400">or</span>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-auto"
                aria-label="From date"
              />
              <span className="text-slate-400">–</span>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-auto"
                aria-label="To date"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Group by:</span>
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm font-medium transition',
                    groupBy === g
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  )}
                >
                  {GROUP_LABELS[g]}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Summary */}
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Stat label="Bookings in period" value={String(filtered.length)} />
          <Stat label="Completed" value={String(completed.length)} />
          <Stat label="Total billed" value={formatPrice(total)} />
        </div>

        {/* Grouped work list */}
        <div className="space-y-5">
          {groups.map((group) => {
            const subtotal = group.items
              .filter((b) => b.status === 'completed')
              .reduce((s, b) => s + Number(b.estimated_price ?? 0), 0);
            return (
              <Card key={group.key}>
                <CardBody>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{group.label}</h3>
                    <span className="text-sm text-slate-500">
                      {group.items.length} job{group.items.length === 1 ? '' : 's'} ·{' '}
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {group.items.map((b) => (
                      <li key={b.id} className="flex items-center justify-between py-2">
                        <Link
                          to={`/admin/bookings/${b.id}`}
                          className="text-sm text-slate-700 hover:text-brand-600"
                        >
                          {formatDate(serviceDate(b))} · {SERVICE_LABELS[b.service_type]}
                          {b.reference_code ? ` · ${b.reference_code}` : ''}
                        </Link>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">
                            {formatPrice(b.estimated_price)}
                          </span>
                          <StatusBadge status={b.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            );
          })}
          {groups.length === 0 && (
            <p className="text-sm text-slate-500">No bookings in this period.</p>
          )}
        </div>

        <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Invoice preview
        </h2>
      </div>

      {/* Invoice (the only thing that prints) */}
      <Card className="print:border-0 print:shadow-none">
        <Invoice
          invoiceNumber={invoiceNumber}
          clientName={client?.name ?? clientEmail}
          clientAddress={clientAddress}
          periodLabel={periodLabel}
          lines={invoiceLines}
          total={total}
        />
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </CardBody>
    </Card>
  );
}
