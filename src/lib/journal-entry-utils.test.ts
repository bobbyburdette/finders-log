import assert from "node:assert/strict";
import test from "node:test";
import { compareJournalEntriesByDate, getLocalDateInputValue } from "./journal-entry-utils.ts";

test("formats a date for an HTML date input without shifting the local calendar day", () => {
  const date = new Date("2026-06-18T16:30:00-04:00");
  assert.equal(getLocalDateInputValue(date), "2026-06-18");
});

test("sorts entries by session day and then creation time", () => {
  const earlier = { date: "2026-06-18", createdAt: "2026-06-18T13:00:00.000Z" };
  const later = { date: "", createdAt: "2026-06-18T15:00:00.000Z" };

  assert.ok(compareJournalEntriesByDate(earlier, later) < 0);
  assert.ok(compareJournalEntriesByDate(later, earlier) > 0);
});
