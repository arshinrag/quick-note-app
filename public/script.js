
document.addEventListener("DOMContentLoaded", () => {

    const noteForm = document.getElementById("noteForm");
    const noteTitle = document.getElementById("noteTitle");
    const noteContent = document.getElementById("noteContent");
    const notesContainer = document.getElementById("notesContainer");
    const noteCount = document.getElementById("noteCount");
    const searchInput = document.getElementById("searchInput");
    const saveButton = document.getElementById("saveButton");
    const message = document.getElementById("message");

    let notes = [];

    // Check HTML elements
    if (!noteForm || !noteTitle || !noteContent ||
        !notesContainer || !noteCount ||
        !searchInput || !saveButton || !message) {
        console.error("Some HTML elements are missing. Check index.html IDs.");
        return;
    }

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "green" : "red";
    }

    // GET NOTES
    async function fetchNotes() {
        try {
            const response = await fetch("/notes");

            if (!response.ok) {
                throw new Error("Unable to load notes");
            }

            notes = await response.json();
            renderNotes();

        } catch (error) {
            console.error(error);
            showMessage(error.message);
        }
    }

    // DISPLAY NOTES
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

    // POST NOTES
    noteForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (!title || !content) {
            showMessage("Please enter title and content.");
            return;
        }

        saveButton.disabled = true;

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
                throw new Error(result.error || "Could not save note");
            }

            noteForm.reset();
            showMessage("Note saved successfully!", true);

            await fetchNotes();

        } catch (error) {
            console.error(error);
            showMessage(error.message);

        } finally {
            saveButton.disabled = false;
        }
    });

    // DELETE NOTES
    async function deleteNote(id) {
        if (!confirm("Are you sure you want to delete this note?")) {
            return;
        }

        try {
            const response = await fetch(
                `/notes/${encodeURIComponent(id)}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not delete note");
            }

            showMessage("Note deleted successfully!", true);
            await fetchNotes();

        } catch (error) {
            console.error(error);
            showMessage(error.message);
        }
    }

    // SEARCH NOTES
    searchInput.addEventListener("input", renderNotes);

    // INITIAL LOAD
    fetchNotes();

});
