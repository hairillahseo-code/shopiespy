import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic URL validation
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Fetch HTML from the target store
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the target store.' }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const htmlString = html.toLowerCase();

    // 0. Validate if it's a Shopify store
    const isShopify = htmlString.includes('cdn.shopify.com') || htmlString.includes('shopify.theme') || htmlString.includes('window.shopify') || htmlString.includes('shopify.shop') || htmlString.includes('shopify.com/s/files');
    if (!isShopify) {
      return NextResponse.json({ error: 'This URL does not appear to be a Shopify store. ShopieSpy only works on Shopify websites.' }, { status: 400 });
    }

    // 1. Detect Shopify Theme
    let themeName = 'Custom or Hidden Theme';
    
    // Shopify stores often leak theme info inside inline scripts (window.Shopify.theme)
    const scriptTags = $('script').map((i, el) => $(el).html()).get();
    for (const script of scriptTags) {
      if (script && script.includes('Shopify.theme')) {
        // Regex to find the theme name
        const themeMatch = script.match(/name":\s*"([^"]+)"/);
        if (themeMatch && themeMatch[1]) {
          themeName = themeMatch[1];
          break;
        }
      }
    }

    // 2. Detect Apps based on script tags & keywords in HTML
    const detectedApps: string[] = [];
    
    if (htmlString.includes('klaviyo.com')) detectedApps.push('Klaviyo');
    if (htmlString.includes('loox.io') || htmlString.includes('loox-reviews')) detectedApps.push('Loox Reviews');
    if (htmlString.includes('smile.io')) detectedApps.push('Smile.io (Rewards)');
    if (htmlString.includes('judge.me')) detectedApps.push('Judge.me');
    if (htmlString.includes('gorgias.chat') || htmlString.includes('gorgias.io')) detectedApps.push('Gorgias Chat');
    if (htmlString.includes('yotpo.com')) detectedApps.push('Yotpo');
    if (htmlString.includes('sezzle.com')) detectedApps.push('Sezzle');
    if (htmlString.includes('afterpay.com')) detectedApps.push('Afterpay');
    if (htmlString.includes('omnisend')) detectedApps.push('Omnisend');
    if (htmlString.includes('privy.com')) detectedApps.push('Privy');

    // 3. Extract Products (Real Best-Sellers via HTML Scraping + JSON API)
    let extractedProducts: any[] = [];
    try {
      // Step A: Scrape the best-selling collection page
      const bestSellingUrl = `${targetUrl}/collections/all?sort_by=best-selling`;
      const bestSellingRes = await fetch(bestSellingUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });
      
      if (bestSellingRes.ok) {
        const bsHtml = await bestSellingRes.text();
        const bs$ = cheerio.load(bsHtml);
        
        // Cari semua link yang mengarah ke halaman produk
        const productHandles = new Set<string>();
        bs$('a[href*="/products/"]').each((i, el) => {
          const href = bs$(el).attr('href');
          if (href) {
            // ekstrak slug/handle (misal: /products/sepatu-keren?variant=123 -> sepatu-keren)
            const match = href.match(/\/products\/([a-zA-Z0-9\-]+)/);
            if (match && match[1]) {
              productHandles.add(match[1]);
            }
          }
        });

        // Step B: Fetch JSON murni untuk produk-produk terlaris tersebut
        // Kita ambil 12 teratas agar loading tidak terlalu lama
        const topHandles = Array.from(productHandles).slice(0, 12); 
        
        for (const handle of topHandles) {
          try {
            // Endpoint .js selalu mengembalikan data akurat terlepas dari tema toko
            const prodRes = await fetch(`${targetUrl}/products/${handle}.js`, {
              headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (prodRes.ok) {
              const p = await prodRes.json();
              extractedProducts.push({
                id: p.id,
                title: p.title,
                handle: p.handle,
                product_type: p.type || 'General',
                body_html: p.description || '',
                price: (p.price / 100).toFixed(2), // Endpoint .js mengembalikan harga dalam sen
                image: p.featured_image || (p.images && p.images[0]) || '',
                url: `${targetUrl}/products/${p.handle}`
              });
            }
          } catch (e) {
            console.error(`Gagal fetch detail produk: ${handle}`, e);
          }
        }
      }
      
      // Step C: Fallback (Jika proteksi toko sangat kuat / scraping gagal)
      // Kita gunakan products.json sebagai cadangan agar aplikasi tidak pernah error/kosong
      if (extractedProducts.length === 0) {
        const productsRes = await fetch(`${targetUrl}/products.json?limit=12`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        });
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData && productsData.products) {
            extractedProducts = productsData.products.map((p: any) => ({
              id: p.id,
              title: p.title,
              handle: p.handle,
              product_type: p.product_type || 'General',
              body_html: p.body_html || '',
              price: p.variants?.[0]?.price || '0.00',
              image: p.images?.[0]?.src || '',
              url: `${targetUrl}/products/${p.handle}`
            }));
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    }

    // 4. Generate Multi-Platform Ad Intelligence Deep-Links
    const cleanDomain = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');
    const domainParts = cleanDomain.split('.');
    const brandName = domainParts[0] || cleanDomain;

    const fbAdsLink = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(cleanDomain)}&search_type=keyword_unordered&media_type=all`;
    const tiktokAdsLink = `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?keyword=${encodeURIComponent(brandName)}`;
    const tiktokSearchLink = `https://www.tiktok.com/search?q=${encodeURIComponent(brandName)}`;
    const googleShoppingLink = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(brandName)}`;

    return NextResponse.json({
      success: true,
      data: {
        theme: themeName,
        apps: detectedApps,
        products: extractedProducts,
        cleanDomain,
        brandName,
        fbAdsLink,
        tiktokAdsLink,
        tiktokSearchLink,
        googleShoppingLink
      }
    });

  } catch (error: any) {
    console.error('Error analyzing store:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during analysis.' }, { status: 500 });
  }
}
