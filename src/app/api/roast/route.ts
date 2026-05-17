import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubProfile } from '@/services/github';
import { generateRoastStream } from '@/services/ai';

// We use the Edge runtime for blazing-fast, serverless streaming support
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // 1. Extract username from request body
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // 2. Fetch data from GitHub service
    const githubData = await fetchGitHubProfile(username.trim());

    // 3. Initiate Gemini AI streaming session
    const aiStream = await generateRoastStream(githubData);

    // 4. Transform the Gemini stream into a standard Web ReadableStream
    const encoder = new TextEncoder();
    const customReadableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of aiStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    // 5. Return response with streaming headers
    return new Response(customReadableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal error occurred while prepping the roast.' },
      { status: 500 }
    );
  }
}