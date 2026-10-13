import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Initializes Lenis smooth scrolling for mouse/trackpad users.
 *
 * Touch devices already have native momentum scrolling, and Lenis' per-frame
 * loop costs noticeable main-thread time on phones, so it is skipped there.
 * The library is loaded on demand to keep it out of the initial bundle.
 */
export default function SmoothScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarsePointer || reducedMotion) return undefined;

    let lenis = null;
    let rafId = null;
    let cancelled = false;

    Promise.all([import('lenis'), import('lenis/dist/lenis.css')]).then(([{ default: Lenis }]) => {
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
      });

      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      // Immediate scroll to top on route change
      lenis.scrollTo(0, { immediate: true });
    });

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, [pathname]);

  return null;
}
