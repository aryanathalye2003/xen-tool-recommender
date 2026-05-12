import xenLogoWhite from 'figma:asset/4785e91dafe99e13d478e1a40728b927354ff8ed.png';
import bgImage from 'figma:asset/601ea1563c500ceee090e7375229ddbc04a4dcb8.png';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Header } from './Header';

// Mirrors the gradient style of the real recommendation cards.
// 1/4 red rule: only RICE is red.
const CARDS = [
  {
    name: 'Empathy Map',
    category: 'User Research',
    color: '#2041CE',
    dark:  '#1a34b8',
    top: 186, left: 8,   rotate: -13, zIndex: 1,
  },
  {
    name: 'How Might We',
    category: 'Problem Framing',
    color: '#3D5FD9',
    dark:  '#2a48c0',
    top: 176, left: 172, rotate: 10, zIndex: 2,
  },
  {
    name: 'Customer Journey Map',
    category: 'Experience Mapping',
    color: '#5D3ABF',
    dark:  '#4a2fa0',
    top: 80,  left: 172, rotate: -8, zIndex: 3,
  },
  {
    name: 'Persona',
    category: 'User Research',
    color: '#2041CE',
    dark:  '#0f2490',
    top: 80,  left: 8,   rotate: 7,  zIndex: 4,
  },
  {
    name: 'RICE Prioritization',
    category: 'Prioritization',
    color: '#BD4C46',   // the 1 red card
    dark:  '#9e3030',
    top: 8,   left: 90,  rotate: -3, zIndex: 5,
  },
];

interface IntroPageProps {
  onStart: () => void;
  onLibraryClick: () => void;
}

export function IntroPage({ onStart, onLibraryClick }: IntroPageProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(5,5,30,0.80) 0%, rgba(5,5,30,0.58) 50%, rgba(5,5,30,0.85) 100%)',
          zIndex: 1,
        }}
      />
      {/* Colour wash - cobalt + purple, no red wash */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse at 15% 85%, rgba(32,65,206,0.20) 0%, transparent 55%), ' +
            'radial-gradient(ellipse at 75% 15%, rgba(93,58,191,0.16) 0%, transparent 50%)',
          zIndex: 2, pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header onTitleClick={onStart} onLibraryClick={onLibraryClick} currentPage={undefined} />
      </div>

      {/* Main layout */}
      <div className="intro-outer">
        <div className="intro-row">

          {/* ════ LEFT ════ */}
          <div className="intro-left">

            <div className="intro-content-block">

              {/* TAG + HEADLINE + BODY */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Eyebrow tag - cobalt */}
                <div style={{ marginBottom: 18 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(32,65,206,0.14)',
                    border: '1px solid rgba(32,65,206,0.38)',
                    borderRadius: 100, padding: '4px 12px',
                    color: '#6B8FE8', fontSize: '0.68rem',
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    XENTools Finder
                  </span>
                </div>

                {/* Headline - blue-to-purple */}
                <h1 style={{
                  color: '#ffffff',
                  fontSize: 'clamp(2rem, 3.6vw, 3.2rem)',
                  fontWeight: 800, lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  marginBottom: 18, maxWidth: 480,
                }}>
                  The Right Tool
                  <br />
                  <span style={{
                    background: 'linear-gradient(90deg, #4A6FE8, #5D3ABF)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    for Every Workshop
                  </span>
                </h1>

                <p style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
                  lineHeight: 1.7, maxWidth: 380, margin: 0,
                }}>
                  A simple question about the session you are running. One perfectly matched facilitation framework - built for UX designers, creative strategists, and anyone facilitating XEN workshops.
                </p>
              </div>

              {/* CTA - red is intentional, the one primary action */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <button
                  onClick={onStart}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: '#BD4C46', border: 'none', borderRadius: 100,
                    padding: '13px 32px', color: '#ffffff',
                    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                    letterSpacing: '0.01em', transition: 'all 0.2s ease',
                    boxShadow: '0 4px 20px rgba(189,76,70,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = '#a83d38';
                    b.style.transform = 'translateY(-2px) scale(1.02)';
                    b.style.boxShadow = '0 6px 28px rgba(189,76,70,0.50)';
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = '#BD4C46';
                    b.style.transform = 'translateY(0) scale(1)';
                    b.style.boxShadow = '0 4px 20px rgba(189,76,70,0.35)';
                  }}
                >
                  Get Started
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>

          {/* ════ RIGHT ════ */}
          <div className="intro-right">
            {/* Quote */}
            <div style={{
              textAlign: 'center', marginBottom: 40,
              maxWidth: 320, position: 'relative', zIndex: 20,
            }}>
              <p style={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: 'clamp(0.92rem, 1.4vw, 1.08rem)',
                fontStyle: 'italic', fontWeight: 300,
                lineHeight: 1.65, letterSpacing: '-0.01em',
                marginBottom: 0,
              }}>
                "The best workshops don't start with a blank canvas - they start with the right frame."
              </p>
            </div>

            {/* Scattered mini recommendation cards */}
            <div style={{ position: 'relative', width: 440, height: 465, flexShrink: 0 }}>
              {CARDS.map((card, i) => {
                const isHovered = hoveredCard === i;
                const gradientBg = `linear-gradient(135deg, ${card.dark} 0%, ${card.color} 100%)`;

                // 3 above, 2 below - stacked playing-card arrangement
                // Card size: 144 × 202
                // Top row: left edges at 12, 148, 284 → 136px spacing (slight overlap)
                // Bottom row: same 136px spacing, centred → left edges at 80, 216
                // Vertical gap: bottom row pushed to top=210 with reduced spacing
                const positions = [
                  { top: 10,  left: 12,  rotate: -6, zIndex: 1 }, // top-left
                  { top: 0,   left: 148, rotate: 0,  zIndex: 3 }, // top-centre (front)
                  { top: 10,  left: 284, rotate: 6,  zIndex: 2 }, // top-right
                  { top: 210, left: 80,  rotate: -4, zIndex: 4 }, // bottom-left
                  { top: 210, left: 216, rotate: 4,  zIndex: 5 }, // bottom-right
                ];
                const pos = positions[i] ?? { top: 0, left: 0, rotate: 0, zIndex: i + 1 };

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      position: 'absolute',
                      top: pos.top,
                      left: pos.left,
                      width: 144,
                      height: 202,
                      borderRadius: 14,
                      background: gradientBg,
                      boxShadow: isHovered
                        ? `0 24px 56px rgba(0,0,0,0.62), 0 0 0 1.5px ${card.color}88`
                        : `0 8px 28px rgba(0,0,0,0.44), 0 0 0 1px ${card.color}44`,
                      transform: isHovered
                        ? 'rotate(0deg) scale(1.1) translateY(-14px)'
                        : `rotate(${pos.rotate}deg) scale(1)`,
                      zIndex: isHovered ? 20 : pos.zIndex,
                      transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                      cursor: 'default',
                      overflow: 'hidden',
                      padding: '12px 13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                    }}
                  >
                    {/* Decorative circles */}
                    <div style={{
                      position: 'absolute', top: -24, right: -24,
                      width: 88, height: 88, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: -32, left: -14,
                      width: 100, height: 100, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
                    }} />

                    {/* Top: category label */}
                    <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>
                      <span style={{
                        color: 'rgba(255,255,255,0.55)',
                        fontSize: '0.46rem', fontWeight: 700,
                        letterSpacing: '0.13em', textTransform: 'uppercase',
                        display: 'block',
                      }}>
                        {card.category}
                      </span>
                    </div>

                    {/* Middle: dot-grid - evokes a canvas / matrix */}
                    <div style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', zIndex: 1,
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '7px',
                      }}>
                        {Array.from({ length: 20 }).map((_, j) => (
                          <div
                            key={j}
                            style={{
                              width: 4, height: 4, borderRadius: '50%',
                              background: `rgba(255,255,255,${j % 7 === 0 ? '0.55' : j % 3 === 0 ? '0.30' : '0.15'})`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bottom: tool name + ghost pills */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: 7,
                      position: 'relative', zIndex: 1, marginTop: 8,
                    }}>
                      <span style={{
                        color: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                      }}>
                        {card.name}
                      </span>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <span style={{
                          display: 'inline-block', width: 52, height: 14, borderRadius: 100,
                          background: 'rgba(255,255,255,0.18)',
                          border: '1px solid rgba(255,255,255,0.25)',
                        }} />
                        <span style={{
                          display: 'inline-block', width: 38, height: 14, borderRadius: 100,
                          background: 'rgba(255,255,255,0.18)',
                          border: '1px solid rgba(255,255,255,0.25)',
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom brand bar - cobalt → purple → red (red is the final 1/4) */}
      <div style={{
        position: 'relative', zIndex: 10, height: 4,
        background: 'linear-gradient(90deg, #2041CE 0%, #4A6FE8 35%, #5D3ABF 68%, #BD4C46 100%)',
      }} />
    </div>
  );
}