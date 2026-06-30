import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import {
  HttpError,
  badRequest,
  methodNotAllowed,
  ok,
  preflight,
  serverError,
} from './_shared/http';

/**
 * Admin-only: every booking placed with a given client email, optionally
 * within a date range (?from=YYYY-MM-DD&to=YYYY-MM-DD by created_at). Used for
 * the client history view and monthly invoices.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    await requireRole(event, 'admin');

    const email = event.queryStringParameters?.email?.trim();
    if (!email) return badRequest('Missing email');
    const from = event.queryStringParameters?.from;
    const to = event.queryStringParameters?.to;

    const supabase = serviceClient();
    let query = supabase
      .from('bookings')
      .select(
        'id, reference_code, client_name, client_email, client_phone, service_type, frequency, status, company_supplies, address, city, postal_code, preferred_date, estimated_price, visit_number, created_at',
      )
      .ilike('client_email', email)
      .order('created_at', { ascending: false });

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', `${to}T23:59:59`);

    const { data, error } = await query;
    if (error) {
      console.error('bookings-by-email error', error);
      return serverError('Could not load client bookings');
    }

    const bookings = data ?? [];
    const client = bookings[0]
      ? {
          name: bookings[0].client_name,
          email: bookings[0].client_email,
          phone: bookings[0].client_phone,
        }
      : { name: null, email, phone: null };

    return ok({ client, bookings });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('bookings-by-email error', err);
    return serverError();
  }
};
