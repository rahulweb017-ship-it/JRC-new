import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { COMPANY } from '../../content/siteData';
import '../../styles/floating-cta.css';

// Pages that already render their own sticky call bar.
const HIDDEN_ON = ['/basement-remodeling'];
const SHOW_AFTER_SCROLL = 240;

/**
 * Floating "Get Your Free Quote Today!" call button, fixed bottom-left.
 * Slides in once the visitor scrolls past the hero (so it never covers the
 * hero CTAs) and tucks away while the footer, which repeats the phone number,
 * is on screen.
 */
export default function FloatingCallBadge() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  const hidden = HIDDEN_ON.some((path) => pathname.replace(/\/$/, '') === path);

  useEffect(() => {
    if (hidden) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SHOW_AFTER_SCROLL);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [hidden, pathname]);

  useEffect(() => {
    if (hidden) return undefined;
    const footer = document.querySelector('footer');
    if (!footer) return undefined;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, [hidden]);

  if (hidden) return null;

  const visible = scrolled && !footerVisible;

  return (
    <a
      href={`tel:${COMPANY.phoneRaw}`}
      className={`jrc-fcta${visible ? ' is-visible' : ''}`}
      aria-label={`Get your free quote today, call ${COMPANY.phone}`}
      aria-hidden={visible ? undefined : 'true'}
      tabIndex={visible ? undefined : -1}
    >
      <span className="jrc-fcta-icon" aria-hidden="true">
        <svg viewBox="0 0 512 512">
          <path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z" />
        </svg>
      </span>
      <span className="jrc-fcta-text">
        <span className="jrc-fcta-title">Get Your Free Quote Today!</span>
        <span className="jrc-fcta-phone">{COMPANY.phone}</span>
      </span>
      <span className="jrc-fcta-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  );
}
