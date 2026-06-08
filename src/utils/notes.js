export const TAG_COLOR_CLASSES = [
  'tag--cyan',
  'tag--blue',
  'tag--green',
  'tag--violet',
  'tag--amber',
  'tag--rose'
];

/**
 * Нормализует пользовательский ввод тегов перед отправкой на backend.
 * Разделителями считаются запятые и пробелы; начальный # убирается,
 * регистр приводится к lowercase, дубликаты удаляются с сохранением порядка.
 *
 * @param {string} value
 * @returns {string[]}
 */
export function normalizeTagsInput(value) {
  const seen = new Set();
  const normalized = [];

  value
    .split(/[,\s]+/u)
    .map((item) => item.trim())
    .forEach((item) => {
      const withoutHash = item.startsWith('#') ? item.slice(1) : item;
      const tag = withoutHash.trim().toLowerCase();

      if (tag && !seen.has(tag)) {
        seen.add(tag);
        normalized.push(tag);
      }
    });

  return normalized;
}

/**
 * Нормализует значение одиночного tag-фильтра для GET /notes.
 *
 * @param {string} value
 * @returns {string}
 */
export function normalizeTagFilter(value) {
  const trimmed = value.trim();
  const withoutHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;

  return withoutHash.trim().toLowerCase();
}

/**
 * Проверяет, не пытается ли пользователь ввести тег прямо в текст заметки.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function hasHashtagToken(value) {
  return value
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .some((token) => token.startsWith('#'));
}

/**
 * Выполняет frontend-валидацию полей формы до отправки запроса.
 *
 * @param {{ title: string, noteText: string }} form
 * @returns {{ title?: string, noteText?: string }}
 */
export function getFrontendFieldErrors({ title, noteText }) {
  const errors = {};

  if (!title.trim()) {
    errors.title = 'Введите заголовок.';
  }

  if (!noteText.trim()) {
    errors.noteText = 'Введите текст заметки.';
  } else if (hasHashtagToken(noteText)) {
    errors.noteText = 'Теги вводятся только в поле «Теги».';
  }

  return errors;
}

/**
 * Собирает payload backend: текст заметки и нормализованные теги объединяются в content.
 * Если теги есть, они добавляются отдельной последней строкой в формате #tag.
 *
 * @param {{ title: string, noteText: string, tagsInput: string }} form
 * @returns {{ title: string, content: string }}
 */
export function buildNotePayload({ title, noteText, tagsInput }) {
  const normalizedTags = normalizeTagsInput(tagsInput);
  const trimmedText = noteText.trim();
  const content =
    normalizedTags.length > 0
      ? `${trimmedText}\n${normalizedTags.map((tag) => `#${tag}`).join(' ')}`
      : trimmedText;

  return {
    title: title.trim(),
    content
  };
}

/**
 * Раскладывает backend-модель заметки обратно в поля формы редактирования.
 *
 * @param {{ title: string, content: string, tags?: string[] }} note
 * @returns {{ title: string, noteText: string, tagsInput: string }}
 */
export function getFormValuesFromNote(note) {
  return {
    title: note.title,
    noteText: getContentWithoutServiceTagLine(note),
    tagsInput: Array.isArray(note.tags) ? note.tags.join(', ') : ''
  };
}

/**
 * Убирает служебную последнюю строку тегов только при уверенном совпадении с note.tags.
 * Если заметка создана другим клиентом и строку нельзя распознать безопасно,
 * content возвращается без попытки агрессивного парсинга.
 *
 * @param {{ content?: string, tags?: string[] }} note
 * @returns {string}
 */
export function getContentWithoutServiceTagLine(note) {
  const content = typeof note.content === 'string' ? note.content : '';
  const serviceLineIndex = findServiceTagLineIndex(content, note.tags);

  if (serviceLineIndex === -1) {
    return content;
  }

  return content
    .split(/\r?\n/u)
    .slice(0, serviceLineIndex)
    .join('\n')
    .trimEnd();
}

/**
 * Формирует короткий preview карточки без служебной строки тегов.
 *
 * @param {{ content?: string, tags?: string[] }} note
 * @returns {string}
 */
export function getPreviewText(note) {
  const text = getContentWithoutServiceTagLine(note).trim();

  if (text.length <= 200) {
    return text;
  }

  return `${text.slice(0, 197).trimEnd()}...`;
}

/**
 * Стабильно выбирает CSS-класс цвета по содержимому тега.
 * Один и тот же тег получает один цвет при каждом рендере.
 *
 * @param {string} tag
 * @returns {string}
 */
export function getTagColorClass(tag) {
  let hash = 0;

  for (const char of tag) {
    hash = (hash * 31 + char.codePointAt(0)) | 0;
  }

  return TAG_COLOR_CLASSES[Math.abs(hash) % TAG_COLOR_CLASSES.length];
}

/**
 * Форматирует ISO-дату backend в русскую локаль для интерфейса.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

/**
 * Находит индекс служебной строки тегов в content.
 * Строка считается служебной только если она последняя непустая,
 * состоит исключительно из hashtag-токенов и после нормализации совпадает с note.tags.
 *
 * @param {string} content
 * @param {string[] | undefined} tags
 * @returns {number}
 */
function findServiceTagLineIndex(content, tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return -1;
  }

  const lines = content.split(/\r?\n/u);
  const lastNonEmptyIndex = findLastNonEmptyLineIndex(lines);

  if (lastNonEmptyIndex === -1) {
    return -1;
  }

  const line = lines[lastNonEmptyIndex].trim();
  const tokens = line.split(/\s+/u).filter(Boolean);

  if (tokens.length === 0 || !tokens.every((token) => token.startsWith('#'))) {
    return -1;
  }

  const lineTags = normalizeTagsInput(tokens.join(' '));
  const noteTags = tags.map((tag) => String(tag).toLowerCase());

  if (!arraysEqual(lineTags, noteTags)) {
    return -1;
  }

  return lastNonEmptyIndex;
}

/**
 * Возвращает индекс последней строки, содержащей непробельные символы.
 *
 * @param {string[]} lines
 * @returns {number}
 */
function findLastNonEmptyLineIndex(lines) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].trim() !== '') {
      return index;
    }
  }

  return -1;
}

/**
 * Сравнивает два массива тегов по длине, порядку и значениям.
 *
 * @param {string[]} left
 * @param {string[]} right
 * @returns {boolean}
 */
function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
}
