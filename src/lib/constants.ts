import { Home, Building2, BedDouble, Zap, type LucideIcon } from 'lucide-react';
import type {
  BookingStatus,
  Frequency,
  ServiceType,
  TimeSlot,
} from './types';

export interface ServiceOption {
  value: ServiceType;
  label: string;
  blurb: string;
  icon: LucideIcon;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { value: 'house', label: 'House', blurb: 'Standard home cleaning', icon: Home },
  { value: 'apartment', label: 'Apartment', blurb: 'Flats & condos', icon: Building2 },
  { value: 'airbnb', label: 'Airbnb', blurb: 'Guest turnover clean', icon: BedDouble },
  {
    value: 'airbnb_express',
    label: 'Airbnb Express',
    blurb: 'Fast same-day turnaround',
    icon: Zap,
  },
];

// Includes legacy values so any older bookings still render a readable label.
export const SERVICE_LABELS: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  airbnb: 'Airbnb',
  airbnb_express: 'Airbnb Express',
  hotel: 'Hotel',
  office: 'Office / Commercial',
  move_in_out: 'Move In / Out',
  post_construction: 'Post-Construction',
  deep_clean: 'Deep Clean',
};

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'one_time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

export const FREQUENCY_LABELS: Record<Frequency, string> = Object.fromEntries(
  FREQUENCY_OPTIONS.map((f) => [f.value, f.label]),
) as Record<Frequency, string>;

export const TIME_SLOT_OPTIONS: { value: TimeSlot; label: string }[] = [
  { value: 'morning', label: 'Morning (8am – 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm – 4pm)' },
  { value: 'evening', label: 'Evening (4pm – 8pm)' },
];

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = Object.fromEntries(
  TIME_SLOT_OPTIONS.map((t) => [t.value, t.label]),
) as Record<TimeSlot, string>;

export const EXTRA_OPTIONS: string[] = [
  'Inside fridge',
  'Inside oven',
  'Interior windows',
  'Laundry & ironing',
  'Inside cabinets',
  'Wall washing',
  'Balcony / patio',
  'Garage',
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_STYLES: Record<BookingStatus, string> = {
  new: 'bg-amber-100 text-amber-800 ring-amber-200',
  assigned: 'bg-blue-100 text-blue-800 ring-blue-200',
  in_progress: 'bg-violet-100 text-violet-800 ring-violet-200',
  completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-slate-200 text-slate-700 ring-slate-300',
};

/** The ordered pipeline used by the admin dispatch board. */
export const PIPELINE: BookingStatus[] = [
  'new',
  'assigned',
  'in_progress',
  'completed',
];
