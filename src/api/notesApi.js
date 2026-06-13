const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Ошибка API с сохранением HTTP-статуса; для сетевых ошибок status равен null.
 */
export class ApiError extends Error {
  /**
   * @param {number | null} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Строит полный URL API и не добавляет пустые query-параметры.
 *
 * @param {string} path
 * @param {Record<string, string | undefined | null>} query
 * @returns {string}
 */
function buildUrl(path, query = {}) {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = new URL(`${base}${path}`, window.location.origin);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * Выполняет fetch и приводит успешные/ошибочные ответы backend к единому виду.
 *
 * @param {string} path
 * @param {object} options
 * @returns {Promise<unknown>}
 */
async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body
    });
  } catch {
    throw new ApiError(null, 'Не удалось подключиться к серверу');
  }

  // 204 No Content приходит без тела, поэтому response.json() здесь не вызывается.
  if (response.status === 204) {
    return undefined;
  }

  if (response.ok) {
    return response.json();
  }

  let message = 'Ошибка запроса';

  try {
    const errorBody = await response.json();
    if (errorBody && typeof errorBody.message === 'string') {
      message = errorBody.message;
    }
  } catch {
    message = response.status >= 500 ? 'Ошибка сервера' : 'Ошибка запроса';
  }

  throw new ApiError(response.status, message);
}

/**
 * Загружает список заметок с необязательными search/tag-фильтрами.
 *
 * @param {{ search?: string, tag?: string }} filters
 * @returns {Promise<unknown>}
 */
export function getNotes({ search, tag } = {}) {
  return request('/notes', {
    query: {
      search,
      tag
    }
  });
}

/**
 * Загружает одну заметку по id для страницы редактирования.
 *
 * @param {string | number} id
 * @returns {Promise<unknown>}
 */
export function getNote(id) {
  return request(`/notes/${id}`);
}

/**
 * Создает заметку через POST /notes.
 *
 * @param {{ title: string, content: string }} payload
 * @returns {Promise<unknown>}
 */
export function createNote(payload) {
  return request('/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

/**
 * Обновляет заметку через PATCH /notes/:id.
 *
 * @param {string | number} id
 * @param {{ title: string, content: string }} payload
 * @returns {Promise<unknown>}
 */
export function updateNote(id, payload) {
  return request(`/notes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

/**
 * Удаляет заметку; успешный ответ ожидается как 204 без тела.
 *
 * @param {string | number} id
 * @returns {Promise<unknown>}
 */
export function deleteNote(id) {
  return request(`/notes/${id}`, {
    method: 'DELETE'
  });
}
