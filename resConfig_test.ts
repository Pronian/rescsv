import { assertEquals } from '@std/assert';
import { parseResFileName, resFileNameFromIdAndLocale, sortLocaleColumns } from './resConfig.ts';

Deno.test('parseResFileName', () => {
	assertEquals(parseResFileName('fileId_en_US.properties'), {
		fileId: 'fileId',
		locale: 'en_US',
	});
	assertEquals(parseResFileName('fileId_de.properties'), {
		fileId: 'fileId',
		locale: 'de',
	});
	assertEquals(parseResFileName('fileId.properties'), {
		fileId: 'fileId',
		locale: 'default',
	});
});

Deno.test('resFileNameFromIdAndLocale', () => {
	assertEquals(
		resFileNameFromIdAndLocale('fileId', 'en_US'),
		'fileId_en_US.properties',
	);
	assertEquals(
		resFileNameFromIdAndLocale('fileId', 'de'),
		'fileId_de.properties',
	);
	assertEquals(
		resFileNameFromIdAndLocale('fileId', 'default'),
		'fileId.properties',
	);
	assertEquals(
		resFileNameFromIdAndLocale('account', 'fr'),
		'account_fr.properties',
	);
	assertEquals(
		resFileNameFromIdAndLocale('account', 'fr_CA'),
		'account_fr_CA.properties',
	);
	assertEquals(
		resFileNameFromIdAndLocale('test', 'it_IT'),
		'test_it_IT.properties',
	);
});

Deno.test('sortLocaleColumns', () => {
	assertEquals(
		sortLocaleColumns(['jp', 'en_US', 'default', 'fr_CA', 'en', 'fr_FR', 'en_GB', 'fr', 'key']),
		[
			'key',
			'default',
			'en',
			'en_GB',
			'en_US',
			'fr',
			'fr_CA',
			'fr_FR',
			'jp',
		],
	);
});
