// Notes functionality
class NotesManager {
  constructor() {
    this.notes = Storage.getNotes();
    this.currentNoteId = null;
    this.searchQuery = '';
    this.init();
  }

  init() {
    this.renderNotes();
  }

  createNote() {
    this.currentNoteId = null;
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('delete-note-btn').classList.add('hidden');
    document.getElementById('pin-icon').classList.remove('text-yellow-500');
    document.getElementById('pin-icon').classList.add('text-gray-400');
    document.getElementById('note-modal').classList.remove('hidden');
    document.getElementById('note-modal').classList.add('flex');
    document.getElementById('note-title').focus();
  }

  editNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    this.currentNoteId = id;
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    document.getElementById('delete-note-btn').classList.remove('hidden');
    
    if (note.pinned) {
      document.getElementById('pin-icon').classList.add('text-yellow-500');
      document.getElementById('pin-icon').classList.remove('text-gray-400');
    } else {
      document.getElementById('pin-icon').classList.remove('text-yellow-500');
      document.getElementById('pin-icon').classList.add('text-gray-400');
    }
    
    document.getElementById('note-modal').classList.remove('hidden');
    document.getElementById('note-modal').classList.add('flex');
  }

  closeModal() {
    document.getElementById('note-modal').classList.add('hidden');
    document.getElementById('note-modal').classList.remove('flex');
    this.currentNoteId = null;
  }

  saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title && !content) {
      UI.showToast('Note cannot be empty', 'error');
      return;
    }

    const isPinned = document.getElementById('pin-icon').classList.contains('text-yellow-500');
    
    if (this.currentNoteId) {
      // Update existing note
      const note = this.notes.find(n => n.id === this.currentNoteId);
      if (note) {
        note.title = title || 'Untitled';
        note.content = content;
        note.pinned = isPinned;
        note.updatedAt = new Date().toISOString();
      }
    } else {
      // Create new note
      const note = {
        id: Date.now().toString(),
        title: title || 'Untitled',
        content: content,
        pinned: isPinned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.notes.unshift(note);
      Storage.addXP(5);
      Storage.updateStats({ notesCreated: (Storage.getStats().notesCreated || 0) + 1 });
    }

    Storage.saveNotes(this.notes);
    this.closeModal();
    this.renderNotes();
    UI.showToast('Note saved!', 'success');
  }

  deleteNote() {
    if (!this.currentNoteId) return;

    UI.confirm('Are you sure you want to delete this note?').then(confirmed => {
      if (confirmed) {
        this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
        Storage.saveNotes(this.notes);
        this.closeModal();
        this.renderNotes();
        UI.showToast('Note deleted', 'info');
      }
    });
  }

  togglePin() {
    const icon = document.getElementById('pin-icon');
    icon.classList.toggle('text-yellow-500');
    icon.classList.toggle('text-gray-400');
  }

  searchNotes(query) {
    this.searchQuery = query.toLowerCase();
    this.renderNotes();
  }

  getFilteredNotes() {
    let filtered = [...this.notes];
    
    // Sort: pinned first, then by updatedAt
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(this.searchQuery) ||
        note.content.toLowerCase().includes(this.searchQuery)
      );
    }
    
    return filtered;
  }

  renderNotes() {
    const container = document.getElementById('notes-container');
    if (!container) return;

    const filteredNotes = this.getFilteredNotes();

    if (filteredNotes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">No notes found</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredNotes.map(note => `
      <div class="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 fade-in cursor-pointer tilt-hover ${note.pinned ? 'ring-2 ring-yellow-400' : ''}" onclick="notesManager.editNote('${note.id}')">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex-1">${this.escapeHtml(note.title)}</h3>
          ${note.pinned ? `
            <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          ` : ''}
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">${this.escapeHtml(note.content)}</p>
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>${UI.getRelativeTime(note.updatedAt)}</span>
          <span>${note.content.length} chars</span>
        </div>
      </div>
    `).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize notes manager
let notesManager;
document.addEventListener('DOMContentLoaded', () => {
  notesManager = new NotesManager();
});

