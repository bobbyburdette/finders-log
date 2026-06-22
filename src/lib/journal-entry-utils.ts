export type DatedJournalEntry = {
  date: string;
  createdAt: string;
};

export function getLocalDateInputValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function compareJournalEntriesByDate(left: DatedJournalEntry, right: DatedJournalEntry) {
  const leftDate = left.date || left.createdAt.slice(0, 10);
  const rightDate = right.date || right.createdAt.slice(0, 10);
  const dateComparison = leftDate.localeCompare(rightDate);

  return dateComparison || left.createdAt.localeCompare(right.createdAt);
}
