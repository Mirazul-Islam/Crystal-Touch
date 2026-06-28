import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import { jobUpdateSchema } from './_shared/validation';
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

/** Cleaner (assigned) or admin: post a comment + photos to a job in progress. */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    const user = await requireRole(event, 'cleaner', 'admin');

    const raw = parseBody<unknown>(event.body);
    const parsed = jobUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid update', parsed.error.flatten());
    }
    if (!parsed.data.comment && parsed.data.photo_urls.length === 0) {
      return badRequest('Add a comment or at least one photo');
    }

    const supabase = serviceClient();

    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, assigned_cleaner_id, status')
      .eq('id', parsed.data.booking_id)
      .maybeSingle();
    if (bErr) {
      console.error('job-updates-create lookup error', bErr);
      return serverError();
    }
    if (!booking) return notFound('Booking not found');
    if (user.role === 'cleaner' && booking.assigned_cleaner_id !== user.id) {
      return forbidden('This job is not assigned to you');
    }

    const { data, error } = await supabase
      .from('job_updates')
      .insert({
        booking_id: parsed.data.booking_id,
        cleaner_id: user.id,
        comment: parsed.data.comment ?? null,
        photo_urls: parsed.data.photo_urls,
      })
      .select('id, comment, photo_urls, created_at')
      .single();

    if (error || !data) {
      console.error('job-updates-create insert error', error);
      return serverError('Could not save update');
    }

    // First update moves the job into "in_progress".
    if (booking.status === 'assigned') {
      await supabase
        .from('bookings')
        .update({ status: 'in_progress' })
        .eq('id', booking.id);
    }

    return created({ update: data });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('job-updates-create error', err);
    return serverError();
  }
};
