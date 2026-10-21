import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/scripts/not-found.ts', import.meta.url), 'utf8');
const script = ts.transpileModule(source.replace('import.meta.env.BASE_URL', "'/tiki-hostel/'"), {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
vm.runInNewContext(script, {
	exports, URL,
	document: { querySelector: () => null, addEventListener() {} },
	window: { location: { href: 'https://example.test/tiki-hostel/' } },
});

test('404 language selection respects the deployment base and whole en segment', () => {
	for (const base of ['/tiki-hostel', '/tiki-hostel/', '/', '']) {
		const prefix = base.replace(/\/+$/, '');
		for (const [path, language, spanish] of [
			['/missing/deep/', 'es', '/missing/deep/'],
			['/en/missing/deep/', 'en', '/missing/deep/'],
			['/english/missing', 'es', '/english/missing'],
			['/enough/', 'es', '/enough/'],
			['/missing/en/', 'es', '/missing/en/'],
			['/en', 'en', '/'],
		]) {
			const result = exports.getNotFoundPaths(prefix + path, base);
			assert.equal(result.language, language);
			assert.equal(result.es, prefix + spanish);
			assert.equal(result.en, prefix + '/en' + spanish);
		}
	}
	assert.equal(exports.getNotFoundPaths('/tiki-hostel-other/en/missing', '/tiki-hostel').language, 'es');
});
