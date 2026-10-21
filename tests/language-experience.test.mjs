import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/components/LanguageExperience.astro', import.meta.url), 'utf8');
const script = ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)[1], {
	compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ mobile = false, primary = 'en-US', localChoice, sessionChoice, blockLocal = false, suggestLanguage = true } = {}) {
	const writes = [];
	const preferenceKey = 'tiki-hostel:language-preference';
	const document = new EventTarget();
	const window = Object.assign(new EventTarget(), {
		matchMedia: () => ({ matches: mobile }),
		setTimeout() {},
		requestAnimationFrame(callback) { callback(); },
	});
	const element = (properties = {}) => Object.assign(new EventTarget(), {
		dataset: {},
		focus() { document.activeElement = this; },
		setAttribute() {},
	}, properties);
	const storage = (choice, blocked, name) => {
		const values = new Map(choice ? [[preferenceKey, choice]] : []);
		return {
			getItem(key) { if (blocked) throw new Error('Storage blocked'); return values.get(key) ?? null; },
			setItem(key, value) { if (blocked) throw new Error('Storage blocked'); writes.push([name, key, value]); values.set(key, value); },
			removeItem(key) { if (blocked) throw new Error('Storage blocked'); values.delete(key); },
		};
	};
	const localStorage = storage(localChoice, blockLocal, 'local');
	const sessionStorage = storage(sessionChoice, false, 'session');
	let page;
	function makePage(language = 'es') {
		const english = element({ dataset: { languageChoice: 'en' }, hasAttribute: () => true });
		const spanish = element({ dataset: { languageChoice: 'es' }, hasAttribute: () => true });
		const dialog = element({
			open: false,
			showModal() { this.open = true; },
			close() { this.open = false; },
			querySelector: () => english,
		});
		const toast = element({ hidden: true, dataset: { message: 'Confirmation' } });
		const trigger = element();
		const mobileTrigger = element();
		const menu = element({ hidden: true });
		const switcher = element({ querySelector: (selector) => selector === '[data-language-trigger]' ? trigger : menu });
		const root = element({
			dataset: { language, suggestLanguage: suggestLanguage ? undefined : 'false' },
			querySelector: (selector) => selector === '[data-language-dialog]' ? dialog : toast,
		});
		return { root, dialog, toast, trigger, mobileTrigger, switcher, english, spanish };
	}
	page = makePage();
	document.querySelector = (selector) => ({
		'[data-language-experience]': page.root,
		'[data-language-switcher]': page.switcher,
		'[data-mobile-nav-trigger]': page.mobileTrigger,
	})[selector];
	document.querySelectorAll = () => [page.english, page.spanish];
	vm.runInNewContext(script, {
		document, window, localStorage, sessionStorage, navigator: { languages: [primary] }, AbortController,
	});
	return {
		get page() { return page; }, document, writes, localStorage, sessionStorage,
		visit(language = 'es') { page = makePage(language); document.dispatchEvent(new Event('astro:page-load')); return page; },
		restore() { window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true })); },
	};
}

for (const mobile of [false, true]) {
	test(`Escape closes the prompt without storing a choice (${mobile ? 'mobile' : 'desktop'})`, () => {
		const app = setup({ mobile });
		assert.equal(app.page.dialog.open, true);
		assert.equal(app.document.activeElement, app.page.english);
		const key = Object.assign(new Event('keydown', { cancelable: true }), { key: 'Escape' });
		app.page.dialog.dispatchEvent(key);
		assert.equal(key.defaultPrevented, false);
		app.page.dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
		assert.equal(app.page.dialog.open, false);
		assert.equal(app.document.activeElement, mobile ? app.page.mobileTrigger : app.page.trigger);
		app.restore();
		assert.equal(app.page.dialog.open, false);
		app.visit();
		app.restore();
		assert.equal(app.page.dialog.open, false);
		assert.deepEqual(app.writes, []);
		assert.equal(setup({ mobile }).page.dialog.open, true, 'a new document can suggest the language again');
	});
}

test('existing language conditions and saved preferences still suppress the prompt', () => {
	assert.equal(setup({ primary: 'es-NI' }).page.dialog.open, false);
	assert.equal(setup({ localChoice: 'es' }).page.dialog.open, false);
	assert.equal(setup({ localChoice: 'en' }).page.dialog.open, false);
	assert.equal(setup({ blockLocal: true, sessionChoice: 'es' }).page.dialog.open, false);
});

test('404 pages keep the language picker without opening the browser-language prompt', () => {
	const app = setup({ suggestLanguage: false });
	assert.equal(app.page.dialog.open, false);
	app.page.english.dispatchEvent(new Event('click', { cancelable: true }));
	assert.equal(app.localStorage.getItem('tiki-hostel:language-preference'), 'en');
});

for (const choice of ['es', 'en']) {
	test(`choosing ${choice} retains preference storage and confirmation`, () => {
		const app = setup();
		const event = new Event('click', { cancelable: true });
		(choice === 'es' ? app.page.spanish : app.page.english).dispatchEvent(event);
		assert.equal(app.page.dialog.open, false);
		assert.equal(app.localStorage.getItem('tiki-hostel:language-preference'), choice);
		assert.equal(event.defaultPrevented, choice === 'es');
		if (choice === 'es') {
			assert.equal(app.document.activeElement, app.page.trigger);
			assert.equal(app.page.toast.hidden, false);
		} else {
			app.visit('en');
			assert.equal(app.page.toast.hidden, false);
		}
		assert.equal(app.page.dialog.open, false);
	});
}

test('choosing a language keeps the session fallback when local storage is blocked', () => {
	const app = setup({ blockLocal: true });
	app.page.spanish.dispatchEvent(new Event('click', { cancelable: true }));
	assert.equal(app.sessionStorage.getItem('tiki-hostel:language-preference'), 'es');
	assert.equal(app.page.dialog.open, false);
});
