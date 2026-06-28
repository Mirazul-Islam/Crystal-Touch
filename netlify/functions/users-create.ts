import type { Handler } from '@netlify/functions';
import { requireRole, serviceClient } from './_shared/supabase';
import { userCreateSchema } from './_shared/validation';
import {
  HttpError,
  badRequest,
  created,
  methodNotAllowed,
  parseBody,
  preflight,
  serverError,
} from './_shared/http';

/** Admin-only: create a cleaner (or another admin) account. */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    await requireRole(event, 'admin');

    const raw = parseBody<unknown>(event.body);
    const parsed = userCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid user details', parsed.error.flatten());
    }

    const supabase = serviceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.full_name },
    });

    if (error || !data.user) {
      console.error('users-create auth error', error);
      return badRequest(error?.message || 'Could not create user');
    }

    // The handle_new_user trigger inserts a profile; set role + phone here.
    const { error: pErr } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data.full_name,
        role: parsed.data.role,
        phone: parsed.data.phone ?? null,
      })
      .eq('id', data.user.id);

    if (pErr) {
      console.error('users-create profile error', pErr);
      return serverError('User created but profile update failed');
    }

    return created({
      id: data.user.id,
      email: data.user.email,
      role: parsed.data.role,
      full_name: parsed.data.full_name,
    });
  } catch (err) {
    if (err instanceof HttpError) return err.response;
    console.error('users-create error', err);
    return serverError();
  }
};
