# CS 499 Milestone Two: Software Design and Engineering Enhancement

## Artifact
Travlr Getaways full-stack application originally created in CS 465.

## Enhanced files
- `app_api/controllers/trips.js`
- `app_api/helpers/trip-validator.js` (new reusable validation module)
- `app_api/routes/index.js`
- `app_admin/src/app/services/trip-data.service.ts`
- `app_admin/src/app/trip-listing/trip-listing.component.ts`
- `app_admin/src/app/add-trip/add-trip.component.ts`
- `app_admin/src/app/delete-trip/delete-trip.component.ts`

## Improvements
- Replaced incomplete callback-based CRUD handlers with consistent async/await logic.
- Added complete success and error responses using appropriate HTTP status codes.
- Added server-side trip validation and normalization in a reusable helper.
- Added duplicate trip-code conflict checking.
- Removed duplicated `image` assignments and unreachable/debugging statements.
- Protected the user endpoint with JWT authentication.
- Centralized Angular authorization-header creation and API error handling.
- Added typed Angular HTTP calls, encoded route values, and user-facing error states.
- Improved component access modifiers, initialization, naming, and form validation.
- Removed unused imports and development-only console statements.

## Scope note
Database-schema changes and advanced sorting/filtering are intentionally reserved for later CS 499 milestones so this submission remains focused on software design and engineering.
