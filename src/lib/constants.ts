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

// Company details used on invoices.
export const COMPANY = {
  name: 'Crystal Touch Cleaning',
  addressLines: ['169 Regency Park Drive, Unit 305', 'Halifax, Nova Scotia', 'B3S 1P4'],
  phone: '(902) 789-7777',
};

// Hourly rate per cleaner, depending on who supplies the cleaning materials.
export const RATE_CLIENT_SUPPLIES = 25; // client provides supplies
export const RATE_COMPANY_SUPPLIES = 40; // we bring supplies

export function hourlyRate(companySupplies: boolean): number {
  return companySupplies ? RATE_COMPANY_SUPPLIES : RATE_CLIENT_SUPPLIES;
}

// Security/closing checklist the cleaner ticks before leaving.
export const DEFAULT_CLOSING_CHECKLIST: string[] = [
  'All windows closed',
  'Front door locked',
  'Back door locked',
  'Garage door closed',
  'Lights turned off',
  'Heating / AC set',
  'Keys returned / lockbox secured',
];

// Restock items a cleaner can flag for Airbnb hosts.
export const AIRBNB_SUPPLY_ITEMS: string[] = [
  'Coffee',
  'Tea',
  'Sugar',
  'Toilet paper',
  'Paper towels',
  'Dish soap',
  'Hand soap',
  'Shampoo',
  'Cleaning supplies',
  'Trash bags',
];

export function isAirbnb(serviceType: ServiceType): boolean {
  return serviceType === 'airbnb' || serviceType === 'airbnb_express';
}

export const SUPPLIES_OPTIONS: {
  value: boolean;
  label: string;
  blurb: string;
}[] = [
  {
    value: false,
    label: 'I’ll provide supplies',
    blurb: `$${RATE_CLIENT_SUPPLIES}/hr per cleaner`,
  },
  {
    value: true,
    label: 'Bring supplies',
    blurb: `$${RATE_COMPANY_SUPPLIES}/hr per cleaner`,
  },
];
