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
- flexible creation of inquiry items through file import, manual entry, and clipboard batch paste
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

All checkbox-style list selection in the product should support Shift range selection when a contiguous range is meaningful. This applies consistently across item lists, supplier selection lists, and other similar batch-selection lists rather than being implemented only on one screen.

### Supplier-first
Select a supplier, then add one or many items.

Assignment actions are additive by default. Adding Supplier C must not overwrite existing Supplier A or Supplier B assignments.

For batch selection, use three states:
- unchecked: no selected items are assigned
- partial: some selected items are assigned
- checked: all selected items are assigned

Partial state actions should allow:
- add the supplier to the selected items that are not yet related
- remove the supplier from selected items that are already related
- inspect affected items

Use direct, explicit action labels such as:
- "Add this supplier to selected items"
- "Remove this supplier from selected items"

In supplier-first mode, the checkbox is the relationship state itself:
- checked = this item is assigned to the active supplier
- unchecked = this item is not assigned to the active supplier

Toggling the checkbox changes the relationship directly. Do not use a separate temporary-selection checkbox followed by another "add selected items" action, because that creates a misleading second state.

Long checkbox lists should support reliable Shift range selection. The implementation must preserve a stable item anchor across re-rendering so that Shift selection does not depend on transient DOM checkbox indexes.

To reduce repetitive assignment work while preserving supplier-specific differences, supplier-first mode should support:
- copying another supplier's assigned-item scope as a starting point
- adding or removing only the differences afterward
- bulk-linking or bulk-unlinking the current filtered result when appropriate

Batch operations should report how many relationships were added or removed and should support undo where practical.

## 5. Candidate supplier pool

An RFQ should use a buyer-managed candidate supplier pool instead of forcing users to operate against the complete supplier master list.

Supplier-first assignment must show only suppliers already added to the current RFQ. The buyer explicitly adds suppliers from supplier master data into the RFQ supplier pool.

Supplier search should support fuzzy matching by supplier name and supplier code rather than requiring an exact string.

The buyer must be able to remove a supplier from the current RFQ supplier pool. If that supplier already has item assignments, the system must clearly warn how many relationships will be removed and require confirmation before removing them.

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

Before generation, provide a supplier-specific RFQ preview. The user must be able to switch between suppliers and inspect the exact item lines that each supplier will receive, including RFQ header information and supplier-response columns. A supplier-count summary alone is not sufficient.

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

For each item, select the lowest valid quotation by default. This is only the initial system selection and remains editable by the buyer.

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
- quotation round / negotiation round
- historical quotations by item and supplier
- historical suppliers by item
- historical RFQ assignments
- prior supplier selections

The system must support querying the complete quotation history for a specific item-supplier pair across RFQs and negotiation rounds, including quotation date, price, MOQ, lead time, and related RFQ.

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


## 17. Negotiation rounds and OA comparison report

The quotation model must retain negotiation history instead of overwriting the previous quotation.

At minimum, the workflow must support:
- initial quotation / round 1
- second negotiation quotation / round 2
- later rounds as an extensible data structure

A negotiation round may result in no price reduction. The supplier may keep the same price, and that outcome is valid as long as the round is recorded.

For every item-supplier quotation series, retain each round separately and calculate, when applicable:
- previous-round price
- current-round price
- reduction amount
- reduction percentage
- whether the price changed
- quotation / negotiation date
- notes or negotiation result

The system must generate a comparison report suitable for submission into an external OA approval process.

The comparison report should include, at minimum:
- RFQ identification
- inquiry items
- participating suppliers
- each supplier's quotation by negotiation round
- previous purchase price when available
- price change between rounds
- reduction amount and reduction percentage
- lead time
- MOQ
- final selected supplier
- non-lowest-price selection reason when applicable
- items or suppliers that did not reduce price in the second negotiation round

The OA report is an export artifact. Direct OA API integration is not required for V1 unless separately specified.

## 18. Future item drawing integration

Plan a later extension for item drawings and technical-document preview.

The item model should be able to reference one or more drawing/document files.

In the assignment interface, the buyer should be able to select an item and open an embedded preview without leaving the SRM page. This preview is intended to help the buyer judge which suppliers are appropriate for the item.

Initial browser-preview targets should prioritize formats that can be reliably displayed in an offline HTML application, such as PDF and common image formats. Native CAD formats may require later conversion or a dedicated viewer and should not block V1.

The drawing-preview feature is a future enhancement and is not part of the current M0 acceptance scope.


## 19. Current-RFQ item list interaction

The RFQ item-list page represents the items already included in the current RFQ.

Its primary purposes are:
- review the RFQ item scope
- search and filter long item lists
- inspect quantity, unit, category, and assignment coverage
- open item drawings / technical documents
- navigate into supplier assignment

Do not introduce an additional temporary checkbox-selection state unless there is a concrete action attached to it. Importing, adding, and removing items from an RFQ belong to the RFQ item-management workflow rather than a purposeless selection layer.

Where a drawing or technical document is available, show a small preview thumbnail next to the item code. Clicking the thumbnail should open an enlarged in-page preview without navigating away from the assignment workflow.


## 20. Inquiry item input methods

The current RFQ item list must support multiple practical input methods:

1. File import
   - Excel is the primary production format.
   - CSV or other simple text formats may also be supported.
   - Import must provide a preview before committing rows into the RFQ.

2. Manual entry
   - Allow the buyer to add a single item directly when only a small number of items need to be added.

3. Clipboard batch paste
   - Allow buyers to paste multiple items copied from Excel, ERP exports, email text, or other sources.
   - Support a compact text format where fields may be separated by commas or tabs and items may be separated by semicolons or line breaks.
   - Parse into a preview before adding the rows.

All methods should converge into the same RFQ item data model and apply the same validation rules, including duplicate item-code handling and required-field checks.


## 21. Add / remove symmetry

As a general product interaction rule, when users can add an object to a working scope, they must also have a clear way to remove it from that scope unless the record is intentionally immutable for audit reasons.

Examples include:
- add inquiry item ↔ remove inquiry item
- add supplier to current RFQ ↔ remove supplier from current RFQ
- add custom field ↔ remove custom field

Removal must clearly explain dependent effects before confirmation. For example, removing an inquiry item from an RFQ also removes that item's supplier-assignment relationships for the RFQ.

Audit/history records that must not be physically deleted should use cancel/void/inactivate semantics rather than violating traceability.

## 22. ERP-aligned and extensible fields

The fields currently shown in M0 are demonstration fields and must not be treated as the final production schema.

The production RFQ item model should be designed from:
- actual ERP export/import fields
- RFQ operational fields required by purchasing
- quotation and comparison requirements
- drawing/document references
- future extensibility

The field model must support configurable additional fields without requiring a code change for every new business field.

Required capabilities include:
- map ERP source fields into SRM fields
- add a new configurable field
- remove a configurable field when appropriate
- define field display name and type
- include configurable fields in import/export mapping
- batch-update one field value across selected inquiry items
- preserve source values where required for traceability

Core identity/audit fields may be protected from deletion or incompatible type changes.

## 23. Field-level fuzzy search

Every searchable data field should support fuzzy matching, not only item code or item name.

For tabular work areas:
- provide a global fuzzy search across all visible/searchable fields
- provide field-specific filtering/search for each field
- newly added configurable fields inherit the same search/filter capability
- numeric values may be treated as text for partial matching where useful
- multiple active field filters should combine predictably

The same principle applies to supplier lists, inquiry items, quotation data, and future configurable data tables.
