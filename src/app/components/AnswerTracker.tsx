import { useData } from '../contexts/DataContext';

const BLANK_COLORS = ['#2041CE', '#5D3ABF'];
const STEP_LABELS = ['Activity', 'Phase', 'Session', 'Direction'];

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export interface AnswerTrackerProps {
  answers: Record<string, string>;
  questionIndex: number;
  clarifyAnswerLabel: string | null;
  /** Pass true on the results page to show all steps as complete */
  showAll?: boolean;
}

export function AnswerTracker({
  answers,
  questionIndex,
  clarifyAnswerLabel,
  showAll = false,
}: AnswerTrackerProps) {
  const { questions } = useData();

  type StepEntry = {
    num: number;
    label: string;
    isCompleted: boolean;
    isCurrent: boolean;
    blanks: Array<{ id: string; placeholder: string; color: string; value: string | null }>;
  };

  const steps: StepEntry[] = [
    ...questions.map((q, i) => ({
      num: i + 1,
      label: STEP_LABELS[i],
      isCompleted: q.blanks.every((b) => !!answers[b.id]),
      isCurrent: !showAll && i === questionIndex,
      blanks: q.blanks.map((b, bi) => ({
        id: b.id,
        placeholder: b.placeholder,
        color: BLANK_COLORS[bi % BLANK_COLORS.length],
        value: answers[b.id] ?? null,
      })),
    })),
    {
      num: 4,
      label: STEP_LABELS[3],
      isCompleted: !!clarifyAnswerLabel,
      isCurrent: !showAll && questionIndex === 3,
      blanks: [
        {
          id: 'clarify',
          placeholder: 'your direction',
          color: '#BD4C46',
          value: clarifyAnswerLabel ?? null,
        },
      ],
    },
  ];

  // During the quiz only show steps that have been reached
  const visibleSteps = showAll
    ? steps
    : steps.filter((step) => step.blanks.some((b) => b.value) || step.isCurrent);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <p
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          margin: '0 0 2px',
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        Your Choices
      </p>

      {visibleSteps.map((step, si) => (
        <div
          key={step.num}
          style={{
            animation: 'fadeSlideIn 0.35s ease both',
            animationDelay: `${si * 50}ms`,
          }}
        >
          {/* Step status dot + label - no numbers (progress bar already shows them) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                flexShrink: 0,
                background: step.isCompleted
                  ? '#2041CE'
                  : step.isCurrent
                    ? '#BD4C46'
                    : 'rgba(255,255,255,0.18)',
                boxShadow: step.isCurrent ? '0 0 0 2px rgba(189,76,70,0.25)' : 'none',
                transition: 'background 0.3s ease',
              }}
            />
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: step.isCompleted
                  ? 'rgba(255,255,255,0.5)'
                  : step.isCurrent
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(255,255,255,0.2)',
              }}
            >
              {step.label}
            </span>
          </div>

          {/* Chips */}
          <div
            style={{
              paddingLeft: 25,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            {step.blanks.map((blank) => {
              if (blank.value) {
                return (
                  <span
                    key={blank.id}
                    title={blank.value}
                    style={{
                      background: hexToRgba(blank.color, 0.15),
                      border: `1.5px solid ${hexToRgba(blank.color, 0.5)}`,
                      borderRadius: 100,
                      padding: '3px 10px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      display: 'block',
                      maxWidth: '100%',
                    }}
                  >
                    {blank.value}
                  </span>
                );
              }
              if (step.isCurrent) {
                return (
                  <span
                    key={blank.id}
                    style={{
                      border: '1.5px dashed rgba(255,255,255,0.18)',
                      borderRadius: 100,
                      padding: '3px 10px',
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.22)',
                      display: 'block',
                      maxWidth: '100%',
                    }}
                  >
                    {blank.placeholder}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}