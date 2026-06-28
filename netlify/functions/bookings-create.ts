import type { Handler } from '@netlify/functions';
import { serviceClient } from './_shared/supabase';
import { bookingCreateSchema } from './_shared/validation';
import {
  HttpError,
  badRequest,
  created,
  methodNotAllowed,
  parseBody,
  preflight,
  serverError,
} from './_shared/http';

/**
 * Public endpoint — anyone can submit a booking request from the home page.
 * Returns the new booking id and its public tracking token.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    const raw = parseBody<unknown>(event.body);
    const parsed = bookingCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid booking details', parsed.error.flatten());
    }

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...parsed.data, status: 'new' })
      .select('id, public_token')
      .single();

    if (error || !data) {
      console.error('bookings-create insert error', error);
      return serverError('Could not create booking');
    }

    return created({ id: data.id, token: data.public_token });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('bookings-create error', err);
    return serverError();
  }
};
