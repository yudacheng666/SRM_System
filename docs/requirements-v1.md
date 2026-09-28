# Lightweight SRM V1 Product Requirements

## 1. Goal

Build a lightweight SRM workflow tool. The first stage is a local offline web application used to validate the product model and operating workflow. After validation, the architecture may be migrated to a server-based multi-user deployment.

V1 focuses on RFQ and quotation management rather than recreating ERP functionality.

## 2. Scope

### In scope
- supplier master data
- item master data
- historical purchase data import
- RFQ creation and tracking
- bulk import of inquiry items
- item-to-supplier assignment
- supplier-specific RFQ document generation
- quotation import and normalization
- quotation comparison and supplier selection
- historical price and supplier relationship accumulation
- local backup and restore

### Out of scope for V1
- supplier portal/login
- accounting and payment
- inventory and warehouse management
- complex approval workflows
- auctions
- contract management
- advanced optimization
- OCR/AI ingestion beyond later extensions
- direct ERP API integration

Initial ERP exchange may use Excel files.

## 3. RFQ model

Use an independent RFQ number as the primary workflow identifier, for example:

`RFQ-YYYYMMDD-001`

An RFQ does not require a project. Optional fields may include:
- title
- project/equipment reference
- request reference
- requested response date
- notes

Main workflow:

```text
Create RFQ
→ Import inquiry items
→ Build candidate supplier pool
→ Assign suppliers to items
→ Run coverage check
→ Preview supplier RFQs
→ Generate supplier-specific RFQ files
→ Import returned quotations
→ Normalize quotation data
→ Compare quotations
→ Select supplier
→ Accumulate history
```

The business model does not impose a fixed maximum number of inquiry items.

## 4. Item–supplier assignment

Items and suppliers form a many-to-many relationship.

Two primary interaction modes are required:

### Item-first
Select one or many items, then add one or many suppliers.

### Supplier-first
Select a supplier, then add one or many items.

Assignment actions are additive by default. Adding Supplier C must not overwrite existing Supplier A or Supplier B assignments.

For batch selection, use three states:
- unchecked: no selected items are assigned
- partial: some selected items are assigned
- checked: all selected items are assigned

Partial state actions should allow:
- add supplier to remaining items
- remove supplier from already assigned items
- inspect affected items

Batch operations should report how many relationships were added or removed and should support undo where practical.

## 5. Candidate supplier pool

An RFQ should use a candidate supplier pool instead of forcing users to operate against the complete supplier master list.

Candidate suppliers may be suggested from:
- historical purchases for the item
- historical quotations for the item
- suppliers associated with the same item category
- supplier product/category capabilities
- manual additions

Recommendations assist the buyer; they do not automatically make the final assignment.

## 6. Item categories

Support simple item categories, such as category and subcategory.

Categories are primarily used for:
- filtering
- batch selection
- supplier recommendation

Categories are advisory rather than hard eligibility rules.

## 7. Coverage check

Before generating supplier RFQs, show coverage information such as:
- total inquiry items
- items assigned to at least one supplier
- items assigned to only one supplier
- unassigned items

Coverage is informational, not a blocking validation rule.

Users may generate RFQ files even when coverage is below 100%. Only assigned items are included. Unassigned items remain in the RFQ for later assignment and supplemental generation.

## 8. Supplier-specific RFQ generation

Generate one RFQ file per supplier based on the assignment result.

Before generation, show a preview with each supplier and the number of assigned items.

Generated RFQ files should include:
- RFQ number
- supplier identifier/name
- RFQ date
- requested response date
- item code
- item name
- specification
- quantity
- unit

Supplier response fields may include:
- unit price
- lead time
- MOQ
- brand
- model
- technical notes

Each RFQ line should include a stable internal line identifier to support reliable quotation re-import.

## 9. Quotation import

V1 prioritizes Excel quotation import.

Different supplier spreadsheets may use different columns and layouts, so provide an import mapping workflow. Mapping profiles may be saved and reused.

Example mapping:

```text
Part No. → Item Code
Quote → Unit Price
Minimum Order → MOQ
Delivery → Lead Time
```

Keep both:
- original imported values
- normalized values

Normalization must not destroy the source quotation data.

## 10. Quotation comparison

Core comparison dimensions:
- price
- lead time
- MOQ

Automatically expose:
- lowest quotation
- second-lowest quotation
- previous purchase price, when available

Allow selection of a non-lowest-price supplier, but require a reason.

Comparison should support:
- line-level supplier selection
- quick selection of one supplier for all applicable lines
- supplier quotation coverage
- no-quote / partial-quote / cannot-supply states

V1 does not require quantity splitting across multiple suppliers for the same item.

## 11. Historical accumulation

Continuously retain:
- historical purchase prices
- historical quotations
- historical suppliers by item
- historical RFQ assignments
- prior supplier selections

The accumulated data should improve future candidate supplier suggestions.

A later enhancement may allow copying supplier assignments from a previous RFQ.

## 12. Supplier evaluation and analytics

Supplier scoring and dashboards are not blockers for the V1 core workflow.

Future extensions may include:
- price performance
- quality performance
- delivery performance
- service evaluation
- supplier spend
- price trends
- price increase/decrease analysis
- single-source items
- multi-source items
- supplier price spread

Data structures may reserve room for these features without expanding V1 scope.

## 13. Main work areas

V1 should remain compact:

1. RFQ List
2. Inquiry Item List
3. Assignment Center
4. RFQ Generation
5. Quotation Import & Comparison
6. Supplier / Item Master Data
7. Data Management

A complex dashboard is not required for V1.

## 14. Local-first architecture

Initial version:
- offline HTML/CSS/JavaScript
- IndexedDB
- offline Excel import/export
- full backup and restore
- no network dependency for normal use

Keep UI, business logic, and data access separated so that a later server version can replace IndexedDB with an API and database without rewriting the product rules.

## 15. Product principles

1. Keep V1 focused on RFQ → assignment → generation → quotation → comparison → history.
2. Do not duplicate complete ERP functionality.
3. RFQ number is the primary workflow identifier; project linkage is optional.
4. Optimize interaction for long item lists and many suppliers.
5. Many-to-many assignment is additive by default and never silently overwrites existing assignments.
6. Supplier recommendations assist users rather than make decisions automatically.
7. Coverage is a warning/inspection mechanism, not a hard gate.
8. Matrices are mainly for checking and comparison, not the primary editing interface for very large datasets.
9. Preserve source quotation data alongside normalized data.
10. Prefer simple, auditable workflows over feature breadth.

## 16. Public repository rule

All examples, fixtures, screenshots, documents, comments, and test data in this repository must be fictional or anonymized. No real organization, person, customer, supplier, product, project, price, quantity, system/vendor identity, or internal operating statistic may be committed.
