import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HandlerEvent } from '@netlify/functions';
import { HttpError, unauthorized, forbidden, serverError } from './http';

export type Role = 'admin' | 'cleaner' | 'client';

const SUPABASE_URL = process.env.SUPABASE_URL;
// Supports both the new secret key (sb_secret_…) and the legacy service-role key.
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'job-photos';

let cached: SupabaseClient | null = null;

/**
 * Service-role client. Bypasses RLS — only ever used inside functions after
 * the caller has been authenticated/authorized.
 */
export function serviceClient(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new HttpError(
      serverError('Server is missing SUPABASE_URL / SUPABASE_SECRET_KEY'),
    );
  }
  if (!cached) {
    cached = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}

export interface AuthedUser {
  id: string;
  email: string | null;
  role: Role;
  fullName: string | null;
}

function bearer(event: HandlerEvent): string | null {
  const header = event.headers.authorization || event.headers.Authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

/** Resolve the calling user from their JWT, including their role from profiles. */
export async function getUser(event: HandlerEvent): Promise<AuthedUser> {
  const token = bearer(event);
  if (!token) throw new HttpError(unauthorized('Missing bearer token'));

  const supabase = serviceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    console.error('[auth] getUser failed:', error?.message);
    throw new HttpError(
      unauthorized(`Invalid session${error?.message ? ` — ${error.message}` : ''}`),
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    role: (profile?.role as Role) ?? 'client',
    fullName: profile?.full_name ?? null,
  };
}

/** Require the caller to be authenticated and have one of the allowed roles. */
export async function requireRole(
  event: HandlerEvent,
  ...roles: Role[]
): Promise<AuthedUser> {
  const user = await getUser(event);
  if (roles.length && !roles.includes(user.role)) {
    throw new HttpError(forbidden(`Requires role: ${roles.join(' or ')}`));
  }
  return user;
}
