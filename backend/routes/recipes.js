import express from 'express'
import Recipe from '../models/Recipe.js'
import authenticate from '../middleware/auth.js'

const router = express.Router()

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })

    res.json(recipes)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Unable to load recipes.'
    })
  }
})

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username')

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found.'
      })
    }

    res.json(recipe)
  } catch {
    res.status(400).json({
      message: 'Invalid recipe ID.'
    })
  }
})

// Create recipe
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      category
    } = req.body

    if (
      !title ||
      !instructions ||
      !Array.isArray(ingredients) ||
      !ingredients.length
    ) {
      return res.status(400).json({
        message: 'Title, ingredients, and instructions are required.'
      })
    }

    const recipe = await Recipe.create({
      title,
      description,
      ingredients,
      instructions,
      category,
      author: req.userId
    })

    await recipe.populate('author', 'username')
    res.status(201).json(recipe)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Unable to create recipe.'
    })
  }
})

// Update recipe
router.put('/:id', authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found.'
      })
    }

    if (recipe.author.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Not authorized.'
      })
    }

    const {
      title,
      description,
      ingredients,
      instructions,
      category
    } = req.body

    recipe.title = title ?? recipe.title
    recipe.description = description ?? recipe.description
    recipe.ingredients = ingredients ?? recipe.ingredients
    recipe.instructions = instructions ?? recipe.instructions
    recipe.category = category ?? recipe.category

    await recipe.save()
    await recipe.populate('author', 'username')

    res.json(recipe)
  } catch (error) {
    console.error(error)
    res.status(400).json({
      message: 'Unable to update recipe.'
    })
  }
})

// Delete recipe
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found.'
      })
    }

    if (recipe.author.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Not authorized.'
      })
    }

    await recipe.deleteOne()

    res.json({ message: 'Recipe deleted.' })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      message: 'Unable to delete recipe.'
    })
  }
})

export default router
