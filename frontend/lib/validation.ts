/** Client-side checks for instant feedback. They mirror the API; the API stays the source of truth. */
export type Errors = Record<string, string>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function phoneError(phone: string): string | undefined {
  const v = phone.trim();
  if (!v) return undefined;
  if (!/^[0-9+().\-\s]+$/.test(v)) return 'Use digits and + ( ) - only.';
  const n = v.replace(/\D/g, '').length;
  if (n < 10 || n > 15) return 'Enter a phone number with area code (10–15 digits).';
  return undefined;
}

function common(name: string, email: string, phone: string, consent: boolean): Errors {
  const e: Errors = {};
  if (!name.trim()) e.name = 'Enter your full name.';
  if (!email.trim()) e.email = 'Enter your email address.';
  else if (!EMAIL.test(email.trim())) e.email = 'Enter a valid email, like name@example.com.';
  const p = phoneError(phone);
  if (p) e.phone = p;
  if (!consent) e.consent = 'Please agree to be contacted so the club can reply.';
  return e;
}

export interface MembershipForm { name: string; email: string; phone: string; planId: string; programId: string; message: string; consent: boolean; website: string }
export function validateMembership(f: MembershipForm): Errors {
  const e = common(f.name, f.email, f.phone, f.consent);
  if (f.message.length > 1000) e.message = 'Keep your message under 1,000 characters.';
  return e;
}

export interface ContactFormValues { name: string; email: string; phone: string; topic: string; message: string; consent: boolean; website: string }
export function validateContact(f: ContactFormValues): Errors {
  const e = common(f.name, f.email, f.phone, f.consent);
  if (!f.topic) e.topic = 'Choose an inquiry type.';
  if (f.message.trim().length < 10) e.message = 'Write a message of at least 10 characters.';
  else if (f.message.length > 1500) e.message = 'Keep your message under 1,500 characters.';
  return e;
}

export const isBracketed = (s?: string | null) => !!s && /^\[.*\]$/.test(s.trim());

/** "18:30" → "6:30 PM" */
export function formatTime(t: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  if (!m) return t;
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
}
