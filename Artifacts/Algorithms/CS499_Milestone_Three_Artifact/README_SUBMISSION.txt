CS 499 Milestone Three: Algorithms and Data Structures
Student: Jason Bogart
Artifact: Travlr Getaways Full-Stack Application

FOLDER CONTENTS
- Original_Artifact: Original CS 465 project.
- Milestone_Two_Enhanced_Artifact: Software design/engineering version submitted for Milestone Two.
- Enhanced_Artifact: Milestone Three version that builds on Milestone Two.

MILESTONE THREE ENHANCEMENTS
1. Added app_admin/src/app/utils/trip-algorithms.ts.
2. Added case-insensitive partial searching across trip name, code, and resort.
3. Added resort, minimum-price, and maximum-price filters.
4. Added stable merge sort for name, price, start date, and trip length.
5. Added a Set-based unique resort index.
6. Added pagination and page-count algorithms.
7. Combined searching and filtering into a single O(n) traversal.
8. Preserved source arrays instead of mutating service data.
9. Added trackBy logic to reduce unnecessary Angular DOM rendering.
10. Added Jasmine unit tests for search, filtering, sorting, indexing, and pagination.

COMPLEXITY SUMMARY
- Search/filter pipeline: O(n)
- Unique resort collection: O(n), followed by O(r log r) sorting
- Stable merge sort: O(n log n) time and O(n) auxiliary space
- Pagination: O(k), where k is the page size

KEY FILES
- app_admin/src/app/utils/trip-algorithms.ts
- app_admin/src/app/utils/trip-algorithms.spec.ts
- app_admin/src/app/trip-listing/trip-listing.component.ts
- app_admin/src/app/trip-listing/trip-listing.component.html
- app_admin/src/app/trip-listing/trip-listing.component.css
