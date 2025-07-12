// Baby game service - handles all baby game related API calls

export interface BabyGame {
  id?: number;
  game_name: string;
  description?: string;
  game_description?: string; // For API request
  min_age?: number;
  min_age_months?: number; // For API request
  max_age?: number;
  max_age_months?: number; // For API request
  duration_minutes: number;
  categories: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new baby game
 * @param gameData The game data to create
 * @returns The created game
 */
export async function createBabyGame(gameData: BabyGame): Promise<BabyGame> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData), // Send original gameData, let the API route handle field mapping
    });

    if (!response.ok) {
      await response.text(); // Consume the response body
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all baby games
 * @returns A list of all baby games
 */
export async function getAllBabyGames(): Promise<BabyGame[]> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Ensure we return an array
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get a baby game by ID
 * @param id The ID of the baby game to get
 * @returns The baby game with the specified ID
 */
export async function getBabyGameById(id: number): Promise<BabyGame> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Return the first item if it's an array, otherwise return the data
    const gameData = Array.isArray(data) ? data[0] : data;

    if (!gameData) {
      throw new Error("No game data found");
    }

    return gameData;
  } catch (error) {
    throw error;
  }
}

/**
 * Update a baby game
 * @param gameData The game data to update
 * @returns The updated game
 */
export async function updateBabyGame(gameData: BabyGame): Promise<BabyGame> {
  if (!gameData.id) {
    throw new Error("Game ID is required for update");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/update', {
      method: "POST", // Changed from PUT to POST as per API documentation
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData), // Send original gameData, let the API route handle field mapping
    });

    if (!response.ok) {
      await response.text(); // Consume the response body
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a baby game
 * @param id The ID of the baby game to delete
 * @returns A success indicator
 */
export async function deleteBabyGame(id: number): Promise<{ success: boolean }> {
  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    throw new Error("Invalid game ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/delete', {
      method: "POST", // Changed from DELETE to POST as per API documentation
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to delete game. API returned status: ${response.status}`);
      }
    }

    // Try to parse the response
    try {
      const data = await response.json();

      // Check if the response indicates success
      if (data && (data.success === true || (Array.isArray(data) && data[0]?.success === true))) {
        return { success: true };
      }

      return { success: true }; // Default to success if we got a 200 response
    } catch (parseError) {
      // If we can't parse the response but got a 200 status, consider it a success
      return { success: true };
    }
  } catch (error) {
    throw error;
  }
}
