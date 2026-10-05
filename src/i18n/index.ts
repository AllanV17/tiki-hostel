import es from './es.json';
import en from './en.json';

export const supportedLanguages = ['es', 'en'] as const;
export type Language = (typeof supportedLanguages)[number];
export const defaultLanguage: Language = 'es';
// Spanish defines the content shape; TypeScript checks the English dictionary against it.
export type SiteContent = typeof es;

const content = { es, en } satisfies Record<Language, SiteContent>;

export function getContent(language: Language): SiteContent {
	return content[language];
}
