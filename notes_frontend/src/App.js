import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Color palette from requirements
const COLORS = {
  primary: "#1976d2",
  secondary: "#424242",
  accent: "#ffb300",
  background: "#fff",
  sidebarBg: "#f7f8fa",
  sidebarBorder: "#e0e0e0",
  noteTitle: "#222",
  noteTitleActive: "#1976d2",
  noteContent: "#424242",
  placeholder: "#a6a6a6",
};

function getNewNote() {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    title: "Untitled Note",
    content: "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

// PUBLIC_INTERFACE
function App() {
  // Notes state: array of {id, title, content, ...}
  const [notes, setNotes] = useState(() => {
    // Persist notes in localStorage for demo
    const stored = window.localStorage.getItem("notes-data");
    return stored ? JSON.parse(stored) : [];
  });
  // Currently selected note id
  const [activeId, setActiveId] = useState(null);
  // Editing state: 'view', 'edit', 'add'
  const [mode, setMode] = useState("view"); // 'view' | 'edit' | 'add'
  // Form state for add/edit
  const [form, setForm] = useState({ title: "", content: "" });
  // For focusing input when adding/editing
  const titleInputRef = useRef();

  // Persist notes when changed
  useEffect(() => {
    window.localStorage.setItem("notes-data", JSON.stringify(notes));
  }, [notes]);

  // If no activeId (on boot), set first note as active if exists
  useEffect(() => {
    if (!activeId && notes.length > 0) {
      setActiveId(notes[0].id);
      setMode("view");
    }
    if (notes.length === 0) {
      setActiveId(null);
      setMode("view");
    }
  }, [notes]);

  // Focus title input on entering edit/add mode
  useEffect(() => {
    if ((mode === "add" || mode === "edit") && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [mode]);

  // Add a note
  // PUBLIC_INTERFACE
  function handleAddNote() {
    setMode("add");
    setForm({ title: "", content: "" });
  }

  // Save a new note
  // PUBLIC_INTERFACE
  function handleSaveNewNote(e) {
    e.preventDefault();
    if (!form.title.trim() && !form.content.trim()) return;
    const newNote = {
      ...getNewNote(),
      title: form.title.trim() || "Untitled Note",
      content: form.content,
    };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
    setMode("view");
    setForm({ title: "", content: "" });
  }

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setActiveId(id);
    setMode("view");
  }

  // PUBLIC_INTERFACE
  function handleEditNote() {
    const note = notes.find((n) => n.id === activeId);
    setForm({ title: note.title, content: note.content });
    setMode("edit");
  }

  // PUBLIC_INTERFACE
  function handleSaveEdit(e) {
    e.preventDefault();
    setNotes((ns) =>
      ns.map((n) =>
        n.id === activeId
          ? {
              ...n,
              title: form.title.trim() || "Untitled Note",
              content: form.content,
              updated: new Date().toISOString(),
            }
          : n
      )
    );
    setMode("view");
    setForm({ title: "", content: "" });
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    const idx = notes.findIndex((n) => n.id === id);
    let nextActive = null;
    if (notes.length > 1) {
      // If not last note, select next; otherwise previous.
      nextActive = idx < notes.length - 1 ? notes[idx + 1].id : notes[idx - 1].id;
    }
    setNotes(notes.filter((n) => n.id !== id));
    setActiveId(nextActive);
    setMode("view");
  }

  // Handler for inputs in forms
  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Format ISO date
  function formatDate(isostr) {
    try {
      return new Date(isostr).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  // Find the active note object
  const activeNote = notes.find((n) => n.id === activeId);

  return (
    <div className="notes-app-root" style={{ height: "100vh", background: COLORS.background }}>
      <div className="notes-header" style={{
        display: "flex",
        alignItems: "center",
        height: 64,
        padding: "0 2rem",
        background: "#fff",
        borderBottom: `1px solid ${COLORS.sidebarBorder}`,
        justifyContent: "space-between"
      }}>
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: COLORS.primary,
          letterSpacing: 1,
        }}>Notes</span>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            background: COLORS.accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            padding: "8px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          aria-label="Add Note"
          onClick={handleAddNote}
        >
          <span style={{ fontSize: 22, fontWeight: 700 }}>+</span> Add Note
        </button>
      </div>
      <div className="notes-main-layout" style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* Sidebar with note titles */}
        <aside className="notes-sidebar"
          style={{
            width: 270,
            minWidth: 200,
            background: COLORS.sidebarBg,
            borderRight: `1px solid ${COLORS.sidebarBorder}`,
            padding: "1rem 0",
            overflowY: "auto"
          }}>
          {notes.length === 0 && (
            <p style={{
              textAlign: "center", color: COLORS.placeholder, fontSize: 15, marginTop: "2rem"
            }}>
              No notes yet.<br />Click <b style={{ color: COLORS.accent }}>Add Note</b>.
            </p>
          )}
          <ul className="notes-list" style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}>
            {notes.map((note) => (
              <li key={note.id}
                className="sidebar-note-listitem"
                style={{
                  margin: "0 12px",
                  borderRadius: 8,
                  background: note.id === activeId ? "#fff" : "transparent",
                  border: note.id === activeId ? `1.5px solid ${COLORS.primary}` : "1.5px solid transparent",
                  boxShadow: note.id === activeId ? "0 2px 7px 0 rgba(31,41,55,0.06)" : "none",
                  padding: "0.7rem 0.8rem",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  marginBottom: 6,
                  transition: "background 0.13s, border 0.13s"
                }}
                onClick={() => handleSelectNote(note.id)}
                tabIndex={0}
                aria-label={`View note ${note.title}`}
              >
                <span
                  title={note.title}
                  style={{
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    fontWeight: 500,
                    lineHeight: "1.2",
                    fontSize: 15.5,
                    color: note.id === activeId ? COLORS.noteTitleActive : COLORS.noteTitle,
                    paddingBottom: 1,
                    letterSpacing: ".05em"
                  }}
                >{note.title || "Untitled Note"}</span>
                <span style={{
                  color: "#888",
                  fontSize: 12,
                  marginTop: 2,
                  fontFamily: "monospace",
                  letterSpacing: 0,
                }}>{formatDate(note.updated)}</span>
              </li>
            ))}
          </ul>
        </aside>
        {/* Main panel */}
        <main className="notes-main-content"
          style={{
            flex: 1, background: "#fff", padding: "2.3rem 2.7rem", minWidth: 0, overflowY: "auto", display: "flex",
            flexDirection: "column",
          }}>
          {/* ADD FORM */}
          {mode === "add" && (
            <form className="notes-addform" onSubmit={handleSaveNewNote}
              style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
              <input
                name="title"
                ref={titleInputRef}
                style={{
                  width: "100%",
                  fontSize: 22,
                  fontWeight: 700,
                  border: `1.7px solid ${COLORS.primary}`,
                  background: "#f9f9fb",
                  color: COLORS.noteTitle,
                  padding: "14px 15px",
                  borderRadius: 8,
                  marginBottom: 10,
                  outline: "none",
                  transition: "border 0.15s",
                  marginTop: 10,
                }}
                value={form.title}
                placeholder="Note Title"
                onChange={handleFormChange}
                autoComplete="off"
                maxLength={100}
                required
              />
              <textarea
                name="content"
                style={{
                  width: "100%",
                  minHeight: 170,
                  fontSize: 16.8,
                  color: COLORS.noteContent,
                  resize: "vertical",
                  border: `1.3px solid ${COLORS.sidebarBorder}`,
                  borderRadius: 8,
                  background: "#fafbfc",
                  padding: "14px 13px",
                  marginBottom: 18,
                  marginTop: 0
                }}
                value={form.content}
                placeholder="Write your note here..."
                onChange={handleFormChange}
                required
              />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="cancel-btn"
                  style={{
                    background: "none",
                    border: `1.2px solid ${COLORS.secondary}`,
                    color: COLORS.secondary,
                    borderRadius: 7,
                    padding: "10px 20px",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={() => { setMode("view"); setForm({ title: "", content: "" }); }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{
                    background: COLORS.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    padding: "10px 26px",
                    fontWeight: 600,
                    fontSize: 16,
                    letterSpacing: ".03em",
                    transition: "background 0.18s",
                    cursor: "pointer",
                  }}
                >Save</button>
              </div>
            </form>
          )}
          {/* EDIT FORM */}
          {mode === "edit" && activeNote && (
            <form className="notes-editform" onSubmit={handleSaveEdit}
              style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
              <input
                name="title"
                ref={titleInputRef}
                style={{
                  width: "100%",
                  fontSize: 22,
                  fontWeight: 700,
                  border: `1.7px solid ${COLORS.primary}`,
                  background: "#f9f9fb",
                  color: COLORS.noteTitle,
                  padding: "14px 15px",
                  borderRadius: 8,
                  marginBottom: 10,
                  outline: "none",
                  marginTop: 10,
                }}
                value={form.title}
                placeholder="Note Title"
                onChange={handleFormChange}
                maxLength={100}
                required
              />
              <textarea
                name="content"
                style={{
                  width: "100%",
                  minHeight: 170,
                  fontSize: 16.8,
                  color: COLORS.noteContent,
                  resize: "vertical",
                  border: `1.3px solid ${COLORS.sidebarBorder}`,
                  borderRadius: 8,
                  background: "#fafbfc",
                  padding: "14px 13px",
                  marginBottom: 18,
                  marginTop: 0
                }}
                value={form.content}
                placeholder="Write your note here..."
                onChange={handleFormChange}
                required
              />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="cancel-btn"
                  style={{
                    background: "none",
                    border: `1.2px solid ${COLORS.secondary}`,
                    color: COLORS.secondary,
                    borderRadius: 7,
                    padding: "10px 20px",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={() => { setMode("view"); setForm({ title: "", content: "" }); }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{
                    background: COLORS.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    padding: "10px 26px",
                    fontWeight: 600,
                    fontSize: 16,
                    letterSpacing: ".03em",
                    transition: "background 0.18s",
                    cursor: "pointer",
                  }}
                >Save</button>
              </div>
            </form>
          )}
          {/* VIEW (readonly note details) */}
          {(mode === "view" && !!activeNote) && (
            <div className="notes-viewpanel" style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
              <h2 style={{
                fontWeight: 800,
                fontSize: 28,
                margin: "10px 0 10px 0",
                color: COLORS.noteTitle
              }}>
                {activeNote.title}
              </h2>
              <div style={{
                display: "flex",
                alignItems: "center",
                color: "#888",
                fontSize: 13,
                marginBottom: 14
              }}>
                <span style={{ marginRight: 20, fontStyle: "italic" }}>
                  <span>Created: {formatDate(activeNote.created)}</span>
                </span>
                <span>
                  <span>Last updated: {formatDate(activeNote.updated)}</span>
                </span>
              </div>
              <p style={{
                fontSize: 17,
                color: COLORS.noteContent,
                minHeight: 48,
                marginTop: 10,
                marginBottom: 28,
                whiteSpace: "pre-wrap",
              }}>
                {activeNote.content || <span style={{ color: COLORS.placeholder, fontStyle: "italic" }}>No content</span>}
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                <button
                  style={{
                    background: COLORS.secondary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "11px 25px",
                    letterSpacing: ".01em",
                    cursor: "pointer",
                    marginRight: 4,
                  }}
                  onClick={handleEditNote}
                >Edit</button>
                <button
                  style={{
                    background: "#fff",
                    color: "#d32f2f",
                    border: "1.8px solid #d32f2f",
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: 15,
                    padding: "11px 24px",
                    letterSpacing: ".01em",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (window.confirm("Delete this note?")) {
                      handleDeleteNote(activeNote.id);
                    }
                  }}
                >Delete</button>
              </div>
            </div>
          )}
          {(mode === "view" && !activeNote && notes.length > 0) && (
            <div style={{ textAlign: "center", color: COLORS.placeholder, marginTop: 56, fontSize: 20 }}>
              Please select a note from the sidebar.
            </div>
          )}
          {(mode === "view" && notes.length === 0) && (
            <div style={{ textAlign: "center", color: COLORS.placeholder, marginTop: 86, fontSize: 24 }}>
              No notes yet.<br />Click <b style={{ color: COLORS.accent }}>Add Note</b> to get started!
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
