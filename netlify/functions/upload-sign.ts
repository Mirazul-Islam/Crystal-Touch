import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient, STORAGE_BUCKET } from './_shared/supabase';
import { uploadSignSchema } from './_shared/validation';
import {
  HttpError,
  badRequest,
  methodNotAllowed,
  ok,
  parseBody,
  preflight,
  serverError,
} from './_shared/http';

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-').slice(-80);
}

/**
 * Auth'd (cleaner/admin): mint a Supabase signed upload URL so the browser can
 * upload a job photo directly to Storage. Returns the storage path, a one-time
 * upload token, and the eventual public URL.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    await requireRole(event, 'cleaner', 'admin');

    const raw = parseBody<unknown>(event.body);
    const parsed = uploadSignSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid upload request', parsed.error.flatten());
    }

    const path = `bookings/${parsed.data.booking_id}/${Date.now()}-${crypto.randomUUID()}-${safeName(
      parsed.data.filename,
    )}`;

    const supabase = serviceClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error('upload-sign error', error);
      return serverError('Could not create upload URL');
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return ok({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl,
    });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('upload-sign error', err);
    return serverError();
  }
};
