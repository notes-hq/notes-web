import { Link } from 'react-router-dom';
import { formatDate, getPreviewText, getTagColorClass } from '../utils/notes.js';

/**
 * Карточка заметки в списке: показывает preview, теги и действия редактирования/удаления.
 */
export default function NoteCard({ note, deletingNoteId, onDelete }) {
  const preview = getPreviewText(note);
  const isDeleting = deletingNoteId === note.id;
  const isDeleteDisabled = deletingNoteId !== null;

  return (
    <article className="note-card">
      <div className="note-card-main">
        <div className="note-card-heading">
          <h2>{note.title}</h2>
          <span className="note-date">{formatDate(note.updatedAt || note.createdAt)}</span>
        </div>

        {preview ? <p className="note-preview">{preview}</p> : null}

        {note.tags.length > 0 ? (
          <div className="tag-list" aria-label="Теги заметки">
            {note.tags.map((tag) => (
              <span className={`tag-chip ${getTagColorClass(tag)}`} key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="note-actions">
        <Link className="button subtle-button" to={`/edit/${note.id}`}>
          Редактировать
        </Link>
        <button
          className="button danger-button"
          type="button"
          onClick={() => onDelete(note.id)}
          disabled={isDeleteDisabled}
        >
          {isDeleting ? 'Удаление...' : 'Удалить'}
        </button>
      </div>
    </article>
  );
}
