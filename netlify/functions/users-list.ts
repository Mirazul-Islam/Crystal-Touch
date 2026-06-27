import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import {
  HttpError,
  methodNotAllowed,
  ok,
  preflight,
  serverError,
} from './_shared/http';

/** Admin-only: list staff (cleaners by default) for assignment dropdowns. */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return methodNotAllowed();

  try {
    await requireRole(event, 'admin');

    const role = event.queryStringParameters?.role ?? 'cleaner';
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, created_at')
      .eq('role', role)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('users-list error', error);
      return serverError('Could not load users');
    }

    return ok({ users: data ?? [] });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('users-list error', err);
    return serverError();
  }
};
