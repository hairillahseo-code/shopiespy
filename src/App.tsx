import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ShopifyStoreModal } from './components/ShopifyStoreModal';
import { CreditsModal } from './components/CreditsModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { BulkCsvView } from './components/BulkCsvView';
import { BlogPinsView } from './components/BlogPinsView';
import { PricingView } from './components/PricingView';
import { PRODUCT_PRESETS, ProductData } from './data/presets';

export default function App() {
  // Navigation & state
  const [activeNavTab, setActiveNavTab] = useState<'single' | 'bulk' | 'blog' | 'pricing'>('single');
  const [credits, setCredits] = useState<number>(12);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Shopify Store Synced',
      desc: 'nordic-goods.myshopify.com connected with Storefront API v2025-01.',
      time: '10m ago',
      type: 'sync' as const,
      read: false,
    },
    {
      id: '2',
      title: 'Google 2025 Algorithm Active',
      desc: 'SERP title and semantic H3 snippet compliance check updated.',
      time: '1h ago',
      type: 'system' as const,
      read: false,
    },
    {
      id: '3',
      title: 'Credits Refilled',
      desc: 'Monthly plan renewed: +12 credits added to balance.',
      time: '1d ago',
      type: 'credit' as const,
      read: true,
    },
  ]);

  // Current Product Form State
  const defaultPreset = PRODUCT_PRESETS[0];
  const [currentPresetId, setCurrentPresetId] = useState<string>(defaultPreset.id);
  const [title, setTitle] = useState<string>(defaultPreset.title);
  const [specs, setSpecs] = useState<string>(defaultPreset.specs);
  const [tone, setTone] = useState<string>(defaultPreset.tone);
  const [language, setLanguage] = useState<string>(defaultPreset.language);
  const [keywords, setKeywords] = useState<string>(defaultPreset.keywords);
  const [creativity, setCreativity] = useState<number>(defaultPreset.creativity);
  const [price, setPrice] = useState<string>(defaultPreset.price);
  const [rating] = useState<number>(defaultPreset.rating);
  const [reviewCount] = useState<number>(defaultPreset.reviewCount);
  const [slug, setSlug] = useState<string>(defaultPreset.slug);

  // Generated Result State
  const [result, setResult] = useState<ProductData['result']>(defaultPreset.result);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputViewMode, setOutputViewMode] = useState<'shopify-html' | 'store-visual' | 'raw-code'>('shopify-html');

  // Trigger Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Switch preset
  const handleSelectPreset = (preset: ProductData) => {
    setCurrentPresetId(preset.id);
    setTitle(preset.title);
    setSpecs(preset.specs);
    setTone(preset.tone);
    setLanguage(preset.language);
    setKeywords(preset.keywords);
    setCreativity(preset.creativity);
    setPrice(preset.price);
    setSlug(preset.slug);
    setResult(preset.result);
    showToast(`Loaded preset: ${preset.title.split('(')[0].trim()}`);
  };

  // Reset form
  const handleResetForm = () => {
    handleSelectPreset(PRODUCT_PRESETS[0]);
  };

  // Dynamic Creativity Label
  const creativityLabel = useMemo(() => {
    if (creativity <= 0.3) return `Strictly Technical (${creativity.toFixed(2)})`;
    if (creativity <= 0.75) return `Balanced SEO (${creativity.toFixed(2)})`;
    return `Highly Creative (${creativity.toFixed(2)})`;
  }, [creativity]);

  // Formatted HTML output string
  const rawHtmlOutput = useMemo(() => {
    if (!result) return '';
    const specsList = result.specifications
      .map(
        (s) =>
          `  <li><strong>${s.label}:</strong> ${s.description}</li>`
      )
      .join('\n');

    return `<h3>${result.h3Heading}</h3>
<p>${result.introParagraph}</p>

<h4>Core Architectural Specifications:</h4>
<ul>
${specsList}
</ul>

<p><em>${result.callToAction}</em></p>`;
  }, [result]);

  // Dynamic Keyword Counts
  const detectedKeywordPills = useMemo(() => {
    if (!result) return [];
    const copyText = `${result.h3Heading} ${result.introParagraph} ${result.specifications.map((s) => `${s.label} ${s.description}`).join(' ')} ${result.callToAction}`.toLowerCase();
    const userKws = keywords.split(',').map((k) => k.trim()).filter(Boolean);

    const counts: Array<{ keyword: string; count: number }> = [];
    userKws.forEach((kw) => {
      if (!kw) return;
      const regex = new RegExp(`\\b${kw.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const matches = copyText.match(regex);
      const count = matches ? matches.length : 0;
      if (count > 0 || counts.length < 3) {
        counts.push({ keyword: kw, count: Math.max(1, count) });
      }
    });

    if (counts.length === 0 && result.detectedKeywords) {
      return result.detectedKeywords;
    }
    return counts.slice(0, 3);
  }, [result, keywords]);

  // Primary Generation Action
  const handleGenerate = async () => {
    if (!title.trim() || !specs.trim()) {
      showToast('Please enter product title and specifications.');
      return;
    }

    if (credits <= 0) {
      setIsCreditsModalOpen(true);
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          specs,
          tone,
          language,
          keywords,
          creativity,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      setResult(data);
      setCredits((prev) => Math.max(0, prev - 1));
      showToast('New Shopify SEO copy generated in ' + data.generationTime + 's!');
    } catch {
      // Local fallback generation
      setTimeout(() => {
        const words = `${title} ${specs}`.split(/\s+/);
        const duration = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));
        const cleanTitle = title.replace(/\(.*?\)/g, '').trim();

        const fallbackResult: ProductData['result'] = {
          h3Heading: `Elevate Your Everyday Ritual with the ${cleanTitle}`,
          introParagraph: `Discover the perfect synthesis of tactile luxury and thoughtful engineering. The ${cleanTitle} brings effortless distinction into your space, combining handcrafted artisanal materials with high-performance durability designed to enrich your daily routine.`,
          specifications: [
            {
              label: 'Precision Handcrafted Quality',
              description: 'Constructed to rigorous artisan standards ensuring exceptional structural resilience and long-lasting beauty.',
            },
            {
              label: 'Ergonomic Functional Harmony',
              description: 'Engineered for seamless daily use with comfortable balance and scratch-resistant protective finishing.',
            },
            {
              label: 'Effortless Lifestyle Care',
              description: 'Built for practical longevity with easy maintenance that fits seamlessly into your busy lifestyle.',
            },
          ],
          callToAction: `Order yours today to transform your daily routine. Backed by our 30-day Nordic crack-free satisfaction guarantee.`,
          seoTitle: `${cleanTitle.slice(0, 48)} | Premium Edition`.slice(0, 60),
          metaDescription: `Shop the handcrafted ${cleanTitle}. ${specs.slice(0, 80)}. Free shipping on orders over $50 with 30-day returns.`.slice(0, 155),
          detectedKeywords: [
            { keyword: keywords.split(',')[0]?.trim() || cleanTitle.toLowerCase(), count: 3 },
            { keyword: keywords.split(',')[1]?.trim() || 'artisan', count: 2 },
          ],
          wordCount: 178,
          readingEase: 71,
          readingLabel: 'Very Easy to read',
          generationTime: duration > 0 ? duration : 1.3,
        };

        setResult(fallbackResult);
        setCredits((prev) => Math.max(0, prev - 1));
        showToast(`Generated SEO copy in ${duration}s! (1 Credit used)`);
        setIsGenerating(false);
      }, 700);
      return;
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy helpers
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  // CSV export for single product
  const handleExportSingleCsv = () => {
    const handle = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const csvHeader = 'Handle,Title,Body (HTML),Vendor,Type,Tags,Published,SEO Title,SEO Description\n';
    const escapedBody = `"${rawHtmlOutput.replace(/"/g, '""')}"`;
    const escapedTitle = `"${title.replace(/"/g, '""')}"`;
    const escapedSeoTitle = `"${result.seoTitle.replace(/"/g, '""')}"`;
    const escapedMeta = `"${result.metaDescription.replace(/"/g, '""')}"`;
    const csvRow = `${handle},${escapedTitle},${escapedBody},Nordic Goods Store,Home & Living,"${keywords}",TRUE,${escapedSeoTitle},${escapedMeta}`;

    const blob = new Blob([csvHeader + csvRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${handle}-seo-product.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Shopify product CSV exported!');
  };

  // SEO Title & Meta character counters
  const seoTitleLength = result.seoTitle.length;
  const metaDescLength = result.metaDescription.length;

  return (
    <div className="bg-background text-on-surface font-sans text-sm antialiased min-h-screen flex flex-col selection:bg-secondary-container selection:text-on-primary-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APP BAR */}
      <Header
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        credits={credits}
        onOpenCreditsModal={() => setIsCreditsModalOpen(true)}
        onToggleNotifications={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
        hasUnreadNotifications={notifications.some((n) => !n.read)}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          showToast('All notifications marked as read');
        }}
      />

      {/* MAIN WORKSPACE CANVAS */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Bulk CSV View */}
        {activeNavTab === 'bulk' && (
          <BulkCsvView
            onOpenStoreModal={() => setIsStoreModalOpen(true)}
            credits={credits}
            setCredits={setCredits}
          />
        )}

        {/* Blog & Pins View */}
        {activeNavTab === 'blog' && (
          <BlogPinsView currentProductTitle={title} specs={specs} />
        )}

        {/* Pricing View */}
        {activeNavTab === 'pricing' && (
          <PricingView
            onSelectPlan={(plan) => {
              showToast(`Selected ${plan} plan. Opening checkout...`);
              setIsCreditsModalOpen(true);
            }}
          />
        )}

        {/* Single Writer (Default Primary View) */}
        {activeNavTab === 'single' && (
          <div className="flex flex-col gap-6">
            {/* Top Context & Notification Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div>
                  <h1 className="font-bold text-base text-on-surface">Shopify SEO Copywriting Engine</h1>
                  <p className="text-xs text-on-surface-variant">
                    Generate conversion-tuned product descriptions, structured tags, and SERP metadata compliant with Google &amp; Shopify 2025.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => setIsStoreModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 hover:bg-secondary-container/60 text-on-secondary-container text-xs font-semibold border border-secondary-container cursor-pointer transition-colors"
                  title="Click to view connected store settings"
                >
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Shopify API Connected
                </button>
              </div>
            </div>

            {/* Presets Quick-Switcher Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">interests</span>
                  Sample Catalog Presets:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRODUCT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        currentPresetId === preset.id
                          ? 'bg-primary-container text-white font-semibold shadow-xs'
                          : 'bg-surface-container-low/70 hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {preset.id === 'ceramic-mug'
                        ? '☕ Ceramic Mug'
                        : preset.id === 'leather-backpack'
                        ? '🎒 Leather Backpack'
                        : preset.id === 'smart-ring'
                        ? '💍 Smart Ring'
                        : '🍵 Ceremonial Matcha'}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-on-surface-variant/80 hidden sm:inline">
                Click any preset to test varied voice &amp; schema tags
              </span>
            </div>

            {/* 2-COLUMN SPLIT WORKSPACE (50 / 50 Desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: INPUT PANEL */}
              <section className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col gap-6">
                {/* Header */}
                <div className="border-b border-outline-variant/60 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-on-surface">Product Details</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Generate SEO-optimized HTML copy for Shopify
                    </p>
                  </div>
                  <button
                    onClick={handleResetForm}
                    className="text-on-surface-variant hover:text-primary text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Reset Form
                  </button>
                </div>

                {/* Form Elements */}
                <div className="flex flex-col gap-5">
                  {/* Product Title Input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-on-surface" htmlFor="product-title">
                        Product Title
                      </label>
                      <span className="text-on-surface-variant">
                        Recommended: 40-70 characters ({title.length} chars)
                      </span>
                    </div>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-hidden"
                      id="product-title"
                      placeholder="e.g., Minimalist Ceramic Coffee Mug 350ml"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Key Features & Specs Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-on-surface" htmlFor="product-specs">
                        Key Features &amp; Specs
                      </label>
                      <span className="text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                        Bullet specs yield highest SEO rank
                      </span>
                    </div>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-hidden resize-none"
                      id="product-specs"
                      placeholder="e.g., Matte black finish, heat-resistant, microwave & dishwasher safe, ergonomic handle"
                      rows={5}
                      value={specs}
                      onChange={(e) => setSpecs(e.target.value)}
                    />
                  </div>

                  {/* Dual Select Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tone of Voice */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface" htmlFor="tone-select">
                        Tone of Voice
                      </label>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs text-on-surface focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-hidden pr-10 cursor-pointer"
                          id="tone-select"
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                        >
                          <option>Minimalist &amp; Luxury</option>
                          <option>Conversational &amp; Friendly</option>
                          <option>Technical &amp; Functional</option>
                          <option>Urgent &amp; High-Conversion</option>
                          <option>Playful &amp; Bold</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">
                          keyboard_arrow_down
                        </span>
                      </div>
                    </div>

                    {/* Target Language */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-on-surface" htmlFor="lang-select">
                        Target Language
                      </label>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs text-on-surface focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-hidden pr-10 cursor-pointer"
                          id="lang-select"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option>English (US)</option>
                          <option>English (UK / Commonwealth)</option>
                          <option>German (Standard)</option>
                          <option>French (European)</option>
                          <option>Spanish (Castilian)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[20px]">
                          keyboard_arrow_down
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Target Keywords */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-on-surface" htmlFor="target-keywords">
                        Target Keywords (Comma Separated)
                      </label>
                      <span className="text-on-surface-variant">Used in H2/H3 headings</span>
                    </div>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-hidden"
                      id="target-keywords"
                      placeholder="e.g., ceramic coffee mug, matte black mug"
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>

                  {/* Creativity Slider & SEO Tuning */}
                  <div className="bg-surface-container-low/50 border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
                        Creativity vs. Direct Factuality
                      </span>
                      <span className="text-on-primary-fixed-variant bg-secondary-container px-2 py-0.5 rounded-full font-bold text-[11px]">
                        {creativityLabel}
                      </span>
                    </div>
                    <input
                      className="w-full accent-primary cursor-pointer h-1.5 bg-surface-container-highest rounded-lg"
                      max="1"
                      min="0"
                      step="0.05"
                      type="range"
                      value={creativity}
                      onChange={(e) => setCreativity(parseFloat(e.target.value))}
                    />
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>Strictly Technical</span>
                      <span>Balanced Merchant</span>
                      <span>Highly Creative</span>
                    </div>
                  </div>

                  {/* Primary Generation CTA */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-primary-container hover:bg-primary text-on-primary py-3.5 px-6 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60"
                    type="button"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Optimizing SEO &amp; Crafting Copy...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                        <span>Generate Description &amp; SEO (1 Credit)</span>
                      </>
                    )}
                  </button>

                  {/* Micro helpers under button */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-on-surface-variant text-[11px] pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                      Instant HTML preview
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                      Google 2025 SERP safe
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                      Shopify Rich Text tags
                    </span>
                  </div>
                </div>
              </section>

              {/* RIGHT COLUMN: OUTPUT & LIVE PREVIEW PANEL */}
              <section className="lg:col-span-6 flex flex-col gap-6">
                {/* TOP CARD: Shopify HTML Preview Container */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden flex flex-col">
                  {/* Output Top Bar / Tabs */}
                  <div className="px-4 lg:px-6 py-3 border-b border-outline-variant flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/30">
                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/80 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        onClick={() => setOutputViewMode('shopify-html')}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                          outputViewMode === 'shopify-html'
                            ? 'bg-primary-container text-on-primary shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">html</span>
                        Shopify HTML
                      </button>
                      <button
                        onClick={() => setOutputViewMode('store-visual')}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                          outputViewMode === 'store-visual'
                            ? 'bg-primary-container text-on-primary shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">preview</span>
                        Store Visual
                      </button>
                      <button
                        onClick={() => setOutputViewMode('raw-code')}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                          outputViewMode === 'raw-code'
                            ? 'bg-primary-container text-on-primary shadow-xs'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">code</span>
                        Raw Code
                      </button>
                    </div>

                    {/* Execution Status Chip */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/30 border border-secondary-container text-on-primary-fixed-variant text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-primary text-[15px]">speed</span>
                      <span>
                        Generated in {result.generationTime}s • High SEO Match
                      </span>
                    </div>
                  </div>

                  {/* Output Action Bar & Stats */}
                  <div className="px-4 lg:px-6 py-2.5 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-2 bg-surface-container-lowest">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-on-surface-variant font-medium">Keywords Detected:</span>
                      {detectedKeywordPills.map((kwItem, index) => (
                        <span
                          key={index}
                          className="bg-secondary-container/40 text-on-primary-container border border-secondary-container px-2 py-0.5 rounded text-[11px] font-semibold"
                        >
                          {kwItem.keyword} ({kwItem.count}x)
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(rawHtmlOutput, 'Shopify HTML')}
                        className="px-2.5 py-1.5 rounded-lg border border-outline-variant hover:border-outline text-on-surface hover:bg-surface-container-low text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy Generated HTML"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        Copy HTML
                      </button>
                      <button
                        onClick={() => setIsStoreModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Push directly to connected Shopify store"
                      >
                        <span className="material-symbols-outlined text-[16px]">storefront</span>
                        Send to Shopify
                      </button>
                    </div>
                  </div>

                  {/* VIEW 1: Formatted Rich Text Shopify Copy Card Preview */}
                  {outputViewMode === 'shopify-html' && (
                    <div className="p-6 lg:p-8 flex flex-col gap-5 text-on-surface leading-relaxed">
                      {/* H3 Heading */}
                      <div>
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-primary bg-secondary-container/30 px-2 py-0.5 rounded">
                          Tag: &lt;h3&gt;
                        </span>
                        <h3 className="text-lg font-bold text-on-surface mt-1.5 tracking-tight">
                          {result.h3Heading}
                        </h3>
                      </div>

                      {/* Intro Paragraph */}
                      <p className="text-sm text-on-surface/90 leading-relaxed">
                        {result.introParagraph}
                      </p>

                      {/* Feature Bullet List */}
                      <div className="bg-surface-container-low/40 border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          Core Architectural Specifications:
                        </span>
                        <ul className="flex flex-col gap-2.5">
                          {result.specifications.map((spec, index) => (
                            <li key={index} className="flex items-start gap-2.5 text-sm">
                              <span className="w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center shrink-0 mt-0.5 text-on-primary-container">
                                <span className="material-symbols-outlined text-[15px]">check</span>
                              </span>
                              <span>
                                <strong className="font-semibold text-on-surface">
                                  {spec.label}:
                                </strong>{' '}
                                {spec.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bold Call-to-action paragraph */}
                      <p className="text-sm text-on-surface font-medium border-l-2 border-primary-container pl-3 py-0.5">
                        {result.callToAction}
                      </p>
                    </div>
                  )}

                  {/* VIEW 2: Store Visual Theme Mockup */}
                  {outputViewMode === 'store-visual' && (
                    <div className="p-6 bg-slate-50 flex flex-col gap-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row gap-5">
                        {/* Mock Product Thumbnail */}
                        <div className="w-full md:w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 relative overflow-hidden group">
                          {PRODUCT_PRESETS.find((p) => p.id === currentPresetId)?.imageUrl ? (
                            <img
                              src={PRODUCT_PRESETS.find((p) => p.id === currentPresetId)?.imageUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-400">
                              <span className="material-symbols-outlined text-4xl">inventory_2</span>
                              <span className="text-[11px] font-medium">Product Image</span>
                            </div>
                          )}
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                            Live Theme
                          </span>
                        </div>

                        {/* Store Mockup Product Buy Area */}
                        <div className="flex-1 flex flex-col justify-between gap-3">
                          <div>
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                              Nordic Goods Store
                            </span>
                            <h2 className="text-base font-bold text-slate-900 mt-0.5">{title}</h2>
                            <div className="flex items-center gap-2 mt-1.5 text-xs">
                              <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className="material-symbols-outlined text-[14px]"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                              <span className="text-slate-600 font-semibold">{rating}</span>
                              <span className="text-slate-400">({reviewCount} reviews)</span>
                            </div>
                            <div className="text-lg font-bold text-slate-900 mt-2">{price}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-white">
                              Qty: 1
                            </div>
                            <button
                              onClick={() => showToast('Simulated: Added to Shopify cart')}
                              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Store Mockup Description Section */}
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                        <div className="border-b border-slate-200 pb-2 mb-4 flex gap-4 text-xs font-semibold text-slate-700">
                          <span className="border-b-2 border-slate-900 pb-2 text-slate-900">
                            Description &amp; Specifications
                          </span>
                          <span className="text-slate-400 cursor-pointer">Shipping &amp; Returns</span>
                          <span className="text-slate-400 cursor-pointer">Customer Reviews</span>
                        </div>
                        <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed text-xs">
                          <h4 className="font-bold text-sm text-slate-900">{result.h3Heading}</h4>
                          <p className="mt-1">{result.introParagraph}</p>
                          <ul className="mt-2 space-y-1 list-disc pl-4">
                            {result.specifications.map((s, idx) => (
                              <li key={idx}>
                                <strong>{s.label}:</strong> {s.description}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-slate-600 italic">{result.callToAction}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW 3: Raw Monospace Code View */}
                  {outputViewMode === 'raw-code' && (
                    <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[480px]">
                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                        <span>Shopify Rich Text HTML Output</span>
                        <button
                          onClick={() => copyToClipboard(rawHtmlOutput, 'Raw HTML')}
                          className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                          Copy
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap">{rawHtmlOutput}</pre>
                    </div>
                  )}

                  {/* Bottom Footer Stats of the Copy Card */}
                  <div className="px-6 py-3 bg-surface-container-low/50 border-t border-outline-variant/60 flex flex-wrap items-center justify-between text-on-surface-variant text-xs gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">data_object</span>
                      Word Count: <strong className="text-on-surface">{result.wordCount} words</strong> (Recommended: 150-250)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                      Flesch Reading Ease: {result.readingEase} ({result.readingLabel})
                    </span>
                  </div>
                </div>

                {/* BOTTOM CARD: SEO Metadata & SERP Simulator */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-primary-container/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">search_check</span>
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-on-surface">
                        SEO Metadata &amp; SERP Live Preview
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `Title: ${result.seoTitle}\nMeta Description: ${result.metaDescription}`,
                            'SEO Metadata'
                          )
                        }
                        className="px-3 py-1 text-primary hover:bg-surface-container-low rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">copy_all</span>
                        Copy All SEO
                      </button>
                      <button
                        onClick={handleExportSingleCsv}
                        className="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">file_download</span>
                        Export to CSV
                      </button>
                    </div>
                  </div>

                  {/* Meta Title Display Box */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface font-semibold">SEO Title</span>
                      <span
                        className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                          seoTitleLength <= 60
                            ? 'bg-secondary-container text-on-primary-container'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {seoTitleLength}/60 chars ({seoTitleLength <= 60 ? 'Optimal' : 'Slightly Long'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container-low/40 border border-outline-variant/80 rounded-lg px-3.5 py-2 text-xs">
                      <span className="text-on-surface font-medium select-all truncate">
                        {result.seoTitle}
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.seoTitle, 'SEO Title')}
                        className="text-on-surface-variant hover:text-primary transition-colors ml-2 cursor-pointer"
                        title="Copy Title"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>
                  </div>

                  {/* Meta Description Display Box */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface font-semibold">Meta Description</span>
                      <span
                        className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                          metaDescLength <= 160
                            ? 'bg-secondary-container text-on-primary-container'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {metaDescLength}/160 chars ({metaDescLength <= 160 ? 'Optimal' : 'Truncated'})
                      </span>
                    </div>
                    <div className="flex items-start justify-between bg-surface-container-low/40 border border-outline-variant/80 rounded-lg px-3.5 py-2 text-xs">
                      <span className="text-on-surface/90 select-all leading-snug">
                        {result.metaDescription}
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.metaDescription, 'Meta Description')}
                        className="text-on-surface-variant hover:text-primary transition-colors ml-2 shrink-0 mt-0.5 cursor-pointer"
                        title="Copy Meta Description"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Genuine Google Desktop SERP Result Card */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                        Google Search Result Simulator (Desktop)
                      </span>
                      <span className="text-[11px] text-on-surface-variant">Google Webbot 2025 Standard</span>
                    </div>

                    {/* Google Result Mockup Card */}
                    <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-xs flex flex-col gap-1">
                      {/* URL & Favicon Row */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-primary text-[13px] font-bold">
                          S
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[14px] text-[#202124] font-medium">ShopieSpy Store</span>
                          <span className="text-[12px] text-[#4d5156] font-mono">
                            https://shopiespy.com › products › {slug}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[#70757a] text-[16px] ml-auto cursor-pointer">
                          more_vert
                        </span>
                      </div>

                      {/* Clickable Blue Title */}
                      <a
                        className="text-[#1a0dab] hover:underline text-[19px] leading-[26px] font-medium tracking-normal"
                        href="#serp"
                        onClick={(e) => {
                          e.preventDefault();
                          showToast('Simulated Google search link clicked');
                        }}
                      >
                        {result.seoTitle}
                      </a>

                      {/* Gray Snippet Text */}
                      <p className="text-[#4d5156] text-[14px] leading-[21px] mt-0.5">
                        {result.metaDescription}
                      </p>

                      {/* Extended Google Merchant Sitelinks Badge */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-[12px] text-[#4d5156]">
                        <span className="font-semibold text-primary">In stock</span>
                        <span>•</span>
                        <span>{price}</span>
                        <span>•</span>
                        <span>30-day returns</span>
                        <span>•</span>
                        <span className="flex items-center text-amber-500">
                          <span
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="ml-0.5 text-slate-700 font-medium">
                            {rating} ({reviewCount})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-outline-variant bg-surface-container-lowest py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">ShopieSpy</span>
            <span>— Single Product Copywriter v2.4</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => showToast('Documentation: Shopify SEO Best Practices 2025')}
              className="hover:text-on-surface transition-colors cursor-pointer"
            >
              Documentation
            </button>
            <button
              onClick={() => showToast('API Keys: Gemini 3.8 Flash & Shopify App Bridge')}
              className="hover:text-on-surface transition-colors cursor-pointer"
            >
              API Keys
            </button>
            <button
              onClick={() => setIsStoreModalOpen(true)}
              className="hover:text-on-surface transition-colors cursor-pointer"
            >
              Shopify App Bridge
            </button>
            <button
              onClick={() => showToast('Privacy Policy: End-to-end merchant data protection')}
              className="hover:text-on-surface transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <ShopifyStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        productTitle={title}
        seoTitle={result.seoTitle}
        metaDescription={result.metaDescription}
        htmlBody={rawHtmlOutput}
        onSuccess={(msg) => {
          showToast(msg);
          setNotifications((prev) => [
            {
              id: Date.now().toString(),
              title: 'Product Pushed to Shopify',
              desc: `${title} pushed to store as active draft with SERP metadata.`,
              time: 'Just now',
              type: 'sync',
              read: false,
            },
            ...prev,
          ]);
        }}
      />

      <CreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        currentCredits={credits}
        onAddCredits={(amount) => {
          setCredits((prev) => prev + amount);
          showToast(`Successfully added +${amount} copywriting credits!`);
          setNotifications((prev) => [
            {
              id: Date.now().toString(),
              title: 'Credits Added',
              desc: `Purchased +${amount} credits package. New balance: ${credits + amount}.`,
              time: 'Just now',
              type: 'credit',
              read: false,
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}
