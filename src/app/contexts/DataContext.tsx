import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Tool, BlankOption, Question } from '../data';

// ─── Supabase client (singleton) ─────────────────────────────────────────────
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

// ─── Internal types for DB rows ───────────────────────────────────────────────
interface DBTool {
  id: string;
  name: string;
  description: string;
  category: string;
  category_color: string;
  duration: string;
  team_size: string;
  figjam_link: string | null;
  download_link: string | null;
  use_cases: string[] | null;
  icon_svg: string | null;
  icon_link: string | null;
}

interface DBRecLogic {
  id: number;
  focus_value: string;
  focus_label: string;
  outcome_value: string;
  outcome_label: string;
  rec_1: string;
  rec_2: string | null;
  rec_3: string | null;
}

// ─── Public types ─────────────────────────────────────────────────────────────
export interface OutcomeOption {
  value: string;
  label: string;
  recommendations: string[];
}

export interface FocusOption {
  value: string;
  label: string;
  outcomes: OutcomeOption[];
}

interface DataContextValue {
  tools: Tool[];
  questions: Question[];
  focusOptions: FocusOption[];
  getOutcomesForFocus: (focusValue: string) => OutcomeOption[];
  getRecommendations: (focusValue: string, outcomeValue: string) => Tool[];
  isLoading: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapTool(row: DBTool): Tool {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    categoryColor: row.category_color,
    duration: row.duration,
    teamSize: row.team_size,
    figJamLink: row.figjam_link ?? undefined,
    downloadLink: row.download_link ?? undefined,
    useCases: row.use_cases ?? [],
    icon_svg: row.icon_svg,
    icon_link: row.icon_link,
    tags: {}, // legacy field, not stored in DB
  };
}

function buildFocusOptions(rows: DBRecLogic[]): FocusOption[] {
  const focusMap = new Map<string, FocusOption>();
  // Sort by DB id so order matches the original seed order
  const sorted = [...rows].sort((a, b) => a.id - b.id);
  for (const row of sorted) {
    if (!focusMap.has(row.focus_value)) {
      focusMap.set(row.focus_value, {
        value: row.focus_value,
        label: row.focus_label,
        outcomes: [],
      });
    }
    focusMap.get(row.focus_value)!.outcomes.push({
      value: row.outcome_value,
      label: row.outcome_label,
      recommendations: [row.rec_1, row.rec_2, row.rec_3].filter((r): r is string => !!r),
    });
  }
  return Array.from(focusMap.values());
}

function buildQuestions(focusOptions: FocusOption[]): Question[] {
  return [
    {
      id: 'q1',
      sentenceParts: ['I want to ', ' so that I can ', '.'],
      hint: 'Choose your focus and outcome to find the right framework',
      blanks: [
        {
          id: 'focus',
          placeholder: 'select your focus',
          options: focusOptions.map(
            (f): BlankOption => ({ value: f.value, label: f.label, tags: {} })
          ),
        },
        {
          id: 'outcome',
          placeholder: 'pick an outcome',
          options: [], // populated dynamically in the wizard from selected focus
        },
      ],
    },
  ];
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [focusOptions, setFocusOptions] = useState<FocusOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [toolsResult, recResult] = await Promise.all([
        supabase.from('tools').select('*'),
        supabase.from('recommendation_logic').select('*').order('id'),
      ]);

      if (toolsResult.error)
        throw new Error(`Tools fetch failed: ${toolsResult.error.message}`);
      if (recResult.error)
        throw new Error(`Recommendation logic fetch failed: ${recResult.error.message}`);

      const mappedTools = (toolsResult.data as DBTool[]).map(mapTool);
      console.log('[DataContext] first tool payload', mappedTools[0]);
      setTools(mappedTools);
      setFocusOptions(buildFocusOptions(recResult.data as DBRecLogic[]));
      setError(null);
      console.log('[DataContext] Loaded', toolsResult.data.length, 'tools and', recResult.data.length, 'recommendation rows.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[DataContext] fetchAll error:', msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // Subscribe to realtime changes on both tables
    const channel = supabase
      .channel('xen-data-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
        console.log('[DataContext] Realtime: tools changed, refetching…');
        fetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recommendation_logic' }, () => {
        console.log('[DataContext] Realtime: recommendation_logic changed, refetching…');
        fetchAll();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const questions = useMemo(() => buildQuestions(focusOptions), [focusOptions]);

  const getOutcomesForFocus = useCallback(
    (focusValue: string): OutcomeOption[] => {
      const focus = focusOptions.find((f) => f.value === focusValue);
      return focus ? focus.outcomes : [];
    },
    [focusOptions]
  );

  const getRecommendations = useCallback(
    (focusValue: string, outcomeValue: string): Tool[] => {
      const focus = focusOptions.find((f) => f.value === focusValue);
      if (!focus) return [];
      const outcome = focus.outcomes.find((o) => o.value === outcomeValue);
      if (!outcome) return [];
      return outcome.recommendations
        .map((id) => tools.find((t) => t.id === id))
        .filter((t): t is Tool => !!t);
    },
    [focusOptions, tools]
  );

  const value: DataContextValue = {
    tools,
    questions,
    focusOptions,
    getOutcomesForFocus,
    getRecommendations,
    isLoading,
    error,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
