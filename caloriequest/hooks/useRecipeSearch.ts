// use client for development 
'use client';

import { useState, useCallback } from 'react';
import type { Recipe, Ingredient } from './useRecipes';

// Define the structure of the data from api
interface ApiRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strSource: string | null;
  ingredients: Ingredient[];
}

// create description from the instructions
const createShortDescription = (instructions: string): string => {
  if (!instructions) {
    // if no instruction have placeholder message
    return "A delicious and easy to make meal.";
  }
  // split the instructions by period
  const firstSentence = instructions.split('. ')[0];
  return firstSentence.length > 100
    ? firstSentence.substring(0, 100) + '...'
    : firstSentence + '.';
};

// hook to search for the receipes
export const useRecipeSearch = () => {
  // state to hold search results, loading state, and error messages
  const [searchResults, setSearchResults] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = useCallback(async (query: string) => {
    // search has to be at least 2 characters long same with the api
    if (!query || query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    // Reset state for the new search
    setLoading(true);
    setError(null);
    setSearchResults(null);

    // fetch the recipes from the API
    try {
      const API_URL = `http://127.0.0.1:8000/meals/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(API_URL);

      // if no results found send empty
      if (response.status === 404) {
        setSearchResults([]); 
        return;
      }

      // error
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
      }

      const data: ApiRecipe[] = await response.json();

      // turn api data into receipe type
      const transformedRecipes: Recipe[] = data.map((meal) => ({
        id: meal.idMeal,
        title: meal.strMeal,
        imageUrl: meal.strMealThumb,
        description: createShortDescription(meal.strInstructions),
        instructions: meal.strInstructions,
        source: meal.strSource,
        ingredients: meal.ingredients,
      }));
      // set the search results state
      setSearchResults(transformedRecipes);

    } catch (e: any) {
      console.error("Error searching recipes:", e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []); 

  // Return the state and the search function
  return { searchResults, loading, error, searchRecipes };
};