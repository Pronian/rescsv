import { assertStrictEquals } from "std/testing/asserts.ts";
import { ResCollection } from "./resCollection.ts";
import { ResEntry } from "./resEntry.ts";
import { ResFile } from "./resFile.ts";

const testFile1 = new ResFile("origin_1", [
  new ResEntry("key", "value"),
  new ResEntry("second", "2"),
  new ResEntry("tr", "three or 3"),
]);

const testFile2 = new ResFile("origin_2", [
  new ResEntry("key.son", "val, son"),
  new ResEntry("second", "22"),
]);

const testFile3 = new ResFile("origin_3", [
  new ResEntry("kra.kra.kra", "V V V V V"),
  new ResEntry("second", "23"),
  new ResEntry("tr", "trio, oi"),
]);

Deno.test("ResCollection.fromLabeled2DArray", () => {
  const dataArray = [
    ["key", "origin_1", "origin_2", "origin_3"],
    ["first", "1", "2", "3"],
    ["second", "", "oh too", "oh three"],
    ["tr", "three or 3", "", "trio, oi"],
  ];

  const collection = ResCollection.fromLabeled2DArray("origin", dataArray);

  assertStrictEquals(collection.name, "origin");
  assertStrictEquals(
    collection.get("origin_1")?.toString(),
    "first=1\ntr=three or 3\n",
  );
  assertStrictEquals(
    collection.get("origin_2")?.toString(),
    "first=2\nsecond=oh too\n",
  );
  assertStrictEquals(
    collection.get("origin_3")?.toString(),
    "first=3\nsecond=oh three\ntr=trio, oi\n",
  );
});

Deno.test("ResCollection.toLabeled2DArray", () => {
  const col = new ResCollection("origin", new Map().set("origin_1", testFile1));
  col.add(testFile2);
  col.add(testFile3);

  const res = col.toLabeled2DArray().map((i) => i.join(","));
  assertStrictEquals(res.length, 6);
  assertStrictEquals(res[0], "key,origin_1,origin_2,origin_3");
  assertStrictEquals(res[1], "key,value,,");
  assertStrictEquals(res[2], "second,2,22,23");
  assertStrictEquals(res[3], "tr,three or 3,,trio, oi");
  assertStrictEquals(res[4], "key.son,,val, son,");
  assertStrictEquals(res[5], "kra.kra.kra,,,V V V V V");
});
