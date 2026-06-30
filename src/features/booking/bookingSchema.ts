import { z } from 'zod';

export const bookingFormSchema = z.object({
  service_type: z.enum(['house', 'apartment', 'airbnb', 'airbnb_express']),
  frequency: z.enum(['one_time', 'weekly', 'biweekly', 'monthly']),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  extras: z.array(z.string()).default([]),

  preferred_date: z.string().optional(),
  preferred_time: z.enum(['morning', 'afternoon', 'evening']).optional(),

  address: z.string().min(3, 'Please enter the address'),
  city: z.string().min(2, 'Please enter the city'),
  postal_code: z.string().optional(),

  client_name: z.string().min(2, 'Please enter your name'),
  client_email: z.string().email('Enter a valid email'),
  client_phone: z.string().min(5, 'Enter a valid phone number'),

  notes: z.string().max(2000).optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const bookingFormDefaults: BookingFormValues = {
  service_type: 'house',
  frequency: 'one_time',
  bedrooms: 2,
  bathrooms: 1,
  extras: [],
  preferred_date: '',
  preferred_time: undefined,
  address: '',
  city: '',
  postal_code: '',
  client_name: '',
  client_email: '',
  client_phone: '',
  notes: '',
};
