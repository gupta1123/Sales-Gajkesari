import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import "./NotesTimeline.css";
import { useSelector } from 'react-redux';

type Note = {
  id: string;
  content: string;
  createdDate: string;
};

type NotesSectionProps = {
  storeId: string;
};

type RootState = {
  auth: {
    token: string;
  };
};

export default function NotesSection({ storeId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/getByStore?id=${storeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() !== "") {
      try {
        const response = await fetch("http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newNote,
            employeeId: 1, // Replace with the actual employeeId
            storeId: storeId,
          }),
        });

        if (response.ok) {
          const noteId = await response.text();
          const note: Note = {
            id: noteId,
            content: newNote,
            createdDate: new Date().toISOString(),
          };
          setNotes([...notes, note]);
          setNewNote("");
        } else {
          console.error("Error creating note:", response.statusText);
        }
      } catch (error) {
        console.error("Error creating note:", error);
      }
    }
  };

  const handleEditNote = (id: string) => {
    setEditingNoteId(id);
    const note = notes.find((note) => note.id === id);
    if (note) {
      setNewNote(note.content);
    }
  };

  const handleUpdateNote = async () => {
    if (newNote.trim() !== "" && editingNoteId !== null) {
      try {
        const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/edit?id=${editingNoteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newNote,
            employeeId: 1, // Replace with the actual employeeId
            storeId: storeId,
          }),
        });

        if (response.ok) {
          const updatedNotes = notes.map((note) => {
            if (note.id === editingNoteId) {
              return { ...note, content: newNote };
            }
            return note;
          });
          setNotes(updatedNotes);
          setNewNote("");
          setEditingNoteId(null);
        } else {
          console.error("Error updating note:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/delete?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedNotes = notes.filter((note) => note.id !== id);
        setNotes(updatedNotes);
      } else {
        console.error("Error deleting note:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Textarea
            placeholder="Enter note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full"
          />
        </div>
        {editingNoteId ? (
          <div className="flex justify-end space-x-2">
            <Button onClick={handleUpdateNote} variant="default">
              Update
            </Button>
            <Button onClick={() => setEditingNoteId(null)} variant="outline">
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={handleAddNote} className="w-full">
            Add Note
          </Button>
        )}
        {notes.length > 0 && (
          <div className="notes-timeline">
            {notes.map((note) => (
              <div key={note.id} className="notes-timeline-item">
                <div className="notes-timeline-point"></div>
                <div className="notes-timeline-content">
                  <div className="notes-timeline-date">
                    {format(new Date(note.createdDate), "MMM d, yyyy")}
                  </div>
                  <div className="notes-timeline-text">{note.content}</div>
                  <div className="notes-timeline-actions">
                    <Button
                      onClick={() => handleEditNote(note.id)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}