import FrameRoseThorn from '../../imports/Frame-1/Frame-252-77';
import { useState } from 'react';
import { Tool } from '../data';
import { useData } from '../contexts/DataContext';
import {
  Target,
  BarChart2,
  Layers,
  GitBranch,
  MessageCircle,
  UserCircle,
  LayoutGrid,
  RefreshCw,
  Users,
  Lightbulb,
  Map,
  ListOrdered,
  TrendingUp,
  FlaskConical,
  ExternalLink,
  Clock,
  Users2,
  Briefcase,
  Grid2x2,
  Sparkles,
  Hexagon,
  Presentation,
  Vote,
  Maximize2,
} from 'lucide-react';

// Wrapper that makes the Figma Frame SVG behave like a Lucide icon
function RoseThornBudIcon({
  size = 44,
  color = 'rgba(255,255,255,0.82)',
  style,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        '--stroke-0': color,
        ...style,
      } as React.CSSProperties}
    >
      <FrameRoseThorn />
    </div>
  );
}

const FOCUS_FILTERS = [
  { id: 'all', label: 'All', color: '#ffffff' },
  { id: 'learn-about-people', label: 'learn about people', color: '#2041CE' },
  { id: 'know-the-business', label: 'know the business', color: '#5D3ABF' },
  { id: 'understand-the-problem', label: 'understand the problem', color: '#2041CE' },
  { id: 'explore-solutions', label: 'explore solutions', color: '#5D3ABF' },
  { id: 'validate-concepts', label: 'validate concepts', color: '#BD4C46' },
];

const FOCUS_TOOL_MAPPING: Record<string, string[]> = {
  'learn-about-people': ['persona', 'roleplaying', 'extremes-and-mainstreams', 'customer-journey-map', 'jobs-to-be-done'],
  'know-the-business': ['golden-circles', 'value-proposition-canvas', 'competitor-matrix', 'swot'],
  'understand-the-problem': ['ishikawa', 'customer-journey-map', 'roleplaying', 'how-might-we', 'create-insight-statements', 'value-proposition-canvas', 'persona', 'ux-honeycomb-scorecard'],
  'explore-solutions': ['how-might-we', 'inversion', 'roleplaying', 'six-thinking-hats', 'card-sorting', 'nabc', 'rose-thorn-bud'],
  'validate-concepts': ['rice-prioritization', 'impact-effort', 'dot-voting', 'six-thinking-hats', 'golden-circles', 'ab-testing', 'roleplaying'],
};

const SHORT_DESCRIPTIONS: Record<string, string> = {
  'golden-circles':             'Align your team around a shared Why, How, and What to build a compelling purpose.',
  'competitor-matrix':          'Map competitors across key dimensions to uncover white spaces and sharpen your direction.',
  'value-proposition-canvas':   'Align your product precisely with what users genuinely need, want, and struggle with.',
  'ishikawa':                   'Trace any problem back to its root causes by exploring contributing factors systematically.',
  'how-might-we':               'Transform challenges into opportunity-framed questions that spark focused ideation.',
  'persona':                    'Build rich, archetypal user representations to drive alignment and empathetic decisions.',
  'card-sorting':               'Understand how users naturally group information to design intuitive navigation.',
  'inversion':                  'Flip the problem on its head to unlock unexpected pathways to innovation.',
  'roleplaying':                "Step into your users' shoes to surface hidden needs and build genuine empathy.",
  'six-thinking-hats':          'Explore decisions from six parallel perspectives to avoid groupthink and reach better outcomes.',
  'customer-journey-map':       "Map every touchpoint in your user's experience to surface pain points and opportunities.",
  'rice-prioritization':        'Score ideas by Reach, Impact, Confidence, and Effort to make data-informed decisions.',
  'impact-effort':              'Plot ideas by impact and effort to quickly identify your highest-leverage opportunities.',
  'ab-testing':                 'Compare two design alternatives against real user behaviour to validate assumptions.',
  'jobs-to-be-done':            'Understand what progress your users are trying to make so you can design solutions that truly help them succeed.',
  'extremes-and-mainstreams':   'Explore the edges of your user spectrum to uncover hidden insights that improve solutions for everyone.',
  'swot':                       'Map Strengths, Weaknesses, Opportunities, and Threats to inform smarter strategic decisions.',
  'create-insight-statements':  'Synthesise research findings into sharp, actionable statements that fuel meaningful design decisions.',
  'ux-honeycomb-scorecard':     'Evaluate your product against the seven core dimensions of user experience to identify key gaps.',
  'rose-thorn-bud':             'Identify positives, pain points, and emerging opportunities to align your team on next steps.',
  'nabc':                       'Structure ideas around Need, Approach, Benefit, and Competition to craft compelling proposals.',
  'dot-voting':                 'Rapidly align your team on the most promising ideas by distributing votes democratically.',
};

const TOOL_ICONS: Record<string, React.ElementType> = {
  'golden-circles':             Target,
  'competitor-matrix':          BarChart2,
  'value-proposition-canvas':   Layers,
  'ishikawa':                   GitBranch,
  'how-might-we':               MessageCircle,
  'persona':                    UserCircle,
  'card-sorting':               LayoutGrid,
  'inversion':                  RefreshCw,
  'roleplaying':                Users,
  'six-thinking-hats':          Lightbulb,
  'customer-journey-map':       Map,
  'rice-prioritization':        ListOrdered,
  'impact-effort':              TrendingUp,
  'ab-testing':                 FlaskConical,
  'jobs-to-be-done':            Briefcase,
  'extremes-and-mainstreams':   Maximize2,
  'swot':                       Grid2x2,
  'create-insight-statements':  Sparkles,
  'ux-honeycomb-scorecard':     Hexagon,
  'rose-thorn-bud':             RoseThornBudIcon,
  'nabc':                       Presentation,
  'dot-voting':                 Vote,
};

function darkenColor(hex: string): string {
  const map: Record<string, string> = {
    '#2041CE': '#122088',
    '#5D3ABF': '#3d258a',
    '#BD4C46': '#7a2c28',
  };
  return map[hex] ?? '#111130';
}

export function LibraryPage() {
  const { tools, isLoading } = useData();
  const [selectedFocus, setSelectedFocus] = useState('all');

  const filteredTools = selectedFocus === 'all'
    ? tools
    : tools.filter(tool => FOCUS_TOOL_MAPPING[selectedFocus]?.includes(tool.id));

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 'calc(100vh - 66px)', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.12)',
          borderTopColor: '#2041CE',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
          Loading library…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: '48px 28px 80px',
      animation: 'fadeSlideIn 0.5s ease forwards',
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: 'clamp(2rem, 4vw, 2.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: 16,
        }}>
          XENTools Library
        </h1>
      </div>

      {/* Focus Filter Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
        marginBottom: 48,
        padding: '0 20px',
      }}>
        {FOCUS_FILTERS.map(focus => (
          <FocusFilterTab
            key={focus.id}
            focus={focus}
            isActive={selectedFocus === focus.id}
            onClick={() => setSelectedFocus(focus.id)}
          />
        ))}
      </div>

      {/* Tools Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 24,
      }}>
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}

/* ── Focus Filter Tab ─────────────────────────────────────────────────── */

interface FocusFilterTabProps {
  focus: { id: string; label: string; color: string };
  isActive: boolean;
  onClick: () => void;
}

function FocusFilterTab({ focus, isActive, onClick }: FocusFilterTabProps) {
  const [hovered, setHovered] = useState(false);

  const isAll = focus.id === 'all';
  const bgColor = isAll && isActive
    ? '#ffffff'
    : isAll && hovered
    ? 'rgba(255,255,255,0.15)'
    : isAll
    ? 'rgba(255,255,255,0.08)'
    : isActive
    ? `${focus.color}33`
    : hovered
    ? `${focus.color}22`
    : 'rgba(255,255,255,0.05)';

  const borderColor = isAll && isActive
    ? '#ffffff'
    : isAll
    ? 'rgba(255,255,255,0.2)'
    : isActive
    ? `${focus.color}88`
    : hovered
    ? `${focus.color}55`
    : 'rgba(255,255,255,0.15)';

  const textColor = isAll && isActive
    ? '#05051E'
    : isActive
    ? '#ffffff'
    : 'rgba(255,255,255,0.6)';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 100,
        padding: '10px 24px',
        color: textColor,
        fontSize: '0.875rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textTransform: isAll ? 'uppercase' : 'lowercase',
        whiteSpace: 'nowrap',
      }}
    >
      {focus.label}
    </button>
  );
}

/* ── Tool Card ────────────────────────────────────────────────────────── */

function ToolCard({ tool }: { tool: Tool }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const IconComponent = TOOL_ICONS[tool.id] ?? Lightbulb;
  const darkColor = darkenColor(tool.categoryColor);
  const gradientBg = `linear-gradient(145deg, ${darkColor} 0%, ${tool.categoryColor} 100%)`;
  const shortDesc = SHORT_DESCRIPTIONS[tool.id] ?? tool.description;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        background: gradientBg,
        boxShadow: hovered
          ? `0 24px 56px rgba(0,0,0,0.62), 0 0 0 1.5px ${tool.categoryColor}88`
          : `0 8px 28px rgba(0,0,0,0.44), 0 0 0 1px ${tool.categoryColor}44`,
        transform: hovered ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
        cursor: 'default',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 20px 18px',
        aspectRatio: '144 / 202',
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -28, right: -28,
        width: 110, height: 110, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -36, left: -18,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />

      {/* Top: category pill */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.28)',
          borderRadius: 100,
          padding: '3px 10px',
          color: '#ffffff',
          fontSize: '0.56rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {tool.category}
        </span>
      </div>

      {/* Middle: icon + tool name + description */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        gap: 10,
        marginBottom: 18,
      }}>
        <IconComponent
          size={44}
          color="rgba(255,255,255,0.82)"
          strokeWidth={1.6}
          style={{ padding: '4px' }}
        />

        <span style={{
          color: '#ffffff',
          fontSize: '1.05rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
          textShadow: '0 1px 4px rgba(0,0,0,0.35)',
        }}>
          {tool.name}
        </span>

        <p style={{
          color: 'rgba(255,255,255,0.62)',
          fontSize: '0.78rem',
          lineHeight: 1.55,
          margin: 0,
        }}>
          {shortDesc}
        </p>
      </div>

      {/* Bottom: meta pills + FigJam CTA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        zIndex: 1,
        marginTop: 'auto',
      }}>
        {/* Meta pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 22, borderRadius: 100, padding: '0 10px',
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.22)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.62rem', fontWeight: 600,
            letterSpacing: '0.03em', whiteSpace: 'nowrap',
          }}>
            <Clock size={9} strokeWidth={2} />
            {tool.duration}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 22, borderRadius: 100, padding: '0 10px',
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.22)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.62rem', fontWeight: 600,
            letterSpacing: '0.03em', whiteSpace: 'nowrap',
          }}>
            <Users2 size={9} strokeWidth={2} />
            {tool.teamSize}
          </span>
        </div>

        {/* FigJam CTA */}
        {tool.figJamLink ? (
          <button
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              window.open(tool.figJamLink, '_blank');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              background: btnHovered ? 'rgba(255,255,255,0.92)' : '#ffffff',
              border: '1.5px solid rgba(255,255,255,0.9)',
              borderRadius: 100,
              padding: '9px 14px',
              color: tool.categoryColor,
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: btnHovered
                ? '0 4px 16px rgba(0,0,0,0.2)'
                : '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            Open in FigJam
            <ExternalLink size={11} strokeWidth={2.5} />
          </button>
        ) : (
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            background: 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.18)',
            borderRadius: 100,
            padding: '9px 14px',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'default',
          }}>
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}