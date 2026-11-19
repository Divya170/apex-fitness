export const ACCENTS = ['lime', 'orange'] as const;
export const BENEFIT_ICONS = ['access', 'group', 'clock', 'coach'] as const;
export const GALLERY_CATEGORIES = ['Gym Equipment', 'Strength Training', 'Cardio', 'Group Activities', 'Training Environment'] as const;
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const CONTACT_TOPICS = ['Membership', 'Programs', 'Personal training', 'Visiting the club', 'Something else'] as const;
export const INQUIRY_STATUSES = ['new', 'contacted', 'joined', 'closed'] as const;
export const MESSAGE_STATUSES = ['new', 'replied', 'closed'] as const;

/** Duplicate-submission window for public forms. */
export const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
/** Max public form submissions per visitor per window. */
export const SUBMISSION_LIMIT = 5;
export const SUBMISSION_WINDOW_MS = 10 * 60 * 1000;

/** 24h "HH:MM". */
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
