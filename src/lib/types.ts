export type Role = 'admin' | 'cleaner' | 'client';

export type ServiceType = 'house' | 'apartment' | 'airbnb' | 'airbnb_express';

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
  reference_code?: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  service_type: ServiceType;
  frequency: Frequency;
  bedrooms: number;
  bathrooms: number;
  extras: string[];
  address: string;
  city: string;
  postal_code: string | null;
  buzz_code?: string | null;
  company_supplies?: boolean;
  preferred_date: string | null;
  preferred_time: TimeSlot | null;
  notes: string | null;
  status: BookingStatus;
  assigned_cleaner_id: string | null;
  assigned_cleaner_name?: string | null;
  estimated_price: number | null;
  extra_cost?: number | null;
  extra_cost_note?: string | null;
  tax_rate?: number | null;
  series_id?: string | null;
  visit_number?: number;
  recurrence_parent_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeriesVisit {
  id: string;
  public_token: string;
  status: BookingStatus;
  preferred_date: string | null;
  visit_number: number;
  has_report: boolean;
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

export interface SupplyAlert {
  item: string;
  status: 'low' | 'out';
}

export interface Report {
  id: string;
  summary: string;
  checklist: ChecklistItem[];
  closing_checklist: ChecklistItem[];
  supply_alerts: SupplyAlert[];
  before_photos: string[];
  after_photos: string[];
  completed_at: string;
}

export interface BookingDetail {
  booking: Booking;
  job_updates: JobUpdate[];
  report: Report | null;
  series: SeriesVisit[];
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
  buzz_code?: string | null;
  company_supplies: boolean;
  preferred_date?: string | null;
  preferred_time?: TimeSlot | null;
  notes?: string | null;
}
