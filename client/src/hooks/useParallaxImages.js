import { useEffect } from 'react';

/**
 * Drifts images against the scroll direction: scrolling down lifts them,
 * scrolling up lowers them.
 *
 * Each target is zoomed by the smallest amount that keeps the drift inside its
 * frame, so no gap can appear at the edges. Targets must sit in a container
 * with `overflow: hidden`.
 *
 * Transforms are written straight to the DOM rather than through state, so
 * scrolling does not re-render the page.
 *
 * @param {object} rootRef   ref to the element to search within
 * @param {object} options
 * @param {string} options.selector  which elements to drift
 * @param {number} options.travel    maximum drift in px, each way
 */
export default function useParallaxImages(rootRef, options = {}) {
  const { selector = '[data-parallax]', travel = 26 } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // Honour the OS "reduce motion" setting — leave the images static.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const targets = Array.from(root.querySelectorAll(selector));
    if (targets.length === 0) return undefined;

    const onScreen = new Set();
    let frame = null;

    const paint = () => {
      frame = null;
      const viewportH = window.innerHeight;

      // Measure everything before writing any transform; interleaving reads and
      // writes forces a synchronous layout for every element.
      const measured = [];
      onScreen.forEach((el) => {
        measured.push([el, el.getBoundingClientRect()]);
      });

      measured.forEach(([el, rect]) => {
        if (rect.height === 0) return;

        // -1 when the element sits at the top of the viewport, +1 at the bottom.
        const fromCentre = (rect.top + rect.height / 2) - viewportH / 2;
        const ratio = Math.max(-1, Math.min(1, fromCentre / (viewportH / 2)));

        // Scrolling down pushes the element up the viewport, so `ratio` falls
        // and the image shifts up with it.
        const y = ratio * travel;

        // Zoom just enough to cover the drift at both extremes.
        const scale = 1 + (travel * 2) / rect.height;

        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      });
    };

    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(paint);
    };

    // Only animate what is actually on screen.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        });
        schedule();
      },
      { rootMargin: '150px 0px' }
    );

    targets.forEach((el) => {
      el.style.willChange = 'transform';
      observer.observe(el);
    });

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
      targets.forEach((el) => {
        el.style.transform = '';
        el.style.willChange = '';
      });
    };
  }, [rootRef, selector, travel]);
}
