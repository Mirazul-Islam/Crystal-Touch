export type Role = 'admin' | 'cleaner' | 'client';

export type ServiceType =
  | 'house'
  | 'apartment'
  | 'airbnb'
  | 'hotel'
  | 'office'
  | 'move_in_out'
  | 'post_construction'
  | 'deep_clean';

export type Frequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type BookingStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  phone: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  public_token: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: ServiceType;
  frequency: Frequency;
  bedrooms: number;
  bathrooms: number;
  extras: string[];
  address: string;
  city: string;
  postal_code: string | null;
  preferred_date: string | null;
  preferred_time: TimeSlot | null;
  notes: string | null;
  status: BookingStatus;
  assigned_cleaner_id: string | null;
  assigned_cleaner_name?: string | null;
  estimated_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobUpdate {
  id: string;
  comment: string | null;
  photo_urls: string[];
  created_at: string;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface Report {
  id: string;
  summary: string;
  checklist: ChecklistItem[];
  before_photos: string[];
  after_photos: string[];
  completed_at: string;
}

export interface BookingDetail {
  booking: Booking;
  job_updates: JobUpdate[];
  report: Report | null;
  view: 'client' | 'staff';
}

export interface BookingCreateInput {
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: ServiceType;
  frequency: Frequency;
  bedrooms: number;
  bathrooms: number;
  extras: string[];
  address: string;
  city: string;
  postal_code?: string | null;
  preferred_date?: string | null;
  preferred_time?: TimeSlot | null;
  notes?: string | null;
}
