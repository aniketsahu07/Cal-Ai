/**
 * Clarifai Food Recognition API Integration Service
 * 
 * This service handles sending food images (base64) to the Clarifai food model
 * to recognize food items and labels.
 * 
 * Supports dynamic URL switching:
 * - Direct endpoints on native mobile (Capacitor webviews)
 * - Vite local proxy (/api/clarifai) in local web development
 */

const CLARIFAI_PAT = import.meta.env.VITE_CLARIFAI_PAT || '';
const CLARIFAI_MODEL_ID = import.meta.env.VITE_CLARIFAI_MODEL || 'food-item-recognition';
const CLARIFAI_USER_ID = 'clarifai';
const CLARIFAI_APP_ID = 'main';

// Dynamically determine the endpoint depending on the platform environment
const getClarifaiEndpoint = () => {
  const isCapacitor = !!window.Capacitor;
  if (isCapacitor) {
    // Direct absolute API on native mobile
    return `https://api.clarifai.com/v2/users/${CLARIFAI_USER_ID}/apps/${CLARIFAI_APP_ID}/models/${CLARIFAI_MODEL_ID}/outputs`;
  }
  // Local Vite proxy for web development
  return '/api/clarifai';
};

/**
 * Analyzes an image in base64 format and returns the most confident recognized food label.
 * 
 * @param {string} base64Data - Clean base64 image data (without prefix)
 * @returns {Promise<string>} Recognized food label (e.g. "grilled chicken salad")
 */
export const analyzeImage = async (base64Data) => {
  if (!base64Data) {
    throw new Error('Image data is required for analysis.');
  }

  // Fallback check for missing key in local dev environment
  if (!CLARIFAI_PAT && !window.Capacitor) {
    throw new Error('Clarifai Personal Access Token (VITE_CLARIFAI_PAT) is missing in your .env configuration.');
  }

  const endpoint = getClarifaiEndpoint();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Clarifai expects authorization header in direct requests
        ...(window.Capacitor ? { 'Authorization': `Key ${CLARIFAI_PAT}` } : {})
      },
      body: JSON.stringify({
        user_app_id: {
          user_id: CLARIFAI_USER_ID,
          app_id: CLARIFAI_APP_ID
        },
        inputs: [
          {
            data: {
              image: {
                base64: base64Data
              }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Clarifai authentication failed. Please check your VITE_CLARIFAI_PAT key.');
      }
      const errText = await response.text();
      throw new Error(`Clarifai API returned status ${response.status}: ${errText || 'Unknown error'}`);
    }

    const data = await response.json();
    const output = data?.outputs?.[0];

    if (output?.status?.code !== 10000) {
      throw new Error(output?.status?.description || 'Failed to analyze image.');
    }

    // Extract concepts (recognized items) sorted by highest confidence
    const concepts = output?.data?.concepts || [];
    if (concepts.length === 0) {
      throw new Error('No recognizable food items found in the image. Try another photo!');
    }

    // Return the name of the highest confidence concept
    return concepts[0].name;
  } catch (error) {
    console.error('Clarifai Service Error:', error);
    throw new Error(error.message || 'Clarifai food recognition service is currently unavailable.');
  }
};
