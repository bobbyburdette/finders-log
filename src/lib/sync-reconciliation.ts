type IdentifiedRow = {
  id: string;
};

type NamedRow = {
  category: string;
  name: string;
};

type ExistingNamedRow = IdentifiedRow & NamedRow;

export function getStaleIds(existingRows: IdentifiedRow[], incomingRows: IdentifiedRow[]) {
  const incomingIds = new Set(incomingRows.map((row) => row.id));
  return existingRows.map((row) => row.id).filter((id) => !incomingIds.has(id));
}

export function getNamedRowKey(row: NamedRow) {
  return `${row.category}:${row.name.trim().toLocaleLowerCase()}`;
}

export function reconcileNamedRows<T extends NamedRow>(existingRows: ExistingNamedRow[], incomingRows: T[]) {
  const existingKeys = new Set(existingRows.map(getNamedRowKey));
  const incomingKeys = new Set(incomingRows.map(getNamedRowKey));

  return {
    rowsToInsert: incomingRows.filter((row) => !existingKeys.has(getNamedRowKey(row))),
    idsToDelete: existingRows.filter((row) => !incomingKeys.has(getNamedRowKey(row))).map((row) => row.id)
  };
}
