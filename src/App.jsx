
import { useEffect, useState } from 'react'
import {
  signup,
  login,
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from './api'



export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [view, setView] = useState('home')
  const [recipes, setRecipes] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [category, setCategory] = useState('Other')
  const [image, setImage] = useState('')
  const [editingId, setEditingId] = useState(null)

  async function loadRecipes() {
    try {
      setRecipes(await getRecipes())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  async function handleAuth(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = view === 'signup'
        ? await signup({ username, password })
        : await login({ username, password })

      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))

      setUser(result.user)
      setUsername('')
      setPassword('')
      setView('home')

      await loadRecipes()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setView('home')
  }

  function resetForm() {
    setTitle('')
    setDescription('')
    setIngredients('')
    setInstructions('')
    setCategory('Other')
    setImage('')
    setEditingId(null)
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      event.target.value = ''
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      setError('Please choose an image smaller than 4 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onloadend = () => {
      setImage(reader.result)
      setError('')
    }

    reader.onerror = () => {
      setError('Unable to read this image. Please try another.')
    }

    reader.readAsDataURL(file)
  }

  async function handleRecipeSubmit(event) {
    event.preventDefault()
    setError('')

    const recipe = {
      title,
      description,
      image,
      ingredients: ingredients
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean),
      instructions,
      category
    }

    try {
      if (editingId) {
        await updateRecipe(editingId, recipe)
      } else {
        await createRecipe(recipe)
      }

      resetForm()
      setView('home')
      await loadRecipes()
    } catch (err) {
      setError(err.message)
    }
  }

  function editRecipe(recipe) {
    setEditingId(recipe._id)
    setTitle(recipe.title)
    setDescription(recipe.description || '')
    setIngredients((recipe.ingredients || []).join('\n'))
    setInstructions(recipe.instructions || '')
    setCategory(recipe.category || 'Other')
    setImage(recipe.image || '')
    setView('create')
    setError('')
  }

  async function removeRecipe(id) {
    if (!window.confirm('Delete this recipe?')) return

    try {
      await deleteRecipe(id)
      await loadRecipes()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <h1 onClick={() => setView('home')}>Recipe Share</h1>

        <nav>
          <button onClick={() => setView('home')}>Recipes</button>

          {user ? (
            <>
              <button onClick={() => {
                resetForm()
                setError('')
                setView('create')
              }}>
                Add Recipe
              </button>

              <span className="welcome">
                Hi, {user.username}
              </span>

              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')}>Login</button>
              <button
                className="primary"
                onClick={() => setView('signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        {error && <p className="error">{error}</p>}

        {(view === 'login' || view === 'signup') && (
          <section className="auth-card">
            <h2>
              {view === 'signup' ? 'Create an Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleAuth}>
              <label>Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />

              <button className="primary" disabled={loading}>
                {loading
                  ? 'Please wait...'
                  : view === 'signup'
                    ? 'Sign Up'
                    : 'Login'}
              </button>
            </form>

            <p>
              {view === 'signup'
                ? 'Already registered?'
                : 'Need an account?'}

              <button
                className="link"
                onClick={() => {
                  setError('')
                  setView(view === 'signup' ? 'login' : 'signup')
                }}
              >
                {view === 'signup' ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </section>
        )}

        {view === 'create' && user && (
          <section className="form-card">
            <h2>{editingId ? 'Edit Recipe' : 'Share a Recipe'}</h2>
            <p>Share Recipe </p>

            <form onSubmit={handleRecipeSubmit}>
              <label>Recipe Title</label>
              <input
                type="text"
                placeholder="Enter your recipe title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              <label>Recipe Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {image && (
                <div className="image-preview">
                  <img
                    src={image}
                    alt="Recipe preview"
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      maxHeight: '260px',
                      objectFit: 'cover',
                      borderRadius: '10px'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setImage('')}
                  >
                    Remove Picture
                  </button>
                </div>
              )}

              <label>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
                <option value="Other">Other</option>
              </select>

              <label>Ingredients (one per line)</label>
              <textarea
                placeholder={'EXAMPLE\n2 cups flour\n1 cup milk\n2 eggs'}
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                required
                rows="6"
              />

              <label>Instructions</label>
              <textarea
                placeholder="Describe how to prepare"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                required
                rows="7"
              />

              <button className="primary" type="submit">
                {editingId ? 'Save Changes' : 'Publish Recipe'}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setView('home')
                }}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        {view === 'home' && (
          <>
            <section className="hero">
              <h2>Share Recipes</h2>

              <p>
                
              </p>

              {user && (
                <button
                  className="primary"
                  onClick={() => {
                    resetForm()
                    setView('create')
                  }}
                >
                  Share Your Recipe
                </button>
              )}
            </section>

            <section className="recipe-section">
              <h2>Community Recipes</h2>

              {recipes.length === 0 ? (
                <p>No recipes yet</p>
              ) : (
                <div className="recipe-grid">
                  {recipes.map(recipe => (
                    <article
                      className="recipe-card"
                      key={recipe._id}
                    >
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '10px'
                          }}
                        />
                      )}

                      <span className="category">
                        {recipe.category}
                      </span>

                      <h3>{recipe.title}</h3>
                      <p>{recipe.description}</p>

                      <p className="author">
                        Shared by {recipe.author?.username || 'Unknown'}
                      </p>

                      <h4>Ingredients</h4>
                      <ul>
                        {(recipe.ingredients || []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>

                      <h4>Instructions</h4>
                      <p>{recipe.instructions}</p>

                      {user && recipe.author?._id === user.id && (
                        <div className="recipe-actions">
                          <button onClick={() => editRecipe(recipe)}>
                            Edit
                          </button>

                          <button
                            className="danger"
                            onClick={() => removeRecipe(recipe._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer>
        <p>Recipe Share </p>
      </footer>
    </div>
  )
}
