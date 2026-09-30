import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { productTitle, productType, bodyHtml } = await req.json();

    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'paste_kodenya_di_sini') {
      return NextResponse.json({ error: 'API Key is missing or invalid. Please update .env.local' }, { status: 500 });
    }

    const prompt = `
      Act as a world-class e-commerce copywriter. I am dropshipping a product.
      Competitor's Product Title: "${productTitle}"
      Category: ${productType || 'E-commerce Product'}
      Competitor's Original Description: "${bodyHtml || 'No description provided.'}"
      
      Your task: Write a highly converting, SEO-optimized product description for my Shopify store that will heavily outperform the competitor's original description.
      
      CRITICAL FORMATTING RULES:
      1. You MUST format the ENTIRE response in valid HTML tags. Do not output raw plain text.
      2. Wrap the catchy new Product Title in an <h2> tag.
      3. Wrap every single paragraph in <p> tags.
      4. Create a list of 4-5 key benefits using <ul> and <li> tags.
      5. Use <strong> tags for emphasis.
      6. Apply FOMO (Fear Of Missing Out) and strong sales psychology.
      7. DO NOT include markdown code blocks like \`\`\`html. Return ONLY the raw HTML elements.
    `;

    // We use gemini-3.8-flash because it's insanely fast and great for copywriting
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rewrittenHtml = response.text;

    return NextResponse.json({ success: true, text: rewrittenHtml });

  } catch (error: any) {
    console.error('Error rewriting with AI:', error);
    return NextResponse.json({ error: error.message || 'Failed to rewrite description.' }, { status: 500 });
  }
}
