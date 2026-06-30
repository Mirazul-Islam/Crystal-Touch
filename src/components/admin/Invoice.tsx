import { COMPANY } from '../../lib/constants';
import { formatDate, formatPrice } from '../../lib/format';

export interface InvoiceLine {
  date: string | null;
  amount: number;
}

interface InvoiceProps {
  invoiceNumber: string;
  issuedAt: string;
  clientName: string | null;
  clientAddress: string | null;
  periodLabel: string;
  lines: InvoiceLine[];
  total: number;
}

/**
 * Official, print-ready invoice. On screen it renders as a white sheet; when
 * the page is printed (or "Saved as PDF") this is the only thing that shows.
 */
export function Invoice({
  invoiceNumber,
  issuedAt,
  clientName,
  clientAddress,
  periodLabel,
  lines,
  total,
}: InvoiceProps) {
  return (
    <div id="invoice-sheet" className="invoice-sheet mx-auto max-w-2xl bg-white p-10 text-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 border-b-2 border-brand-700 pb-5">
        <img src="/logo-lockup.svg" alt={COMPANY.name} className="h-24 w-auto" />
        <div className="text-right">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-800">INVOICE</h2>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold">No.</span> {invoiceNumber}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Date:</span> {formatDate(issuedAt)}
          </p>
        </div>
      </div>

      {/* From / Bill to */}
      <div className="mt-6 grid grid-cols-2 gap-6 text-sm leading-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            From
          </p>
          <p className="font-semibold text-slate-900">{COMPANY.name}</p>
          {COMPANY.addressLines.map((l) => (
            <p key={l}>{l}</p>
          ))}
          <p>Phone: {COMPANY.phone}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Bill to
          </p>
          <p className="font-semibold text-slate-900">{clientName || '—'}</p>
          {clientAddress && <p>{clientAddress}</p>}
          <p className="mt-2 text-slate-500">Billing period: {periodLabel}</p>
        </div>
      </div>

      {/* Line items */}
      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="bg-brand-700 text-left text-white">
            <th className="px-4 py-2.5 font-semibold">Cleaning Date</th>
            <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr className="border-b border-slate-200">
              <td className="px-4 py-2.5 text-slate-400" colSpan={2}>
                No completed cleanings in this period.
              </td>
            </tr>
          )}
          {lines.map((line, i) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="px-4 py-2.5">{line.date ? formatDate(line.date) : '—'}</td>
              <td className="px-4 py-2.5 text-right">{formatPrice(line.amount)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-brand-700 bg-slate-50">
            <td className="px-4 py-3 text-right font-bold uppercase">Total</td>
            <td className="px-4 py-3 text-right text-base font-bold text-brand-800">
              {formatPrice(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-10 text-sm text-slate-700">
        Thank you for choosing {COMPANY.name}.
      </p>
      <p className="mt-1 text-xs text-slate-400">Payment due upon receipt.</p>
    </div>
  );
}
