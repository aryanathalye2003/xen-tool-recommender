import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string | null;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) return null;
  const Icon = (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[name];
  return Icon ? <Icon {...props} /> : null;
}
