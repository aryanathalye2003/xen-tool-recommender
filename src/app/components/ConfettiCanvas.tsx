import { useEffect, useRef } from 'react';

// XEN brand palette - muted so the burst stays subtle
const COLOURS = [
  '#2041CE', // cobalt
  '#5D3ABF', // purple
  '#BD4C46', // brand red
  '#E25454', // secondary red
  '#6B8FE8', // periwinkle
  '#a78bfa', // soft violet
  '#ffffff',  // white
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  angle: number;
  spin: number;
  color: string;
  alpha: number;
  decay: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

interface ConfettiCanvasProps {
  active: boolean;
  onDone: () => void;
}

export function ConfettiCanvas({ active, onDone }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to viewport
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // ── Spawn particles ──────────────────────────────────────────────────────
    // Two clusters: one burst from the horizontal centre-top, one from bottom
    const CX = canvas.width  * 0.5;
    const CY = canvas.height * 0.38;   // slightly above centre
    const COUNT = 72;

    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      // Alternate: most from centre, a few from bottom corners
      const fromBottom = i < 10;
      const ox = fromBottom ? (i % 2 === 0 ? rand(0.1, 0.25) : rand(0.75, 0.9)) * canvas.width : CX;
      const oy = fromBottom ? canvas.height * 0.9 : CY;

      const angle = fromBottom
        ? rand(-Math.PI * 0.85, -Math.PI * 0.15)  // upward cone from corners
        : rand(-Math.PI * 1.1, -Math.PI * 0.0);   // full upward spread from centre

      const speed = fromBottom ? rand(6, 12) : rand(3, 11);

      return {
        x:     ox,
        y:     oy,
        vx:    Math.cos(angle) * speed * rand(0.6, 1.0),
        vy:    Math.sin(angle) * speed,
        w:     rand(5, 9),
        h:     rand(3, 5),
        angle: rand(0, Math.PI * 2),
        spin:  rand(-0.18, 0.18),
        color: COLOURS[Math.floor(Math.random() * COLOURS.length)],
        alpha: rand(0.55, 0.82),   // start already muted - subtle feel
        decay: rand(0.008, 0.016), // how fast each piece fades
      };
    });

    // ── Animation loop ───────────────────────────────────────────────────────
    const GRAVITY = 0.22;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      let alive = 0;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive++;

        p.vy    += GRAVITY;
        p.x     += p.vx;
        p.y     += p.vy;
        p.angle += p.spin;
        p.vx    *= 0.99;  // very slight air drag
        p.alpha -= p.decay;

        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.alpha);
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.angle);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      if (alive > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        onDone();
      }
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        9998,
      }}
    />
  );
}
