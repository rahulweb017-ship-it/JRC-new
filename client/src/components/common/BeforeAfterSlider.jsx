import React, { useRef, useEffect, useCallback } from 'react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = 'Before Renovation',
  afterAlt = 'After Renovation',
  height = 'clamp(280px, 45vh, 480px)',
  borderRadius = '24px',
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  initialPosition = 50,
  autoAnimate = false,
  animationDuration = 6, // duration in seconds for full loop
  priority = false,
  beforeSrcSet,
  afterSrcSet,
  sizes,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const beforeLayerRef = useRef(null);
  const dividerTrackRef = useRef(null);
  const positionRef = useRef(initialPosition);
  const isDragging = useRef(false);
  const isHovered = useRef(false);

  // The position is written straight to the DOM (clip-path + transform) so the
  // animation never re-renders React and never triggers layout.
  const applyPosition = useCallback((pct) => {
    positionRef.current = pct;
    if (beforeLayerRef.current) {
      beforeLayerRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }
    if (dividerTrackRef.current) {
      dividerTrackRef.current.style.transform = `translate3d(${pct}%, 0, 0)`;
    }
  }, []);

  useEffect(() => {
    applyPosition(positionRef.current);
  }, [applyPosition]);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    applyPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  }, [applyPosition]);

  // Smooth automatic oscillation loop, paused while off screen.
  useEffect(() => {
    if (!autoAnimate) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    let frame = null;
    let startTime = null;
    let visible = false;

    const tick = (timestamp) => {
      frame = null;
      if (!visible) return;

      if (!isDragging.current && !isHovered.current) {
        if (startTime === null) {
          // Resume from the current position instead of jumping.
          const angle = Math.asin(Math.max(-1, Math.min(1, (positionRef.current - 50) / 45)));
          startTime = timestamp - (angle * animationDuration * 1000) / (2 * Math.PI);
        }
        const elapsed = (timestamp - startTime) / 1000;
        applyPosition(50 + 45 * Math.sin((2 * Math.PI * elapsed) / animationDuration));
      } else {
        startTime = null;
      }

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && frame === null) {
        startTime = null;
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [autoAnimate, animationDuration, applyPosition]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updatePosition(e.clientX);
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    if (e.touches.length > 0) {
      updatePosition(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    if (e.touches.length > 0) {
      updatePosition(e.touches[0].clientX);
    }
  };

  const handleMouseEnter = () => {
    isHovered.current = true;
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
    isDragging.current = false;
  };

  const imageLoadingProps = priority
    ? { fetchPriority: 'high', loading: 'eager' }
    : { loading: 'lazy' };

  return (
    <div
      ref={containerRef}
      className={`before-after-slider ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: borderRadius,
        overflow: 'hidden',
        cursor: 'ew-resize',
        userSelect: 'none',
        touchAction: 'pan-y',
        boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
        ...style,
      }}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        srcSet={afterSrcSet}
        sizes={afterSrcSet ? sizes : undefined}
        alt={afterAlt}
        decoding="async"
        {...imageLoadingProps}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: '#FFFFFF',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '1px',
          zIndex: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        {afterLabel}
      </span>

      {/* Before Image (Clipped Overlay) */}
      <div
        ref={beforeLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 3,
          clipPath: `inset(0 ${100 - initialPosition}% 0 0)`,
          willChange: autoAnimate ? 'clip-path' : undefined,
        }}
      >
        <img
          src={beforeImage}
          srcSet={beforeSrcSet}
          sizes={beforeSrcSet ? sizes : undefined}
          alt={beforeAlt}
          decoding="async"
          {...imageLoadingProps}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            maxWidth: 'none',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: '#C93800',
            color: '#FFFFFF',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1px',
            zIndex: 4,
            boxShadow: '0 4px 12px rgba(255, 69, 0, 0.4)',
          }}
        >
          {beforeLabel}
        </span>
      </div>

      {/* Full-width track whose translateX(%) equals the slider position */}
      <div
        ref={dividerTrackRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
          transform: `translate3d(${initialPosition}%, 0, 0)`,
          willChange: autoAnimate ? 'transform' : undefined,
        }}
      >
        {/* Divider Bar & Handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            transform: 'translateX(-50%)',
            cursor: 'ew-resize',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'ew-resize',
              border: '2px solid #FF4500',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#160A05" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8L22 12L18 16" />
              <path d="M6 8L2 12L6 16" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
