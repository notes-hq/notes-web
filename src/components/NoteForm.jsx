import { Link } from 'react-router-dom';

/**
 * Общая форма создания и редактирования заметки с Ctrl+Enter для отправки.
 */
export default function NoteForm({
  title,
  noteText,
  tagsInput,
  fieldErrors,
  formErrorMessage,
  isSaving,
  submitLabel,
  savingLabel,
  autoFocusTitle,
  onTitleChange,
  onNoteTextChange,
  onTagsInputChange,
  onSubmit,
  children
}) {
  /**
   * Передает submit формы в страницу, где находится валидация и API-запрос.
   *
   * @param {SubmitEvent} event
   * @returns {void}
   */
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  /**
   * Поддерживает горячую клавишу Ctrl+Enter без отдельной кнопки в UI.
   *
   * @param {KeyboardEvent} event
   * @returns {void}
   */
  function handleKeyDown(event) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
      {formErrorMessage ? <div className="error-message form-message">{formErrorMessage}</div> : null}

      <div className="field">
        <label htmlFor="note-title">Заголовок</label>
        <input
          id="note-title"
          type="text"
          value={title}
          maxLength={255}
          onChange={(event) => onTitleChange(event.target.value)}
          autoFocus={autoFocusTitle}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? 'note-title-error' : undefined}
        />
        {fieldErrors.title ? (
          <span className="field-error" id="note-title-error">
            {fieldErrors.title}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="note-text">Текст</label>
        <textarea
          id="note-text"
          value={noteText}
          onChange={(event) => onNoteTextChange(event.target.value)}
          rows={10}
          aria-invalid={Boolean(fieldErrors.noteText)}
          aria-describedby={fieldErrors.noteText ? 'note-text-error' : undefined}
        />
        {fieldErrors.noteText ? (
          <span className="field-error" id="note-text-error">
            {fieldErrors.noteText}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="note-tags">Теги</label>
        <input
          id="note-tags"
          type="text"
          value={tagsInput}
          onChange={(event) => onTagsInputChange(event.target.value)}
        />
        <span className="help-text">Разделяйте теги запятыми или пробелами.</span>
      </div>

      <div className="form-actions">
        <button className="button primary-button" type="submit" disabled={isSaving}>
          {isSaving ? savingLabel : submitLabel}
        </button>
        {children}
        <Link className="button subtle-button" to="/">
          К списку
        </Link>
      </div>
    </form>
  );
}
