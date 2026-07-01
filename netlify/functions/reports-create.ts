import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import { reportCreateSchema } from './_shared/validation';
import {
  HttpError,
  badRequest,
  created,
  forbidden,
  methodNotAllowed,
  notFound,
  parseBody,
  preflight,
  serverError,
} from './_shared/http';

const COPY_COLUMNS =
  'id, public_token, client_name, client_email, client_phone, service_type, frequency, bedrooms, bathrooms, extras, address, city, postal_code, buzz_code, company_supplies, preferred_date, preferred_time, notes, status, assigned_cleaner_id, estimated_price, tax_rate, series_id, visit_number';

/** Compute the next visit date (YYYY-MM-DD) from today for a recurring booking. */
function nextDate(frequency: string): string {
  const d = new Date();
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'biweekly') d.setDate(d.getDate() + 14);
  else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Cleaner (assigned) or admin: submit the final after-service report.
 * Marks the booking completed. For recurring bookings, the next visit is
 * auto-created (same client/cleaner, dated by frequency) so the schedule
 * keeps cycling. Upserts so an existing report is replaced.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    const user = await requireRole(event, 'cleaner', 'admin');

    const raw = parseBody<unknown>(event.body);
    const parsed = reportCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid report', parsed.error.flatten());
    }

    const supabase = serviceClient();

    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select(COPY_COLUMNS)
      .eq('id', parsed.data.booking_id)
      .maybeSingle();
    if (bErr) {
      console.error('reports-create lookup error', bErr);
      return serverError();
    }
    if (!booking) return notFound('Booking not found');
    if (user.role === 'cleaner' && booking.assigned_cleaner_id !== user.id) {
      return forbidden('This job is not assigned to you');
    }

    const { data, error } = await supabase
      .from('reports')
      .upsert(
        {
          booking_id: parsed.data.booking_id,
          cleaner_id: user.id,
          summary: parsed.data.summary,
          checklist: parsed.data.checklist,
          closing_checklist: parsed.data.closing_checklist,
          supply_alerts: parsed.data.supply_alerts,
          before_photos: parsed.data.before_photos,
          after_photos: parsed.data.after_photos,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'booking_id' },
      )
      .select('id')
      .single();

    if (error || !data) {
      console.error('reports-create upsert error', error);
      return serverError('Could not save report');
    }

    await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', parsed.data.booking_id);

    // --- recurring: schedule the next visit -------------------------------
    let nextVisit: { id: string; preferred_date: string } | null = null;
    if (booking.frequency && booking.frequency !== 'one_time') {
      // Idempotent: don't spawn a duplicate if a next visit already exists.
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('recurrence_parent_id', booking.id)
        .maybeSingle();

      if (!existing) {
        const due = nextDate(booking.frequency);
        const { data: nextBooking, error: nextErr } = await supabase
          .from('bookings')
          .insert({
            client_name: booking.client_name,
            client_email: booking.client_email,
            client_phone: booking.client_phone,
            service_type: booking.service_type,
            frequency: booking.frequency,
            bedrooms: booking.bedrooms,
            bathrooms: booking.bathrooms,
            extras: booking.extras,
            address: booking.address,
            city: booking.city,
            postal_code: booking.postal_code,
            buzz_code: booking.buzz_code,
            company_supplies: booking.company_supplies,
            preferred_date: due,
            preferred_time: booking.preferred_time,
            notes: booking.notes,
            estimated_price: booking.estimated_price,
            tax_rate: booking.tax_rate,
            assigned_cleaner_id: booking.assigned_cleaner_id,
            status: booking.assigned_cleaner_id ? 'assigned' : 'new',
            series_id: booking.series_id,
            visit_number: (booking.visit_number ?? 1) + 1,
            recurrence_parent_id: booking.id,
          })
          .select('id, preferred_date')
          .single();

        if (nextErr) {
          // Non-fatal: the report saved fine; just log the scheduling failure.
          console.error('reports-create next-visit error', nextErr);
        } else if (nextBooking) {
          nextVisit = { id: nextBooking.id, preferred_date: nextBooking.preferred_date };
        }
      }
    }

    return created({ id: data.id, next_visit: nextVisit });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('reports-create error', err);
    return serverError();
  }
};
