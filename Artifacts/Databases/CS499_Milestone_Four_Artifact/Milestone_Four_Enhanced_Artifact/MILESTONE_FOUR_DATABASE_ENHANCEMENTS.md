# Milestone Four: Database Enhancement

This version builds on the Milestone Three artifact and strengthens MongoDB/Mongoose design, data integrity, query performance, and security.

## Major changes
- Converted trip length and price to numeric database types while preserving the existing API display format.
- Enforced a unique, normalized trip code and added schema-level length, range, format, and required-field validation.
- Added timestamps and compound indexes for common resort/date, name/date, and price queries.
- Added bounded server-side pagination, search, resort filtering, and price filtering.
- Used field projection, `lean()` reads, and `countDocuments()` to reduce query overhead.
- Added duplicate-key handling and consistent database error responses.
- Strengthened user records with normalized email validation and non-selected password hash/salt fields.
- Increased PBKDF2 iterations and used timing-safe password comparison.
- Added database model tests covering normalization, type conversion, and invalid records.

## Compatibility
The API continues returning trip length as "N days" and price as a two-decimal string so the existing Angular interface remains compatible.
