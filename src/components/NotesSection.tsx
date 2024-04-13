import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import "./NotesTimeline.css";
import Link from 'next/link';

// Define types for props and state
type Note = {
  id: string;
  content: string;
  createdDate: string;
  employeeName: string;
  visitId?: string;  // Optional Visit ID
};

type NotesSectionProps = {
  storeId: string;
};

type RootState = {
  auth: {
    token: string;
  };
};

// Component definition
export default function NotesSection({ storeId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showTextarea, setShowTextarea] = useState<boolean>(false);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    fetchNotes();
  }, [storeId]);

  // Fetch notes from the server
  const fetchNotes = async () => {
    try {
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/getByStore?id=${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Show textarea to add a new note
  const handleAddNote = () => {
    setShowTextarea(true);
    setEditingNoteId(null);
  };

  // Save or update note
  const handleSaveOrUpdateNote = async () => {
    if (!newNote.trim()) return;

    const url = editingNoteId
      ? `http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/edit?id=${editingNoteId}`
      : "http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/create";
    const method = editingNoteId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNote, employeeId: 1, employeeName: "XYZ", storeId }),
      });

      if (response.ok) {
        const noteId = editingNoteId ? editingNoteId : await response.text();
        const updatedOrNewNote = {
          id: noteId,
          content: newNote,
          createdDate: editingNoteId ? notes.find(note => note.id === editingNoteId)!.createdDate : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          employeeName: "XYZ"
        };

        const updatedNotes = editingNoteId ? notes.map(note => note.id === editingNoteId ? updatedOrNewNote : note) : [...notes, updatedOrNewNote];
        setNotes(updatedNotes);
        resetForm();
      } else {
        console.error("Error saving/updating note:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving/updating note:", error);
    }
  };

  // Set state for editing a note
  const handleEditNote = (id: string) => {
    const note = notes.find(note => note.id === id);
    if (note) {
      setNewNote(note.content);
      setShowTextarea(true);
      setEditingNoteId(id);
    }
  };

  // Delete a note
  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`http://ec2-13-49-190-97.eu-north-1.compute.amazonaws.com:8081/notes/delete?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        console.error("Error deleting note:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setShowTextarea(false);
    setNewNote("");
    setEditingNoteId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Note Management</CardTitle>
      </CardHeader>
      <CardContent>
        {showTextarea && (
          <div className="mb-4">
            <Textarea
              placeholder="Enter note"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              className="w-full mb-4"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={handleSaveOrUpdateNote} variant="default">Save</Button>
              <Button onClick={resetForm} variant="outline">Cancel</Button>
            </div>
          </div>
        )}
        {!showTextarea && (
          <div className="flex justify-center">
            <Button onClick={handleAddNote} className="px-4">Add Note</Button>
          </div>
        )}
        {notes.length > 0 && (
          <div className="notes-timeline">
            {notes.map(note => (
              <div key={note.id} className="notes-timeline-item">
                <div className="notes-timeline-point"></div>
                <div className="notes-timeline-content">
                  <div className="notes-timeline-date">
                    {format(new Date(note.createdDate), "MMM d, yyyy")}
                  </div>
                  <div className="notes-timeline-text">{note.content}</div>
                  <div className="text-gray-500">Employee: {note.employeeName}</div>
                  {note.visitId && (
                    <Link href={`/VisitDetailPage/${note.visitId}`}>
                      <a className="visit-id-display">Visit ID: {note.visitId}</a>
                    </Link>
                  )}
                  <div className="notes-timeline-actions">
                    <Button onClick={() => handleEditNote(note.id)} variant="ghost" size="sm">Edit</Button>
                    <Button onClick={() => handleDeleteNote(note.id)} variant="ghost" size="sm" className="text-red-500">Delete</Button>
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