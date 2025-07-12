import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestData = await request.json();
    const cityId = requestData.city_id;

    if (!cityId || isNaN(Number(cityId)) || Number(cityId) <= 0) {
      return NextResponse.json(
        { error: "Invalid city ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    console.log(`Server API route: Fetching events for city ID: ${cityId}`);

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/event-registration/getbycityid";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Use POST method with request body as specified in the API documentation
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city_id: cityId }),
      cache: "no-store",
    });

    console.log(`Server API route: Get events by city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText.substring(0, 200)}...`); // Log first 200 chars

    let responseData;
    try {
      // Try to parse the response as JSON
      responseData = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${Array.isArray(responseData) ? responseData.length : 'non-array'} events`);

      // Ensure we have an array
      if (!Array.isArray(responseData)) {
        console.warn("Server API route: API did not return an array:", responseData);
        responseData = [];
      }
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the error
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }

    // Return the response with the appropriate status
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching events by city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events by city" },
      { status: 500 }
    );
  }
}
