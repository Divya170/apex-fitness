/** Field definitions that drive the generic content manager. */
export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'lines' | 'image' | 'money' | 'time';

export interface Choice { value: string; label: string }

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  choices?: Choice[];
  /** Load select choices from the API (published programs). */
  choicesFrom?: 'programs';
  numeric?: boolean; // select value sent as a number (or null when empty)
  hint?: string;
  full?: boolean;
  rows?: number;
  nullable?: boolean;
}

export interface ContentConfig {
  resource: string;
  title: string;
  singular: string;
  primary: string;
  secondary?: string[];
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

export const ART = [
  '/art/scene-barbell.svg', '/art/scene-dumbbells.svg', '/art/scene-cardio.svg', '/art/scene-rower.svg',
  '/art/scene-kettlebell.svg', '/art/scene-group.svg', '/art/scene-coach.svg', '/art/scene-space.svg',
];
const DAYS: Choice[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d, i) => ({ value: String(i), label: d }));
const GALLERY = ['Gym Equipment', 'Strength Training', 'Cardio', 'Group Activities', 'Training Environment'];

const order: FieldDef = { key: 'sortOrder', label: 'Sort order', type: 'number', hint: 'Lower numbers appear first.' };
const placeholder: FieldDef = { key: 'isPlaceholder', label: 'Placeholder content (shows a “to be supplied” tag)', type: 'checkbox' };
const published: FieldDef = { key: 'published', label: 'Published on the website', type: 'checkbox' };
const slug: FieldDef = { key: 'slug', label: 'URL slug', type: 'text', hint: 'Leave empty to generate from the name.' };

export const CONTENT: ContentConfig[] = [
  {
    resource: 'programs', title: 'Programs', singular: 'program', primary: 'name', secondary: ['summary'],
    defaults: { accent: 'lime', image: ART[7], published: true, isPlaceholder: false, sortOrder: 0, benefits: [] },
    fields: [
      { key: 'name', label: 'Program name', type: 'text', required: true }, slug,
      { key: 'summary', label: 'Short description', type: 'textarea', full: true, rows: 2 },
      { key: 'details', label: 'Program details', type: 'textarea', full: true, rows: 5, hint: 'Who it’s for, what a session looks like. Only confirmed information.' },
      { key: 'benefits', label: 'Confirmed benefits', type: 'lines', full: true, hint: 'One per line. Leave empty if none are confirmed.' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'accent', label: 'Accent colour', type: 'select', options: ['lime', 'orange'] }, order, placeholder, published,
    ],
  },
  {
    resource: 'plans', title: 'Membership plans', singular: 'plan', primary: 'name', secondary: ['billing'],
    defaults: { published: true, isPlaceholder: false, sortOrder: 0, facilities: [], services: [], benefits: [] },
    fields: [
      { key: 'name', label: 'Plan name', type: 'text', required: true }, slug,
      { key: 'priceCents', label: 'Price (USD)', type: 'money', nullable: true, hint: 'Leave empty until pricing is confirmed — the site shows a placeholder.' },
      { key: 'billing', label: 'Billing frequency', type: 'text', hint: 'e.g. per month. Required when a price is set.' },
      { key: 'facilities', label: 'Included facilities', type: 'lines', full: true, hint: 'One per line.' },
      { key: 'services', label: 'Included services', type: 'lines', full: true, hint: 'One per line.' },
      { key: 'benefits', label: 'Membership benefits', type: 'lines', full: true, hint: 'One per line.' },
      order, placeholder, published,
    ],
  },
  {
    resource: 'sessions', title: 'Training schedule', singular: 'session', primary: 'title', secondary: ['dayName', 'startTime', 'programName'],
    defaults: { day: 0, published: true },
    fields: [
      { key: 'title', label: 'Session title', type: 'text', required: true },
      { key: 'day', label: 'Day', type: 'select', choices: DAYS, numeric: true, required: true },
      { key: 'startTime', label: 'Start time', type: 'time', required: true },
      { key: 'endTime', label: 'End time', type: 'time' },
      { key: 'programId', label: 'Program', type: 'select', choicesFrom: 'programs', numeric: true },
      { key: 'level', label: 'Level', type: 'text' },
      { key: 'coach', label: 'Coach', type: 'text', hint: 'Only verified coach names.' },
      { key: 'info', label: 'Session info', type: 'text', full: true }, published,
    ],
  },
  {
    resource: 'gallery', title: 'Gallery', singular: 'image', primary: 'title', secondary: ['category'],
    defaults: { category: GALLERY[0], ratio: '4 / 3', image: ART[0], published: true, isPlaceholder: false, featured: false, sortOrder: 0 },
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: GALLERY, required: true },
      { key: 'image', label: 'Image path or URL', type: 'image', required: true },
      { key: 'alt', label: 'Alt text', type: 'text', required: true, full: true, hint: 'Describe the photo for screen-reader users.' },
      { key: 'ratio', label: 'Aspect ratio', type: 'select', options: ['4 / 3', '1 / 1', '3 / 4', '4 / 5', '16 / 9'] },
      { key: 'featured', label: 'Feature in hero / gallery carousel', type: 'checkbox' }, order, placeholder, published,
    ],
  },
  {
    resource: 'benefits', title: 'Membership benefits', singular: 'benefit', primary: 'title', secondary: ['detail'],
    defaults: { icon: 'access', published: true, isPlaceholder: false, sortOrder: 0 },
    fields: [
      { key: 'title', label: 'Benefit', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'select', options: ['access', 'group', 'clock', 'coach'] },
      { key: 'detail', label: 'Detail', type: 'text', full: true }, order, placeholder, published,
    ],
  },
  {
    resource: 'facilities', title: 'Facilities', singular: 'facility', primary: 'name', secondary: ['description'],
    defaults: { image: ART[7], published: true, isPlaceholder: false, sortOrder: 0 },
    fields: [
      { key: 'name', label: 'Facility / area', type: 'text', required: true },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'description', label: 'Description', type: 'textarea', full: true, rows: 3 }, order, placeholder, published,
    ],
  },
  {
    resource: 'hours', title: 'Business hours', singular: 'hours row', primary: 'label', secondary: ['value'],
    defaults: { sortOrder: 0 },
    fields: [
      { key: 'label', label: 'Days', type: 'text', required: true, hint: 'e.g. Monday – Friday' },
      { key: 'value', label: 'Hours', type: 'text', nullable: true, hint: 'e.g. 5:00 AM – 10:00 PM. Leave empty until confirmed.' }, order,
    ],
  },
  {
    resource: 'trainers', title: 'Trainers', singular: 'trainer', primary: 'name', secondary: ['role'],
    defaults: { published: true, sortOrder: 0 },
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'qualifications', label: 'Verified qualifications', type: 'text', full: true },
      { key: 'bio', label: 'Biography', type: 'textarea', full: true, rows: 4 },
      { key: 'photo', label: 'Photo path or URL', type: 'image' }, order, published,
    ],
  },
  {
    resource: 'testimonials', title: 'Testimonials', singular: 'testimonial', primary: 'attribution', secondary: ['quote'],
    defaults: { published: false, consentConfirmed: false, sortOrder: 0 },
    fields: [
      { key: 'quote', label: 'Quote (exact words)', type: 'textarea', required: true, full: true, rows: 4 },
      { key: 'attribution', label: 'Attribution', type: 'text', required: true }, order,
      { key: 'consentConfirmed', label: 'The member gave permission to publish this', type: 'checkbox' }, published,
    ],
  },
];

/** Entity → form values. */
export function toForm(fields: FieldDef[], item: Record<string, unknown>): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    const v = item[f.key];
    if (f.type === 'checkbox') out[f.key] = !!v;
    else if (f.type === 'lines') out[f.key] = Array.isArray(v) ? v.join('\n') : '';
    else if (f.type === 'money') out[f.key] = typeof v === 'number' ? (v / 100).toFixed(2) : '';
    else out[f.key] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}

/** Form values → API payload. */
export function toPayload(fields: FieldDef[], form: Record<string, string | boolean>, isEdit: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = form[f.key];
    if (f.type === 'checkbox') { out[f.key] = !!v; continue; }
    const s = typeof v === 'string' ? v.trim() : '';
    if (f.key === 'slug') { if (s) out.slug = s; continue; }
    if (f.type === 'number') { if (s !== '') out[f.key] = Number(s); else if (f.nullable) out[f.key] = null; continue; }
    if (f.type === 'money') { out[f.key] = s === '' ? null : Math.round(Number(s) * 100); continue; }
    if (f.type === 'lines') { out[f.key] = s.split('\n').map((x) => x.trim()).filter(Boolean); continue; }
    if (f.type === 'select' && f.numeric) { out[f.key] = s === '' ? null : Number(s); continue; }
    if (f.nullable && s === '') { out[f.key] = null; continue; }
    if (!isEdit && s === '' && !f.required) continue;
    out[f.key] = s;
  }
  return out;
}
