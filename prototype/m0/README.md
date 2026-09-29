# M0 Interaction Prototype

This prototype validates only the highest-risk V1 interactions:

1. Long inquiry-item lists
2. Many-to-many item/supplier assignment
3. Three-state assignment visibility
4. Additive assignment without overwriting existing relationships
5. Direct relation checkboxes in supplier-first mode
6. Shift-range selection for long lists
7. RFQ-specific supplier pool managed by the buyer
8. Copy-another-supplier's item scope as a starting point, then adjust differences
9. Coverage inspection that does not block RFQ generation
10. Supplier-first and item-first assignment views
11. Quotation comparison with lowest price selected by default and non-lowest-price reason capture

## Run

Open `index.html` directly in a modern browser.

No server, network connection, build step, or external dependency is required.

## Data safety

All data is generated in the browser and is fictional. Do not replace the fixtures with real organization, supplier, person, product, price, quantity, system/vendor, project, or internal operating data in this public repository.

## Non-goals

This is not the production application. It does not persist data, import real files, generate Excel workbooks, or implement IndexedDB. Those belong to later milestones after interaction validation.


## Current interaction notes

- In supplier-first mode, a checked item means the item is already assigned to the active supplier. Toggling the checkbox changes the relationship immediately; there is no second "add selected items" confirmation step.
- The supplier list is RFQ-specific. Buyers add suppliers into the current RFQ supplier pool instead of browsing the full supplier master list.
- To reduce repetitive work, buyers can copy another supplier's assigned item scope as a starting point and then add/remove only the differences.
- Long checkbox lists support Shift range selection.
- Quotation comparison starts with the lowest valid quotation selected for each item by default.


## Interaction clarifications after review

- The first page is now a read/review view of the items already included in the current RFQ. It no longer creates a second, meaningless selection state in M0.
- Supplier search in the RFQ supplier pool supports fuzzy matching across supplier name, code, and source/reason text.
- Buyers can remove a previously added supplier from the current RFQ. Removing it also removes that supplier's current item relationships after confirmation.
- Item rows include a drawing thumbnail. Clicking it opens an in-page enlarged drawing preview using synthetic M0 drawings.
- Shift range selection uses the first clicked item's ID as an anchor and applies the second checkbox's target state across the visible range.
- The supplier-list search label is phrased as "Search current RFQ suppliers" rather than "Search added suppliers".


## Latest M0 additions

- RFQ items can now be added through three demo paths: single-item entry, clipboard bulk paste, and file import.
- Clipboard batch format supports comma-separated fields and semicolon/newline-separated items.
- CSV/TXT files can be parsed locally in M0; Excel selection uses synthetic preview rows to validate the import interaction without bundling an Excel parser yet.
- All checkbox-style lists in M0 use one shared Shift-range-selection mechanism, including item selection, supplier-item relation selection, and supplier-pool selection.
- The explanatory Coverage warning sentence was removed from the UI; Coverage remains visible through statistics and generation behavior.
- "Preview RFQ" now opens a supplier-specific RFQ document preview with the exact assigned item rows and response columns before generation.


## Field and delete behavior

- The current RFQ item list supports selecting and deleting inquiry items. Deleting an inquiry item also removes its supplier-assignment relationships.
- As a general interaction rule, user-created membership or configuration should not expose an add action without an understandable corresponding remove/delete action.
- M0 base item columns are demonstration fields only. The production item schema will be aligned with ERP fields and import mapping requirements.
- M0 demonstrates extensible custom fields: add field, delete field, and batch-update a selected set of inquiry items.
- The item list supports both a global fuzzy search and independent fuzzy search inputs for every displayed field, including added custom fields.
