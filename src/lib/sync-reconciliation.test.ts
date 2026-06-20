import assert from "node:assert/strict";
import test from "node:test";
import { getStaleIds, reconcileNamedRows } from "./sync-reconciliation.ts";

test("finds stale IDs only after comparing a complete incoming set", () => {
  assert.deepEqual(
    getStaleIds([{ id: "keep" }, { id: "remove" }], [{ id: "keep" }, { id: "new" }]),
    ["remove"]
  );
});

test("diffs wishlist rows without replacing unchanged rows", () => {
  const result = reconcileNamedRows(
    [
      { id: "one", category: "spirits", name: "Eagle Rare" },
      { id: "two", category: "cigar", name: "Padron 1964" }
    ],
    [
      { category: "spirits", name: " eagle rare " },
      { category: "pipe", name: "Nightcap" }
    ]
  );

  assert.deepEqual(result.rowsToInsert, [{ category: "pipe", name: "Nightcap" }]);
  assert.deepEqual(result.idsToDelete, ["two"]);
});
