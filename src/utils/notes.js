export const TAG_COLOR_CLASSES = [
  'tag--cyan',
  'tag--blue',
  'tag--green',
  'tag--violet',
  'tag--amber',
  'tag--rose'
];

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

export function normalizeTagFilter(value) {
  const trimmed = value.trim();
  const withoutHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;

  return withoutHash.trim().toLowerCase();
}

export function hasHashtagToken(value) {
  return value
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .some((token) => token.startsWith('#'));
}

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

export function getFormValuesFromNote(note) {
  return {
    title: note.title,
    noteText: getContentWithoutServiceTagLine(note),
    tagsInput: Array.isArray(note.tags) ? note.tags.join(', ') : ''
  };
}

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

export function getPreviewText(note) {
  const text = getContentWithoutServiceTagLine(note).trim();

  if (text.length <= 200) {
    return text;
  }

  return `${text.slice(0, 197).trimEnd()}...`;
}

export function getTagColorClass(tag) {
  let hash = 0;

  for (const char of tag) {
    hash = (hash * 31 + char.codePointAt(0)) | 0;
  }

  return TAG_COLOR_CLASSES[Math.abs(hash) % TAG_COLOR_CLASSES.length];
}

export function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

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

function findLastNonEmptyLineIndex(lines) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].trim() !== '') {
      return index;
    }
  }

  return -1;
}

function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
}
