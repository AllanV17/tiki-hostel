const carouselCleanups = new Set<() => void>();

export function cleanupCarousels() {
	carouselCleanups.forEach((cleanup) => cleanup());
	carouselCleanups.clear();
}

export function initCarousels() {
	document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
		if (root.dataset.carouselInitialized) return;
		const track = root.querySelector<HTMLElement>('[data-carousel-track]');
		const slides = [...root.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
		const steps = [...root.querySelectorAll<HTMLElement>('[data-carousel-step]')];
		const previous = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
		const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
		const progress = root.querySelector<HTMLElement>('[data-carousel-steps]');
		if (!track || !slides.length || !previous || !next || !progress) return;
		root.dataset.carouselInitialized = 'true';
		const listeners = new AbortController();
		const { signal } = listeners;

		let activeIndex = 0;
		let requestedIndex: number | null = null;
		let frame = 0;
		let trackWidth = track.clientWidth;
		let aligning = false;
		let resizeTimer = 0;
		let resizeIndex = 0;
		const centered = root.classList.contains('carousel--rooms-first');
		const spaces = root.classList.contains('carousel--spaces');
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const scrollLeftFor = (slide: HTMLElement) => slide.offsetLeft - (centered ? (track.clientWidth - slide.clientWidth) / 2 : 0);
		const lastIndex = () => spaces
			? slides.reduce((last, slide, i) => scrollLeftFor(slide) <= track.scrollWidth - track.clientWidth + 1 ? i : last, 0)
			: slides.length - 1;

		function setActive(index: number) {
			const last = lastIndex();
			activeIndex = Math.max(0, Math.min(index, last));
			const visibleIndex = spaces && last < slides.length - 1 ? activeIndex + 1 : activeIndex;
			slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeIndex));
			steps.forEach((step, i) => step.classList.toggle('is-active', i === visibleIndex));
			previous!.disabled = activeIndex === 0;
			next!.disabled = activeIndex === last;
			progress!.setAttribute('aria-label', `${progress!.dataset.position} ${visibleIndex + 1} ${progress!.dataset.of} ${slides.length}`);
		}

		function syncFromScroll() {
			if (signal.aborted || !root.isConnected) return;
			if (spaces && (track!.clientWidth !== trackWidth || aligning)) return;
			const left = track!.getBoundingClientRect().left + (centered ? track!.clientWidth / 2 : 0);
			const slideLeft = (slide: HTMLElement) => slide.getBoundingClientRect().left + (centered ? slide.clientWidth / 2 : 0);
			const index = slides.reduce((closest, slide, i) =>
				Math.abs(slideLeft(slide) - left) <
				Math.abs(slideLeft(slides[closest]) - left) ? i : closest, 0);
			if (index !== activeIndex) setActive(index);
		}

		function goTo(index: number) {
			const target = Math.max(0, Math.min(index, lastIndex()));
			requestedIndex = target;
			track!.scrollTo({ left: scrollLeftFor(slides[target]), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
		}

		previous.addEventListener('click', () => goTo((requestedIndex ?? activeIndex) - 1), { signal });
		next.addEventListener('click', () => goTo((requestedIndex ?? activeIndex) + 1), { signal });
		root.addEventListener('keydown', (event) => {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
			event.preventDefault();
			goTo((requestedIndex ?? activeIndex) + (event.key === 'ArrowRight' ? 1 : -1));
		}, { signal });
		track.addEventListener('pointerdown', () => {
			requestedIndex = null;
		}, { signal });
		track.addEventListener('wheel', () => {
			requestedIndex = null;
		}, { passive: true, signal });
		track.addEventListener('scroll', () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(syncFromScroll);
		}, { passive: true, signal });
		track.addEventListener('scrollend', () => {
			if (spaces && (track.clientWidth !== trackWidth || aligning)) return;
			syncFromScroll();
			if (requestedIndex !== null) {
				// A snap stop can end a long smooth scroll before its requested slide.
				if (activeIndex === requestedIndex) requestedIndex = null;
				else goTo(requestedIndex);
			}
		}, { signal });
		const resizeObserver = new ResizeObserver(() => {
			if (signal.aborted || !root.isConnected) return;
			if (spaces && track.clientWidth !== trackWidth) {
				if (!aligning) resizeIndex = requestedIndex ?? activeIndex;
				aligning = true;
				clearTimeout(resizeTimer);
				// Responsive widths can pass through intermediate layouts before settling.
				resizeTimer = window.setTimeout(() => {
					if (signal.aborted || !root.isConnected) return;
					setActive(resizeIndex);
					track.scrollTo({ left: scrollLeftFor(slides[activeIndex]), behavior: 'instant' });
					requestedIndex = null;
					trackWidth = track.clientWidth;
					aligning = false;
				}, 80);
				return;
			}
			const index = requestedIndex ?? activeIndex;
			track.scrollTo({ left: scrollLeftFor(slides[index]), behavior: 'instant' });
			setActive(index);
			requestedIndex = null;
		});
		resizeObserver.observe(track);
		carouselCleanups.add(() => {
			listeners.abort();
			resizeObserver.disconnect();
			clearTimeout(resizeTimer);
			cancelAnimationFrame(frame);
			delete root.dataset.carouselInitialized;
		});
		setActive(0);
	});
}
