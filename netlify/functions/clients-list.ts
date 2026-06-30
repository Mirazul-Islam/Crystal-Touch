import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import {
  HttpError,
  methodNotAllowed,
  ok,
  preflight,
  serverError,
} from './_shared/http';

interface ClientRow {
  email: string;
  name: string | null;
  phone: string | null;
  bookings: number;
  completed: number;
  total: number;
  last_booking_at: string;
}

/** Admin-only: every client (grouped by email) with booking counts + totals. */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    await requireRole(event, 'admin');

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(
        'client_email, client_name, client_phone, status, estimated_price, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('clients-list error', error);
      return serverError('Could not load clients');
    }

    const byEmail = new Map<string, ClientRow>();
    for (const b of data ?? []) {
      const key = (b.client_email ?? '').toLowerCase();
      if (!key) continue;
      let row = byEmail.get(key);
      if (!row) {
        row = {
          email: b.client_email as string,
          name: b.client_name,
          phone: b.client_phone,
          bookings: 0,
          completed: 0,
          total: 0,
          last_booking_at: b.created_at as string,
        };
        byEmail.set(key, row);
      }
      row.bookings += 1;
      if (b.status === 'completed') {
        row.completed += 1;
        row.total += Number(b.estimated_price ?? 0);
      }
      // rows arrive newest-first, so the first name/phone seen is the latest.
    }

    const clients = [...byEmail.values()].sort((a, b) =>
      a.last_booking_at < b.last_booking_at ? 1 : -1,
    );

    return ok({ clients });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('clients-list error', err);
    return serverError();
  }
};
