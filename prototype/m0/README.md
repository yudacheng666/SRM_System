# M0 Interaction Prototype

This prototype validates only the highest-risk V1 interactions:

1. Long inquiry-item lists
2. Many-to-many item/supplier assignment
3. Three-state assignment visibility
4. Additive assignment without overwriting existing relationships
5. Coverage inspection that does not block RFQ generation
6. Supplier-first and item-first assignment views
7. Quotation comparison and non-lowest-price reason capture

## Run

Open `index.html` directly in a modern browser.

No server, network connection, build step, or external dependency is required.

## Data safety

All data is generated in the browser and is fictional. Do not replace the fixtures with real organization, supplier, person, product, price, quantity, system/vendor, project, or internal operating data in this public repository.

## Non-goals

This is not the production application. It does not persist data, import real files, generate Excel workbooks, or implement IndexedDB. Those belong to later milestones after interaction validation.
