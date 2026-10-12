export function initCarousels() {
	document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
		const track = root.querySelector<HTMLElement>('[data-carousel-track]');
		const slides = [...root.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
		const steps = [...root.querySelectorAll<HTMLElement>('[data-carousel-step]')];
		const previous = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
		const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
		const progress = root.querySelector<HTMLElement>('[data-carousel-steps]');
		if (!track || !slides.length || !previous || !next || !progress) return;

		let activeIndex = 0;
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
			if (spaces && (track!.clientWidth !== trackWidth || aligning)) return;
			const left = track!.getBoundingClientRect().left + (centered ? track!.clientWidth / 2 : 0);
			const slideLeft = (slide: HTMLElement) => slide.getBoundingClientRect().left + (centered ? slide.clientWidth / 2 : 0);
			const index = slides.reduce((closest, slide, i) =>
				Math.abs(slideLeft(slide) - left) <
				Math.abs(slideLeft(slides[closest]) - left) ? i : closest, 0);
			setActive(index);
		}

		function goTo(index: number) {
			const target = Math.max(0, Math.min(index, lastIndex()));
			track!.scrollTo({ left: scrollLeftFor(slides[target]), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
		}

		previous.addEventListener('click', () => goTo(activeIndex - 1));
		next.addEventListener('click', () => goTo(activeIndex + 1));
		root.addEventListener('keydown', (event) => {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
			event.preventDefault();
			goTo(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
		});
		track.addEventListener('scroll', () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(syncFromScroll);
		}, { passive: true });
		track.addEventListener('scrollend', syncFromScroll);
		new ResizeObserver(() => {
			if (spaces && track.clientWidth !== trackWidth) {
				if (!aligning) resizeIndex = activeIndex;
				aligning = true;
				clearTimeout(resizeTimer);
				// Responsive widths can pass through intermediate layouts before settling.
				resizeTimer = window.setTimeout(() => {
					setActive(resizeIndex);
					track.scrollTo({ left: scrollLeftFor(slides[activeIndex]), behavior: 'instant' });
					trackWidth = track.clientWidth;
					aligning = false;
				}, 80);
				return;
			}
			track.scrollTo({ left: scrollLeftFor(slides[activeIndex]), behavior: 'instant' });
		}).observe(track);
		setActive(0);
	});
}
