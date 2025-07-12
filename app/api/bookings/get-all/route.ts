import { NextResponse } from 'next/server';

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET(request: Request) {
  try {
    console.log("Server API route: Fetching all bookings...");

    // Extract pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit;

    console.log(`Server API route: Pagination - page: ${page}, limit: ${limit}, offset: ${offset}`);

    // Create cache key that includes pagination parameters
    const cacheKey = `bookings_${page}_${limit}`;

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && cachedData.cacheKey === cacheKey && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Server API route: Returning cached paginated bookings data");
      return NextResponse.json(cachedData.data, { status: 200 });
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/bookingsevents/get-all";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log(`Server API route: Get all bookings response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      // Get the response data with a size limit
      const responseText = await response.text();
      
      // Log the size of the response
      const responseSize = new TextEncoder().encode(responseText).length;
      console.log(`Server API route: Raw response size: ${responseSize} bytes`);
      
      // If the response is too large, return a limited subset
      if (responseSize > 10 * 1024 * 1024) { // 10MB limit
        console.warn("Server API route: Response too large, returning limited data");
        return NextResponse.json(
          { error: "Response too large, please implement pagination" },
          { status: 413 }
        );
      }

      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        const totalBookings = Array.isArray(responseData) ? responseData.length : 0;
        console.log(`Server API route: Retrieved ${totalBookings} total bookings from API`);

        // Apply pagination to the data
        const paginatedData = Array.isArray(responseData) ? responseData.slice(offset, offset + limit) : [];
        const totalPages = Math.ceil(totalBookings / limit);

        console.log(`Server API route: Returning ${paginatedData.length} bookings for page ${page} of ${totalPages}`);

        // Prepare paginated response
        const paginatedResponse = {
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: totalBookings,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        };

        // Cache the successful response
        cachedData = {
          cacheKey,
          data: paginatedResponse
        };
        cacheTimestamp = Date.now();
        console.log("Server API route: Cached paginated bookings data");

        return NextResponse.json(paginatedResponse, { status: 200 });
      } catch (parseError) {
        console.error("Server API route: Error parsing response:", parseError);
        // If parsing fails but we got a 200 status, consider it a success
        if (response.status >= 200 && response.status < 300) {
          return NextResponse.json({ success: true, data: [] }, { status: 200 });
        }
        // Otherwise, return the error
        return NextResponse.json(
          {
            error: "Failed to parse API response",
            rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
          },
          { status: 500 }
        );
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("Server API route: Fetch request timed out");
        return NextResponse.json(
          { error: "Request timed out" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Server API route: Error getting all bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get all bookings" },
      { status: 500 }
    );
  }
}
