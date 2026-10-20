import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanupCarousels, initCarousels } from '../src/scripts/carousel.ts';

test('carousel cleanup cancels instance work and permits safe reinitialization', () => {
	const timers = new Map();
	const frames = new Map();
	const observers = [];
	let id = 0;
	const globals = {
		window: { matchMedia: () => ({ matches: false }), setTimeout: (fn) => { timers.set(++id, fn); return id; } },
		clearTimeout: (key) => timers.delete(key),
		requestAnimationFrame: (fn) => { frames.set(++id, fn); return id; },
		cancelAnimationFrame: (key) => frames.delete(key),
		ResizeObserver: class {
			constructor(callback) { this.callback = callback; observers.push(this); }
			observe() {}
			disconnect() { this.disconnected = true; }
		},
	};
	const node = (properties = {}) => Object.assign(new EventTarget(), {
		dataset: {},
		classList: { contains: () => false, toggle() {} },
		setAttribute(name, value) { this[name] = value; },
	}, properties);
	const carousel = () => {
		const track = node({
			clientWidth: 100, scrollWidth: 400, scrollLeft: 0, calls: [],
			scrollTo(options) { this.calls.push(options); this.scrollLeft = options.left; },
			getBoundingClientRect: () => ({ left: 0 }),
		});
		const slides = Array.from({ length: 4 }, (_, index) => node({
			offsetLeft: index * 100, clientWidth: 100,
			getBoundingClientRect: () => ({ left: index * 100 - track.scrollLeft }),
		}));
		const previous = node();
		const next = node();
		const progress = node({ dataset: { position: 'Image', of: 'of' } });
		const elements = {
			'[data-carousel-track]': track, '[data-carousel-previous]': previous,
			'[data-carousel-next]': next, '[data-carousel-steps]': progress,
		};
		const root = node({
			isConnected: true,
			classList: { contains: (name) => name === 'carousel--spaces' },
			querySelector: (selector) => elements[selector],
			querySelectorAll: (selector) => selector === '[data-carousel-slide]' ? slides : slides.map(() => node()),
		});
		return { root, track, next, previous, progress };
	};
	const instances = [carousel(), carousel()];
	globals.document = { querySelectorAll: () => instances.map(({ root }) => root) };
	const originals = Object.fromEntries(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
	Object.assign(globalThis, globals);
	try {
		initCarousels();
		initCarousels();
		assert.equal(observers.length, 2);
		instances[0].next.dispatchEvent(new Event('click'));
		assert.equal(instances[0].track.scrollLeft, 100);
		assert.equal(instances[1].track.scrollLeft, 0);
		instances.forEach(({ track }, index) => {
			track.clientWidth = 90;
			observers[index].callback();
			track.dispatchEvent(new Event('scroll'));
		});
		assert.equal(timers.size, 2);
		assert.equal(frames.size, 2);
		const staleCallbacks = [...timers.values(), ...frames.values(), ...observers.map((observer) => observer.callback)];
		cleanupCarousels();
		cleanupCarousels();
		assert.equal(timers.size, 0);
		assert.equal(frames.size, 0);
		assert.ok(observers.every((observer) => observer.disconnected));
		const calls = instances.map(({ track }) => track.calls.length);
		instances.forEach(({ root, track, next }) => {
			assert.equal(root.dataset.carouselInitialized, undefined);
			root.isConnected = false;
			next.dispatchEvent(new Event('click'));
			track.dispatchEvent(new Event('scroll'));
			track.dispatchEvent(new Event('scrollend'));
		});
		staleCallbacks.forEach((callback) => callback());
		assert.deepEqual(instances.map(({ track }) => track.calls.length), calls);
		assert.equal(frames.size, 0);
		instances.forEach(({ root }) => { root.isConnected = true; });
		initCarousels();
		assert.equal(observers.length, 4);
		staleCallbacks.forEach((callback) => callback());
		assert.deepEqual(instances.map(({ track }) => track.calls.length), calls);
		assert.equal(timers.size, 0);
		assert.equal(frames.size, 0);
		instances[0].next.dispatchEvent(new Event('click'));
		assert.equal(instances[0].track.calls.length, calls[0] + 1);
		observers[2].callback();
		assert.equal(instances[0].progress['aria-label'], 'Image 2 of 4');
		assert.equal(instances[0].previous.disabled, false);
		instances[0].track.clientWidth = 80;
		observers[2].callback();
		assert.equal(timers.size, 1);
		for (const [key, callback] of timers) {
			timers.delete(key);
			callback();
		}
		assert.equal(instances[0].track.scrollLeft, 100);
		assert.equal(instances[0].progress['aria-label'], 'Image 2 of 4');
	} finally {
		cleanupCarousels();
		for (const [key, descriptor] of Object.entries(originals)) {
			if (descriptor) Object.defineProperty(globalThis, key, descriptor);
			else delete globalThis[key];
		}
	}
});
