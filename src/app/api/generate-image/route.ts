import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    // Note: If you want to use OpenAI DALL-E 3, you can implement it here 
    // by checking if process.env.OPENAI_API_KEY exists.
    // For now, we use a backend-proxied AI generator to ensure it works 
    // out-of-the-box and bypasses browser adblockers.

    const enhancedPrompt = `Premium aesthetic product photography of ${prompt}, minimalist, soft lighting, pastel background, magazine editorial style, highly detailed 8k`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);

    // Fetching server-side avoids client CORS or Adblock issues
    const response = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=600&nologo=true`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Image generation failed from upstream');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image generation error:', error);
    // Redirect to a safe fallback image if generation fails
    return NextResponse.redirect(`https://picsum.photos/seed/${encodeURIComponent(prompt)}/600/600`);
  }
}
