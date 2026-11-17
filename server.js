
const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const notesContainer = document.getElementById("notesContainer");
const noteCount = document.getElementById("noteCount");
const searchInput = document.getElementById("searchInput");
const saveButton = document.getElementById("saveButton");
const message = document.getElementById("message");

let notes = [];

// Show messages
function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "green" : "red";
}

// Fetch notes from backend
async function fetchNotes() {
    try {
        const response = await fetch("/notes");

        if (!response.ok) {
            throw new Error("Unable to load notes");
        }

        notes = await response.json();

        console.log("Notes loaded:", notes);

        renderNotes();

    } catch (error) {
        console.error(error);
        showMessage(error.message);
        notesContainer.textContent = "Could not load notes.";
    }
}

// Display notes
function renderNotes() {
    const search = searchInput.value.toLowerCase().trim();

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search)
    );

    noteCount.textContent =
        `${notes.length} ${notes.length === 1 ? "note" : "notes"} saved`;

    notesContainer.replaceChildren();

    if (filteredNotes.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No notes found. Create your first note!";
        notesContainer.appendChild(empty);
        return;
    }

    filteredNotes.forEach(note => {
        const card = document.createElement("article");
        card.className = "note-card";

        const title = document.createElement("h3");
        title.textContent = note.title;

        const content = document.createElement("p");
        content.textContent = note.content;

        const date = document.createElement("span");
        date.className = "note-date";
        date.textContent =
            "Created: " + new Date(note.createdAt).toLocaleString();

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "🗑 Delete";

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        card.append(title, content, date, deleteButton);

        notesContainer.appendChild(card);
    });
}

// Add a new note
noteForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        showMessage("Please enter title and content.");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
        const response = await fetch("/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to save note");
        }

        noteForm.reset();

        showMessage("Note saved successfully!", true);

        await fetchNotes();

    } catch (error) {
        showMessage(error.message);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "+ Save Note";
    }
});

// Delete a note
async function deleteNote(id) {
    if (!confirm("Do you want to delete this note?")) {
        return;
    }

    try {
        const response = await fetch(
            `/notes/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to delete note");
        }

        showMessage("Note deleted successfully!", true);

        await fetchNotes();

    } catch (error) {
        showMessage(error.message);
    }
}

// Search notes
searchInput.addEventListener("input", renderNotes);

// Load notes when page opens
fetchNotes();
