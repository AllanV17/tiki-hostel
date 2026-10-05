import { defaultLanguage, type Language } from './index';
import { withBase } from '../utils/withBase';

// Spanish routes are canonical; English mirrors each page under /en/.
const pagePaths = {
	home: '/',
	hostel: '/hostal/',
	activities: '/actividades/',
	contact: '/contacto/',
} as const;

export type Page = keyof typeof pagePaths;

export function getLocalizedPath(page: Page, language: Language): `/${string}` {
	const path = pagePaths[page];
	return language === defaultLanguage ? path : `/en${path}`;
}

export function getLocalizedHref(page: Page, language: Language): string {
	return withBase(getLocalizedPath(page, language));
}

/** Keep language switches on the equivalent page, including Astro's base path. */
export function getEquivalentHref(page: Page, language: Language): string {
	return getLocalizedHref(
		page,
		language === defaultLanguage ? 'en' : defaultLanguage,
	);
}
