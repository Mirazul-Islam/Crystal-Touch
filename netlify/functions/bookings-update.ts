import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import { bookingUpdateSchema } from './_shared/validation';
import {
  HttpError,
  badRequest,
  methodNotAllowed,
  notFound,
  ok,
  parseBody,
  preflight,
  serverError,
} from './_shared/http';

/** Admin-only: assign a cleaner, change status, or set the quote. */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST') {
    return methodNotAllowed();
  }

  try {
    await requireRole(event, 'admin');

    const id = event.queryStringParameters?.id;
    if (!id) return badRequest('Missing booking id');

    const raw = parseBody<unknown>(event.body);
    const parsed = bookingUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid update', parsed.error.flatten());
    }

    const update: Record<string, unknown> = { ...parsed.data };

    // Auto-advance status when a cleaner is (un)assigned and admin didn't set it.
    if (parsed.data.assigned_cleaner_id !== undefined && parsed.data.status === undefined) {
      update.status = parsed.data.assigned_cleaner_id ? 'assigned' : 'new';
    }

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from('bookings')
      .update(update)
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('bookings-update error', error);
      return serverError('Could not update booking');
    }
    if (!data) return notFound('Booking not found');

    return ok({ id: data.id });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('bookings-update error', err);
    return serverError();
  }
};
