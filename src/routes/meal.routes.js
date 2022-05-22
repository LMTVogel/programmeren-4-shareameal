const express = require('express');
const router = express.Router();

const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/auth.controller');

// Adds a meal
router.post("/meal", authController.validateToken, mealController.validateMeal, mealController.addMeal);

// Gets all the meals
router.get("/meal", mealController.getAllMeals);

// Gets the meal by id
router.get("/meal/:id", mealController.validateId, mealController.getMealById);

// Deletes the meal
router.delete("/meal/:id", authController.validateToken, mealController.validateId, mealController.deleteMeal);

module.exports = router;