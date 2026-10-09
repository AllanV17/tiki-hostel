export function initCarousels() {
	document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
		const track = root.querySelector<HTMLElement>('[data-carousel-track]');
		const slides = [...root.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
		const steps = [...root.querySelectorAll<HTMLElement>('[data-carousel-step]')];
		const previous = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
		const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
		const count = root.querySelector<HTMLElement>('[data-carousel-count]');
		if (!track || !slides.length || !previous || !next || !count) return;

		let activeIndex = 0;
		let frame = 0;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

		function setActive(index: number) {
			activeIndex = Math.max(0, Math.min(index, slides.length - 1));
			slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeIndex));
			steps.forEach((step, i) => step.classList.toggle('is-active', i === activeIndex));
			previous!.disabled = activeIndex === 0;
			next!.disabled = activeIndex === slides.length - 1;
			count!.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
			count!.setAttribute('aria-label', `${count!.dataset.position} ${activeIndex + 1} ${count!.dataset.of} ${slides.length}`);
		}

		function syncFromScroll() {
			const left = track!.getBoundingClientRect().left;
			const index = slides.reduce((closest, slide, i) =>
				Math.abs(slide.getBoundingClientRect().left - left) <
				Math.abs(slides[closest].getBoundingClientRect().left - left) ? i : closest, 0);
			setActive(index);
		}

		function goTo(index: number) {
			const target = Math.max(0, Math.min(index, slides.length - 1));
			track!.scrollTo({ left: slides[target].offsetLeft, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
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
		new ResizeObserver(() => track.scrollTo({ left: slides[activeIndex].offsetLeft, behavior: 'instant' })).observe(track);
		setActive(0);
	});
}
