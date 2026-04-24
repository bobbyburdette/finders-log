# API Contract Draft

## Principles

- Every request is authenticated as a single user.
- Every record is user-scoped.
- The client should never build storage keys or persistence rules directly.
- Search, favorites, sorting, and entitlements should be server-compatible from day one.

## Auth

### `POST /api/auth/session`
Create or refresh a session.

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Bobby"
  },
  "subscription": {
    "status": "active",
    "plan": "pro"
  }
}
```

## Journal Entries

### `GET /api/entries`

Query params:

- `category`
- `search`
- `sort`
- `favorite`
- `limit`
- `cursor`

Response:

```json
{
  "items": [],
  "nextCursor": null
}
```

### `POST /api/entries`

Request:

```json
{
  "category": "pipe",
  "title": "Peterson Nightcap",
  "entryDate": "2026-04-22",
  "timeOfDay": "Evening",
  "location": "Back porch",
  "tags": ["English", "Cool weather"],
  "overallThoughts": "Rich and smoky",
  "quickNotes": "Worth revisiting",
  "suggestedScore": 8.6,
  "finalScore": null,
  "useFinalOverride": false,
  "detail": {}
}
```

### `PATCH /api/entries/:id`
Update entry fields.

### `DELETE /api/entries/:id`
Delete an entry.

### `POST /api/entries/:id/favorite`
Toggle or set favorite state.

## Collection

### `GET /api/collection`

Query params:

- `category`
- `search`

### `POST /api/collection`
Create a collection item.

### `PATCH /api/collection/:id`
Update a collection item.

### `DELETE /api/collection/:id`
Delete a collection item.

## Wishlist

### `GET /api/wishlist`

Query params:

- `category`
- `fulfilled`

### `POST /api/wishlist`
Create a wishlist item.

### `PATCH /api/wishlist/:id`
Update a wishlist item.

### `POST /api/wishlist/:id/fulfill`
Mark a wishlist item fulfilled.

### `DELETE /api/wishlist/:id`
Delete a wishlist item.

## Billing

### `GET /api/billing/summary`
Return current plan, status, renewal date, and entitlement flags.

### `POST /api/billing/checkout`
Create a Stripe checkout session.

### `POST /api/billing/portal`
Create a Stripe billing portal session.

## Validation Rules

- Entry category must be one of `pipe`, `cigar`, `whiskey`
- Collection category must be one of `pipe`, `tin`, `cigar`, `bottle`, `lighter`
- Every write endpoint validates payload shape server-side
- Scores must be between `0.0` and `10.0`
- Wishlist priority must be between `1` and `5`

## Migration Guidance

The current prototype can continue using local storage, but its client-side structures should map to:

- `journal_entry.detail`
- `collection_item.detail`
- `wishlist_item`

That means the UI can migrate incrementally without a full redesign.
