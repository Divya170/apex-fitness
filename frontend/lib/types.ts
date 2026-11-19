/** Shapes returned by the Apex NestJS API. */
interface Base {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  street: string;
  city: string;
  country: string;
  mapQuery: string;
  story: string;
  privacyUrl: string;
  mapsUrl: string;
  directionsUrl: string;
}

export interface Program extends Base {
  slug: string;
  name: string;
  summary: string;
  details: string;
  benefits: string[];
  image: string;
  accent: 'lime' | 'orange';
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Plan extends Base {
  slug: string;
  name: string;
  priceCents: number | null;
  priceLabel: string | null;
  billing: string;
  facilities: string[];
  services: string[];
  benefits: string[];
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Session extends Base {
  day: number;
  dayName: string;
  startTime: string;
  endTime: string;
  title: string;
  programId: number | null;
  programName: string;
  programSlug: string;
  level: string;
  coach: string;
  info: string;
  published: boolean;
}

export interface ScheduleSummary {
  total: number;
  days: { day: number; name: string; count: number }[];
}

export interface GalleryImage extends Base {
  title: string;
  category: string;
  image: string;
  alt: string;
  ratio: string;
  featured: boolean;
  sortOrder: number;
  isPlaceholder: boolean;
  published: boolean;
}

export interface Facet {
  value: string;
  count: number;
}

export interface Benefit extends Base {
  title: string;
  detail: string;
  icon: 'access' | 'group' | 'clock' | 'coach';
  isPlaceholder: boolean;
}

export interface Facility extends Base {
  name: string;
  description: string;
  image: string;
  isPlaceholder: boolean;
}

export interface HoursRow extends Base {
  label: string;
  value: string | null;
  sortOrder: number;
}

export interface Trainer extends Base {
  name: string;
  role: string;
  bio: string;
  qualifications: string;
  photo: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  attribution: string;
}

export interface InquiryReceipt {
  reference: string;
  submittedAt: string;
  planName: string;
  programName: string;
}

export interface MessageReceipt {
  reference: string;
  submittedAt: string;
  topic: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface MembershipInquiry extends Base {
  reference: string;
  name: string;
  email: string;
  phone: string;
  planName: string;
  programName: string;
  message: string;
  status: string;
  notes: string;
}

export interface ContactMessage extends Base {
  reference: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  status: string;
  notes: string;
}

export interface AdminStats {
  inquiries: Record<string, number>;
  messages: Record<string, number>;
  programs: number;
  plansPriced: number;
  sessions: number;
  gallery: number;
  hoursMissing: number;
  placeholders: number;
}
