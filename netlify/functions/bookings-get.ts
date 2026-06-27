import type { Handler } from '@netlify/functions';
import { getUser, serviceClient } from './_shared/supabase';
import {
  HttpError,
  badRequest,
  forbidden,
  methodNotAllowed,
  notFound,
  ok,
  preflight,
  serverError,
} from './_shared/http';

const BOOKING_COLUMNS =
  'id, public_token, client_name, client_email, client_phone, service_type, frequency, bedrooms, bathrooms, extras, address, city, postal_code, preferred_date, preferred_time, notes, status, assigned_cleaner_id, estimated_price, created_at, updated_at';

/**
 * Returns a single booking with its job updates and final report.
 *
 *  - `?token=<public_token>`  → public client tracking (no auth)
 *  - `?id=<booking_id>`       → admin (any) or the assigned cleaner (auth required)
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  const token = event.queryStringParameters?.token;
  const id = event.queryStringParameters?.id;
  if (!token && !id) return badRequest('Provide a booking id or token');

  try {
    const supabase = serviceClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(BOOKING_COLUMNS)
      .eq(token ? 'public_token' : 'id', token ?? id)
      .maybeSingle();

    if (error) {
      console.error('bookings-get error', error);
      return serverError('Could not load booking');
    }
    if (!booking) return notFound('Booking not found');

    // Authorize id-based access (token access is implicitly authorized).
    const isClientView = Boolean(token);
    if (!token) {
      const user = await getUser(event); // throws 401 if not signed in
      const allowed =
        user.role === 'admin' || booking.assigned_cleaner_id === user.id;
      if (!allowed) return forbidden('You do not have access to this booking');
    }

    const [{ data: updates }, { data: report }] = await Promise.all([
      supabase
        .from('job_updates')
        .select('id, comment, photo_urls, created_at')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reports')
        .select(
          'id, summary, checklist, before_photos, after_photos, completed_at',
        )
        .eq('booking_id', booking.id)
        .maybeSingle(),
    ]);

    // For the public client view, hide internal contact duplication is fine —
    // the booking is theirs. We simply return everything they need to see.
    const payload = {
      booking,
      job_updates: updates ?? [],
      report: report ?? null,
      view: isClientView ? 'client' : 'staff',
    };

    return ok(payload);
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('bookings-get error', err);
    return serverError();
  }
};
