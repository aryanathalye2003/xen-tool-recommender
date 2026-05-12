import { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback, ReactNode } from 'react';
import { X, ArrowRight } from 'lucide-react';
import {
  Tool,
  Question,
  Blank,
  BlankOption,
} from '../data';
import { useData } from '../contexts/DataContext';
import { ToolResults } from './TemplateResults';
import { ConfettiCanvas } from './ConfettiCanvas';

// Fixed colour per blank slot — cobalt / purple (removed brand-red since we only have 2 blanks now)
const BLANK_COLORS = ['#2041CE', '#5D3ABF'];
const blankColor = (idx: number) => BLANK_COLORS[idx % BLANK_COLORS.length];


function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type WizardStep = 'quiz' | 'results';

interface FlyingCard {
  label: string;
  color: string;
  blankId: string;
  value: string;
  sx: number; sy: number; sw: number; sh: number;
  dx: number; dy: number; dw: number; dh: number;
}

// ─── Root wizard ──────────────────────────────────────────────────────────────
interface RecommendationWizardProps {
  onProgressChange?: (hasProgress: boolean) => void;
  onBack?: () => void;
}

export function RecommendationWizard({ onProgressChange, onBack }: RecommendationWizardProps) {
  const { questions, getOutcomesForFocus, getRecommendations, isLoading } = useData();

  const [wizardStep, setWizardStep] = useState<WizardStep>('quiz');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [blankHistory, setBlankHistory] = useState<string[]>([]);
  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Tool[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [outcomeOptions, setOutcomeOptions] = useState<BlankOption[]>([]);

  // Re-sync outcome options when recommendation logic changes via realtime
  useEffect(() => {
    const focusValue = answers['focus'];
    if (focusValue) {
      const outcomes = getOutcomesForFocus(focusValue);
      setOutcomeOptions(outcomes.map((o) => ({ value: o.value, label: o.label, tags: {} })));
    }
  }, [getOutcomesForFocus]); // intentionally excludes answers — only re-sync when DB changes

  useEffect(() => {
    const hasAny = Object.keys(answers).length > 0 || wizardStep === 'results' || questionIndex > 0;
    onProgressChange?.(hasAny);
  }, [answers, wizardStep, questionIndex]);

  const isQuizStep = questionIndex === 0;
  const currentQuestion: Question | null = isQuizStep ? (questions[questionIndex] ?? null) : null;

  // Effective question overlays the dynamic outcome options so we never mutate context data
  const effectiveQuestion: Question | null = useMemo(() => {
    if (!currentQuestion) return null;
    return {
      ...currentQuestion,
      blanks: currentQuestion.blanks.map((b) =>
        b.id === 'outcome' ? { ...b, options: outcomeOptions } : b
      ),
    };
  }, [currentQuestion, outcomeOptions]);

  useEffect(() => {
    if (wizardStep === 'quiz' && effectiveQuestion) {
      const firstUnfilled = effectiveQuestion.blanks.find((b) => !answers[b.id]);
      setActiveBlankId(firstUnfilled ? firstUnfilled.id : null);
    }
  }, [questionIndex, wizardStep]);

  const handleOptionSelect = (blankId: string, value: string) => {
    if (!effectiveQuestion) return;
    const newAnswers = { ...answers, [blankId]: value };

    // If selecting a focus, derive outcome options from context and clear any existing outcome
    if (blankId === 'focus') {
      const outcomes = getOutcomesForFocus(value);
      setOutcomeOptions(outcomes.map((o) => ({ value: o.value, label: o.label, tags: {} })));
      delete newAnswers['outcome'];
    }

    setAnswers(newAnswers);
    const blankIdx = effectiveQuestion.blanks.findIndex((b) => b.id === blankId);
    const nextBlank = effectiveQuestion.blanks[blankIdx + 1];
    if (nextBlank && !newAnswers[nextBlank.id]) {
      setTimeout(() => setActiveBlankId(nextBlank.id), 180);
    } else {
      setTimeout(() => setActiveBlankId(null), 180);
    }
  };

  const handleClearFrom = (blankId: string) => {
    if (!effectiveQuestion) return;
    const blankIdx = effectiveQuestion.blanks.findIndex((b) => b.id === blankId);
    if (blankIdx === -1) return;
    const newAnswers = { ...answers };
    for (let i = blankIdx; i < effectiveQuestion.blanks.length; i++) {
      delete newAnswers[effectiveQuestion.blanks[i].id];
    }
    setAnswers(newAnswers);
    setActiveBlankId(blankId);
  };

  const isCurrentQuestionComplete = () =>
    !!effectiveQuestion && effectiveQuestion.blanks.every((b) => answers[b.id]);

  const handleNext = () => {
    if (transitioning) return;
    const focusValue = answers['focus'];
    const outcomeValue = answers['outcome'];
    const recs = getRecommendations(focusValue, outcomeValue);
    setRecommendations(recs);
    setShowConfetti(true);
    setTransitioning(true);
    setTimeout(() => { setWizardStep('results'); setTransitioning(false); }, 300);
  };

  const handleStartOver = () => {
    setTransitioning(true);
    setTimeout(() => {
      setWizardStep('quiz');
      setQuestionIndex(0);
      setAnswers({});
      setActiveBlankId(null);
      setRecommendations([]);
      setOutcomeOptions([]);
      setTransitioning(false);
    }, 300);
  };

  const activeBlank = effectiveQuestion && activeBlankId
    ? effectiveQuestion.blanks.find((b) => b.id === activeBlankId)
    : undefined;
  const activeBlankIdx = effectiveQuestion && activeBlankId
    ? effectiveQuestion.blanks.findIndex((b) => b.id === activeBlankId)
    : 0;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main
        style={{
          height: 'calc(100vh - 66px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.12)',
          borderTopColor: '#2041CE',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
          Loading frameworks…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  return (
    <main
      style={{
        height: 'calc(100vh - 66px)',
        backgroundColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <ConfettiCanvas active={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Background glows + dot grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Original gradient glows (slightly reduced opacity) */}
        <div style={{
          position: 'absolute', top: -140, left: -120, width: 560, height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(32,65,206,0.10) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, right: -80, width: 480, height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93,58,191,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: -60, width: 340, height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(189,76,70,0.05) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
      </div>

      {/* Page content */}
      <div
        style={{
          position: 'relative', zIndex: 1, flex: 1,
          display: 'flex', flexDirection: 'column',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          overflow: 'hidden',
        }}
      >
        {wizardStep === 'quiz' && (
          <QuizView
            question={effectiveQuestion}
            questionIndex={questionIndex}
            answers={answers}
            activeBlankId={activeBlankId}
            activeBlank={activeBlank ?? undefined}
            activeBlankIdx={activeBlankIdx}
            onBlankClick={(id) => setActiveBlankId(id)}
            onOptionSelect={handleOptionSelect}
            onClearBlank={handleClearFrom}
            isComplete={isCurrentQuestionComplete()}
            onNext={handleNext}
            onBack={onBack}
          />
        )}

        {wizardStep === 'results' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100%',
              padding: '24px 24px',
            }}>
              <div style={{ width: '100%' }}>
                <ToolResults
                  tools={recommendations}
                  answers={answers}
                  onStartOver={handleStartOver}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Quiz View ────────────────────────────────────────────────────────────────
interface QuizViewProps {
  question: Question | null;
  questionIndex: number;
  answers: Record<string, string>;
  activeBlankId: string | null;
  activeBlank: Blank | undefined;
  activeBlankIdx: number;
  onBlankClick: (id: string) => void;
  onOptionSelect: (blankId: string, value: string) => void;
  onClearBlank: (blankId: string) => void;
  isComplete: boolean;
  onNext: () => void;
  onBack?: () => void;
}

function QuizView({
  question, questionIndex, answers, activeBlankId, activeBlank, activeBlankIdx,
  onBlankClick, onOptionSelect, onClearBlank, isComplete, onNext,
}: QuizViewProps) {
  const blankRefs = useRef<Record<string, HTMLElement | null>>({});
  const [flyingCard, setFlyingCard] = useState<FlyingCard | null>(null);
  const [poppingBlanks, setPoppingBlanks] = useState<Set<string>>(new Set());

  // ── Tray height lock ──────────────────────────────────────────────────────
  const trayBoxRef = useRef<HTMLDivElement>(null);
  const trayMinHRef = useRef(0);

  useLayoutEffect(() => {
    const el = trayBoxRef.current;
    if (!el) return;
    el.style.minHeight = '0px';
    const h = el.offsetHeight;
    trayMinHRef.current = Math.max(trayMinHRef.current, h);
    el.style.minHeight = `${trayMinHRef.current}px`;
  }, [activeBlankId, questionIndex]);

  // ── Lower panel height lock ────────────────────────────────────────────────
  const lowerPanelRef = useRef<HTMLDivElement>(null);
  const lowerMinHRef  = useRef(0);

  useLayoutEffect(() => {
    const el = lowerPanelRef.current;
    if (!el) return;
    if (activeBlankId) {
      el.style.minHeight = '0px';
      const h = el.offsetHeight;
      lowerMinHRef.current = Math.max(lowerMinHRef.current, h);
    }
    if (lowerMinHRef.current > 0) {
      el.style.minHeight = `${lowerMinHRef.current}px`;
    }
  }, [activeBlankId, questionIndex, isComplete]);

  useEffect(() => {
    setFlyingCard(null);
    setPoppingBlanks(new Set());
  }, [questionIndex]);

  const handleCardSelect = useCallback((
    cardEl: HTMLElement,
    blankId: string,
    value: string,
    label: string,
    color: string,
  ) => {
    if (flyingCard) return;
    const blankEl = blankRefs.current[blankId];
    if (!blankEl) { onOptionSelect(blankId, value); return; }
    const srcRect = cardEl.getBoundingClientRect();
    const dstRect = blankEl.getBoundingClientRect();
    setFlyingCard({
      label, color, value, blankId,
      sx: srcRect.left, sy: srcRect.top, sw: srcRect.width, sh: srcRect.height,
      dx: dstRect.left, dy: dstRect.top, dw: dstRect.width, dh: dstRect.height,
    });
  }, [flyingCard, onOptionSelect]);

  const handleFlyComplete = useCallback(() => {
    if (!flyingCard) return;
    onOptionSelect(flyingCard.blankId, flyingCard.value);
    setPoppingBlanks((prev) => new Set(prev).add(flyingCard.blankId));
    setTimeout(() => {
      setPoppingBlanks((prev) => { const n = new Set(prev); n.delete(flyingCard.blankId); return n; });
    }, 420);
    setFlyingCard(null);
  }, [flyingCard, onOptionSelect]);

  return (
    <>
      {flyingCard && <FlyingCardOverlay card={flyingCard} onComplete={handleFlyComplete} />}

      {/* ── Upper: progress bar + sentence ── */}
      <div
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: '24px 28px 16px',
          maxWidth: 1280, width: '100%', margin: '0 auto',
          position: 'relative',
        }}
      >
        {question ? (
          <>
            <p style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: '0.72rem', letterSpacing: '0.14em',
              textTransform: 'uppercase', fontWeight: 700,
              textAlign: 'center', marginBottom: 24,
            }}>
              {question.hint}
            </p>
            <div
              className="sentence-line"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                rowGap: 10,
                columnGap: 0,
                fontSize: '1rem',
                lineHeight: 1.5,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.65)',
                maxWidth: '100%',
              }}
            >
              {question.sentenceParts.flatMap((part, i) => {
                const items: ReactNode[] = [<span key={`p${i}`}>{part}</span>];
                if (i < question.blanks.length) {
                  const blank = question.blanks[i];
                  const color = blankColor(i);
                  items.push(
                    <BlankChip
                      key={`b${i}`}
                      blank={blank}
                      color={color}
                      selectedValue={answers[blank.id]}
                      isActive={activeBlankId === blank.id}
                      isPopping={poppingBlanks.has(blank.id)}
                      isFilled={!!answers[blank.id]}
                      onClick={() => onBlankClick(blank.id)}
                      onClear={() => onClearBlank(blank.id)}
                      onRef={(el) => { blankRefs.current[blank.id] = el; }}
                    />
                  );
                }
                return items;
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* ── Lower: option cards / Next button ── */}
      <div
        ref={lowerPanelRef}
        style={{
          flexShrink: 0,
          padding: '20px 28px 40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {isComplete ? (
          <NextButton onNext={onNext} />
        ) : activeBlank ? (
          <div
            ref={trayBoxRef}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              padding: '20px 24px',
              backdropFilter: 'blur(12px)',
              maxWidth: 680,
              width: '100%',
              minHeight: trayMinHRef.current || undefined,
            }}
          >
            <OptionTray
              blank={activeBlank}
              blankColor={blankColor(activeBlankIdx)}
              answers={answers}
              flyingCard={flyingCard}
              onSelect={handleCardSelect}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.875rem' }}>
              Tap a blank above to fill it in
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Blank Chip ──────────────────────────────────────────────────────────────
interface BlankChipProps {
  blank: Blank;
  color: string;
  selectedValue?: string;
  isActive: boolean;
  isPopping: boolean;
  isFilled: boolean;
  onClick: () => void;
  onClear: () => void;
  onRef: (el: HTMLElement | null) => void;
}

function BlankChip({ blank, color, selectedValue, isActive, isPopping, isFilled, onClick, onClear, onRef }: BlankChipProps) {
  const [hovered, setHovered] = useState(false);

  // Find the label for the selected value
  const displayText = selectedValue 
    ? blank.options.find(opt => opt.value === selectedValue)?.label || selectedValue
    : blank.placeholder;

  return (
    <button
      ref={onRef as any}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 100, padding: '6px 22px',
        fontSize: 'inherit', fontWeight: 700,
        background: isFilled ? hexToRgba(color, 0.22) : isActive ? hexToRgba(color, 0.10) : 'rgba(255,255,255,0.04)',
        border: isFilled
          ? `2px solid ${color}`
          : `2px dashed ${color}`,
        color: isFilled ? '#ffffff' : 'rgba(255,255,255,0.85)',
        cursor: 'pointer',
        margin: '0 5px', verticalAlign: 'middle', whiteSpace: 'nowrap', lineHeight: 1.5,
        boxShadow: isFilled
          ? `0 2px 14px ${hexToRgba(color, 0.4)}`
          : isActive
          ? `0 0 0 3px ${hexToRgba(color, 0.15)}`
          : 'none',
        transition: 'background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s',
        animation: isPopping ? 'blankPop 0.38s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
      }}
    >
      {displayText}

      {/* Clear badge — absolutely positioned so it overlaps the text without shifting it */}
      {isFilled && (
        <span
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          style={{
            position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: '50%',
            background: hovered ? 'rgba(255,255,255,0.28)' : 'transparent',
            color: hovered ? '#ffffff' : 'transparent',
            transition: 'background 0.18s ease, color 0.18s ease',
            cursor: 'pointer',
          }}
        >
          <X size={10} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─── Option Tray ──────────────────────────────────────────────────────────────
interface OptionTrayProps {
  blank: Blank;
  blankColor: string;
  answers: Record<string, string>;
  flyingCard: FlyingCard | null;
  onSelect: (cardEl: HTMLElement, blankId: string, value: string, label: string, color: string) => void;
}

function OptionTray({ blank, blankColor: color, answers, flyingCard, onSelect }: OptionTrayProps) {
  const selectedValue = answers[blank.id];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {blank.options.map((opt, i) => {
          const isSelected = selectedValue === opt.value;
          const isFlyingAway = flyingCard?.blankId === blank.id && flyingCard?.value === opt.value;
          return (
            <OptionCard
              key={opt.value}
              option={opt}
              color={color}
              isSelected={isSelected}
              isFlyingAway={isFlyingAway}
              animDelay={i * 45}
              onSelect={(el) => onSelect(el, blank.id, opt.value, opt.label, color)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Option Card ──────────────────────────────────────────────────────────────
interface OptionCardProps {
  option: BlankOption;
  color: string;
  isSelected: boolean;
  isFlyingAway: boolean;
  animDelay: number;
  onSelect: (el: HTMLElement) => void;
}

function OptionCard({ option, color, isSelected, isFlyingAway, animDelay, onSelect }: OptionCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      onClick={() => { if (!isFlyingAway && ref.current) onSelect(ref.current); }}
      style={{
        borderRadius: 100, padding: '6px 22px',
        fontSize: '1rem', fontWeight: isSelected ? 700 : 500, lineHeight: 1.5,
        background: isSelected ? hexToRgba(color, 0.18) : 'rgba(255,255,255,0.055)',
        border: isSelected ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.12)',
        color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.82)',
        cursor: isFlyingAway ? 'default' : 'pointer',
        opacity: isFlyingAway ? 0 : 1,
        transition: 'opacity 0.04s ease, transform 0.18s ease, background 0.18s, border-color 0.18s, box-shadow 0.18s',
        whiteSpace: 'nowrap',
        boxShadow: isSelected ? `0 2px 16px ${hexToRgba(color, 0.35)}` : 'none',
        pointerEvents: isFlyingAway ? 'none' : 'auto',
        animation: `cardEntrance 0.32s ease ${animDelay}ms both`,
      }}
      onMouseEnter={(e) => {
        if (isFlyingAway) return;
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = hexToRgba(color, 0.15);
        el.style.transform = 'translateY(-2px)';
        el.style.borderColor = hexToRgba(color, 0.7);
        el.style.boxShadow = `0 6px 20px ${hexToRgba(color, 0.3)}`;
      }}
      onMouseLeave={(e) => {
        if (isFlyingAway) return;
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = isSelected ? hexToRgba(color, 0.18) : 'rgba(255,255,255,0.055)';
        el.style.transform = 'translateY(0)';
        el.style.borderColor = isSelected ? color : 'rgba(255,255,255,0.12)';
        el.style.boxShadow = isSelected ? `0 2px 16px ${hexToRgba(color, 0.35)}` : 'none';
      }}
    >
      {option.label}
    </button>
  );
}

// ─── Flying Card Overlay ──────────────────────────────────────────────────────
function FlyingCardOverlay({ card, onComplete }: { card: FlyingCard; onComplete: () => void }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    let r1: number, r2: number;
    r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setAnimating(true)); });
    const t = setTimeout(onComplete, 380);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t); };
  }, []);

  const tx = (card.dx + card.dw / 2) - (card.sx + card.sw / 2);
  const ty = (card.dy + card.dh / 2) - (card.sy + card.sh / 2);

  return (
    <div
      style={{
        position: 'fixed', left: card.sx, top: card.sy, width: card.sw, height: card.sh,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 100,
        border: `2px solid ${card.color}`,
        background: hexToRgba(card.color, 0.18),
        color: '#ffffff', fontSize: '1rem', fontWeight: 700, lineHeight: 1.5,
        zIndex: 9999, pointerEvents: 'none',
        transform: animating ? `translate(${tx}px, ${ty}px)` : 'translate(0, 0)',
        opacity: animating ? 0 : 1,
        transition: 'transform 0.34s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s ease 0.26s',
        boxShadow: `0 8px 32px ${hexToRgba(card.color, 0.4)}`,
        padding: '0 22px', overflow: 'hidden', whiteSpace: 'nowrap',
      }}
    >
      {card.label}
    </div>
  );
}

// ─── Next Button ──────────────────────────────────────────────────────────────
function NextButton({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'fadeSlideIn 0.3s ease forwards' }}>
      <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.85rem', margin: 0 }}>
        All set — let's find your perfect framework.
      </p>
      <button
        onClick={onNext}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: '#BD4C46', border: 'none', borderRadius: 100,
          padding: '14px 38px', color: '#ffffff',
          fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.01em',
          transition: 'all 0.2s ease',
          animation: 'completePulse 1.4s ease 0.3s',
        }}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = '#a83d38';
          b.style.transform = 'translateY(-2px) scale(1.02)';
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = '#BD4C46';
          b.style.transform = 'translateY(0) scale(1)';
        }}
      >
        Show my frameworks <ArrowRight size={16} />
      </button>
    </div>
  );
}