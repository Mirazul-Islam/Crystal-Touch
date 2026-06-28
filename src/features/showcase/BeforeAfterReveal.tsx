import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Sparkles, MoveHorizontal, RotateCcw } from 'lucide-react';

interface Props {
  beforeSrc?: string;
  afterSrc?: string;
  className?: string;
}

const SPARKLES = [
  { top: '14%', left: '30%', d: 0 },
  { top: '26%', left: '64%', d: 0.15 },
  { top: '58%', left: '22%', d: 0.3 },
  { top: '44%', left: '78%', d: 0.45 },
  { top: '70%', left: '54%', d: 0.6 },
  { top: '20%', left: '48%', d: 0.2 },
];

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Interactive "messy → clean" hero. Drag the handle to wipe between the two
 * images, or tap "Clean it" for an automatic sparkle sweep. The card tilts
 * with the cursor for a subtle 3D / depth feel.
 *
 * Swap in real photos by passing `beforeSrc` / `afterSrc` (e.g. /before.jpg).
 */
export function BeforeAfterReveal({
  beforeSrc = '/room-messy.svg',
  afterSrc = '/room-clean.svg',
  className,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const [reveal, setReveal] = useState(22); // % of the clean image shown
  const [animating, setAnimating] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const cleaned = reveal >= 50;
  const reduced = prefersReducedMotion();

  // --- drag to wipe -------------------------------------------------------
  const setFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setReveal(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    setAnimating(false);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    setFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  // --- one-tap auto clean -------------------------------------------------
  const toggleClean = () => {
    if (reduced) {
      setReveal(cleaned ? 22 : 100);
      return;
    }
    setAnimating(true);
    setReveal(cleaned ? 8 : 100);
  };

  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => setAnimating(false), 1700);
    return () => clearTimeout(t);
  }, [animating, reveal]);

  // --- 3D parallax tilt ---------------------------------------------------
  const onMouseMove = (e: React.MouseEvent) => {
    if (reduced || draggingRef.current) return;
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: +(py * -7).toFixed(2), y: +(px * 9).toFixed(2) });
  };
  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      className={clsx('group [perspective:1400px]', className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="relative animate-[floaty_6s_ease-in-out_infinite] transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        {/* glow / shadow for depth */}
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-900/30 blur-2xl" />

        <div
          ref={frameRef}
          className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-3xl border border-white/40 bg-slate-100 shadow-2xl ring-1 ring-black/5"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* messy (base) */}
          <img
            src={beforeSrc}
            alt="A messy living room before cleaning"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* clean (revealed from the left) */}
          <img
            src={afterSrc}
            alt="The same living room, spotless after cleaning"
            draggable={false}
            className={clsx(
              'absolute inset-0 h-full w-full object-cover',
              animating && 'transition-[clip-path] duration-[1600ms] ease-in-out',
            )}
            style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
          />

          {/* labels */}
          <span
            className="absolute left-3 top-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition-opacity"
            style={{ opacity: reveal > 78 ? 0 : 1 }}
          >
            Before
          </span>
          <span
            className="absolute right-3 top-3 rounded-full bg-brand-600/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition-opacity"
            style={{ opacity: reveal < 22 ? 0 : 1 }}
          >
            After ✨
          </span>

          {/* sparkles over the cleaned area */}
          {SPARKLES.map((s, i) => {
            const pos = parseFloat(s.left);
            const visible = reveal > pos + 2;
            return (
              <Sparkles
                key={i}
                className={clsx(
                  'pointer-events-none absolute h-5 w-5 text-white drop-shadow transition-all duration-500',
                  visible ? 'scale-100 opacity-90' : 'scale-0 opacity-0',
                )}
                style={{
                  top: s.top,
                  left: s.left,
                  transitionDelay: animating ? `${s.d * 900}ms` : '0ms',
                }}
              />
            );
          })}

          {/* wipe divider + handle */}
          <div
            className={clsx(
              'absolute inset-y-0 z-10 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.7)]',
              animating && 'transition-[left] duration-[1600ms] ease-in-out',
            )}
            style={{ left: `${reveal}%` }}
          >
            <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-600 shadow-lg ring-1 ring-black/10">
              <MoveHorizontal className="h-5 w-5" />
            </div>
          </div>

          {/* shine sweep while cleaning */}
          {animating && reveal > 50 && (
            <div className="pointer-events-none absolute inset-0 z-20 animate-[shine_1.6s_ease-in-out] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={toggleClean}
          className="absolute -bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-xl ring-1 ring-black/5 transition hover:bg-brand-50 active:scale-95"
        >
          {cleaned ? (
            <>
              <RotateCcw className="h-4 w-4" /> See the before
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-accent-500" /> Clean it
            </>
          )}
        </button>
      </div>
    </div>
  );
}
