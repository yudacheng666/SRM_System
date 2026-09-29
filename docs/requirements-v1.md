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
- supplier-specific RFQ package generation, including related PDF drawings
- item drawing / technical-document association and offline PDF preview
- quotation import and normalization
- quotation comparison and supplier selection
- historical price and supplier relationship accumulation
- pre-go-live legacy inquiry / quotation / purchase-order data migration
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
4. RFQ Package Generation
5. Quotation Import & Comparison
6. Supplier / Item Master Data
7. Historical Data / Migration
8. System Settings / Data Management

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

## 18. V1 PDF drawing and technical-document integration

Item drawings are part of the V1 inquiry workflow rather than a post-V1 enhancement.

The primary drawing format is PDF. A PDF may contain one or many pages, and one item may reference one or more PDF drawing / technical-document files.

The item model must support:
- one item → multiple PDF documents
- document type / display name
- source file reference
- document version or revision information when available
- page count when available
- active / superseded state
- RFQ-time attachment snapshot so a historical RFQ continues to reference the files or versions actually sent at that time

### Preview interaction

In item lists, use a compact PDF-oriented preview instead of treating drawings as ordinary images.

A compact preview should show, where practical:
- first-page thumbnail
- PDF indicator
- page count
- document count when multiple files exist

Opening the preview should provide an in-page PDF viewer with:
- previous / next page
- current page / total pages
- zoom in / zoom out
- fit width / fit page
- document switcher when the item has multiple PDFs

The production offline application should use a locally packaged PDF rendering/viewing capability. M0 only needs to validate the multi-page PDF interaction model.

### RFQ attachment use

Drawings are not only for internal preview. They are part of supplier RFQ package generation.

When generating a supplier-specific RFQ package, the system must collect the PDF files associated with the items assigned to that supplier.

Before generation, show an attachment-coverage check such as:
- expected drawing files
- found drawing files
- missing drawing files
- items without drawings
- duplicate/shared documents where relevant

Missing drawings should be visible to the buyer and should not be silently ignored.

Historical RFQs must preserve the attachment set sent at generation time even if the item's current drawing is later replaced or revised.


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


## 24. Clipboard parsing tolerance

Clipboard batch paste must tolerate common buyer workflows, especially direct copying from Excel or ERP exports.

The parser should support mixed delimiters where practical:
- English comma
- Chinese comma
- English semicolon
- Chinese semicolon
- tab
- line break

Ordinary spaces must not be treated as field delimiters. Values such as `304 不锈钢` must remain intact in one field.

The import preview remains mandatory before records are committed so users can detect ambiguous parsing. Production parsing should prefer tabular structure when clipboard data originates from Excel and should avoid silently corrupting field boundaries.

## 25. Explicit multi-condition search

Fuzzy searching must not execute and re-render the list on every keystroke.

Users should be able to:
1. type values into one or more global / field-specific search boxes;
2. configure additional filters;
3. click a Search button;
4. execute all conditions together.

This prevents focus loss during entry and supports combined multi-field querying.

Search rules:
- field conditions are combined predictably, normally with AND across different fields;
- fuzzy matching applies within each field condition;
- global fuzzy search may search across configured searchable fields;
- changing text alone does not execute a search;
- clearing or resetting filters must be explicit.

## 26. Standard list selection controls

Every multi-select list should provide a consistent selection toolset:

- Select all: select all records in the current filtered result, including records on other pages.
- Select current page: select only visible records on the current page.
- Invert all: invert selection across the current filtered result.
- Invert current page: invert selection only on the current page.

Shift range selection remains available for contiguous visible rows.

The meaning of "all" must always respect the current search/filter result rather than silently including hidden records outside the filter.

Lists whose interaction is inherently single-select may omit multi-select actions but should retain consistent search and pagination behavior.

## 27. Numeric pagination

Paginated list and table views must provide direct numeric page navigation in addition to Previous / Next controls.

The pager should:
- show the current page clearly;
- allow direct jump to nearby and boundary pages;
- handle large page counts with compact ellipsis;
- preserve active search/filter conditions while changing pages.

This applies to RFQ items, assignment lists, supplier lists, supplier pickers, quotation comparison, and other paginated operational lists.

## 28. Key-based batch field update

In addition to assigning one value to selected records, field values must support table-driven batch update.

Workflow:
1. choose the key field used to identify existing records, such as item code;
2. choose the target field to update;
3. import or paste an update table;
4. preview matched, unmatched, duplicate, and invalid rows;
5. confirm update.

The system must not depend only on row order. Matching is based on the selected key value.

Production behavior must explicitly handle:
- missing keys
- duplicate source keys
- duplicate target keys where uniqueness is expected
- unmatched rows
- type conversion errors
- blank values and whether they mean "clear" or "do not update"

## 29. Field-definition administration

Field-definition maintenance belongs in System Settings / Administration rather than the day-to-day RFQ business interface.

Business screens may:
- view fields
- search/filter fields
- edit permitted field values
- batch-update field values

System Settings may:
- create configurable fields
- remove configurable fields
- rename fields
- define type / validation
- configure ERP mapping
- control visibility / editability / searchability
- define protected core fields

The M0 prototype includes a minimal System Settings page only to validate this separation. Full field-administration behavior may be implemented in a later milestone.


## 30. Quotation-return import and negotiation-round model

M0 must validate quotation-return import interactions using synthetic data before M5 production implementation.

Supported M0 input paths should mirror inquiry-item intake where practical:
- single-line manual quotation entry
- clipboard batch paste
- CSV / TXT local import
- Excel import-flow simulation
- editable imported quotation lines after import

Quotation rounds are modeled at the RFQ × supplier submission level, not independently per item.

For each supplier:
- Round 1 represents the initial quotation submission.
- Round 2 represents the second negotiation / requotation submission.
- Later rounds are allowed as an extensible sequence.
- Creating a later round never overwrites an earlier round.

Each round stores its own line-level quotation records.

A later round may be partial. If a supplier only requotes some items:
- quoted items receive new line records in the new round;
- missing items must not automatically be interpreted as "price unchanged";
- the UI must distinguish "not submitted in this round" from "confirmed carry-forward from the previous round".

When purchasing confirms that a supplier explicitly keeps the prior quotation after negotiation, the system may create a new-round line marked as "carry forward previous round". This records that a negotiation round occurred even when the numeric price did not change.

If the supplier explicitly submits the same numeric price again, the new round stores the repeated price normally and the calculated price change is 0.

For each line in round 2 or later, expose:
- previous effective quotation
- current-round quotation
- absolute price change
- percentage price change
- source: imported / manually corrected / confirmed carry-forward
- quotation status

A quotation round may remain Draft while imported values are reviewed and manually corrected. Confirming the round makes it eligible as the current quotation for comparison.

Formal M5 implementation should retain an audit trail for post-import manual corrections and should not silently destroy the originally imported value.


## 31. Quotation-return coverage validation

Each quotation round must have an explicit expected quotation scope.

For round 1, the default expected scope is the item scope sent to that supplier in the RFQ.

For round 2 and later, the system must preserve a round-specific expected-scope snapshot. A later round may intentionally cover only part of the prior scope, so quotation coverage must always be measured against the expected scope of that round rather than blindly against the full RFQ.

Quotation-return coverage should distinguish at least:

- Quoted: expected item with a valid quotation.
- Explicit no-quote: expected item returned with a status meaning the supplier does not quote this item.
- Cannot supply: expected item explicitly marked as unavailable / cannot supply.
- Missing / omitted: expected item has no returned record for the round.
- Extra: returned item is outside the expected scope for the round, including items not assigned to the supplier.
- Duplicate: the same item appears more than once in the returned quotation data.

"Explicit no-quote" and "missing / omitted" are not equivalent. The first is a supplier response; the second may be a supplier omission, file omission, mapping failure, or buyer/import error.

Before a quotation round is confirmed, show a coverage summary and the concrete item list for missing, extra, and duplicate records.

Coverage anomalies should not be silently discarded. The buyer should be able to review and resolve them before confirmation. If confirmation is still allowed with unresolved anomalies, the system must display a clear warning and preserve the anomaly state for audit/review.

Extra or duplicate rows should not automatically enter the effective quotation dataset without resolution.

Quotation coverage results should later be available to the comparison report so the approval reviewer can distinguish full quotation coverage from partial or exceptional quotation responses.


## 32. Tiered quotation pricing

Tiered pricing must be supported without creating a separate quotation workflow.

A quotation line remains one item quotation record for one supplier and one quotation round.

The line may use either:
- a single unit price; or
- an optional tier-price structure containing multiple quantity ranges and unit prices.

Example normalized tier structure:

- quantity 1–99 → unit price 100
- quantity 100–499 → unit price 90
- quantity 500+ → unit price 80

The full tier structure must be retained as part of the quotation source data. The system must not replace or destroy the tier structure after calculating a currently applicable price.

For comparison:
- use the RFQ requested quantity to determine the applicable tier;
- display the effective unit price used for comparison;
- clearly indicate that the source quotation is tiered;
- allow the buyer to inspect the full set of tiers;
- use the effective price at the same RFQ quantity when calculating round-to-round price changes.

Tier prices belong to the quotation line and quotation round. A later negotiation round may change all tiers, some tiers, or replace a tiered quote with a single price, and earlier rounds remain unchanged.

Quotation import should normalize different source layouts into the same tier structure. Production M5 should support supplier files where tiers may be represented as:
- multiple tier columns;
- multiple rows;
- compact text;
- or other mapped layouts.

M0 uses a compact synthetic representation only to validate the interaction and normalized data model.

The comparison / OA report in M6 should show the effective price used for the RFQ quantity and provide the complete tier-price detail where the quotation is tiered. This prevents approval users from mistaking one calculated tier price for the supplier's entire quotation.


## 33. Supplier RFQ package generation

The V1 output unit is a supplier RFQ package, not only an Excel quotation sheet.

For each supplier, generation should produce a package similar to:

- supplier-specific RFQ Excel
- drawing / technical-document folder containing only files related to that supplier's assigned item scope
- optional ZIP package containing the RFQ file and drawing folder

The package must be derived from the supplier's assignment scope. Two suppliers with different assigned items may therefore receive different attachment packages.

Package generation should:
- preview the exact RFQ lines;
- preview / check the drawing attachment set;
- expose missing attachment warnings;
- avoid silently copying unrelated drawings;
- keep stable RFQ / supplier / line identifiers;
- preserve the generated attachment snapshot for later audit and quotation traceability.

A single PDF may legitimately be associated with multiple RFQ lines. The implementation should avoid unnecessary duplicate file copies inside the same supplier package where one shared document is sufficient.

## 34. Quotation amount analysis

Quotation comparison must support both line-level price comparison and aggregate amount analysis.

Aggregate comparisons must not treat different quotation scopes as directly comparable without explaining the scope.

At minimum support:

### Supplier quoted-scope total
For one supplier, sum the effective quotation amount across the items that supplier actually quoted:

effective unit price × RFQ quantity.

This describes the size of that supplier's quoted scope but is not by itself a fair cross-supplier ranking when scopes differ.

### Common-item-scope total
For two or more suppliers, identify the same set of items that all compared suppliers validly quoted, then compare total quotation amount on that common scope.

The system must display the number / scope of common items so the user understands what is being compared.

### User-selected scope total
Allow the buyer to select an item subset and calculate each supplier's total on exactly that same subset.

A missing quotation must remain missing / incomplete; it must never be treated as zero.

### Theoretical lowest total
Calculate the theoretical RFQ total if each item uses the lowest currently valid effective quotation.

### Final selected total
Calculate the total based on the buyer's final supplier selections and compare it with:
- theoretical lowest total
- previous-purchase total where comparable
- other useful reference totals

Tiered pricing must first resolve the effective unit price using the RFQ quantity before amount calculation.

Aggregate price analysis must consider comparability conditions such as currency, tax basis, unit of measure, and quantity basis. Non-comparable quotations must be flagged rather than silently summed together.

## 35. Historical quotation preservation and analysis

Quotation history is core transaction data and must be preserved from the moment production quotation import is implemented in M5.

M5 must permanently retain:
- each supplier quotation round
- original imported values
- normalized values
- tier structures
- explicit no-quote / cannot-supply states
- quotation coverage anomalies
- confirmed carry-forward records
- manual corrections and their audit information
- quotation date / negotiation date
- related RFQ / supplier / item identifiers

M7 is responsible for history-query and analysis experiences, not for beginning historical retention.

History analysis should support, at minimum:
- one item's price history over time
- one item × one supplier quotation history
- comparison of multiple suppliers' historical quotations for one item
- negotiation-round price changes
- historical purchase price versus historical quotation
- historical supplier participation / quotation coverage
- price trend analysis where data is comparable

Historical values must retain their original commercial context, including quantity / tier, currency, tax basis, and unit where available.

## 36. Pre-go-live legacy data migration

Before production go-live, the system must support importing relevant historical purchasing and inquiry / quotation information so the new SRM does not start with an empty history.

Legacy migration must not force users to reconstruct business events that cannot be supported by evidence.

Import the deepest historical layer supported by the available source data:

### Purchase-order history
If only ERP purchase-order history is available, import facts such as:
- purchase / order date
- item
- supplier
- quantity
- unit price
- order identifier
- currency / tax / unit information where available

This becomes historical purchase-order / purchase-price data. It must not be represented as a historical RFQ or supplier quotation unless evidence exists.

### Historical inquiry / quotation data
If legacy inquiry sheets, supplier quotations, email attachments, or other reliable records are available, import the supported facts such as:
- historical inquiry / RFQ identifier
- supplier
- item
- quotation date
- quotation price
- tier prices where available
- lead time / MOQ where available
- quotation / negotiation round when reliably known
- source-evidence reference

If the original round number is unknown, store it as unknown / legacy rather than inventing a round.

### Migration controls
Legacy records should carry:
- legacy-import flag
- source type
- source file / evidence reference when available
- migration batch ID
- import timestamp
- original source values
- mapping / normalization result

Migration should provide preview, duplicate detection, unmatched-item / supplier handling, and import logs.

Legacy-imported data and post-go-live native SRM transactions should be distinguishable for traceability while remaining available in the same history analysis when their fields are comparable.
