let cleanup: (() => void) | undefined;

export function cleanupActivitiesGallery() {
	cleanup?.();
	cleanup = undefined;
}

export function initActivitiesGallery() {
	cleanupActivitiesGallery();
	const root = document.querySelector<HTMLElement>('[data-moments]');
	if (!root) return;
	const track = root.querySelector<HTMLElement>('.moments__track')!;
	const photos = [...track.querySelectorAll<HTMLImageElement>('img')];
	const previous = root.querySelector<HTMLButtonElement>('[data-moments-previous]')!;
	const next = root.querySelector<HTMLButtonElement>('[data-moments-next]')!;
	const progress = root.querySelector<HTMLElement>('[role="progressbar"]')!;
	const fill = root.querySelector<HTMLElement>('.carousel__progress-fill')!;
	const listeners = new AbortController();
	const { signal } = listeners;
	let requested: number | null = null;
	const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

	function sync() {
		const max = maxScroll();
		const left = Math.max(0, Math.min(track.scrollLeft, max));
		const fraction = max <= 1 ? 1 : left >= max - 1 ? 1 : left / max;
		fill.style.transform = `scaleX(${fraction})`;
		progress.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
		previous.disabled = left <= 1;
		next.disabled = left >= max - 1;
	}

	function goTo(target: number) {
		requested = target;
		track.scrollTo({
			left: target,
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
		});
	}

	function move(direction: number) {
		const max = maxScroll();
		const stops = [...new Set([0, ...photos.map((photo) => Math.min(photo.offsetLeft, max)), max])].sort((a, b) => a - b);
		const current = requested ?? track.scrollLeft;
		const target = direction > 0
			? stops.find((stop) => stop > current + 1) ?? max
			: stops.reverse().find((stop) => stop < current - 1) ?? 0;
		goTo(target);
	}

	previous.addEventListener('click', () => move(-1), { signal });
	next.addEventListener('click', () => move(1), { signal });
	root.addEventListener('keydown', (event) => {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		if (event.key === 'Home') goTo(0);
		else if (event.key === 'End') goTo(maxScroll());
		else move(event.key === 'ArrowRight' ? 1 : -1);
	}, { signal });
	const cancelRequest = () => { requested = null; };
	track.addEventListener('pointerdown', cancelRequest, { signal });
	track.addEventListener('wheel', cancelRequest, { passive: true, signal });
	track.addEventListener('scroll', sync, { passive: true, signal });
	track.addEventListener('scrollend', () => { requested = null; sync(); }, { signal });
	const observer = new ResizeObserver(() => { requested = null; sync(); });
	observer.observe(track);
	cleanup = () => { listeners.abort(); observer.disconnect(); };
	sync();
}
