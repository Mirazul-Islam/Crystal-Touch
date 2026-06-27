import type { ReactNode } from 'react';
import {
  MapPin,
  CalendarClock,
  BedDouble,
  Bath,
  Repeat,
  Tag,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import type { Booking } from '../../lib/types';
import {
  SERVICE_LABELS,
  FREQUENCY_LABELS,
  TIME_SLOT_LABELS,
} from '../../lib/constants';
import { formatDate, formatPrice } from '../../lib/format';
import { Pill } from '../ui/Badge';

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="text-slate-700">{children}</span>
    </div>
  );
}

export function BookingSummary({
  booking,
  showContact = false,
}: {
  booking: Booking;
  showContact?: boolean;
}) {
  const schedule = [
    booking.preferred_date ? formatDate(booking.preferred_date) : null,
    booking.preferred_time ? TIME_SLOT_LABELS[booking.preferred_time] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Row icon={<Tag className="h-4 w-4" />}>
        <span className="font-semibold">{SERVICE_LABELS[booking.service_type]}</span>
        {' cleaning'}
      </Row>
      <Row icon={<Repeat className="h-4 w-4" />}>{FREQUENCY_LABELS[booking.frequency]}</Row>
      <Row icon={<BedDouble className="h-4 w-4" />}>
        {booking.bedrooms === 0 ? 'Studio' : `${booking.bedrooms} bed`}
      </Row>
      <Row icon={<Bath className="h-4 w-4" />}>{booking.bathrooms} bath</Row>
      <Row icon={<MapPin className="h-4 w-4" />}>
        {booking.address}, {booking.city}
        {booking.postal_code ? ` ${booking.postal_code}` : ''}
      </Row>
      <Row icon={<CalendarClock className="h-4 w-4" />}>
        {schedule || 'Flexible timing'}
      </Row>
      {booking.estimated_price != null && (
        <Row icon={<Tag className="h-4 w-4" />}>
          Quote: <span className="font-semibold">{formatPrice(booking.estimated_price)}</span>
        </Row>
      )}

      {booking.extras.length > 0 && (
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            Extras
          </p>
          <div className="flex flex-wrap gap-1.5">
            {booking.extras.map((e) => (
              <Pill key={e}>{e}</Pill>
            ))}
          </div>
        </div>
      )}

      {booking.notes && (
        <div className="sm:col-span-2">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Client notes
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {booking.notes}
          </p>
        </div>
      )}

      {showContact && (
        <div className="sm:col-span-2 mt-1 border-t border-slate-100 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Client contact
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Row icon={<User className="h-4 w-4" />}>{booking.client_name}</Row>
            <Row icon={<Mail className="h-4 w-4" />}>
              <a href={`mailto:${booking.client_email}`} className="hover:text-brand-600">
                {booking.client_email}
              </a>
            </Row>
            <Row icon={<Phone className="h-4 w-4" />}>
              <a href={`tel:${booking.client_phone}`} className="hover:text-brand-600">
                {booking.client_phone}
              </a>
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}
