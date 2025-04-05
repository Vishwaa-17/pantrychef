document.addEventListener("DOMContentLoaded", fetchIngredients);

async function fetchIngredients() {
    try {
        const response = await fetch("http://localhost:5009/ingredients");
        const ingredients = await response.json();

        const ingredientList = document.getElementById("ingredientList");
        ingredientList.innerHTML = "";

        const categories = {};
        ingredients.forEach(({ id, name, category }) => {
            if (!categories[category]) categories[category] = [];
            categories[category].push({ id, name });
        });

        Object.keys(categories).forEach(category => {
            const categoryHeading = document.createElement("h3");
            categoryHeading.textContent = category;
            ingredientList.appendChild(categoryHeading);

            categories[category].forEach(({ id, name }) => {
                const button = document.createElement("button");
                button.textContent = name;
                button.classList.add("ingredient-btn");
                button.dataset.id = id;
                button.addEventListener("click", toggleIngredient);
                ingredientList.appendChild(button);
            });
        });
    } catch (error) {
        console.error("❌ Error fetching ingredients:", error);
    }
}

let selectedIngredients = [];

function toggleIngredient(event) {
    const button = event.target;
    const ingredientId = button.dataset.id;

    if (selectedIngredients.includes(ingredientId)) {
        selectedIngredients = selectedIngredients.filter(id => id !== ingredientId);
        button.classList.remove("selected");
    } else {
        selectedIngredients.push(ingredientId);
        button.classList.add("selected");
    }

    displaySelectedIngredients();
}

function displaySelectedIngredients() {
    const selectedContainer = document.getElementById("selectedIngredients");
    selectedContainer.innerHTML = selectedIngredients.map(id => {
        const btn = document.querySelector(`button[data-id='${id}']`);
        return btn ? btn.textContent : "";
    }).join(", ");
}

async function fetchRecipes() {
    try {
        const response = await fetch("http://localhost:5009/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients: selectedIngredients })
        });

        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error("❌ Error fetching recipes:", error);
    }
}

function displayRecipes(recipes) {
    const recipeList = document.getElementById("recipeList");
    recipeList.innerHTML = "";

    if (recipes.length === 0) {
        recipeList.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        const imageUrl = recipe.image_url || "/images/default-recipe.jpg";

        card.innerHTML = `
            <img src="${imageUrl}" alt="${recipe.name}" class="recipe-image">
            <h3>${recipe.name}</h3>
            <p>${recipe.description || ""}</p>
        `;

        card.addEventListener("click", () => fetchRecipeDetails(recipe.id));
        recipeList.appendChild(card);
    });
}

async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(`http://localhost:5009/recipe/${recipeId}`);
        if (!response.ok) throw new Error("Failed to fetch recipe details");

        const recipe = await response.json();

        const ingredientList = recipe.ingredients.length
            ? recipe.ingredients.map(ing => {
                const qty = ing.quantity ?? "";
                const unit = ing.unit ?? "";
                return `<li>${qty} ${unit} ${ing.name}</li>`;
            }).join("")
            : "<li>No ingredients available</li>";

        const instructionSteps = recipe.instructions.length
            ? `<ol>${recipe.instructions.map(step => `<li>${step.instruction}</li>`).join("")}</ol>`
            : "<p>No instructions available.</p>";

        const popup = document.getElementById("recipePopup");
        popup.innerHTML = `
            <div class="popup-content">
                <span class="close-btn" onclick="closePopup()">×</span>
                <img src="${recipe.image_url}" alt="${recipe.name}" class="popup-image">
                <h2>${recipe.name}</h2>
                <h3>Ingredients:</h3>
                <ul>${ingredientList}</ul>
                <h3>Instructions:</h3>
                ${instructionSteps}
                <button onclick="closePopup()">Close</button>
            </div>
        `;
        popup.style.display = "flex";

    } catch (error) {
        console.error("❌ Error fetching recipe details:", error);
    }
}

function closePopup() {
    document.getElementById("recipePopup").style.display = "none";
}
