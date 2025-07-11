import { assertStrictEquals } from '@std/assert';
import { ResCollection } from './resCollection.ts';
import { ResEntry } from './resEntry.ts';
import { ResFile } from './resFile.ts';

const testFile1 = new ResFile('origin', [
	new ResEntry('key', 'value'),
	new ResEntry('second', '2'),
	new ResEntry('tr', 'three or 3'),
]);

const testFile2 = new ResFile('origin_so_SO.properties', [
	new ResEntry('key.son', 'val, son'),
	new ResEntry('second', '22'),
]);

const testFile3 = new ResFile('origin_kr.properties', [
	new ResEntry('kra.kra.kra', 'V V V V V'),
	new ResEntry('second', '23'),
	new ResEntry('tr', 'trio, oi'),
]);

Deno.test('ResCollection.toLabeled2DArray', () => {
	const col = new ResCollection(
		'origin',
		new Map().set('origin.properties', testFile1),
	);
	col.add(testFile2);
	col.add(testFile3);

	const res = col.toLabeled2DArray().map((i) => i.join(','));
	assertStrictEquals(res.length, 6);
	assertStrictEquals(res[0], 'key,default,kr,so_SO');
	assertStrictEquals(res[1], 'origin:key,value,,');
	assertStrictEquals(res[2], 'origin:second,2,23,22');
	assertStrictEquals(res[3], 'origin:tr,three or 3,trio, oi,');
	assertStrictEquals(res[4], 'origin:key.son,,,val, son');
	assertStrictEquals(res[5], 'origin:kra.kra.kra,,V V V V V,');
});

Deno.test('ResCollection.fromLabeled2DArray', () => {
	const dataArray = [
		['key', 'default', 'en_IE', 'tr'],
		['file1:first', '1', '2', '3'],
		['file1:second', '', 'oh too', 'oh three'],
		['file2:tr', 'three or 3', '', 'trio, oi'],
	];

	const collection = ResCollection.fromLabeled2DArray('origin', dataArray);

	assertStrictEquals(collection.name, 'origin');
	assertStrictEquals(
		collection.get('file1.properties')?.toString(),
		'first=1\n',
	);
	assertStrictEquals(
		collection.get('file1_en_IE.properties')?.toString(),
		'first=2\nsecond=oh too\n',
	);
	assertStrictEquals(
		collection.get('file1_tr.properties')?.toString(),
		'first=3\nsecond=oh three\n',
	);
	assertStrictEquals(
		collection.get('file2.properties')?.toString(),
		'tr=three or 3\n',
	);
	assertStrictEquals(
		collection.get('file2_en_IE.properties')?.toString(),
		'',
	);
	assertStrictEquals(
		collection.get('file2_tr.properties')?.toString(),
		'tr=trio, oi\n',
	);
});
