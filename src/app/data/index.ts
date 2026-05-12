export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  teamSize: string;
  tags: Record<string, number>;
  categoryColor: string;
  useCases: string[];
  figJamLink?: string;
  downloadLink?: string;
}

export interface BlankOption {
  value: string;
  label: string;
  tags: Record<string, number>;
}

export interface Blank {
  id: string;
  placeholder: string;
  options: BlankOption[];
}

export interface Question {
  id: string;
  sentenceParts: string[];
  blanks: Blank[];
  hint: string;
}