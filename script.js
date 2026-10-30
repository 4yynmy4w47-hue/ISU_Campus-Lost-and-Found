/*
  Campus Lost-and-Found Tracker
  Beginner DSA demonstration using HTML, CSS, and JavaScript.
  Note: JavaScript runs in the browser; this is not a Java backend.
*/

// DSA 1: Linked list implementation.
// Each node stores one item and a reference to the next node.
class ItemNode {
    constructor(item) {
        this.item = item;
        this.next = null;
    }
}

class ItemLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    add(item) {
        const node = new ItemNode(item);
        if (this.head === null) {
            this.head = node;
        } else {
            let current = this.head;
            while (current.next !== null) {
                current = current.next;
            }
            current.next = node;
        }
        this.size++;
    }

    toArray() {
        const result = [];
        let current = this.head;
        while (current !== null) {
            result.push(current.item);
            current = current.next;
        }
        return result;
    }

    findById(id) {
        let current = this.head;
        while (current !== null) {
            if (current.item.id === id) return current.item;
            current = current.next;
        }
        return null;
    }

    // Remove an item node by ID while keeping the linked list connected.
    remove(id) {
        if (this.head === null) return false;

        // If the first node matches, move head to the next node.
        if (this.head.item.id === id) {
            this.head = this.head.next;
            this.size--;
            return true;
        }

        // Otherwise, find the node immediately before the target node.
        let current = this.head;
        while (current.next !== null) {
            if (current.next.item.id === id) {
                current.next = current.next.next;
                this.size--;
                return true;
            }
            current = current.next;
        }

        // No item with this ID was found.
        return false;
    }
}

// Main linked-list store for all item reports.
const items = new ItemLinkedList();

// DSA 4: Queue implemented with an array and a front index.
// Enqueue adds to the back; dequeue processes the oldest inquiry first (FIFO).
class InquiryQueue {
    constructor() {
        this.entries = [];
        this.front = 0;
    }

    enqueue(inquiry) {
        this.entries.push(inquiry);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        const inquiry = this.entries[this.front];
        this.front++;
        // Reset storage when all entries have been processed.
        if (this.front === this.entries.length) {
            this.entries = [];
            this.front = 0;
        }
        return inquiry;
    }

    toArray() {
        return this.entries.slice(this.front);
    }

    isEmpty() {
        return this.front >= this.entries.length;
    }

    get size() {
        return this.entries.length - this.front;
    }
}

const inquiries = new InquiryQueue();
let nextItemId = 1;
let nextInquiryId = 1;
const STORAGE_KEY = "campusLostFoundTracker.v2";
const HISTORY_LIMIT = 100;
let historyEvents = [];
let selectedImageData = "";

// Persist the linked-list contents and active queue in this browser.
// The linked list and queue remain the live data structures used by the app.
function saveData() {
    const data = {
        items: items.toArray(),
        inquiries: inquiries.toArray(),
        historyEvents,
        nextItemId,
        nextInquiryId
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Could not save tracker data:", error);
        showMessage("Browser storage is full. Try using a smaller photo or deleting old reports.", true);
        return false;
    }
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (Array.isArray(data.items)) {
                data.items.forEach(item => items.add(item));
                nextItemId = Math.max(Number(data.nextItemId) || 1, ...data.items.map(item => Number(item.id) + 1), 1);
            }
            if (Array.isArray(data.inquiries)) {
                data.inquiries.forEach(inquiry => inquiries.enqueue(inquiry));
                nextInquiryId = Math.max(Number(data.nextInquiryId) || 1, ...data.inquiries.map(inquiry => Number(inquiry.id) + 1), 1);
            }
            if (Array.isArray(data.historyEvents) && data.historyEvents.length) {
                historyEvents = data.historyEvents.slice(0, HISTORY_LIMIT);
            } else {
                // Older saved projects did not keep history. Add a baseline snapshot without pretending to know exact past actions.
                const snapshotTime = new Date().toISOString();
                items.toArray().forEach(item => {
                    historyEvents.push({ category: "reports", action: "Existing report on record", detail: `${item.name} (#${item.id}) is currently saved in the tracker.`, timestamp: snapshotTime });
                    if (item.status === "Unclaimed") {
                        historyEvents.push({ category: "unclaimed", action: "Unclaimed item on record", detail: `${item.name} (#${item.id}) is currently unclaimed.`, timestamp: snapshotTime });
                    }
                });
                inquiries.toArray().forEach(inquiry => {
                    historyEvents.push({ category: "inquiries", action: "Inquiry currently waiting", detail: `${inquiry.studentName}: ${inquiry.details}`, timestamp: snapshotTime });
                });
                historyEvents = historyEvents.slice(0, HISTORY_LIMIT);
                saveData();
            }
            return;
        }
    } catch (error) {
        console.error("Could not load saved tracker data:", error);
    }

    // First-time starter records. They are saved so refreshes keep the same reports.
    [
        { name: "Student ID", category: "Identification", description: "Blue ID holder", location: "School Library", date: "2026-10-29", type: "Found", status: "Unclaimed", image: "" },
        { name: "USB Drive", category: "Electronics", description: "Black 16GB USB drive", location: "Computer Laboratory", date: "2026-10-28", type: "Found", status: "Unclaimed", image: "" },
        { name: "Wallet", category: "Personal Belongings", description: "Brown wallet", location: "Campus Canteen", date: "2026-10-27", type: "Lost", status: "Unclaimed", image: "" }
    ].forEach(item => items.add({ id: nextItemId++, ...item }));
    const snapshotTime = new Date().toISOString();
    items.toArray().forEach(item => {
        historyEvents.push({ category: "reports", action: "Starter report added", detail: `${item.name} (#${item.id}) is available in the tracker.`, timestamp: snapshotTime });
        if (item.status === "Unclaimed") {
            historyEvents.push({ category: "unclaimed", action: "Unclaimed item on record", detail: `${item.name} (#${item.id}) is currently unclaimed.`, timestamp: snapshotTime });
        }
    });
    saveData();
}
loadData();

const itemList = document.getElementById("itemList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const messageBox = document.getElementById("message");
const itemForm = document.getElementById("itemForm");
const inquiryList = document.getElementById("inquiryList");

function showMessage(text, isError = false) {
    messageBox.textContent = text;
    messageBox.classList.remove("hidden", "error");
    if (isError) messageBox.classList.add("error");
    window.setTimeout(() => messageBox.classList.add("hidden"), 3500);
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

function refreshStats() {
    const allItems = items.toArray();
    document.getElementById("totalCount").textContent = allItems.length;
    document.getElementById("unclaimedCount").textContent =
        allItems.filter(item => item.status === "Unclaimed").length;
    document.getElementById("inquiryCount").textContent = inquiries.size;
}

// Save a short activity log so the dashboard cards can show recent history after refresh.
function logHistory(category, action, detail) {
    historyEvents.unshift({
        category,
        action,
        detail,
        timestamp: new Date().toISOString()
    });
    historyEvents = historyEvents.slice(0, HISTORY_LIMIT);
    saveData();
}

const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const historyTitles = {
    reports: { title: "Total reports — recent history", description: "Recent report creation, status changes, and deletions." },
    unclaimed: { title: "Unclaimed items — recent history", description: "Recent activity that affected the unclaimed-item count." },
    inquiries: { title: "Waiting inquiries — recent history", description: "Recent inquiries added to the queue or processed." }
};

function showHistory(category) {
    const view = historyTitles[category];
    if (!view) return;
    document.getElementById("historyTitle").textContent = view.title;
    document.getElementById("historyDescription").textContent = view.description;
    const matchingEvents = historyEvents.filter(event => event.category === category).slice(0, 12);
    historyList.innerHTML = "";

    if (matchingEvents.length === 0) {
        historyList.innerHTML = '<p class="history-empty">No recent activity recorded yet. New activity will appear here.</p>';
    } else {
        matchingEvents.forEach(event => {
            const row = document.createElement("article");
            row.className = "history-row";
            const when = new Date(event.timestamp);
            const timeLabel = Number.isNaN(when.getTime()) ? "Time unavailable" : when.toLocaleString();
            row.innerHTML = `<span class="history-dot" aria-hidden="true"></span>
                <div class="history-copy"><strong>${escapeHtml(event.action)}</strong><p>${escapeHtml(event.detail)}</p><time>${escapeHtml(timeLabel)}</time></div>`;
            historyList.appendChild(row);
        });
    }
    historyPanel.classList.remove("hidden");
    historyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll("[data-history]").forEach(button => {
    button.addEventListener("click", () => showHistory(button.dataset.history));
});
document.getElementById("closeHistoryButton").addEventListener("click", () => historyPanel.classList.add("hidden"));

// DSA 2: Linear searching across name, category, description, and location.
function searchItems(keyword) {
    const term = keyword.trim().toLowerCase();
    const result = [];
    let current = items.head;

    while (current !== null) {
        const item = current.item;
        const searchableText = `${item.name} ${item.category} ${item.description} ${item.location}`.toLowerCase();
        if (term === "" || searchableText.includes(term)) {
            result.push(item);
        }
        current = current.next;
    }
    return result;
}

// DSA 3: Sorting results by date, category, or name.
function sortItems(list, sortBy) {
    const sorted = [...list];
    if (sortBy === "date") {
        sorted.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === "category") {
        sorted.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === "name") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
}

function renderItems() {
    const results = sortItems(searchItems(searchInput.value), sortSelect.value);
    itemList.innerHTML = "";
    document.getElementById("emptyState").classList.toggle("hidden", results.length !== 0);

    results.forEach(item => {
        const card = document.createElement("article");
        card.className = "item-card";
        const typeClass = item.type.toLowerCase() === "lost" ? "lost" : "found";
        const statusClass = item.status.toLowerCase() === "claimed" ? "claimed" : "unclaimed";
        card.innerHTML = `
            <div class="item-card-top">
                <span class="pill ${typeClass}">${escapeHtml(item.type)} report</span>
                <span class="pill">#${item.id}</span>
            </div>
            <h3>${escapeHtml(item.name)}</h3>
            ${item.image ? `<img class="item-photo" src="${item.image}" alt="Photo of ${escapeHtml(item.name)}">` : '<div class="photo-placeholder">No photo uploaded</div>'}
            <p>${escapeHtml(item.description)}</p>
            <div class="item-meta">
                <span class="pill">${escapeHtml(item.category)}</span>
                <span class="pill ${statusClass}">${escapeHtml(item.status)}</span>
            </div>
            <p>⌖ ${escapeHtml(item.location)}</p>
            <p>▦ ${escapeHtml(item.date)}</p>
            <div class="item-bottom">
                <label class="status-control">Claim status
                    <select aria-label="Update claim status for item ${item.id}" data-item-id="${item.id}" class="status-select">
                        <option value="Unclaimed" ${item.status === "Unclaimed" ? "selected" : ""}>Unclaimed</option>
                        <option value="Claimed" ${item.status === "Claimed" ? "selected" : ""}>Claimed</option>
                    </select>
                </label>
                <button type="button" class="button delete-button" data-delete-id="${item.id}" aria-label="Delete ${escapeHtml(item.name)} report" ${item.status !== "Claimed" ? "disabled title=\"Only claimed items can be deleted\"" : ""}>${item.status === "Claimed" ? "Delete report" : "Delete when claimed"}</button>
            </div>`;
        itemList.appendChild(card);
    });

    // Delete button: remove the selected report from the linked list, then redraw.
    itemList.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.deleteId);
            const item = items.findById(id);
            if (!item) {
                showMessage("That item report could not be found.", true);
                return;
            }

            // Safety check: unclaimed reports must never be deleted.
            if (item.status !== "Claimed") {
                showMessage("Only claimed items can be deleted. Mark this item as Claimed first.", true);
                return;
            }

            const shouldDelete = window.confirm(`Delete the report for "${item.name}"? This cannot be undone.`);
            if (!shouldDelete) return;

            if (items.remove(id)) {
                logHistory("reports", "Report deleted", `${item.name} (#${item.id}) was deleted after being claimed.`);
                showMessage(`Report for "${item.name}" was deleted.`);
                renderItems();
            } else {
                showMessage("The report could not be deleted.", true);
            }
        });
    });

    document.querySelectorAll(".status-select").forEach(select => {
        select.addEventListener("change", event => {
            const id = Number(event.target.dataset.itemId);
            const item = items.findById(id);
            if (item) {
                const previousStatus = item.status;
                item.status = event.target.value;
                if (previousStatus !== item.status) {
                    logHistory("reports", "Claim status changed", `${item.name} (#${item.id}): ${previousStatus} → ${item.status}.`);
                    logHistory("unclaimed", item.status === "Unclaimed" ? "Item marked unclaimed" : "Item claimed", `${item.name} (#${item.id}) changed from ${previousStatus} to ${item.status}.`);
                }
                saveData();
                showMessage("Claim status updated.");
                renderItems();
            }
        });
    });
    refreshStats();
}

document.getElementById("toggleFormButton").addEventListener("click", () => {
    itemForm.classList.toggle("hidden");
});
const imageInput = document.getElementById("itemImage");
const imagePreviewWrap = document.getElementById("imagePreviewWrap");
const imagePreview = document.getElementById("imagePreview");

function clearSelectedImage() {
    selectedImageData = "";
    imageInput.value = "";
    imagePreview.removeAttribute("src");
    imagePreviewWrap.classList.add("hidden");
}

// Resize/compress the selected image before saving it to localStorage.
imageInput.addEventListener("change", async () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
        clearSelectedImage();
        return;
    }
    if (!file.type.startsWith("image/")) {
        showMessage("Please choose an image file.", true);
        clearSelectedImage();
        return;
    }
    try {
        selectedImageData = await compressImage(file);
        imagePreview.src = selectedImageData;
        imagePreviewWrap.classList.remove("hidden");
    } catch (error) {
        console.error("Image processing failed:", error);
        showMessage("This image could not be loaded. Please choose another photo.", true);
        clearSelectedImage();
    }
});

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("File could not be read"));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("Image could not be decoded"));
            image.onload = () => {
                const maxDimension = 1000;
                const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.78));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

document.getElementById("removeImageButton").addEventListener("click", clearSelectedImage);

document.getElementById("cancelFormButton").addEventListener("click", () => {
    itemForm.reset();
    clearSelectedImage();
    itemForm.classList.add("hidden");
    document.getElementById("date").value = new Date().toISOString().slice(0, 10);
});

itemForm.addEventListener("submit", event => {
    event.preventDefault();
    const item = {
        id: nextItemId++,
        type: document.getElementById("type").value,
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value.trim(),
        date: document.getElementById("date").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim(),
        status: "Unclaimed",
        image: selectedImageData
    };
    if (!item.name || !item.category || !item.date || !item.location || !item.description) {
        showMessage("Please complete all item fields.", true);
        return;
    }
    items.add(item);
    logHistory("reports", "New report added", `${item.name} (#${item.id}) was added as a ${item.type.toLowerCase()} report.`);
    logHistory("unclaimed", "New unclaimed item", `${item.name} (#${item.id}) was added and is currently unclaimed.`);
    saveData();
    itemForm.reset();
    clearSelectedImage();
    document.getElementById("date").value = new Date().toISOString().slice(0, 10);
    itemForm.classList.add("hidden");
    searchInput.value = "";
    showMessage("Item report saved successfully.");
    renderItems();
});

searchInput.addEventListener("input", renderItems);
sortSelect.addEventListener("change", renderItems);

// Enqueue: add a new inquiry to the back of the queue.
document.getElementById("inquiryForm").addEventListener("submit", event => {
    event.preventDefault();
    const studentName = document.getElementById("studentName").value.trim();
    const details = document.getElementById("inquiryDetails").value.trim();
    if (!studentName || !details) {
        showMessage("Enter your name and inquiry details.", true);
        return;
    }
    const inquiry = { id: nextInquiryId++, studentName, details };
    inquiries.enqueue(inquiry);
    logHistory("inquiries", "Inquiry added to queue", `${studentName}: ${details}`);
    saveData();
    event.target.reset();
    showMessage("Inquiry added to the queue.");
    renderInquiries();
});

// Dequeue: process the oldest inquiry first.
document.getElementById("processInquiryButton").addEventListener("click", () => {
    const inquiry = inquiries.dequeue();
    if (inquiry === null) {
        showMessage("There are no inquiries waiting.", true);
    } else {
        logHistory("inquiries", "Inquiry processed", `${inquiry.studentName}: ${inquiry.details}`);
        saveData();
        showMessage(`Processed inquiry from ${inquiry.studentName}: ${inquiry.details}`);
    }
    renderInquiries();
});

function renderInquiries() {
    const queueItems = inquiries.toArray();
    inquiryList.innerHTML = "";
    if (queueItems.length === 0) {
        inquiryList.innerHTML = '<p class="muted">No inquiries waiting in the queue.</p>';
    } else {
        queueItems.forEach((inquiry, index) => {
            const row = document.createElement("div");
            row.className = "inquiry-row";
            row.innerHTML = `
                <div class="queue-number">${index + 1}</div>
                <div><strong>${escapeHtml(inquiry.studentName)}</strong>
                <span>${escapeHtml(inquiry.details)}</span></div>`;
            inquiryList.appendChild(row);
        });
    }
    refreshStats();
}

document.getElementById("date").value = new Date().toISOString().slice(0, 10);
renderItems();
renderInquiries();
