import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

for (const language of ['es', 'en']) {
	test(`activities ${language}: editorial structure, decorative spaces and localized contact`, () => {
		const prefix = language === 'en' ? 'en/' : '';
		const html = readFileSync(new URL(`../dist/${prefix}actividades/index.html`, import.meta.url), 'utf8');
		const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
		const sectionTitles = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map((match) => match[1]);
		assert.deepEqual(sectionTitles, ['activities-title', 'activities-routes-title', 'sleepover-title', 'activities-gallery-title', 'activities-contact-title']);
		assert.equal((main.match(/<h1\b/g) || []).length, 1);
		assert.equal((main.match(/<h2\b/g) || []).length, 4);
		assert.equal((main.match(/<h3\b/g) || []).length, 3);
		assert.equal((main.match(/<article\b/g) || []).length, 3);
		const spaces = [...main.matchAll(/<div class="activity-image-placeholder[^\"]*"([^>]*)>([\s\S]*?)<\/div>/g)];
		assert.equal(spaces.length, 7);
		for (const [, attributes, inner] of spaces) {
			assert.match(attributes, /aria-hidden="true"/);
			assert.equal(inner.trim(), '');
		}
		assert.equal((main.match(/<img\b/g) || []).length, 1, 'only the existing hero has a photograph');
		assert.doesNotMatch(main, /data-carousel|data-link-placeholder|por confirmar|provisional|coming soon|to be confirmed/i);
		assert.match(main, new RegExp(`href="/tiki-hostel/${prefix}contacto/"`));
	});
}
