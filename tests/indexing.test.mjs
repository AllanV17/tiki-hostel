import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import config from '../astro.config.mjs';

const root = new URL('../', import.meta.url);
const routes = ['/', '/hostal/', '/actividades/', '/contacto/', '/en/', '/en/hostal/', '/en/actividades/', '/en/contacto/'];
const robots = /<meta\b[^>]*\bname="robots"[^>]*>/g;
const metadata = /<link\b[^>]*\brel="(?:canonical|alternate)"[^>]*>/g;

function build(value) {
	const env = { ...process.env };
	if (value === undefined) delete env.PUBLIC_ALLOW_INDEXING;
	else env.PUBLIC_ALLOW_INDEXING = value;
	const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
		cwd: root, env, encoding: 'utf8', timeout: 120_000,
	});
	assert.equal(result.status, 0, result.error?.message ?? result.stdout + result.stderr);
	const pages = routes.map(route => readFileSync(new URL(`dist${route}index.html`, root), 'utf8'));
	const absolute = path => new URL(config.base.replace(/\/$/, '') + path, config.site).href;
	const locations = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
	const index = readFileSync(new URL('dist/sitemap-index.xml', root), 'utf8');
	assert.deepEqual(locations(index), [absolute('/sitemap-0.xml')]);
	const sitemap = readFileSync(new URL('dist/sitemap-0.xml', root), 'utf8');
	const urls = locations(sitemap);
	assert.equal(urls.length, 8);
	assert.equal(new Set(urls).size, 8);
	assert.deepEqual(urls.toSorted(), routes.map(absolute).toSorted());
	assert.deepEqual(urls.toSorted(), pages.map(html => html.match(/<link rel="canonical" href="([^"]+)"/)[1]).toSorted());
	assert.doesNotMatch(sitemap, /<(?:lastmod|priority|changefreq)\b/);
	for (const [index, html] of pages.entries()) {
		const route = routes[index];
		const english = route.startsWith('/en/');
		const location = english ? 'Ometepe Island, Rivas, Nicaragua' : 'Isla de Ometepe, Rivas, Nicaragua';
		assert.equal(html.match(/<p class="site-footer__location">([^<]+)<\/p>/)[1], location, route);
		if (route === '/' || route === '/en/') {
			assert.equal(html.match(/<p class="eyebrow">([^<]+)<\/p>/)[1], `${location}.`, route);
			assert.ok(html.match(/<meta name="description" content="([^"]*)"/)[1].includes(location), route);
			assert.doesNotMatch(html.match(/<meta name="description" content="([^"]*)"/)[1], /santa\s+cruz/i);
		}
		if (route === '/contacto/' || route === '/en/contacto/') {
			const section = html.match(/<section\b[^>]*id="ubicacion"[^>]*>([\s\S]*?)<\/section>/)[1];
			assert.ok(section.includes(`${location}.`), route);
			assert.doesNotMatch(section, /santa\s+cruz/i);
			assert.doesNotMatch(html.match(/<meta name="description" content="([^"]*)"/)[1], /santa\s+cruz/i);
		}
		const social = [...html.matchAll(/<meta\b[^>]*property="(og:[^"]+)"[^>]*content="([^"]*)"[^>]*>/g)];
		assert.equal(social.length, 7, route);
		assert.deepEqual(Object.fromEntries(social.map(match => [match[1], match[2]])), {
			'og:type': 'website',
			'og:title': html.match(/<title>([^<]+)<\/title>/)[1],
			'og:description': html.match(/<meta name="description" content="([^"]*)"/)[1],
			'og:url': html.match(/<link rel="canonical" href="([^"]+)"/)[1],
			'og:locale': english ? 'en_US' : 'es_NI',
			'og:locale:alternate': english ? 'es_NI' : 'en_US',
			'og:site_name': 'Tiki Hostel Ometepe',
		}, route);
		assert.doesNotMatch(html, /<(?:meta|link)\b[^>]*(?:og:image|twitter:)/);
	}
	return pages;
}

test('static ES/EN pages and sitemap work in both indexing modes and finish protected', () => {
	let indexable;
	try {
		indexable = build('true');
		for (const html of indexable) {
			assert.equal([...html.matchAll(robots)].length, 0);
			assert.doesNotMatch(html, /noindex/i);
		}
	} finally {
		const provisional = build();
		for (const [index, html] of provisional.entries()) {
			const route = routes[index];
			assert.deepEqual([...html.matchAll(robots)].map(match => match[0]), ['<meta name="robots" content="noindex, follow">'], route);
			const esRoute = route.replace(/^\/en\//, '/');
			const absolute = path => new URL(config.base.replace(/\/$/, '') + path, config.site).href;
			assert.deepEqual([...html.matchAll(metadata)].map(match => match[0]), [
				`<link rel="canonical" href="${absolute(route)}">`,
				`<link rel="alternate" hreflang="es" href="${absolute(esRoute)}">`,
				`<link rel="alternate" hreflang="en" href="${absolute('/en' + esRoute)}">`,
				`<link rel="alternate" hreflang="x-default" href="${absolute(esRoute)}">`,
			], route);
			if (indexable) assert.equal(html.replace(robots, ''), indexable[index], `Only robots changes: ${route}`);
		}
		assert.equal(existsSync(new URL('dist/robots.txt', root)), false);
	}
});
