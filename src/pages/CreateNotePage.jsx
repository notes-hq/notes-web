import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNote } from '../api/notesApi.js';
import NoteForm from '../components/NoteForm.jsx';
import { buildNotePayload, getFrontendFieldErrors } from '../utils/notes.js';

const EMPTY_FORM = {
  title: '',
  noteText: '',
  tagsInput: ''
};

/**
 * Страница создания заметки с frontend-валидацией перед POST-запросом.
 */
export default function CreateNotePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Обновляет одно поле формы без сброса остальных значений.
   *
   * @param {'title' | 'noteText' | 'tagsInput'} field
   * @param {string} value
   * @returns {void}
   */
  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  /**
   * Валидирует форму, создает заметку и после успеха возвращает пользователя к списку.
   *
   * @returns {Promise<void>}
   */
  async function handleSubmit() {
    // Защита от двойной отправки, включая быстрый повтор Ctrl+Enter до re-render.
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
      await createNote(buildNotePayload(form));
      setForm(EMPTY_FORM);
      navigate('/');
    } catch (error) {
      setFormErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page-section narrow-section">
      <div className="page-heading">
        <div>
          <h1>Новая заметка</h1>
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
        submitLabel="Создать"
        savingLabel="Создание..."
        autoFocusTitle
        onTitleChange={(value) => updateForm('title', value)}
        onNoteTextChange={(value) => updateForm('noteText', value)}
        onTagsInputChange={(value) => updateForm('tagsInput', value)}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
