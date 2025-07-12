import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type || !body.fields) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, fields' },
        { status: 400 }
      );
    }

    // Forward to n8n webhook
    const response = await fetch(
      'https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n create error:', errorText);
      throw new Error(`Failed to create template: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create template' },
      { status: 500 }
    );
  }
}
