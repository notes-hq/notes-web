import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteNote, getNote, updateNote } from '../api/notesApi.js';
import NoteForm from '../components/NoteForm.jsx';
import { buildNotePayload, getFormValuesFromNote, getFrontendFieldErrors } from '../utils/notes.js';

const EMPTY_FORM = {
  title: '',
  noteText: '',
  tagsInput: ''
};

export default function EditNotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentNote, setCurrentNote] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [requestErrorMessage, setRequestErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadNote() {
      setIsLoading(true);
      setCurrentNote(null);
      setNotFound(false);
      setRequestErrorMessage('');
      setFormErrorMessage('');
      setFieldErrors({});

      try {
        const note = await getNote(id);

        if (ignore) {
          return;
        }

        setCurrentNote(note);
        setForm(getFormValuesFromNote(note));
      } catch (error) {
        if (ignore) {
          return;
        }

        if (error.status === 400 || error.status === 404) {
          setNotFound(true);
          setRequestErrorMessage('Заметка не найдена');
        } else {
          setRequestErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadNote();

    return () => {
      ignore = true;
    };
  }, [id]);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit() {
    if (isSaving) {
      return;
    }

    const nextFieldErrors = getFrontendFieldErrors(form);
    setFieldErrors(nextFieldErrors);
    setFormErrorMessage('');

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      await updateNote(id, buildNotePayload(form));
      setForm(EMPTY_FORM);
      navigate('/');
    } catch (error) {
      setFormErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!currentNote || deletingNoteId !== null) {
      return;
    }

    const confirmed = window.confirm('Удалить заметку?');

    if (!confirmed) {
      return;
    }

    setDeletingNoteId(currentNote.id);
    setFormErrorMessage('');

    try {
      await deleteNote(currentNote.id);
      navigate('/');
    } catch (error) {
      setFormErrorMessage(error.message);
    } finally {
      setDeletingNoteId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="page-section narrow-section">
        <div className="state-panel">Загрузка заметки...</div>
      </section>
    );
  }

  if (notFound || (!currentNote && requestErrorMessage)) {
    return (
      <section className="page-section narrow-section">
        <div className="state-panel">
          <h1>{notFound ? 'Заметка не найдена' : 'Не удалось загрузить заметку'}</h1>
          <p>{requestErrorMessage}</p>
          <Link className="button primary-button" to="/">
            Вернуться к списку
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section narrow-section">
      <div className="page-heading">
        <div>
          <h1>Редактирование заметки</h1>
          <p className="page-subtitle">Ctrl+Enter сохраняет форму</p>
        </div>
      </div>

      <NoteForm
        title={form.title}
        noteText={form.noteText}
        tagsInput={form.tagsInput}
        fieldErrors={fieldErrors}
        formErrorMessage={formErrorMessage}
        isSaving={isSaving}
        submitLabel="Сохранить"
        savingLabel="Сохранение..."
        onTitleChange={(value) => updateForm('title', value)}
        onNoteTextChange={(value) => updateForm('noteText', value)}
        onTagsInputChange={(value) => updateForm('tagsInput', value)}
        onSubmit={handleSubmit}
      >
        <button
          className="button danger-button"
          type="button"
          onClick={handleDelete}
          disabled={isSaving || deletingNoteId !== null}
        >
          {deletingNoteId !== null ? 'Удаление...' : 'Удалить'}
        </button>
      </NoteForm>
    </section>
  );
}
