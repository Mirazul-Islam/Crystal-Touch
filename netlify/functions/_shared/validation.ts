import { z } from 'zod';

export const SERVICE_TYPES = [
  'house',
  'apartment',
  'airbnb',
  'airbnb_express',
] as const;

export const FREQUENCIES = ['one_time', 'weekly', 'biweekly', 'monthly'] as const;
export const TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;
export const BOOKING_STATUSES = [
  'new',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export const bookingCreateSchema = z.object({
  client_name: z.string().trim().min(2).max(120),
  client_email: z.string().trim().email().max(160),
  client_phone: z.string().trim().min(5).max(40),
  service_type: z.enum(SERVICE_TYPES),
  frequency: z.enum(FREQUENCIES).default('one_time'),
  bedrooms: z.number().int().min(0).max(20).default(1),
  bathrooms: z.number().int().min(0).max(20).default(1),
  extras: z.array(z.string().max(60)).max(30).default([]),
  address: z.string().trim().min(3).max(240),
  city: z.string().trim().min(2).max(120),
  postal_code: z.string().trim().max(20).optional().nullable(),
  buzz_code: z.string().trim().max(60).optional().nullable(),
  company_supplies: z.boolean().default(false),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  preferred_time: z.enum(TIME_SLOTS).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const bookingUpdateSchema = z
  .object({
    status: z.enum(BOOKING_STATUSES).optional(),
    assigned_cleaner_id: z.string().uuid().nullable().optional(),
    estimated_price: z.number().min(0).max(1_000_000).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const jobUpdateSchema = z.object({
  booking_id: z.string().uuid(),
  comment: z.string().trim().max(2000).optional().nullable(),
  photo_urls: z.array(z.string().max(500)).max(20).default([]),
});

export const reportCreateSchema = z.object({
  booking_id: z.string().uuid(),
  summary: z.string().trim().min(5).max(4000),
  checklist: z
    .array(z.object({ label: z.string().max(120), done: z.boolean() }))
    .max(50)
    .default([]),
  closing_checklist: z
    .array(z.object({ label: z.string().max(120), done: z.boolean() }))
    .max(50)
    .default([]),
  supply_alerts: z
    .array(
      z.object({
        item: z.string().max(120),
        status: z.enum(['low', 'out']),
      }),
    )
    .max(50)
    .default([]),
  before_photos: z.array(z.string().max(500)).max(20).default([]),
  after_photos: z.array(z.string().max(500)).max(20).default([]),
});

export const userCreateSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  role: z.enum(['cleaner', 'admin']).default('cleaner'),
});

export const uploadSignSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  booking_id: z.string().uuid(),
});
