import React from 'react';

export const PricingView: React.FC<{
  onSelectPlan: (name: string) => void;
}> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Starter Merchant',
      badge: 'For emerging stores',
      price: '$19',
      period: '/ month',
      description: 'Ideal for solo Shopify founders launching up to 50 products per month.',
      credits: '100 Credits included',
      features: [
        'Single Product Copywriter',
        'Google 2025 SERP Simulator',
        'Shopify HTML formatting',
        'Direct 1-click Shopify Push',
        'Standard generation speed',
      ],
      cta: 'Choose Starter',
      featured: false,
    },
    {
      name: 'Merchant Pro',
      badge: 'Most Popular',
      price: '$49',
      period: '/ month',
      description: 'Designed for scaling e-commerce brands needing bulk catalog automation.',
      credits: '500 Credits included',
      features: [
        'Everything in Starter',
        'Bulk CSV Importer & Generator',
        'Blog & Pinterest Copy Multiplier',
        'Custom Brand Tone Calibration',
        'Priority Gemini Flash Latency',
        'Multi-Store Shopify Connection',
      ],
      cta: 'Start Pro Trial',
      featured: true,
    },
    {
      name: 'Agency & Enterprise',
      badge: 'For high-volume operations',
      price: '$129',
      period: '/ month',
      description: 'Uncapped power for digital marketing agencies managing 10+ client stores.',
      credits: '2,500 Credits included',
      features: [
        'Everything in Merchant Pro',
        'Dedicated Shopify App Bridge API',
        'Team multi-seat access',
        'Custom liquid code styling',
        'Automated collection tagging',
        '24/7 dedicated account strategist',
      ],
      cta: 'Contact Enterprise',
      featured: false,
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-4">
      <div className="text-center flex flex-col items-center gap-2">
        <span className="text-xs font-bold text-primary bg-secondary-container/50 px-3 py-1 rounded-full uppercase tracking-wider">
          Transparent Scalable Pricing
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
          Supercharge Your Shopify Organic Conversion
        </h2>
        <p className="text-sm text-on-surface-variant max-w-lg">
          Generate search-ranking descriptions, structured rich text tags, and live Google SERP snippets in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl p-6 flex flex-col justify-between border transition-all ${
              p.featured
                ? 'bg-surface-container-lowest border-primary shadow-xl ring-2 ring-primary/20 relative'
                : 'bg-surface-container-lowest border-outline-variant shadow-xs hover:border-outline'
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                {p.badge}
              </span>
            )}
            <div>
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-lg text-on-surface">{p.name}</h3>
                {!p.featured && (
                  <span className="text-[11px] text-on-surface-variant font-medium">{p.badge}</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{p.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-on-surface">{p.price}</span>
                <span className="text-xs text-on-surface-variant">{p.period}</span>
              </div>

              <div className="mt-2 text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                {p.credits}
              </div>

              <div className="border-t border-outline-variant/60 my-5"></div>

              <ul className="flex flex-col gap-2.5 text-xs text-on-surface">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan(p.name)}
              className={`mt-6 w-full py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                p.featured
                  ? 'bg-primary hover:bg-on-primary-container text-white shadow-sm'
                  : 'bg-surface-container-high hover:bg-surface-variant text-on-surface'
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
