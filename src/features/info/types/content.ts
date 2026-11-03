export interface ContentLink {
  label: string;
  href: string;
}
export interface GuideSection {
  id: string;
  title: string;
  paragraphs: string[];
  checklist?: string[];
  example?: { before: string; after: string; reason: string };
}
export interface GuideArticle {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  category: string;
  sections: GuideSection[];
  related: string[];
}
export interface StoreRequirement {
  id: string;
  title: string;
  format: string;
  sizes: string[];
  count: string;
  notes: string[];
  presetIds: string[];
  source: ContentLink;
}
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  link: ContentLink;
}
export interface WorkflowStep {
  title: string;
  instruction: string;
  check: string;
}
