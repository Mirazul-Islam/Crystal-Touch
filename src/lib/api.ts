import { supabase } from './supabase';
import type {
  Booking,
  BookingCreateInput,
  BookingDetail,
  BookingStatus,
  ChecklistItem,
  JobUpdate,
  Profile,
  Role,
} from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | undefined>;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, query } = opts;

  const url = new URL(`${API_BASE}/${path}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) Object.assign(headers, await authHeader());

  const res = await fetch(url.toString().replace(window.location.origin, ''), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(
      data?.error || `Request failed (${res.status})`,
      res.status,
      data?.details,
    );
  }
  return data as T;
}

// --- Public ---------------------------------------------------------------
export function createBooking(input: BookingCreateInput) {
  return request<{ id: string; token: string; reference_code: string }>(
    'bookings-create',
    {
      method: 'POST',
      body: input,
    },
  );
}

export function getBookingByToken(token: string) {
  return request<BookingDetail>('bookings-get', { query: { token } });
}

// --- Authenticated --------------------------------------------------------
export function getBookingById(id: string) {
  return request<BookingDetail>('bookings-get', { auth: true, query: { id } });
}

export function listBookings(status?: BookingStatus) {
  return request<{ bookings: Booking[] }>('bookings-list', {
    auth: true,
    query: { status },
  });
}

export function listMyJobs() {
  return request<{ bookings: Booking[] }>('my-jobs', { auth: true });
}

export interface ClientSummary {
  email: string;
  name: string | null;
  phone: string | null;
  bookings: number;
  completed: number;
  total: number;
  last_booking_at: string;
}

export function listClients() {
  return request<{ clients: ClientSummary[] }>('clients-list', { auth: true });
}

export function listBookingsByEmail(
  email: string,
  range?: { from?: string; to?: string },
) {
  return request<{
    client: { name: string | null; email: string; phone: string | null };
    bookings: Booking[];
  }>('bookings-by-email', {
    auth: true,
    query: { email, from: range?.from, to: range?.to },
  });
}

export function updateBooking(
  id: string,
  patch: {
    status?: BookingStatus;
    assigned_cleaner_id?: string | null;
    estimated_price?: number | null;
    extra_cost?: number | null;
    extra_cost_note?: string | null;
    tax_rate?: number;
  },
) {
  return request<{ id: string }>('bookings-update', {
    method: 'PATCH',
    auth: true,
    query: { id },
    body: patch,
  });
}

export function createJobUpdate(input: {
  booking_id: string;
  comment?: string | null;
  photo_urls: string[];
}) {
  return request<{ update: JobUpdate }>('job-updates-create', {
    method: 'POST',
    auth: true,
    body: input,
  });
}

export function createReport(input: {
  booking_id: string;
  summary: string;
  checklist: ChecklistItem[];
  closing_checklist: ChecklistItem[];
  supply_alerts: { item: string; status: 'low' | 'out' }[];
  before_photos: string[];
  after_photos: string[];
}) {
  return request<{
    id: string;
    next_visit: { id: string; preferred_date: string } | null;
  }>('reports-create', {
    method: 'POST',
    auth: true,
    body: input,
  });
}

export function listCleaners() {
  return request<{ users: Profile[] }>('users-list', {
    auth: true,
    query: { role: 'cleaner' },
  });
}

export function createUser(input: {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
  role: Extract<Role, 'cleaner' | 'admin'>;
}) {
  return request<{ id: string }>('users-create', {
    method: 'POST',
    auth: true,
    body: input,
  });
}

// --- Photo upload (signed URL → direct storage upload) --------------------
export async function uploadJobPhoto(bookingId: string, file: File): Promise<string> {
  const sign = await request<{
    path: string;
    token: string;
    signedUrl: string;
    publicUrl: string;
  }>('upload-sign', {
    method: 'POST',
    auth: true,
    body: { booking_id: bookingId, filename: file.name },
  });

  const { error } = await supabase.storage
    .from(import.meta.env.VITE_SUPABASE_BUCKET || 'job-photos')
    .uploadToSignedUrl(sign.path, sign.token, file);

  if (error) throw new ApiError(`Upload failed: ${error.message}`, 500);
  return sign.publicUrl;
}
