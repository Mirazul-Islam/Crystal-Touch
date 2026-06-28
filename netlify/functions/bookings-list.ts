import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import { BOOKING_STATUSES } from './_shared/validation';
import {
  HttpError,
  methodNotAllowed,
  ok,
  preflight,
  serverError,
} from './_shared/http';

/** Admin-only: list all bookings, optionally filtered by ?status=. */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    await requireRole(event, 'admin');

    const supabase = serviceClient();
    let query = supabase
      .from('bookings')
      .select(
        'id, public_token, client_name, client_email, client_phone, service_type, frequency, bedrooms, bathrooms, address, city, postal_code, preferred_date, preferred_time, status, assigned_cleaner_id, estimated_price, series_id, visit_number, recurrence_parent_id, created_at',
      )
      .order('created_at', { ascending: false });

    const status = event.queryStringParameters?.status;
    if (status && (BOOKING_STATUSES as readonly string[]).includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('bookings-list error', error);
      return serverError('Could not load bookings');
    }

    // attach assigned cleaner names
    const cleanerIds = [
      ...new Set(data.map((b) => b.assigned_cleaner_id).filter(Boolean)),
    ] as string[];
    let names: Record<string, string> = {};
    if (cleanerIds.length) {
      const { data: cleaners } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', cleanerIds);
      names = Object.fromEntries(
        (cleaners ?? []).map((c) => [c.id, c.full_name ?? '']),
      );
    }

    const bookings = data.map((b) => ({
      ...b,
      assigned_cleaner_name: b.assigned_cleaner_id
        ? names[b.assigned_cleaner_id] ?? null
        : null,
    }));

    return ok({ bookings });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('bookings-list error', err);
    return serverError();
  }
};
