CAMPUS LOST-AND-FOUND TRACKER — SIMPLE WEBSITE
================================================

FILES
- index.html: page layout and forms
- style.css: website appearance and responsive layout
- script.js: app behavior and DSA implementations

HOW TO RUN IN VS CODE
1. Extract the ZIP file to a folder.
2. Open VS Code.
3. Choose File > Open Folder and select CampusLostAndFoundSimpleWebsite.
4. Install the "Live Server" extension by Ritwick Dey (optional but recommended).
5. Right-click index.html in the Explorer and choose "Open with Live Server".
6. Your browser should open the website, usually at an address like http://127.0.0.1:5500.
Alternative: double-click index.html to open it in a browser. Live Server is recommended during editing.

DSA REQUIREMENTS
- Linked List: script.js has ItemNode and ItemLinkedList, used to store item reports. The remove(id) method deletes a report node while preserving the list links.
- Searching: searchItems() linearly searches names, categories, descriptions, and locations.
- Sorting: sortItems() sorts by date, category, or name.
- Queue: InquiryQueue uses enqueue() and dequeue() to process inquiries FIFO.

IMPORTANT LIMITATIONS
- This version uses HTML, CSS, and JavaScript, not Java. Browser JavaScript does not run Java source code.
- Delete report: click "Delete report" on an item card and confirm the prompt. The report is removed from the linked list, the saved browser data is updated, and the dashboard refreshes.
- Image upload: select an image in the "Item photo" field when creating a report. The preview appears before saving and the photo is displayed on the item card.
- Reports, claim statuses, inquiries, and uploaded item photos are saved in this browser's localStorage, so they remain after refresh or reopening the site in the same browser and same local address.
- Photos are resized and compressed to reduce storage use. Browser storage is limited; if it fills up, try smaller photos or delete old reports.
- Browser storage is local to this browser/device and does not sync with other students or computers. Clearing site data/browser storage can erase saved reports and photos.
- This is a local demonstration website, not an online multi-user service.

Delete rule: A report can only be deleted after its claim status is changed to Claimed. The Delete button stays disabled while the item is Unclaimed, and JavaScript checks the status again before removing the node from the linked list.

VISUAL UPDATE
- The website now uses a restrained ISU-green theme with light green surfaces and small gold accents.
- The official Isabela State University seal is displayed in the header. The logo is loaded from the official ISU website, so an internet connection is needed for it to appear.
- The official seal is displayed without recoloring or visual effects.

All existing functions are retained: item photo uploads and previews, browser persistence, linked-list item storage, search, sorting, claimed-only deletion, and the FIFO inquiry queue.
