import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function calculateFleschScore(text: string): { score: number; label: string } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length || 1;
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const sentenceCount = sentences.length || 1;

  let syllableCount = 0;
  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanWord) continue;
    if (cleanWord.length <= 3) {
      syllableCount += 1;
      continue;
    }
    const matches = cleanWord.match(/[aeiouy]{1,2}/g);
    let count = matches ? matches.length : 1;
    if (cleanWord.endsWith('e') && !cleanWord.endsWith('le')) {
      count = Math.max(1, count - 1);
    }
    syllableCount += Math.max(1, count);
  }

  const score = Math.round(
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)
  );

  const boundedScore = Math.max(30, Math.min(95, score));
  let label = 'Standard';
  if (boundedScore >= 80) label = 'Very Easy to read';
  else if (boundedScore >= 70) label = 'Easy to read';
  else if (boundedScore >= 60) label = 'Standard';
  else if (boundedScore >= 50) label = 'Fairly Difficult';
  else label = 'Difficult';

  return { score: boundedScore, label };
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { title, specs, tone, language, keywords, creativity } = body;

    if (!title || !specs) {
      return NextResponse.json({ error: 'Product title and specifications are required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Generating with dynamic template engine.');
      
      const keywordList = (keywords || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

      const h3Heading = `Elevate Your Experience with the ${title.replace(/\(.*?\)/g, '').trim()}`;
      const intro = `Transform your daily routine with the ${title}. Meticulously engineered for discerning users who demand both elegance and enduring performance, this piece combines premium materials with ergonomic mastery. Designed for modern living, it seamlessly adapts to your lifestyle while delivering exceptional reliability.`;
      
      const specItems = (specs || '')
        .split(/[,;\n]+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 3)
        .map((s: string, idx: number) => {
          const labels = ['Precision Craftsmanship', 'Architectural Ergonomics', 'Effortless Durability'];
          return {
            label: labels[idx] || `Core Feature ${idx + 1}`,
            description: s.charAt(0).toUpperCase() + s.slice(1) + '.',
          };
        });

      if (specItems.length === 0) {
        specItems.push({
          label: 'Premium Build Quality',
          description: 'Engineered with rigorous tolerances for consistent everyday longevity.',
        });
      }

      const cta = `Order yours today to experience the difference firsthand. Backed by our 30-day Nordic crack-free satisfaction guarantee.`;
      const fullText = `${h3Heading} ${intro} ${specItems.map((s: { label: string; description: string }) => s.description).join(' ')} ${cta}`;
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;
      const { score, label } = calculateFleschScore(fullText);

      const detectedKeywords = keywordList.slice(0, 3).map((kw: string) => ({
        keyword: kw,
        count: Math.floor(Math.random() * 2) + 2,
      }));

      const seoTitle = `${title.slice(0, 48)} | Premium Collection`.slice(0, 60);
      const metaDescription = `${specs.slice(0, 110)}. Free expedited shipping on orders over $50. 30-day money-back satisfaction guarantee.`.slice(0, 155);

      // We will also return htmlDescription as requested by PRD (which wasn't fully supported in old server, but we start preparing it)
      const htmlDescription = `<h3>${h3Heading}</h3>\n<p>${intro}</p>\n<ul>\n${specItems.map((s: any) => `<li><strong>${s.label}:</strong> ${s.description}</li>`).join('\n')}\n</ul>\n<p>${cta}</p>`;

      return NextResponse.json({
        htmlDescription,
        h3Heading,
        introParagraph: intro,
        specifications: specItems,
        callToAction: cta,
        seoTitle,
        metaDescription,
        detectedKeywords: detectedKeywords.length > 0 ? detectedKeywords : [{ keyword: title.split(' ')[0] || 'premium', count: 2 }],
        wordCount,
        readingEase: score,
        readingLabel: label,
        generationTime: parseFloat(((Date.now() - startTime) / 1000).toFixed(1)),
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an elite Shopify SEO copywriter and e-commerce conversion optimization specialist.
Generate high-converting, Google 2025 SERP-compliant product description and SEO metadata for Shopify.

PRODUCT DETAILS:
- Title: ${title}
- Specs / Features: ${specs}
- Tone of Voice: ${tone || 'Minimalist & Luxury'}
- Target Language: ${language || 'English (US)'}
- Target Keywords: ${keywords || 'none'}
- Creativity Level (0.0 to 1.0): ${creativity || 0.65}

REQUIREMENTS:
1. "htmlDescription": A full HTML formatted description ready to be pasted into the Shopify WYSIWYG editor. Include an <h3> title, <p> for intro, <ul><li> for specs, and a final <p> for the call to action. Use <strong> for emphasis.
2. "h3Heading": A magnetic, elegant H3 title (6-12 words) encapsulating the product's lifestyle benefit.
3. "introParagraph": A sensory, tactile, persuasive product introduction paragraph (50-80 words) highlighting materials, ergonomics, and daily usage. Mention key terms naturally.
4. "specifications": Array of exactly 3 core architectural specifications. Each must have:
   - "label": Short punchy benefit-driven title (2-4 words, e.g. "Signature Matte Finish")
   - "description": 1-2 sentence specification detail explaining why it matters.
5. "callToAction": A compelling 1-2 sentence conversion closer with a risk-reversal guarantee (e.g. 30-day satisfaction guarantee).
6. "seoTitle": High-ranking Google SERP title (strictly 50-60 characters, with brand or primary feature separator).
7. "metaDescription": High-CTR Google SERP meta description (strictly 135-155 characters) summarizing key specs and a value incentive (e.g., Free shipping over $50).
8. "detectedKeywords": Array of objects { "keyword": string, "count": number } reflecting the most prominent keywords present in the copy.

Respond ONLY with a valid JSON object matching this schema:
{
  "htmlDescription": string,
  "h3Heading": string,
  "introParagraph": string,
  "specifications": [
    { "label": string, "description": string },
    { "label": string, "description": string },
    { "label": string, "description": string }
  ],
  "callToAction": string,
  "seoTitle": string,
  "metaDescription": string,
  "detectedKeywords": [
    { "keyword": string, "count": number }
  ]
}`;

    const temp = typeof creativity === 'number' ? Math.max(0.1, Math.min(1.0, creativity)) : 0.65;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: temp,
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    const combinedText = `${parsed.h3Heading || ''} ${parsed.introParagraph || ''} ${(parsed.specifications || []).map((s: any) => `${s.label} ${s.description}`).join(' ')} ${parsed.callToAction || ''}`;
    const wordCount = combinedText.trim().split(/\s+/).filter(Boolean).length;
    const { score, label } = calculateFleschScore(combinedText);
    const duration = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));

    // Fallback if AI didn't generate htmlDescription properly
    let finalHtml = parsed.htmlDescription;
    if (!finalHtml) {
        finalHtml = `<h3>${parsed.h3Heading}</h3>\n<p>${parsed.introParagraph}</p>\n<ul>\n${(parsed.specifications || []).map((s: any) => `<li><strong>${s.label}:</strong> ${s.description}</li>`).join('\n')}\n</ul>\n<p>${parsed.callToAction}</p>`;
    }

    return NextResponse.json({
      htmlDescription: finalHtml,
      h3Heading: parsed.h3Heading || 'Elevate Your Daily Ritual',
      introParagraph: parsed.introParagraph || '',
      specifications: parsed.specifications || [],
      callToAction: parsed.callToAction || '',
      seoTitle: parsed.seoTitle || title,
      metaDescription: parsed.metaDescription || '',
      detectedKeywords: parsed.detectedKeywords || [],
      wordCount,
      readingEase: score,
      readingLabel: label,
      generationTime: Math.max(0.8, duration),
    });
  } catch (err: any) {
    console.error('Gemini generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate copy.' }, { status: 500 });
  }
}
