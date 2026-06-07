import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteNote, getNotes } from '../api/notesApi.js';
import Filters from '../components/Filters.jsx';
import NoteCard from '../components/NoteCard.jsx';
import { normalizeTagFilter } from '../utils/notes.js';

const EMPTY_FILTERS = {
  search: '',
  tag: ''
};

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestErrorMessage, setRequestErrorMessage] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [tagFilterValue, setTagFilterValue] = useState('');
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  async function fetchNotes(filters) {
    setIsLoading(true);
    setRequestErrorMessage('');

    try {
      const data = await getNotes(filters);
      setNotes(data);
    } catch (error) {
      setRequestErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes(EMPTY_FILTERS);
  }, []);

  async function handleApplyFilters() {
    const nextFilters = {
      search: searchValue.trim(),
      tag: normalizeTagFilter(tagFilterValue)
    };

    setSearchValue(nextFilters.search);
    setTagFilterValue(nextFilters.tag);
    setActiveFilters(nextFilters);
    await fetchNotes(nextFilters);
  }

  async function handleResetFilters() {
    setSearchValue('');
    setTagFilterValue('');
    setActiveFilters(EMPTY_FILTERS);
    await fetchNotes(EMPTY_FILTERS);
  }

  async function handleDelete(id) {
    if (deletingNoteId !== null) {
      return;
    }

    const confirmed = window.confirm('Удалить заметку?');

    if (!confirmed) {
      return;
    }

    setDeletingNoteId(id);
    setRequestErrorMessage('');

    try {
      await deleteNote(id);
      await fetchNotes(activeFilters);
    } catch (error) {
      setRequestErrorMessage(error.message);
    } finally {
      setDeletingNoteId(null);
    }
  }

  const hasActiveFilters = Boolean(activeFilters.search || activeFilters.tag);
  const showEmptyState = !isLoading && !requestErrorMessage && notes.length === 0;

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>Все заметки</h1>
          <p className="page-subtitle">Найдено: {notes.length}</p>
        </div>
        <Link className="button primary-button" to="/create">
          Новая заметка
        </Link>
      </div>

      <Filters
        searchValue={searchValue}
        tagFilterValue={tagFilterValue}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
        onSearchChange={setSearchValue}
        onTagFilterChange={setTagFilterValue}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {requestErrorMessage ? <div className="error-message">{requestErrorMessage}</div> : null}
      {isLoading ? <div className="state-panel">Загрузка заметок...</div> : null}

      {showEmptyState ? (
        <div className="state-panel">
          {hasActiveFilters ? (
            <>
              <h2>Ничего не найдено</h2>
              <button className="button subtle-button" type="button" onClick={handleResetFilters}>
                Сбросить фильтры
              </button>
            </>
          ) : (
            <>
              <h2>Заметок пока нет</h2>
              <Link className="button primary-button" to="/create">
                Создать первую
              </Link>
            </>
          )}
        </div>
      ) : null}

      {!isLoading && notes.length > 0 ? (
        <div className="notes-list">
          {notes.map((note) => (
            <NoteCard note={note} deletingNoteId={deletingNoteId} onDelete={handleDelete} key={note.id} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
