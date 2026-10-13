import { useState } from 'react';
import '../../styles/youtube-lite.css';

const CHANNEL_NAME = 'JRC Home Remodeling';
const CHANNEL_AVATAR = '/assets/logo/jrc-avatar.webp';

/**
 * Looks like YouTube's own Shorts embed (channel header, title, Shorts play
 * button) but only mounts the real player iframe after the visitor clicks.
 * Each embedded player pulls ~500 KB of script plus third-party cookies, so
 * deferring it keeps the initial page load light.
 */
export default function YouTubeLite({ id, title, channel = CHANNEL_NAME }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        className="yt-lite-frame"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="yt-lite"
      onClick={() => setActive(true)}
      aria-label={`Play video: ${title}`}
    >
      {/* oardefault is the vertical Shorts thumbnail; not every video has one */}
      <img
        className="yt-lite-thumb"
        src={`https://i.ytimg.com/vi/${id}/oardefault.jpg`}
        alt=""
        width="1080"
        height="1920"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }}
      />

      <span className="yt-lite-header" aria-hidden="true">
        <img
          className="yt-lite-avatar"
          src={CHANNEL_AVATAR}
          alt=""
          width="36"
          height="36"
          loading="lazy"
          decoding="async"
        />
        <span className="yt-lite-meta">
          <span className="yt-lite-title">{title}</span>
          <span className="yt-lite-channel">{channel}</span>
        </span>
      </span>

      <span className="yt-lite-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path
            fill="#FF0033"
            d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"
          />
          <path fill="#FFFFFF" d="M10 14.65v-5.3L15 12z" />
        </svg>
      </span>
    </button>
  );
}
