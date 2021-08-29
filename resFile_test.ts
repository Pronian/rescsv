import { assertStrictEquals } from "https://deno.land/std@0.105.0/testing/asserts.ts";
import { ResEntry } from "./resEntry.ts";
import { ResFile } from "./resFile.ts";

const testRead = new ResFile("origin.properties", [
  new ResEntry("name", "Test Name"),
  new ResEntry("second", "2"),
  new ResEntry("foo", "bar"),
  new ResEntry("last", "With {0} Placeholder"),
]);
const writeFile = new ResFile("origin.properties");
const empty = new ResFile("origin.properties");

Deno.test("get present value", () => {
  assertStrictEquals(testRead.getValue("foo"), "bar");
});

Deno.test("get missing value", () => {
  assertStrictEquals(testRead.getValue("missing"), "");
});

Deno.test("check has key", () => {
  assertStrictEquals(testRead.hasKey("foo"), true);
  assertStrictEquals(testRead.hasKey("missing"), false);
});

Deno.test("setEntry using empty file", () => {
  assertStrictEquals(writeFile.length, 0);

  writeFile.setEntry(new ResEntry("key1", "value1"));
  assertStrictEquals(writeFile.getValue("key1"), "value1");

  writeFile.setEntry(new ResEntry("key2", "value2"));
  assertStrictEquals(writeFile.getValue("key2"), "value2");

  assertStrictEquals(writeFile.length, 2);
});

Deno.test("setEntry on existing key", () => {
  assertStrictEquals(writeFile.length, 2);

  assertStrictEquals(writeFile.getValue("key1"), "value1");
  writeFile.setEntry(new ResEntry("key1", "new value"));
  assertStrictEquals(writeFile.getValue("key1"), "new value");

  assertStrictEquals(writeFile.length, 2);
});

Deno.test("toString on empty file", () => {
  assertStrictEquals(empty.toString(), "");
});

Deno.test("toString on populated file", () => {
  assertStrictEquals(
    testRead.toString(),
    `name=Test Name
second=2
foo=bar
last=With {0} Placeholder
`,
  );
});

Deno.test("parseFile", () => {
  const strInput = `name=Test Name
second=2
empty=
ph=With {0} Placeholder
with.dot=Key with dot!`;

  const parsed = ResFile.parseFile("origin.properties", strInput, "origin");

  assertStrictEquals(parsed.length, 4); // empty is not reflected
  assertStrictEquals(parsed.getValue("name"), "Test Name");
  assertStrictEquals(parsed.getValue("second"), "2");
  assertStrictEquals(parsed.getValue("ph"), "With {0} Placeholder");
  assertStrictEquals(parsed.getValue("with.dot"), "Key with dot!");
});

Deno.test("getEntriesDiff", () => {
  const newTestRead = new ResFile("origin.properties", [
    new ResEntry("new.key.first", "New Value 1"),
    new ResEntry("name", "Test Name"),
    new ResEntry("second", "two"),
    new ResEntry("newKey", "New Value"),
    new ResEntry("foo", "bar"),
    new ResEntry("last", "With {0} Placeholder"),
    new ResEntry("new.key.last", "New Value at the end"),
  ]);

  const diff = ResFile.getEntriesDiff(testRead, newTestRead);

  assertStrictEquals(diff.length, 3);
  assertStrictEquals(diff.getValue("new.key.first"), "New Value 1");
  assertStrictEquals(diff.getValue("newKey"), "New Value");
  assertStrictEquals(diff.getValue("new.key.last"), "New Value at the end");
});

Deno.test("getUpdatedEntries", () => {
  const newTestRead = new ResFile("origin.properties", [
    new ResEntry("new.key.first", "New Value 1"),
    new ResEntry("name", "Test Name"),
    new ResEntry("second", "two"),
    new ResEntry("newKey", "New Value"),
    new ResEntry("foo", "bar"),
    new ResEntry("last", ""),
  ]);

  const diff = ResFile.getUpdatedEntries(testRead, newTestRead);

  assertStrictEquals(diff.length, 2);
  assertStrictEquals(diff.getValue("second"), "two");
  assertStrictEquals(diff.getValue("last"), "");
});
