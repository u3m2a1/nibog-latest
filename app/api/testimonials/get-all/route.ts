import { NextResponse } from 'next/server';

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Maximum number of retry attempts
const MAX_RETRIES = 3;

export async function GET() {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      console.log(`Server API route: Fetching all testimonials (attempt ${retries + 1}/${MAX_RETRIES})`);

      // Forward the request to the external API
      const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/testimonials/get-all";
      console.log("Server API route: Calling API URL:", apiUrl);

      // Set a reasonable timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        },
        cache: "no-store",
        next: { revalidate: 0 },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log(`Server API route: Get all testimonials response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server API route: Error response: ${errorText}`);
        
        // If we get a server error (5xx), retry
        if (response.status >= 500 && retries < MAX_RETRIES - 1) {
          retries++;
          await delay(1000 * retries); // Exponential backoff
          continue;
        }
        
        let errorMessage = `Error fetching testimonials: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If we can't parse the error as JSON, use the status code
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      // Get the response data
      const responseText = await response.text();
      
      // Handle empty response case gracefully
      if (!responseText || responseText.trim() === '') {
        console.log("Server API route: Empty response received, returning empty array");
        return NextResponse.json([], { status: 200 });
      }
      
      console.log(`Server API route: Raw response size: ${responseText.length} characters`);

      let data;
      try {
        // Try to parse the response as JSON
        data = JSON.parse(responseText);
        console.log(`Server API route: Retrieved ${Array.isArray(data) ? data.length : 1} testimonials`);
      } catch (error) {
        // TypeScript-safe error handling
        const parseError = error instanceof Error ? error : new Error(String(error));
        console.error("Server API route: Error parsing response:", parseError);
        
        // If we can't parse JSON and haven't exceeded retries, try again
        if (retries < MAX_RETRIES - 1) {
          retries++;
          await delay(1000 * retries); // Exponential backoff
          continue;
        }
        
        return NextResponse.json(
          { 
            error: "Failed to parse API response", 
            details: parseError.message,
            rawResponseSample: responseText.substring(0, 200) // Just include a small sample to debug
          },
          { status: 500 }
        );
      }
      
      // If the data is empty or not an array but the call was successful, return an empty array
      if (!data) {
        return NextResponse.json([], { status: 200 });
      }
      
      // Return the testimonials data
      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      console.error(`Server API route: Error fetching testimonials (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
      
      // Retry on network errors
      if (retries < MAX_RETRIES - 1 && 
          (error.name === 'AbortError' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
        retries++;
        await delay(1000 * retries); // Exponential backoff
        continue;
      }
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: "Request timed out when connecting to testimonials service" },
          { status: 504 } // Gateway Timeout
        );
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return NextResponse.json(
          { error: "Unable to connect to testimonials service" },
          { status: 503 } // Service Unavailable
        );
      }
      
      return NextResponse.json(
        { error: error.message || "Failed to fetch testimonials" },
        { status: 500 }
      );
    }
  }
  
  // If we've exhausted all retries
  return NextResponse.json(
    { error: "Failed to fetch testimonials after multiple attempts" },
    { status: 503 }
  );
}
