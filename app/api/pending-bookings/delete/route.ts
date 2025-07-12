import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log(`=== DELETING PENDING BOOKING ===`);
    
    // Parse the request body to get transaction ID
    const { transaction_id } = await request.json();
    console.log(`Transaction ID: ${transaction_id}`);

    if (!transaction_id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Delete from database via external API
    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/pending-bookings/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_id: transaction_id
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete pending booking:', errorText);
      return NextResponse.json(
        { error: `Failed to delete pending booking: ${response.status}` },
        { status: 500 }
      );
    }

    console.log("✅ Pending booking deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Pending booking deleted successfully"
    });

  } catch (error: any) {
    console.error("Error deleting pending booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete pending booking" },
      { status: 500 }
    );
  }
}
