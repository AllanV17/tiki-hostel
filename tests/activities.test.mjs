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
		assert.equal(spaces.length, 4);
		assert.equal(spaces.filter(([, attributes]) => /aria-hidden="true"/.test(attributes)).length, 0);
		assert.equal(spaces.filter(([, , inner]) => /<img\b/.test(inner)).length, 4, 'activity cards and Maderas have photographs');
		assert.equal((main.match(/<img\b/g) || []).length, 14, 'hero, three activity cards, Maderas and nine gallery photographs');
		const maderas = main.match(/<section\b[^>]*aria-labelledby="sleepover-title"[\s\S]*?<\/section>/)[0];
		const copy = JSON.parse(readFileSync(new URL(`../src/i18n/${language}.json`, import.meta.url), 'utf8')).activities.sleepover;
		for (const text of Object.values(copy)) assert.ok(maderas.includes(text));
		assert.match(maderas, /src="[^"]*volcan-maderas-laguna-crater-vista-aerea[^\"]*\.webp"/);
		assert.match(maderas, /srcset="[^"]+"/);
		assert.match(maderas, /sizes="[^"]+"/);
		assert.match(maderas, /loading="lazy"/);
		assert.doesNotMatch(maderas, /camping|pernocta|nocturn|overnight/i);
		const gallery = main.match(/<section\b[^>]*aria-labelledby="activities-gallery-title"[\s\S]*?<\/section>/)[0];
		const photos = [...gallery.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
		assert.equal(photos.length, 9);
		const names = ['kayak-grupo', 'cascada-arcoiris', 'senderista-crater', 'terraza-atardecer', 'exterior-madera', 'viajera-portatil', 'viajera-scooter', 'senderistas-laguna', 'volcan-atardecer'];
		photos.forEach((tag, index) => {
			assert.match(tag, new RegExp(`momentos-${names[index]}`));
			assert.match(tag, /alt="[^"]+"/);
			assert.match(tag, /loading="lazy"/);
			assert.match(tag, /srcset="[^"]+"/);
			assert.match(tag, /sizes="[^"]+"/);
			assert.match(tag, /width="\d+"/);
			assert.match(tag, /height="\d+"/);
		});
		assert.match(photos[3], /width="720"[^>]*height="1280"|height="1280"[^>]*width="720"/);
		assert.match(photos[5], /width="1200"[^>]*height="1600"|height="1600"[^>]*width="1200"/);
		assert.match(photos[5], language === 'es' ? /alt="Persona usando un portátil/ : /alt="Person using a laptop/);
		assert.match(gallery, /role="progressbar"[^>]*aria-valuenow="0"/);
		assert.match(gallery, /tabindex="0"/);
		assert.equal((gallery.match(/<button\b[^>]*aria-label="[^"]+"/g) || []).length, 2);
		assert.doesNotMatch(main, /data-carousel|data-link-placeholder|por confirmar|provisional|coming soon|to be confirmed/i);
		assert.match(main, new RegExp(`href="/tiki-hostel/${prefix}contacto/"`));
	});
}
