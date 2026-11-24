'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const tracks = [
  ['Saman', 'Ólafur Arnalds', '/assets/Saman.mp3'],
  ['Oceans', 'Ólafur Arnalds', '/assets/Oceans.mp3'],
  ['Loom', 'Ólafur Arnalds', '/assets/Loom.mp3'],
  ['My Only Girl', '方大同', '/assets/MyOnlyGirl.mp3'],
];

function clock(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}

export default function SitePlayer({ language, rememberedLanguage }) {
  const router = useRouter();
  const pathname = usePathname();
  const player = useRef(null);
  const storedTime = useRef(0);
  const selected = useRef(0);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const zh = language === 'zh' || pathname?.startsWith('/admin');
  const [name, artist] = tracks[track];

  function applyLanguage(value) {
    document.cookie = 'mindscape_lang=' + value + '; Path=/; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    try { localStorage.setItem('site-lang', value); } catch {}
    router.refresh();
  }

  useEffect(() => {
    const audio = player.current;
    try {
      if (!rememberedLanguage && localStorage.getItem('site-lang') === 'zh') applyLanguage('zh');
      const value = Number(localStorage.getItem('audio_index'));
      if (Number.isInteger(value) && tracks[value]) {
        selected.current = value;
        setTrack(value);
        storedTime.current = Math.max(0, Number(localStorage.getItem('audio_time')) || 0);
      }
    } catch {}
    function remember() {
      try {
        localStorage.setItem('audio_index', String(selected.current));
        localStorage.setItem('audio_time', String(audio.currentSrc ? audio.currentTime : storedTime.current));
      } catch {}
    }
    window.addEventListener('pagehide', remember);
    return () => window.removeEventListener('pagehide', remember);
  }, []);

  async function play(index = selected.current) {
    const audio = player.current;
    setError(false);
    if (index !== selected.current) storedTime.current = 0;
    selected.current = index;
    setTrack(index);
    const path = tracks[index][2];
    if (audio.getAttribute('src') !== path) {
      audio.src = path;
      setTime(storedTime.current);
      setDuration(0);
    }
    try { await audio.play(); } catch (failure) { if (failure.name !== 'AbortError') setError(true); }
  }

  function metadata(event) {
    const audio = event.currentTarget;
    setDuration(audio.duration);
    if (storedTime.current && storedTime.current < audio.duration) audio.currentTime = storedTime.current;
    storedTime.current = 0;
  }

  return <div className="site-controls mindscape-type" aria-label={zh ? '全站偏好' : 'Site preferences'}>
    <audio ref={player} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onLoadedMetadata={metadata} onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
      onEnded={() => play((selected.current + 1) % tracks.length)} />
    <button className="site-player-toggle" type="button" aria-label={playing ? (zh ? '暂停音乐' : 'Pause music') : (zh ? '播放音乐' : 'Play music')}
      onClick={() => playing ? player.current.pause() : play()}>
      <span className="site-wave" data-playing={playing} aria-hidden="true"><i /><i /><i /><i /></span>
      <span>{playing ? name : (zh ? '音乐' : 'Music')}</span>
    </button>
    <button className="site-tracks-toggle" type="button" aria-expanded={expanded} aria-controls="site-playlist"
      onClick={() => setExpanded(!expanded)} aria-label={zh ? '播放列表' : 'Playlist'}>≡</button>
    <span className="site-control-divider" aria-hidden="true" />
    <div className="site-language" aria-label={zh ? '网站语言' : 'Site language'}>
      <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => applyLanguage('en')}>EN</button>
      <button type="button" lang="zh-CN" aria-pressed={language === 'zh'} onClick={() => applyLanguage('zh')}>中文</button>
    </div>
    {expanded && <div id="site-playlist" className="site-playlist" onKeyDown={(event) => { if (event.key === 'Escape') setExpanded(false); }}>
      <div className="site-now-playing"><strong>{name}</strong><span>{artist}</span></div>
      {duration > 0 && <label className="site-seek">
        <span>{clock(time)}</span><input type="range" min="0" max={duration} step=".25" value={Math.min(time, duration)}
          aria-label={zh ? '播放进度' : 'Seek'} onChange={(event) => { player.current.currentTime = Number(event.target.value); setTime(Number(event.target.value)); }} /><span>{clock(duration)}</span>
      </label>}
      {tracks.map(([title, composer], index) => <button type="button" key={title} aria-pressed={index === track}
        onClick={() => play(index)}><span>{title}</span><small>{composer}</small></button>)}
    </div>}
    {error && <p className="site-player-error" role="status">{zh ? '音乐暂时无法播放。' : 'Music could not play.'}</p>}
  </div>;
}
