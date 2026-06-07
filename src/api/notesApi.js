const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buildUrl(path, query = {}) {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = new URL(`${base}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

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

export function getNotes({ search, tag } = {}) {
  return request('/notes', {
    query: {
      search,
      tag
    }
  });
}

export function getNote(id) {
  return request(`/notes/${id}`);
}

export function createNote(payload) {
  return request('/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateNote(id, payload) {
  return request(`/notes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteNote(id) {
  return request(`/notes/${id}`, {
    method: 'DELETE'
  });
}
