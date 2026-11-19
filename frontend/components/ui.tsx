import type { CSSProperties, ReactNode } from 'react';
import { isBracketed } from '@/lib/validation';
import { Alert } from './Icons';

/** Orange dashed tag for content the club still has to supply or confirm. */
export const Ph = ({ children = 'To be supplied' }: { children?: ReactNode }) => <span className="ph">{children}</span>;

/** Renders [bracketed] placeholder text in the muted italic style. */
export function Txt({ text, className = '', as: Tag = 'p' }: { text: string; className?: string; as?: 'p' | 'span' }) {
  return <Tag className={`${className} ${isBracketed(text) ? 'phc' : ''}`.trim()}>{text}</Tag>;
}

/** Photography slot. `placeholder` adds the "Photo placeholder" chip. */
export function Shot({
  src, alt = '', className = '', style, imgClass = 'z', placeholder = true, label = 'Photo placeholder', priority = false, children,
}: {
  src: string; alt?: string; className?: string; style?: CSSProperties; imgClass?: string; placeholder?: boolean; label?: string; priority?: boolean; children?: ReactNode;
}) {
  return (
    <div className={`shot ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={imgClass} src={src} alt={alt} width={800} height={600} loading={priority ? 'eager' : 'lazy'} decoding="async" />
      {placeholder && <span className="pt">{label}</span>}
      {children}
    </div>
  );
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="notice n-err" role="alert">
      <Alert size={22} color="var(--err)" />
      <div className="stack small" style={{ gap: 8 }}>
        <b className="h4">Couldn’t load this section</b>
        <p>{message}</p>
        {action}
      </div>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p className="err" id={id}><Alert size={16} />{message}</p>;
}

export const Lbl = ({ children, or = false }: { children: ReactNode; or?: boolean }) => <p className={`lbl ${or ? 'or' : ''}`}>{children}</p>;
