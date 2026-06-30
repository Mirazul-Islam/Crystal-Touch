import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import {
  HttpError,
  methodNotAllowed,
  ok,
  preflight,
  serverError,
} from './_shared/http';

/** Cleaner: list the bookings assigned to the signed-in cleaner. */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    const user = await requireRole(event, 'cleaner', 'admin');

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(
        // No client contact fields — cleaners only get the job location + access.
        'id, reference_code, service_type, frequency, bedrooms, bathrooms, address, city, postal_code, buzz_code, company_supplies, preferred_date, preferred_time, status, estimated_price, visit_number, created_at',
      )
      .eq('assigned_cleaner_id', user.id)
      .in('status', ['assigned', 'in_progress', 'completed'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('my-jobs error', error);
      return serverError('Could not load your jobs');
    }

    return ok({ bookings: data ?? [] });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('my-jobs error', err);
    return serverError();
  }
};
