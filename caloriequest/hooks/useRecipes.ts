// use cleint for development
'use client';

import { useState, useEffect, useCallback } from 'react';

// define types for the recipe
export interface Ingredient {
  name: string;
  measure: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  instructions: string;
  source: string | null;
  ingredients: Ingredient[];
}

interface ApiRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strSource: string | null;
  ingredients: Ingredient[];
}

// function to create a short description from the instructions
const createShortDescription = (instructions: string): string => {
  if (!instructions) {
    // if no instruction have placeholder message
    return "A delicious and easy-to-make meal.";
  }
  // split the instructions by period.
  const firstSentence = instructions.split('. ')[0];
  return firstSentence.length > 100
    ? firstSentence.substring(0, 100) + '...'
    : firstSentence + '.';
};

// fetach and manage the recipes from the api
export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // use call back to fetch the recipes
  const fetchAndSetRecipes = useCallback(async (append: boolean = false) => {
    setLoading(true);
    setError(null);

    // fetch random recipes from the api
    try {
      const API_URL = 'http://127.0.0.1:8000/meals/suggestions';
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch recipes. Status: ${response.status}`);
      }

      // parse throught the response data
      const data: ApiRecipe[] = await response.json();

      // turn the api data into the recipe type
      const transformedRecipes: Recipe[] = data.map((meal) => ({
        id: meal.idMeal,
        title: meal.strMeal,
        imageUrl: meal.strMealThumb,
        description: createShortDescription(meal.strInstructions),
        instructions: meal.strInstructions,
        source: meal.strSource,
        ingredients: meal.ingredients,
      }));

      // ensure we only append new recipes
      if (append) {
        // check if we have existing recipes
        setRecipes((prevRecipes) => {
          // create a set of existing recipes with ids
          const existingIds = new Set(prevRecipes.map(r => r.id));
          
          // check for unique new recipes
          const uniqueNewRecipes = transformedRecipes.filter(
            (recipe) => !existingIds.has(recipe.id)
          );

          //  return new list of recipes with new and old appended
          return [...prevRecipes, ...uniqueNewRecipes];
        });
      } else {
        // set the recipes directly on page load
        setRecipes(transformedRecipes);
      }
      
      // error handling
    } catch (e: any) {
      console.error("Error fetching recipes:", e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

    // useEffect to fetch recipes on initial load
  useEffect(() => {
    fetchAndSetRecipes(false);
  }, [fetchAndSetRecipes]);

  // load more recipe function
  const loadMore = () => {
    fetchAndSetRecipes(true);
  };

  return { recipes, loading, error, loadMore };
};