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

/**
 * Cleaner (assigned) or admin: submit the final after-service report.
 * Marks the booking completed. Upserts so an existing report is replaced.
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
      .select('id, assigned_cleaner_id')
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

    return created({ id: data.id });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('reports-create error', err);
    return serverError();
  }
};
