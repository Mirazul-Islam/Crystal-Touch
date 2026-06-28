import type { Handler } from '@netlify/functions';
import { ok, preflight } from './_shared/http';

/**
 * Diagnostic endpoint — visit /api/health to confirm the serverless functions
 * have the right Supabase environment configured. Reports presence/shape only,
 * never the secret values. If you call it from the app (with a session) it also
 * tries to validate your token and tells you exactly why it fails.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const url = process.env.SUPABASE_URL || '';
  let host = '';
  try {
    host = new URL(url).host;
  } catch {
    /* invalid or empty URL */
  }

  const secret =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const secretType = secret.startsWith('sb_secret_')
    ? 'new_secret_key'
    : secret.startsWith('eyJ')
      ? 'legacy_service_role_jwt'
      : secret
        ? 'unrecognized'
        : 'MISSING';

  const report: Record<string, unknown> = {
    has_SUPABASE_URL: Boolean(url),
    supabase_host: host || 'MISSING',
    secret_key: secretType,
    storage_bucket: process.env.SUPABASE_STORAGE_BUCKET || 'job-photos (default)',
  };

  // If a bearer token is present, test it against Supabase and report the reason.
  const header = event.headers.authorization || event.headers.Authorization;
  const token = header?.toLowerCase().startsWith('bearer ')
    ? header.slice(7)
    : null;

  if (token && url && secret) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, secret, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await supabase.auth.getUser(token);
      report.token_check = error
        ? { ok: false, reason: error.message }
        : { ok: true, email: data.user?.email };
    } catch (e) {
      report.token_check = { ok: false, reason: (e as Error).message };
    }
  } else {
    report.token_check = 'no token sent (open this from the app to test your login)';
  }

  return ok(report);
};
