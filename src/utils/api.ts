/**
 * Utility function to safely fetch JSON from API routes
 * Handles cases where the API might return HTML error pages instead of JSON
 */
export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(url, options);
    
    // Clone response to read it multiple times if needed
    const responseClone = response.clone();
    
    // Check if response is JSON by trying to parse it
    // First, check content-type header
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json") ?? false;
    
    // If content-type suggests it's not JSON, check the first few characters
    if (!isJson) {
      try {
        const text = await responseClone.text();
        // Check if it starts with HTML
        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
          console.error(`API returned HTML instead of JSON (${response.status}) for ${url}`);
          return {
            data: null,
            error: `Erreur serveur (${response.status}): La réponse n'est pas au format JSON`,
          };
        }
        // Try to parse as JSON anyway (might be JSON without proper content-type)
        try {
          const data = JSON.parse(text);
          if (!response.ok) {
            return {
              data: null,
              error: data.error || `Erreur ${response.status}`,
            };
          }
          return { data, error: null };
        } catch {
          // Not JSON, return error
          console.error(`API returned non-JSON response (${response.status}) for ${url}:`, text.substring(0, 200));
          return {
            data: null,
            error: `Erreur serveur (${response.status}): La réponse n'est pas au format JSON`,
          };
        }
      } catch (textError) {
        console.error("Error reading response text:", textError);
        return {
          data: null,
          error: `Erreur lors de la lecture de la réponse (${response.status})`,
        };
      }
    }

    // If content-type is JSON, parse normally
    try {
      const text = await response.text();
      
      // Check if response is empty
      if (!text || text.trim().length === 0) {
        return {
          data: null,
          error: `Erreur ${response.status}: Réponse vide du serveur`,
        };
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError, "Response text:", text.substring(0, 200));
        return {
          data: null,
          error: "Erreur lors du parsing de la réponse JSON",
        };
      }
      
      if (!response.ok) {
        return {
          data: data || null,
          error: data?.error || data?.message || `Erreur ${response.status}`,
        };
      }

      return { data, error: null };
    } catch (jsonError) {
      // JSON parsing failed even though content-type says JSON
      console.error("JSON parsing error:", jsonError);
      return {
        data: null,
        error: "Erreur lors du parsing de la réponse JSON",
      };
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erreur lors de la requête",
    };
  }
}

