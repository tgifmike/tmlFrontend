# Backend additions for automatic location time zones

The frontend now treats time zones as an automatic location property by default. It sends `locationTimeZoneMode: "AUTO"` when creating a location and supports an explicit `"MANUAL"` override in location settings.

## 1. Persist IANA time-zone IDs and selection mode

Add or migrate these location fields:

- `locationTimeZone`: IANA zone ID, for example `America/New_York` (up to 64 characters).
- `locationTimeZoneMode`: enum/string with `AUTO` and `MANUAL`; default `AUTO`.

Do not store fixed-offset labels such as `Eastern Time (GMT-5)`. IANA zones apply the correct daylight-saving rules for the date being processed.

## 2. Add a coordinate-to-time-zone resolver

After the existing address geocoder produces latitude and longitude, resolve those coordinates to an IANA zone ID. This can use the time-zone feature of the existing geocoding provider or a separate coordinate-to-time-zone provider.

The resolver should:

- Accept latitude and longitude.
- Return an IANA zone ID.
- Validate the returned ID with the platform time-zone database (for Java, `ZoneId.of(id)`).
- Have explicit timeout and error handling.
- Avoid guessing a zone from state or fixed UTC offset.

## 3. Update create-location behavior

Expected request:

```json
{
  "locationName": "Downtown",
  "locationStreet": "123 Main St",
  "locationTown": "Knoxville",
  "locationState": "TN",
  "locationZipCode": "37902",
  "locationTimeZoneMode": "AUTO"
}
```

When mode is `AUTO` or omitted:

1. Geocode the address using the existing process.
2. Resolve the resulting coordinates to an IANA time zone.
3. Save the coordinates, geocoding fallback status, zone ID, and `AUTO` mode in the same transaction.
4. Return all four values in the location response.

The create request must no longer require `locationTimeZone` when mode is `AUTO`.

## 4. Update partial location-update behavior

The existing update endpoint should support these rules:

- If any address field changes and the saved mode is `AUTO`, geocode the complete resulting address and resolve the time zone again.
- If `locationTimeZoneMode` changes to `AUTO`, re-resolve the time zone from the saved coordinates (or geocode again if coordinates are missing).
- If mode is `MANUAL`, require and validate `locationTimeZone`; preserve it when the address changes.
- If a request changes the manual zone while the saved mode is already `MANUAL`, accept the zone even when the mode field is omitted from the PATCH.
- Preserve omitted fields. Do not replace them with `null` during a partial update.

Manual override request:

```json
{
  "locationTimeZoneMode": "MANUAL",
  "locationTimeZone": "America/Chicago"
}
```

Return-to-automatic request:

```json
{
  "locationTimeZoneMode": "AUTO"
}
```

## 5. Return the new fields in every location DTO

Location list, location-access, create, and update responses must include:

```json
{
  "locationTimeZone": "America/New_York",
  "locationTimeZoneMode": "AUTO",
  "locationLatitude": 35.9606,
  "locationLongitude": -83.9207,
  "geocodedFromZipFallback": false
}
```

This applies particularly to the endpoints currently used by the frontend:

- `POST /locations/{accountId}/createLocation`
- `PATCH /locations/{locationId}/updateLocation`
- `GET /locations/accounts/{accountId}/locations`
- `GET /user-access-locations/{userId}/locations`

## 6. Handle resolution failures explicitly

Recommended behavior:

- If the full address fails but ZIP fallback succeeds, resolve the time zone from the fallback coordinates and keep `geocodedFromZipFallback: true` so the manager is prompted to verify it.
- If no usable coordinates or zone can be resolved in `AUTO` mode, return a validation/service error such as HTTP 422 or 503. Do not silently use the server’s time zone.
- Keep the update transactional so an address does not save with stale coordinates or a stale automatic time zone.

## 7. Migrate existing locations

Backfill existing records to valid IANA IDs. Preferred migration:

1. Set mode to `AUTO`.
2. Resolve from the stored coordinates.
3. Re-geocode records with missing or invalid coordinates.

Temporary legacy mappings can cover existing values:

- `Eastern Time (GMT-5)` → `America/New_York`
- `Central Time (GMT-6)` → `America/Chicago`
- `Mountain Time (GMT-7)` → `America/Denver`
- `Pacific Time (GMT-8)` → `America/Los_Angeles`
- `Alaska Time (GMT-9)` → `America/Anchorage`
- `Hawaii-Aleutian Time (GMT-10)` → `Pacific/Honolulu`

Coordinate resolution should replace these broad mappings because Arizona and some boundary regions require different zone IDs.

## 8. Audit and test the behavior

Add location-history entries when the zone or mode changes. Test at least:

- Creation in each major US zone.
- Arizona and Hawaii daylight-saving behavior.
- A location near a time-zone boundary.
- Full-address and ZIP-fallback geocoding.
- Address change in `AUTO` mode.
- Address change in `MANUAL` mode.
- Switching from `MANUAL` back to `AUTO`.
- Invalid IANA IDs and provider failures.
- Existing-location migration.

No separate frontend-facing “resolve time zone” endpoint is required for this implementation; resolution can remain inside the existing create and update operations.
