import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string | null;
}

const ICON_NAME_ALIASES: Record<string, string> = {
  BarChart2: 'ChartBar',
  Grid2x2: 'Grid2X2',
  UserCircle: 'CircleUser',
};

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) return null;

  const primaryName = name;
  const fallbackName = ICON_NAME_ALIASES[name];
  const Icon = (LucideIcons as any)[primaryName] ?? (fallbackName ? (LucideIcons as any)[fallbackName] : undefined);

  console.log('[DynamicIcon] resolve', { primaryName, fallbackName, resolved: !!Icon });

  return Icon ? <Icon {...props} /> : null;
}
