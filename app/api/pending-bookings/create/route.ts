import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("=== CREATING PENDING BOOKING ===");
    
    // Parse the request body
    const bookingData = await request.json();
    console.log("Pending booking data:", JSON.stringify(bookingData, null, 2));

    // Validate required fields
    const requiredFields = [
      'userId', 'parentName', 'email', 'phone', 'childName', 'childDob',
      'schoolName', 'gender', 'eventId', 'gameId', 'totalAmount', 'termsAccepted'
    ];

    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate a unique transaction ID for this pending booking
    const timestamp = Date.now();
    const transactionId = `NIBOG_${bookingData.userId}_${timestamp}`;
    
    // Create the pending booking record
    const pendingBookingPayload = {
      transaction_id: transactionId,
      user_id: bookingData.userId,
      booking_data: JSON.stringify(bookingData),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      status: 'pending'
    };

    console.log("Creating pending booking with transaction ID:", transactionId);

    // Store in database via external API
    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/pending-bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pendingBookingPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create pending booking:', errorText);
      return NextResponse.json(
        { error: `Failed to create pending booking: ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log("✅ Pending booking created successfully");

    return NextResponse.json({
      success: true,
      transactionId,
      pendingBookingId: result.id || result.pending_booking_id,
      expiresAt: pendingBookingPayload.expires_at
    });

  } catch (error: any) {
    console.error("Error creating pending booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create pending booking" },
      { status: 500 }
    );
  }
}
