import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Tree, Waves, SpeakerHigh, MusicNotes, Fire, Drop, Wind, Play, Pause } from '@phosphor-icons/react';

// Place audio files in public/sounds/ — sourced from Freesound.org (CC0 license)
// Filenames: rain.mp3, forest.mp3, ocean.mp3, white-noise.mp3, tibetan-bowls.mp3, fireplace.mp3, stream.mp3, wind.mp3
const SOUNDS = [
  { id: 'rain',          label: 'Rain',           icon: CloudRain,   file: '/sounds/rain.mp3' },
  { id: 'forest',        label: 'Forest',         icon: Tree,        file: '/sounds/forest.mp3' },
  { id: 'ocean',         label: 'Ocean',          icon: Waves,       file: '/sounds/ocean.mp3' },
  { id: 'white-noise',   label: 'White Noise',    icon: SpeakerHigh, file: '/sounds/white-noise.mp3' },
  { id: 'tibetan-bowls', label: 'Tibetan Bowls',  icon: MusicNotes,  file: '/sounds/tibetan-bowls.mp3' },
  { id: 'fireplace',     label: 'Fireplace',      icon: Fire,        file: '/sounds/fireplace.mp3' },
  { id: 'stream',        label: 'Stream',         icon: Drop,        file: '/sounds/stream.mp3' },
  { id: 'wind',          label: 'Wind',           icon: Wind,        file: '/sounds/wind.mp3' },
];

export default function CalmingSoundsScreen() {
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  // Single Audio instance — not paused on unmount so sound continues during navigation
  const audioRef = useRef(null);

  function getAudio() {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  }

  function handleSelect(sound) {
    const audio = getAudio();
    if (currentId === sound.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }
    audio.src = sound.file;
    audio.loop = true;
    audio.volume = volume;
    audio.play().then(() => {
      setCurrentId(sound.id);
      setIsPlaying(true);
    }).catch(() => {});
  }

  function handleVolumeChange(e) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  return (
    <div className="screen">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Calming Sounds</h2>
      </div>

      {currentId && (
        <div
          style={{
            margin: 'var(--space-md) var(--space-md) 0',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--color-surface-card)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)', flexShrink: 0 }}>Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            style={{ flex: 1, accentColor: 'var(--color-accent)' }}
          />
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', width: 32, textAlign: 'right' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      <div style={{ padding: 'var(--space-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        {SOUNDS.map((sound) => {
          const Icon = sound.icon;
          const active = currentId === sound.id;
          const playing = active && isPlaying;
          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => handleSelect(sound)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 'var(--space-md)',
                background: active ? 'rgba(194,164,138,0.14)' : 'var(--color-surface-card)',
                border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                minHeight: 100,
              }}
              aria-pressed={active}
              aria-label={`${sound.label}${active ? (playing ? ', playing' : ', paused') : ''}`}
            >
              <Icon
                size={32}
                weight={active ? 'fill' : 'duotone'}
                color={active ? 'var(--color-accent)' : 'var(--color-text-muted)'}
              />
              <span style={{ fontSize: 13, color: active ? '#F5EDE4' : 'var(--color-text-muted)', fontWeight: active ? 600 : 400 }}>
                {sound.label}
              </span>
              <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                {playing
                  ? <Pause size={16} weight="fill" />
                  : <Play size={16} weight={active ? 'fill' : 'regular'} />}
              </span>
            </button>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', padding: '0 var(--space-md)', lineHeight: 1.5 }}>
        Audio continues when you navigate away.{'\n'}Tap a playing sound to pause it.
      </p>
    </div>
  );
}
