'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { SiteSettings } from '@/lib/types';
import { Close, Logo, Menu } from './Icons';

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Programs' },
  { href: '/membership', label: 'Membership' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];
const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href));

export default function Header({ site }: { site: SiteSettings | null }) {
  const path = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>('a[href],button');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); opener?.focus(); };
  }, [open]);

  return (
    <div className="hdr-wrap">
      <header className={`hdr ${solid ? 'solid' : ''}`}>
        <div className="wrap hdr-in" style={{ maxWidth: 1440 }}>
          <Link className="logo" href="/" aria-label={`${site?.name ?? 'Apex Fitness Club'} — home`}>
            <Logo />
            <span><b>Apex</b><small>Fitness Club · Napa</small></span>
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? 'page' : undefined}>{n.label}</Link>)}
          </nav>
          <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
            <Link className="btn btn-lime btn-sm hdr-cta" href="/membership#inquiry">Join Now</Link>
            <button ref={openerRef} type="button" className="menu-btn" aria-label="Open menu" aria-expanded={open} aria-controls="apex-menu" onClick={() => setOpen(true)}><Menu /></button>
          </div>
        </div>
      </header>
      {open && (
        <div className="menu" id="apex-menu" role="dialog" aria-modal="true" aria-label="Site menu" ref={menuRef}>
          <div className="between" style={{ alignItems: 'center', minHeight: 68 }}>
            <span className="logo"><Logo size={40} /><b>Apex</b></span>
            <button ref={closeRef} type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}><Close /></button>
          </div>
          <nav aria-label="Main (mobile)" style={{ marginTop: 20 }}>
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
                <span>0{i + 1}</span>{n.label}
              </Link>
            ))}
          </nav>
          <div className="stack" style={{ gap: 14, marginTop: 32 }}>
            <Link className="btn btn-lime" href="/membership#inquiry" onClick={() => setOpen(false)}>Join Now</Link>
            {site && <a className="btn btn-line" href={`tel:${site.phoneHref}`}>Call {site.phone}</a>}
          </div>
          {site && <p className="xs muted" style={{ marginTop: 'auto', paddingTop: 32 }}>{site.street}, {site.city} · <a href={`mailto:${site.email}`}>{site.email}</a></p>}
        </div>
      )}
    </div>
  );
}
