export type WidgetType = 'ai' | 'embed' | 'utility';
export type InputType = 'text' | 'url' | 'none';

export interface Widget {
  id: string;
  widget_id: string;
  name: string;
  type: WidgetType;
  endpoint: string;
  input_type: InputType;
  enabled: boolean;
  position: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}
