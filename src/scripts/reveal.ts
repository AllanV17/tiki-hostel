export function initScrollReveals(root: ParentNode = document) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

	const elements = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
	let observer: IntersectionObserver | undefined;

	try {
		observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.remove('is-reveal-pending');
				entry.target.classList.add('is-revealed');
				observer!.unobserve(entry.target);
			}
		}, { rootMargin: '0px 0px -32px 0px', threshold: 0.08 });

		for (const element of elements) {
			if (element.classList.contains('is-revealed') || element.classList.contains('is-reveal-pending')) continue;
			const { top, bottom } = element.getBoundingClientRect();
			if (top < window.innerHeight && bottom > 0) {
				element.classList.add('is-revealed');
				continue;
			}
			observer.observe(element);
			element.classList.add('is-reveal-pending');
		}
	} catch {
		observer?.disconnect();
		elements.forEach((element) => element.classList.remove('is-reveal-pending'));
	}
}
