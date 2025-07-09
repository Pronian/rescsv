import { assertStrictEquals } from '@std/assert';
import { ResEntry } from './resEntry.ts';

Deno.test('resEntry.toString()', () => {
	const entry1 = new ResEntry('key1', 'value1');
	assertStrictEquals(entry1.toString(), 'key1=value1');

	const entry2 = new ResEntry('key2', 'value2', 'en_US');
	assertStrictEquals(entry2.toString(), 'key2=value2');
});

Deno.test('default entry locale', () => {
	const entry1 = new ResEntry('key1', 'value1');
	assertStrictEquals(entry1.locale, 'default');
});

Deno.test('entry regular expression', () => {
	const entry1 = new ResEntry('key1', 'value1');
	assertStrictEquals(entry1.keyEntryRE.source, '^key1=.*$');
});
