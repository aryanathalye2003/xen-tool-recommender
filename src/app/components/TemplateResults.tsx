import { useState, useEffect, useLayoutEffect, useRef, ReactNode } from 'react';
import { Clock, Users, ExternalLink, ArrowLeft, ChevronRight, Download, Edit } from 'lucide-react';
import { Tool } from '../data';
import { useData } from '../contexts/DataContext';

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const GRADIENT_DARK: Record<string, string> = {
  '#2041CE': '#2848ca',
  '#5D3ABF': '#4a2fa0',
  '#BD4C46': '#9e3030',
  '#E25454': '#c03030',
};

const MATCH_LABELS = ['Best Fit', 'Good Recommendation', 'Also Useful'];

// Strip width for collapsed cards
const STRIP_W = 48;
// Gap between accordion items
const GAP = 10;
// Consistent height for all expanded cards - prevents jumps when switching
const CARD_H = 390;

interface ToolResultsProps {
  tools: Tool[];
  answers?: Record<string, string>;
  clarifyAnswerLabel?: string | null;
  onStartOver: () => void;
}

export function ToolResults({ tools, answers = {}, onStartOver }: ToolResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [headingW, setHeadingW] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (headingRef.current) {
        setHeadingW(headingRef.current.getBoundingClientRect().width);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const stackMaxWidth = headingW > 0 ? Math.max(540, Math.round((headingW - 64) * 1.5)) : '90%';

  return (
    <div style={{
      animation: 'fadeSlideIn 0.5s ease forwards',
      filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.4))'
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <h2
          ref={headingRef}
          style={{
            color: '#ffffff',
            fontSize: 'clamp(1.4rem, 2.8vw, 2rem)',
            fontWeight: 800, lineHeight: 1.15,
            marginBottom: 16, letterSpacing: '-0.015em',
          }}
        >
          Your XENTools
        </h2>

        {/* ── Filled sentence ── */}
        <SentenceSummary answers={answers} onEdit={onStartOver} />

        <p style={{
          color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem',
          maxWidth: 480, margin: '14px auto 0', lineHeight: 1.6,
        }}>
          {tools.length === 1
            ? 'One clear winner for this combination - tap to explore it.'
            : 'Ranked by best fit - tap any card to explore it.'}
        </p>
      </div>

      {/* ── Card stack ── */}
      <div style={{ maxWidth: stackMaxWidth, margin: '0 auto' }}>
        <CardStackAccordion tools={tools} />
      </div>
    </div>
  );
}

// ─── Card Stack Accordion ─────────────────────────────────────────────────────
function CardStackAccordion({ tools }: { tools: Tool[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const prevHRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Smooth height transition when active card changes ──────────────────────
  // Instead of letting the flex row jump to the new card's height, we animate
  // from the previous pixel height to the new one using a CSS height transition.
  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    // Measure the new natural height (all cards rendered at correct widths)
    el.style.height = 'auto';
    const newH = el.scrollHeight;

    if (prevHRef.current === 0) {
      // First mount - set silently, no animation
      el.style.height = `${newH}px`;
      prevHRef.current = newH;
      return;
    }

    // Pin at the previous height, then animate to new height
    el.style.transition = 'none';
    el.style.height = `${prevHRef.current}px`;
    // Force a reflow so the browser registers the pinned height before transitioning
    el.getBoundingClientRect();
    el.style.transition = 'height 0.42s cubic-bezier(0.4,0,0.2,1)';
    el.style.height = `${newH}px`;
    prevHRef.current = newH;
  }, [activeIdx]);

  const nInactive = tools.length - 1;
  const activeW = containerW > 0
    ? Math.max(200, containerW - nInactive * (STRIP_W + GAP))
    : 0;

  return (
    <div ref={containerRef}>
      <div
        ref={rowRef}
        style={{
          display: 'flex',
          gap: GAP,
          alignItems: 'stretch',
          overflow: 'hidden', // hide content while height is animating
        }}
      >
        {tools.map((tool, i) => {
          const isActive = i === activeIdx;
          const hex = tool.categoryColor.replace('#', '');
          const cr = parseInt(hex.slice(0, 2), 16);
          const cg = parseInt(hex.slice(2, 4), 16);
          const cb = parseInt(hex.slice(4, 6), 16);
          const darkColor = GRADIENT_DARK[tool.categoryColor] ?? '#05051E';
          const targetW = isActive ? activeW : STRIP_W;

          return (
            <div
              key={tool.id}
              style={{
                width: containerW > 0 ? targetW : undefined,
                flexGrow: containerW > 0 ? 0 : isActive ? 1 : 0,
                flexShrink: containerW > 0 ? 0 : isActive ? 1 : 0,
                flexBasis: containerW > 0 ? targetW : isActive ? '0%' : STRIP_W,
                transition: 'width 0.42s cubic-bezier(0.4,0,0.2,1), flex-basis 0.42s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
                borderRadius: 20,
                cursor: isActive ? 'default' : 'pointer',
              }}
              onClick={() => { if (!isActive) setActiveIdx(i); }}
            >
              {isActive ? (
                <ExpandedCard
                  template={tool}
                  matchLabel={MATCH_LABELS[i] ?? 'Match'}
                  isPrimary={i === 0}
                />
              ) : (
                <CollapsedStrip
                  template={tool}
                  matchLabel={MATCH_LABELS[i] ?? 'Match'}
                  darkColor={darkColor}
                  cr={cr} cg={cg} cb={cb}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Collapsed Strip ──────────────────────────────────────────────────────────
interface CollapsedStripProps {
  template: Tool;
  matchLabel: string;
  darkColor: string;
  cr: number; cg: number; cb: number;
}

function CollapsedStrip({ template, matchLabel, darkColor, cr, cg, cb }: CollapsedStripProps) {
  const [hovered, setHovered] = useState(false);

  const stripShadowHover = `0 0 0 1.5px rgba(${cr},${cg},${cb},0.6), 0 8px 28px rgba(${cr},${cg},${cb},0.38)`;
  const stripShadowDefault = `0 0 0 1px rgba(${cr},${cg},${cb},0.2)`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(180deg, ${darkColor} 0%, ${template.categoryColor} 100%)`,
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        overflow: 'hidden',
        opacity: hovered ? 1 : 0.72,
        boxShadow: hovered ? stripShadowHover : stripShadowDefault,
        transition: 'opacity 0.22s ease, box-shadow 0.22s ease',
        userSelect: 'none',
      }}
    >
      <ChevronRight
        size={13}
        color={`rgba(255,255,255,${hovered ? 0.9 : 0.4})`}
        style={{ flexShrink: 0, transition: 'color 0.2s' }}
      />
      <span style={{
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: `rgba(255,255,255,${hovered ? 1 : 0.82})`,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        transition: 'color 0.22s',
        lineHeight: 1,
      }}>
        {template.name}
      </span>
      <span style={{
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        fontSize: '0.5rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: `rgba(255,255,255,${hovered ? 0.6 : 0.3})`,
        whiteSpace: 'nowrap',
        transition: 'color 0.22s',
      }}>
        {matchLabel}
      </span>
    </div>
  );
}

// ─── Expanded Card ────────────────────────────────────────────────────────────
// Fixed height (CARD_H) prevents the row from jumping when switching cards.
// Body uses flex:1 so it fills remaining space; CTAs are always anchored at the bottom.
interface ExpandedCardProps {
  template: Tool;
  matchLabel: string;
  isPrimary: boolean;
}

function ExpandedCard({ template, matchLabel, isPrimary }: ExpandedCardProps) {
  const darkColor = GRADIENT_DARK[template.categoryColor] ?? '#05051E';
  const gradientBg = `linear-gradient(135deg, ${darkColor} 0%, ${template.categoryColor} 100%)`;

  const cardShadow = `0 8px 32px ${withAlpha(template.categoryColor, 0.28)}, 0 2px 10px rgba(0,0,0,0.42)`;
  const borderTopColor = withAlpha(template.categoryColor, 0.18);

  return (
    <div
      style={{
        width: '100%',
        height: CARD_H,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeSlideIn 0.3s ease both',
        boxShadow: cardShadow,
      }}
    >
      {/* ── Gradient header ── */}
      <div style={{
        background: gradientBg,
        padding: '16px 18px 14px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        minHeight: 92,
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -22, right: -22, width: 84, height: 84,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -32, left: -14, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <span style={{
            color: 'rgba(255,255,255,0.65)', fontSize: '0.58rem',
            fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            {template.category}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: isPrimary ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 100, padding: '2px 9px',
            fontSize: '0.56rem', fontWeight: 800,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffffff',
          }}>
            {isPrimary && '★ '}{matchLabel}
          </span>
        </div>

        {/* Framework name */}
        <span style={{
          color: '#ffffff', fontSize: '1.06rem', fontWeight: 800,
          letterSpacing: '-0.02em', lineHeight: 1.2,
          position: 'relative', zIndex: 1, marginTop: 10, display: 'block',
        }}>
          {template.name}
        </span>

        {/* ── Prominent meta pills ── */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 10, position: 'relative', zIndex: 1,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 100, padding: '4px 10px',
          }}>
            <Clock size={10} color="rgba(255,255,255,0.85)" />
            <span style={{ color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.01em' }}>
              {template.duration}
            </span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 100, padding: '4px 10px',
          }}>
            <Users size={10} color="rgba(255,255,255,0.85)" />
            <span style={{ color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.01em' }}>
              {template.teamSize}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        background: 'rgba(5,5,30,0.94)',
        borderTop: `1px solid ${borderTopColor}`,
        padding: '12px 16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        overflow: 'hidden',
      }}>
        {/* Description */}
        <p style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          color: 'rgba(255,255,255,0.55)',
          fontSize: '0.8rem', lineHeight: 1.58, margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {template.description}
        </p>

        {/* Use-case tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flexShrink: 0 }}>
          {template.useCases.map((uc) => (
            <span key={uc} style={{
              fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 100, padding: '2px 9px', whiteSpace: 'nowrap',
            }}>
              {uc}
            </span>
          ))}
        </div>

        {/* CTAs - always at the bottom of the body */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <PrimaryCtaButton template={template} />
        </div>
      </div>
    </div>
  );
}

// ─── Primary CTA - Open in FigJam ────────────────────────────────────────────
function PrimaryCtaButton({ template }: { template: Tool }) {
  const [hov, setHov] = useState(false);
  const darkColor = GRADIENT_DARK[template.categoryColor] ?? template.categoryColor;
  const baseShadow = `0 3px 14px ${withAlpha(template.categoryColor, 0.4)}`;
  const hoverShadow = `0 4px 20px ${withAlpha(template.categoryColor, 0.55)}`;
  const base  = { bg: template.categoryColor, shadow: baseShadow };
  const hover = { bg: darkColor,              shadow: hoverShadow };
  const s = hov ? hover : base;

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (template.figJamLink) window.open(template.figJamLink, '_blank');
      }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        background: s.bg, border: `1.5px solid ${s.bg}`, color: '#ffffff',
        borderRadius: 100, padding: '9px 14px',
        fontSize: '0.78rem', fontWeight: 700,
        cursor: 'pointer', width: '100%',
        transition: 'all 0.2s ease', boxShadow: s.shadow,
      }}
    >
      Open in FigJam
      <ExternalLink size={11} />
    </button>
  );
}

// ─── Sentence Summary ───────────────────────────────────────────────────────
interface SentenceSummaryProps {
  answers: Record<string, string>;
  onEdit: () => void;
}

function SentenceSummary({ answers, onEdit }: SentenceSummaryProps) {
  const [hovered, setHovered] = useState(false);
  const { questions, getOutcomesForFocus } = useData();
  // Blank colours mirror the wizard: cobalt → purple (only 2 blanks now)
  const COLORS = ['#2041CE', '#5D3ABF'];

  // Get the label for a given value by looking it up in context data
  const getAnswerLabel = (key: string, value: string): string => {
    if (key === 'outcome') {
      // Outcomes are dynamic — derive from selected focus
      const focusValue = answers['focus'];
      if (focusValue) {
        const outcomes = getOutcomesForFocus(focusValue);
        const match = outcomes.find((o) => o.value === value);
        if (match) return match.label;
      }
      return value;
    }
    const question = questions[0];
    if (!question) return value;
    const blank = question.blanks.find((b) => b.id === key);
    if (!blank) return value;
    const option = blank.options.find((opt) => opt.value === value);
    return option?.label || value;
  };

  // The two parts of the sentence: "I want to [Focus] so that I can [Outcome]."
  const segments: { text: string; key?: string }[] = [
    { text: 'I want to ',   key: 'focus'    },
    { text: ' so that I can ',   key: 'outcome'  },
    { text: '.'                             },
  ];

  const items: ReactNode[] = [];
  let chipIndex = 0;

  segments.forEach((seg, i) => {
    // Static text
    items.push(
      <span key={`t${i}`} style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.92rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {seg.text}
      </span>
    );

    // Coloured chip for the answer that follows this text part
    if (seg.key && answers[seg.key]) {
      const color = COLORS[chipIndex];
      const delay = chipIndex * 90;
      const answerLabel = getAnswerLabel(seg.key, answers[seg.key]);
      const chipBg = withAlpha(color, 0.18);
      const chipBorder = withAlpha(color, 0.55);
      const chipShadow = `0 2px 12px ${withAlpha(color, 0.25)}`;
      items.push(
        <span key={`c${i}`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 100,
          padding: '3px 14px',
          fontSize: '0.92rem',
          fontWeight: 700,
          background: chipBg,
          border: `1.5px solid ${chipBorder}`,
          color: '#ffffff',
          whiteSpace: 'nowrap',
          margin: '0 3px',
          boxShadow: chipShadow,
          animation: `fadeSlideIn 0.4s ease ${delay}ms both`,
        }}>
          {answerLabel}
        </span>
      );
      chipIndex++;
    }
  });

  // Don't render if nothing is filled
  if (chipIndex === 0) return null;

  return (
    <div style={{
      display: 'inline-flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 18,
      padding: '12px 24px',
      paddingRight: '12px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      maxWidth: '100%',
      margin: '0 auto',
      gap: 12,
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {items}
      </div>
      <button
        onClick={onEdit}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          background: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <Edit size={14} color={hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)'} />
      </button>
    </div>
  );
}