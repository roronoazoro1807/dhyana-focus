import { useState, useEffect } from 'react';
import { Plus, X, Edit, Save, Trash } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('quick-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Failed to parse saved notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quick-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const newNoteObj: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: Date.now()
    };
    
    setNotes([newNoteObj, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    setNotes(notes.map(note => 
      note.id === editingId 
        ? { ...note, content: editContent.trim() } 
        : note
    ));
    
    setEditingId(null);
    setEditContent('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">
          <span className="block">त्वरित नोट्स</span>
          <span className="block text-lg text-primary">Quick Notes</span>
        </h2>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 mb-4">
        <div className="flex items-center mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a quick note..."
            className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-black/50 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={2}
          />
          <button
            onClick={addNote}
            disabled={!newNote.trim()}
            className="ml-2 p-2 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add note"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No notes yet. Add one above!
            </div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id} 
                className="p-3 rounded-lg bg-black/50 border border-gray-700"
              >
                {editingId === note.id ? (
                  <div className="flex flex-col">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-black/50 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none mb-2"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="p-1 rounded text-gray-400 hover:text-gray-200"
                        aria-label="Cancel"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={!editContent.trim()}
                        className="p-1 rounded text-primary hover:text-primary/80 disabled:opacity-50"
                        aria-label="Save"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap break-words text-gray-200 mb-2">
                      {note.content}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1 rounded text-gray-400 hover:text-primary"
                          aria-label="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-500"
                          aria-label="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 