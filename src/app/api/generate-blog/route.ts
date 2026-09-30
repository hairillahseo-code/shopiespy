import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, specs } = body;

    if (!title) {
      return NextResponse.json({ error: 'Product title is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Generating fallback blog and pins.');
      
      const blogHtml = `<h1>Why ${title} is Essential for Your Setup</h1>
<p>In today's fast-paced world, finding the right tools makes all the difference. The <strong>${title}</strong> is designed to offer unparalleled value and performance.</p>
<h2>Key Benefits</h2>
<ul>
  <li>Durable and robust materials.</li>
  <li>Designed for ease of use.</li>
  <li>${specs ? specs.slice(0, 50) : 'Perfect for daily applications.'}</li>
</ul>
<p>Get yours today and experience the difference.</p>`;

      const pins = [
        {
          title: `Must-Have: ${title.slice(0,30)}`,
          description: `Check out the ultimate ${title}! Perfect addition to your daily routine. #ShopifyFinds #MustHave #Trending`,
          board: 'Lifestyle & Tech'
        },
        {
          title: `Top Rated: ${title.slice(0,30)}`,
          description: `Don't miss out on the ${title}. Highly recommended by our community. Tap to shop! #Shopping #Inspo`,
          board: 'Product Recommendations'
        }
      ];

      return NextResponse.json({ blogHtml, pins });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert Shopify SEO blogger and Pinterest marketing specialist.
Given the product title: "${title}" and specifications: "${specs}", generate:
1. A high-converting, SEO-optimized blog article (about 300-500 words) formatted in HTML (use <h1>, <h2>, <p>, <ul>). It should read like an editorial review.
2. Two highly engaging Pinterest Pin descriptions.

Respond ONLY with a valid JSON object matching this schema:
{
  "blogHtml": "string (HTML formatted article)",
  "pins": [
    {
      "title": "string (Catchy pin title, max 40 chars)",
      "description": "string (Engaging description with 3-4 hashtags)",
      "board": "string (Suggested Pinterest board name)"
    },
    {
      "title": "string",
      "description": "string",
      "board": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return NextResponse.json({
      blogHtml: parsed.blogHtml || '<h1>Article Generation Failed</h1>',
      pins: parsed.pins || [],
    });
  } catch (err: any) {
    console.error('Gemini generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate blog.' }, { status: 500 });
  }
}
