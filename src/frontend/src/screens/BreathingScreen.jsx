import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind } from '@phosphor-icons/react';

const BOX_PHASES = [
  { label: 'Inhale', duration: 4, color: 'var(--color-calm)' },
  { label: 'Hold',   duration: 4, color: 'var(--color-accent)' },
  { label: 'Exhale', duration: 4, color: 'var(--color-warning)' },
  { label: 'Hold',   duration: 4, color: 'var(--color-text-muted)' },
];

function BoxBreathing({ onDone }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [seconds, setSeconds] = useState(BOX_PHASES[0].duration);
  const [cycles, setCycles] = useState(0);
  const phase = BOX_PHASES[phaseIdx];
  const progress = 1 - seconds / phase.duration;
  const r = 70;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          const next = (phaseIdx + 1) % BOX_PHASES.length;
          setPhaseIdx(next);
          if (next === 0) setCycles((c) => c + 1);
          setSeconds(BOX_PHASES[next].duration);
          return BOX_PHASES[next].duration;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phaseIdx]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)' }}>
      <svg width={160} height={160} aria-hidden="true">
        <circle cx={80} cy={80} r={r} fill="none" stroke="var(--color-border)" strokeWidth={8} />
        <circle
          cx={80} cy={80} r={r} fill="none"
          stroke={phase.color} strokeWidth={8}
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
        />
        <text x={80} y={76} textAnchor="middle" fontSize={28} fontWeight={700} fill="var(--color-text-primary)">{seconds}</text>
        <text x={80} y={96} textAnchor="middle" fontSize={12} fill={phase.color} fontWeight={600}>{phase.label}</text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }}>Box Breathing · Cycle {cycles + 1}</p>
        <p style={{ fontSize: 13 }}>Inhale 4 · Hold 4 · Exhale 4 · Hold 4</p>
      </div>
      {cycles >= 4 && (
        <button className="btn btn--success" onClick={onDone}>Done — I feel calmer</button>
      )}
    </div>
  );
}

const PHASES_478 = [
  { label: 'Inhale', duration: 4, color: 'var(--color-calm)' },
  { label: 'Hold',   duration: 7, color: 'var(--color-accent)' },
  { label: 'Exhale', duration: 8, color: 'var(--color-warning)' },
];

function Breathing478({ onDone }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [seconds, setSeconds] = useState(PHASES_478[0].duration);
  const [cycles, setCycles] = useState(0);
  const phase = PHASES_478[phaseIdx];

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          const next = (phaseIdx + 1) % PHASES_478.length;
          setPhaseIdx(next);
          if (next === 0) setCycles((c) => c + 1);
          setSeconds(PHASES_478[next].duration);
          return PHASES_478[next].duration;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phaseIdx]);

  const size = phaseIdx === 0 ? 120 : phaseIdx === 1 ? 140 : 90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: phase.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-dark)',
          fontSize: 28,
          fontWeight: 700,
          transition: 'width 1s ease, height 1s ease',
          boxShadow: `0 0 30px rgba(143,175,154,0.3)`,
        }}
        aria-live="polite"
        aria-label={`${phase.label}: ${seconds} seconds`}
      >
        {seconds}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 18, color: phase.color }}>{phase.label}</p>
        <p style={{ fontSize: 13 }}>4-7-8 Breathing · Cycle {cycles + 1}</p>
      </div>
      {cycles >= 4 && (
        <button className="btn btn--success" onClick={onDone}>Done — I feel calmer</button>
      )}
    </div>
  );
}

const GROUNDING_STEPS = [
  { count: 5, sense: 'See',   prompt: 'Name 5 things you can see right now. Look around slowly.',      emoji: '👁️' },
  { count: 4, sense: 'Touch', prompt: 'Name 4 things you can physically touch. Feel their texture.',   emoji: '✋' },
  { count: 3, sense: 'Hear',  prompt: 'Name 3 things you can hear right now. Listen carefully.',       emoji: '👂' },
  { count: 2, sense: 'Smell', prompt: 'Name 2 things you can smell. Take a slow breath.',              emoji: '👃' },
  { count: 1, sense: 'Taste', prompt: 'Name 1 thing you can taste. Notice your mouth right now.',      emoji: '👅' },
];

function Grounding54321({ onDone }) {
  const [step, setStep] = useState(0);
  const current = GROUNDING_STEPS[step];
  const done = step >= GROUNDING_STEPS.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {done ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>🌿</div>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>Well done. You're here, you're present.</h3>
          <button className="btn btn--success" style={{ marginTop: 'var(--space-lg)' }} onClick={onDone}>I feel grounded</button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 'var(--space-sm)' }} aria-hidden="true">{current.emoji}</div>
            <h2 style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-sm)' }}>{current.count} — {current.sense}</h2>
            <p style={{ marginTop: 'var(--space-sm)', lineHeight: 1.6, fontSize: 15, color: 'var(--color-text-primary)' }}>{current.prompt}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="btn btn--primary" onClick={() => setStep((s) => s + 1)}>
              {step < GROUNDING_STEPS.length - 1 ? 'Next →' : 'Finish'}
            </button>
            {step > 0 && <button className="btn btn--muted" onClick={() => setStep((s) => s - 1)}>Back</button>}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {GROUNDING_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: i === step ? 'var(--color-accent)' : 'var(--color-border)',
                  transition: 'background var(--duration-fast)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const PMR_STEPS = [
  { muscle: 'Feet & calves',  tense: 'Curl your toes tightly',          relax: 'Release completely. Feel the warmth.' },
  { muscle: 'Thighs',         tense: 'Squeeze your thigh muscles',       relax: 'Let them go completely.' },
  { muscle: 'Stomach',        tense: 'Tighten your abdomen',             relax: 'Breathe out and release.' },
  { muscle: 'Hands & arms',   tense: 'Make fists and clench',            relax: 'Open your hands. Feel them relax.' },
  { muscle: 'Shoulders',      tense: 'Raise shoulders to your ears',     relax: 'Drop them down. Release all tension.' },
  { muscle: 'Face',           tense: 'Scrunch your face tight',          relax: 'Smooth everything out. Let go.' },
];

function PMR({ onDone }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('tense');
  const [timer, setTimer] = useState(5);
  const done = step >= PMR_STEPS.length;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimer((s) => {
        if (s <= 1) {
          if (phase === 'tense') { setPhase('relax'); return 8; }
          else { const next = step + 1; setStep(next); setPhase('tense'); return 5; }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step, phase, done]);

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>😌</div>
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>Your body is relaxed now. Well done.</h3>
        <button className="btn btn--success" style={{ marginTop: 'var(--space-lg)' }} onClick={onDone}>I feel relaxed</button>
      </div>
    );
  }

  const current = PMR_STEPS[step];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: phase === 'tense' ? 'var(--color-warning)' : 'var(--color-calm)',
            marginBottom: 4,
          }}
          aria-live="polite"
        >
          {timer}s
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>
          {phase === 'tense' ? '💪 Tense' : '😌 Release'} — {current.muscle}
        </div>
        <p style={{ fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
          {phase === 'tense' ? current.tense : current.relax}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {PMR_STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: i < step ? 'var(--color-calm)' : i === step ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'background var(--duration-fast)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

const EXERCISES = [
  { id: 'box',       label: 'Box Breathing',       desc: '4-4-4-4 calm reset' },
  { id: '478',       label: '4-7-8 Breathing',      desc: 'Deep relaxation technique' },
  { id: 'grounding', label: '5-4-3-2-1 Grounding',  desc: 'Sensory anchor technique' },
  { id: 'pmr',       label: 'Muscle Relaxation',     desc: 'Body scan & release' },
];

export default function BreathingScreen() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  return (
    <div className="screen">
      <div className="page-header">
        <button
          className="page-header__back"
          onClick={active ? () => setActive(null) : () => navigate(-1)}
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="page-header__title">
          {active ? EXERCISES.find((e) => e.id === active)?.label : 'Breathing & Grounding'}
        </h2>
      </div>

      <div style={{ padding: 'var(--space-md)' }}>
        {!active ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <p style={{ marginBottom: 'var(--space-sm)', fontSize: 14 }}>Choose an exercise. All are free and need no account.</p>
            {EXERCISES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActive(ex.id)}
                className="card card--interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  background: 'var(--color-surface-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-md)',
                }}
              >
                <Wind size={32} weight="duotone" color="var(--color-accent)" aria-hidden="true" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>{ex.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{ex.desc}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-sm) 0' }}>
            {active === 'box'       && <BoxBreathing   onDone={() => setActive(null)} />}
            {active === '478'       && <Breathing478    onDone={() => setActive(null)} />}
            {active === 'grounding' && <Grounding54321  onDone={() => setActive(null)} />}
            {active === 'pmr'       && <PMR             onDone={() => setActive(null)} />}
          </div>
        )}
      </div>
    </div>
  );
}
