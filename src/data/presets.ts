export interface ProductData {
  id: string;
  title: string;
  specs: string;
  tone: string;
  language: string;
  keywords: string;
  creativity: number;
  price: string;
  category: string;
  slug: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  result: {
    h3Heading: string;
    introParagraph: string;
    specifications: Array<{ label: string; description: string }>;
    callToAction: string;
    seoTitle: string;
    metaDescription: string;
    detectedKeywords: Array<{ keyword: string; count: number }>;
    wordCount: number;
    readingEase: number;
    readingLabel: string;
    generationTime: number;
  };
}

export const PRODUCT_PRESETS: ProductData[] = [
  {
    id: 'ceramic-mug',
    title: 'Artisan Minimalist Ceramic Mug (350ml, Matte Black)',
    specs:
      'Handcrafted stoneware with matte black glaze, double-walled thermal insulation (350ml / 12oz), microwave & dishwasher safe, ergonomic minimalist comfort-grip handle, scratch-resistant base',
    tone: 'Minimalist & Luxury',
    language: 'English (US)',
    keywords: 'ceramic coffee mug, matte black mug, double-walled stoneware, artisan morning cup',
    creativity: 0.65,
    price: '$38.00 USD',
    category: 'Kitchen & Drinkware',
    slug: 'ceramic-mug',
    rating: 4.9,
    reviewCount: 128,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    result: {
      h3Heading: 'Elevate Your Morning Ritual with Understated Luxury',
      introParagraph:
        'Transform your daily caffeine ritual into a tactile luxury experience. Handcrafted from durable, kiln-fired stoneware, the Artisan Minimalist Ceramic Mug combines the raw warmth of handcrafted ceramics with a silky, fingerprint-resistant matte black glaze. Designed to balance effortlessly in your hand, this 350ml vessel is the quintessential companion for slow weekend pour-overs or high-focus morning work sessions.',
      specifications: [
        {
          label: 'Signature Matte Finish',
          description: 'Hand-dipped artisan stoneware designed to resist scratches, coffee patina, and fingerprints.',
        },
        {
          label: 'Precision Heat Retention',
          description: 'Double-walled thermal ceramic keeps brew piping hot for 45+ minutes while remaining cool to the touch.',
        },
        {
          label: 'Seamless Everyday Care',
          description: '100% microwave, oven, and dishwasher safe for effortless cleaning and lifestyle integration.',
        },
      ],
      callToAction:
        'Order yours today to transform your daily espresso and pour-over experience. Backed by our 30-day Nordic crack-free satisfaction guarantee.',
      seoTitle: 'Artisan Minimalist Ceramic Mug 350ml | Matte Stoneware',
      metaDescription:
        'Handcrafted matte black ceramic coffee mug with double-walled thermal insulation. Dishwasher safe, ergonomic design. Free shipping on orders over $50.',
      detectedKeywords: [
        { keyword: 'ceramic coffee mug', count: 3 },
        { keyword: 'matte black', count: 2 },
      ],
      wordCount: 184,
      readingEase: 72,
      readingLabel: 'Very Easy to read',
      generationTime: 1.4,
    },
  },
  {
    id: 'leather-backpack',
    title: 'Aeroway Full-Grain Italian Leather Commuter Backpack',
    specs:
      'Vegetable-tanned full-grain Tuscan leather, 16-inch padded laptop sleeve, waterproof YKK Excella zippers, hidden anti-theft passport pocket, ergonomic air-mesh shoulder straps, luggage trolley pass-through',
    tone: 'Minimalist & Luxury',
    language: 'English (US)',
    keywords: 'leather commuter backpack, italian leather bag, 16 inch laptop bag, minimalist work rucksack',
    creativity: 0.6,
    price: '$285.00 USD',
    category: 'Bags & Luggage',
    slug: 'leather-commuter-backpack',
    rating: 4.95,
    reviewCount: 312,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    result: {
      h3Heading: 'Crafted for the Modern Metropolitan Voyager',
      introParagraph:
        'Master the daily commute with unmatched elegance. The Aeroway Commuter Backpack is sculpted from vegetable-tanned Tuscan leather that develops a distinctive personal patina with every journey. Designed with architectural precision, it effortlessly protects your tech essentials while maintaining an ultra-sleek, tailored silhouette.',
      specifications: [
        {
          label: 'Full-Grain Tuscan Heritage',
          description: 'Supple yet rugged Italian leather naturally resistant to light precipitation and urban scuffs.',
        },
        {
          label: 'Dedicated Tech Enclosure',
          description: 'High-density micro-fleece compartment engineered specifically for up to 16-inch laptops and tablets.',
        },
        {
          label: 'Ergonomic Weight Balancing',
          description: 'Breathable channel-stitched back panel that eliminates heat spots during transit.',
        },
      ],
      callToAction:
        'Upgrade your everyday carry today. Enjoy complimentary expedited worldwide shipping and a lifetime warranty on all leather hardware.',
      seoTitle: 'Aeroway Full-Grain Leather Commuter Backpack 16" Laptop',
      metaDescription:
        'Luxury handcrafted Italian full-grain leather commuter backpack. Features padded 16" laptop sleeve and waterproof zippers. Lifetime warranty included.',
      detectedKeywords: [
        { keyword: 'leather commuter backpack', count: 3 },
        { keyword: '16 inch laptop bag', count: 2 },
      ],
      wordCount: 172,
      readingEase: 68,
      readingLabel: 'Standard to Easy',
      generationTime: 1.2,
    },
  },
  {
    id: 'smart-ring',
    title: 'Lumina Gen-3 Titanium Smart Sleep & Recovery Ring',
    specs:
      'Grade 5 aerospace titanium, optical PPG infrared pulse sensors, body temperature variance tracking, 7-day battery life, 50m water resistant (5ATM), magnetic quick charger, iOS and Android health sync',
    tone: 'Technical & Functional',
    language: 'English (US)',
    keywords: 'titanium smart ring, sleep tracker ring, biometric recovery band, waterproof health wearable',
    creativity: 0.5,
    price: '$249.00 USD',
    category: 'Wearables & Health',
    slug: 'lumina-smart-ring',
    rating: 4.88,
    reviewCount: 540,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    result: {
      h3Heading: 'Unobtrusive Biometric Intelligence for Peak Wellness',
      introParagraph:
        'Experience clinical-precision wellness monitoring wrapped in ultralight aerospace titanium. The Lumina Gen-3 Smart Ring measures microscopic circadian shifts, HRV baseline, and body temperature differentials straight from finger vascular beds, delivering actionable recovery readiness without screen distraction.',
      specifications: [
        {
          label: 'Aerospace Grade 5 Titanium',
          description: 'Weighs under 3 grams with hypoallergenic medical resin interior for effortless 24/7 wear.',
        },
        {
          label: '7-Day Battery Efficiency',
          description: 'Advanced ultra-low power microcontroller powers a full week of continuous logging per 40-minute charge.',
        },
        {
          label: '5ATM Water Submersion',
          description: 'Seamless casing rated for pool laps, deep showers, and sauna recovery sessions.',
        },
      ],
      callToAction:
        'Unlock deep insights into your biological recovery. Order today with complimentary sizing kit and 1-year Lumina Health membership included.',
      seoTitle: 'Lumina Titanium Smart Sleep & Recovery Ring | 7-Day Battery',
      metaDescription:
        'Aerospace titanium smart ring monitoring sleep stages, HRV, and temperature. 50m waterproof with 7-day battery life. Sizing kit included.',
      detectedKeywords: [
        { keyword: 'titanium smart ring', count: 3 },
        { keyword: 'sleep tracker ring', count: 2 },
      ],
      wordCount: 168,
      readingEase: 65,
      readingLabel: 'Standard',
      generationTime: 1.5,
    },
  },
  {
    id: 'organic-matcha',
    title: 'Zenith Organic Uji Ceremonial First-Harvest Matcha (30g)',
    specs:
      'Single-origin 100% stone-ground tencha from Uji, Kyoto, shaded for 28 days, vibrant jade green color, umami-rich with zero bitterness, rich in L-theanine and EGCG catechins, vacuum-sealed nitrogen tin',
    tone: 'Conversational & Friendly',
    language: 'English (US)',
    keywords: 'ceremonial matcha powder, organic uji matcha, japanese green tea powder, authentic stone ground matcha',
    creativity: 0.7,
    price: '$34.00 USD',
    category: 'Gourmet Tea & Food',
    slug: 'zenith-ceremonial-matcha',
    rating: 4.96,
    reviewCount: 420,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    result: {
      h3Heading: 'Pure Calm Energy from Kyoto’s Sacred Tea Gardens',
      introParagraph:
        'Savor the sublime tranquility of authentic Japanese tea culture. Zenith Ceremonial Matcha is crafted exclusively from shade-grown first-flush spring leaves in historic Uji, Kyoto. Stone-ground on traditional granite mills into micro-fine jade silk, each whisked bowl yields a luminous crema packed with clean sustained focus.',
      specifications: [
        {
          label: '28-Day Shaded First Harvest',
          description: 'Maximizes natural chlorophyll and calming L-theanine for a velvety umami sweetness with zero astringency.',
        },
        {
          label: 'Nitrogen-Flushed Freshness',
          description: 'Double-sealed in recyclable aluminum tins directly at the farm to preserve farm-fresh antioxidants.',
        },
        {
          label: 'JAS Organic Certified',
          description: '100% clean single-ingredient ceremonial grade powder free from pesticides, fillers, or artificial sweeteners.',
        },
      ],
      callToAction:
        'Elevate your morning focus routine today. Backed by our fresh-guarantee or your money back within 30 days.',
      seoTitle: 'Zenith Organic Uji Ceremonial Matcha 30g | Kyoto Japan',
      metaDescription:
        'Authentic first-harvest ceremonial Japanese matcha powder from Uji, Kyoto. Rich in L-theanine with creamy umami taste. JAS organic certified.',
      detectedKeywords: [
        { keyword: 'ceremonial matcha powder', count: 3 },
        { keyword: 'organic uji matcha', count: 2 },
      ],
      wordCount: 165,
      readingEase: 74,
      readingLabel: 'Very Easy to read',
      generationTime: 1.1,
    },
  },
];
