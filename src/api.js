
const API_URL = ''

async function request(endpoint, userData, method = 'POST') {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(userData !== undefined
      ? { body: JSON.stringify(userData) }
      : {})
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.')
  }

  return data
}

export function signup(userData) {
  return request('/api/users/signup', userData)
}

export function login(userData) {
  return request('/api/users/login', userData)
}

export function getRecipes() {
  return request('/api/recipes', undefined, 'GET')
}

export function createRecipe(recipe) {
  return request('/api/recipes', recipe)
}

export function updateRecipe(id, recipe) {
  return request(`/api/recipes/${id}`, recipe, 'PUT')
}

export function deleteRecipe(id) {
  return request(`/api/recipes/${id}`, undefined, 'DELETE')
}
