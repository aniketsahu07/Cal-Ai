/**
 * USDA FoodData Central Nutrition Service
 * 
 * This service queries the USDA FoodData database to retrieve accurate nutritional
 * breakdowns (Energy/Calories, Protein, Carbs, Fat) for a given food label.
 * 
 * Supports dynamic URL switching:
 * - Direct absolute endpoints on native mobile (Capacitor webviews)
 * - Vite local proxy (/api/usda) in local web development
 */

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || '';

// Dynamically determine the endpoint depending on the platform environment
const getUsdaEndpoint = () => {
  const isCapacitor = !!window.Capacitor;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isCapacitor || isMobile) {
    // Direct absolute API with key appended on native mobile or production web
    return `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}`;
  }
  // Local Vite proxy for web development to avoid CORS or key exposure
  return '/api/usda';
};

/**
 * Searches the USDA database for a matching food item and returns the food object.
 * 
 * @param {string} foodName - Recognized food label name (e.g. "grilled chicken salad")
 * @returns {Promise<Object>} The first matching food object containing nutrient values
 */
export const getNutrition = async (foodName) => {
  if (!foodName) {
    throw new Error('Food name query is required for nutrition lookup.');
  }

  // Fallback check for missing key in production/mobile contexts
  const isCapacitor = !!window.Capacitor;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if ((isCapacitor || isMobile) && !USDA_API_KEY) {
    throw new Error('USDA API key (VITE_USDA_API_KEY) is missing. Please add it to your environment settings.');
  }

  const baseEndpoint = getUsdaEndpoint();
  const joiner = baseEndpoint.includes('?') ? '&' : '?';
  const url = `${baseEndpoint}${joiner}query=${encodeURIComponent(foodName)}&pageSize=1`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('USDA API key is missing or invalid. Please check your VITE_USDA_API_KEY settings.');
      }
      throw new Error(`USDA API returned status ${response.status}: ${response.statusText || 'Search failed'}`);
    }

    const data = await response.json();
    const food = data?.foods?.[0];

    if (!food) {
      throw new Error(`No matching food item found in the USDA database for "${foodName}".`);
    }

    return food;
  } catch (error) {
    console.error('USDA Service Error:', error);
    throw new Error(error.message || 'USDA nutrition lookup service is currently unavailable.');
  }
};
