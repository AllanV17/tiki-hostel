import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

/** Match whole path segments, after removing the deployment prefix. */
export function getNotFoundPaths(pathname: string, base: string) {
	const prefix = base.replace(/\/+$/, '');
	const path = pathname === prefix ? '/' : pathname.startsWith(prefix + '/')
		? pathname.slice(prefix.length) : '/';
	const english = path === '/en' || path.startsWith('/en/');
	const spanishPath = english ? path.slice(3) || '/' : path;
	return { language: english ? 'en' : 'es', es: prefix + spanishPath, en: prefix + '/en' + spanishPath };
}

function prepareNotFound(doc: Document, url: URL) {
	const root = doc.querySelector<HTMLElement>('[data-not-found]');
	if (!root) return;
	const paths = getNotFoundPaths(url.pathname, import.meta.env.BASE_URL);
	let view = root.querySelector<HTMLElement>('[data-not-found-view]');
	const template = root.querySelector<HTMLTemplateElement>('[data-not-found-english]');
	if (paths.language === 'en' && view?.dataset.language !== 'en' && template) {
		view?.replaceWith(template.content.cloneNode(true));
		view = root.querySelector<HTMLElement>('[data-not-found-view]');
	}
	if (!view) return;
	doc.documentElement.lang = paths.language;
	doc.title = view.dataset.title ?? doc.title;
	const description = view.dataset.description ?? '';
	for (const name of ['description', 'og:description']) {
		doc.querySelector(`meta[${name.startsWith('og:') ? 'property' : 'name'}="${name}"]`)?.setAttribute('content', description);
	}
	doc.querySelector('meta[property="og:title"]')?.setAttribute('content', doc.title);
	doc.querySelector('meta[property="og:locale"]')?.setAttribute('content', paths.language === 'en' ? 'en_US' : 'es_NI');
	doc.querySelector('meta[property="og:locale:alternate"]')?.setAttribute('content', paths.language === 'en' ? 'es_NI' : 'en_US');
	const skip = doc.querySelector('.skip-link');
	if (skip) skip.textContent = view.dataset.skipLabel ?? skip.textContent;
	for (const link of root.querySelectorAll<HTMLAnchorElement>('[data-language-choice]')) {
		const language = link.dataset.languageChoice === 'en' ? 'en' : 'es';
		link.setAttribute('href', paths[language] + url.search + url.hash);
	}
}

// Registered on all pages so an incoming 404 is localized before ClientRouter swaps it in.
document.addEventListener('astro:before-swap', (event) => {
	const transition = event as TransitionBeforeSwapEvent;
	prepareNotFound(transition.newDocument, transition.to);
});
prepareNotFound(document, new URL(window.location.href));
