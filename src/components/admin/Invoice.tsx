import { COMPANY } from '../../lib/constants';
import { formatDate, formatPrice } from '../../lib/format';

export interface InvoiceLine {
  date: string | null;
  amount: number;
}

interface InvoiceProps {
  invoiceNumber: string;
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
  clientName,
  clientAddress,
  periodLabel,
  lines,
  total,
}: InvoiceProps) {
  return (
    <div
      id="invoice-sheet"
      className="mx-auto max-w-2xl bg-white p-8 text-slate-800 print:max-w-none print:p-0"
    >
      {/* Logo */}
      <div className="flex justify-center">
        <img src="/logo-lockup.svg" alt={COMPANY.name} className="h-32 w-auto" />
      </div>

      <h2 className="mt-6 text-lg font-extrabold tracking-wide text-slate-900">INVOICE</h2>
      <p className="mt-1 text-sm">
        <span className="font-semibold">Invoice Number:</span> {invoiceNumber}
      </p>

      <div className="mt-4 text-sm">
        <p>
          <span className="font-semibold">Client:</span> {clientName || '—'}
        </p>
        {clientAddress && (
          <p>
            <span className="font-semibold">Address:</span> {clientAddress}
          </p>
        )}
      </div>

      <div className="mt-4 text-sm leading-5">
        <p className="font-semibold">{COMPANY.name}</p>
        {COMPANY.addressLines.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <p>Phone: {COMPANY.phone}</p>
      </div>

      <p className="mt-4 text-xs text-slate-500">Billing period: {periodLabel}</p>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold">
              Cleaning Date
            </th>
            <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-semibold">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <td className="border border-slate-300 px-3 py-2 text-slate-400" colSpan={2}>
                No completed cleanings in this period.
              </td>
            </tr>
          )}
          {lines.map((line, i) => (
            <tr key={i}>
              <td className="border border-slate-300 px-3 py-2">
                {line.date ? formatDate(line.date) : '—'}
              </td>
              <td className="border border-slate-300 px-3 py-2">
                {formatPrice(line.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="border border-slate-300 px-3 py-2 font-bold">TOTAL</td>
            <td className="border border-slate-300 px-3 py-2 font-bold">
              {formatPrice(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-6 text-sm">Thank you for choosing {COMPANY.name}.</p>
    </div>
  );
}
