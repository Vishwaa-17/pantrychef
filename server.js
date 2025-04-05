const express = require('express');
const cors = require('cors');
const db = require('./database'); // Make sure database.js is set up properly

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('API is running 🚀');
});

// Get all ingredients
app.get('/ingredients', (req, res) => {
    db.query('SELECT * FROM ingredients', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get recipes based on selected ingredients
app.post('/recipes', (req, res) => {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ error: "No ingredients selected" });
    }

    const placeholders = ingredients.map(() => '?').join(',');
    const query = `
        SELECT DISTINCT r.*
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        WHERE ri.ingredient_id IN (${placeholders})
    `;

    db.query(query, ingredients, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get full recipe details
app.get('/recipe/:id', (req, res) => {
    const { id } = req.params;

    const recipeQuery = `SELECT * FROM recipes WHERE id = ?`;
    const ingredientsQuery = `
        SELECT i.name, ri.quantity, ri.unit
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = ?
    `;
    const instructionsQuery = `
        SELECT step_number, instruction
        FROM instructions
        WHERE recipe_id = ?
        ORDER BY step_number ASC
    `;

    db.query(recipeQuery, [id], (err, recipeResults) => {
        if (err) return res.status(500).json({ error: err.message });
        if (recipeResults.length === 0) return res.status(404).json({ message: 'Recipe not found' });

        const recipe = recipeResults[0];

        db.query(ingredientsQuery, [id], (err, ingredientResults) => {
            if (err) return res.status(500).json({ error: err.message });
            recipe.ingredients = ingredientResults;

            db.query(instructionsQuery, [id], (err, instructionResults) => {
                if (err) return res.status(500).json({ error: err.message });
                recipe.instructions = instructionResults;
                res.json(recipe);
            });
        });
    });
});

// Start server
const PORT = process.env.PORT || 5009;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
