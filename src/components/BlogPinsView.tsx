import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export const BlogPinsView: React.FC<{
  currentProductTitle: string;
  specs: string;
}> = ({ currentProductTitle, specs }) => {
  const [contentType, setContentType] = useState<'blog' | 'pinterest'>('blog');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [blogHtml, setBlogHtml] = useState<string>('');
  const [pins, setPins] = useState<{title: string, description: string, board: string}[]>([]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [infographicTheme, setInfographicTheme] = useState<'editorial' | 'dark-tech' | 'modern-pop' | 'full-bleed'>('full-bleed');
  const [extractedColor, setExtractedColor] = useState<{r: number, g: number, b: number} | null>(null);
  const [magicBlend, setMagicBlend] = useState(false);
  const [activeBadge, setActiveBadge] = useState<'none' | 'bestseller' | 'eco' | 'sale'>('bestseller');

  const infographicRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    let file: File | null = null;
    
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    } else if ('target' in e && (e.target as HTMLInputElement).files) {
      file = (e.target as HTMLInputElement).files![0];
    }

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setExtractedColor(null); // Reset color for new image
      };
      reader.readAsDataURL(file);
    }
  };

  const extractDominantColor = (img: HTMLImageElement) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0);
      
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0, count = 0;
      
      // Sample every 4th pixel (step by 16) for performance
      for (let i = 0; i < data.length; i += 16) {
         if (data[i+3] < 200) continue; // skip transparent
         // skip near white/black for better saturation
         if ((data[i]>240 && data[i+1]>240 && data[i+2]>240) || (data[i]<30 && data[i+1]<30 && data[i+2]<30)) continue;
         r += data[i]; g += data[i+1]; b += data[i+2];
         count++;
      }
      if (count > 0) {
        setExtractedColor({ r: Math.floor(r/count), g: Math.floor(g/count), b: Math.floor(b/count) });
      }
    } catch(err) {
      console.log("Canvas color extraction skipped (CORS)");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: currentProductTitle, specs }),
      });
      if (!res.ok) throw new Error('Failed to generate');
      const data = await res.json();
      setBlogHtml(data.blogHtml);
      setPins(data.pins);
    } catch (error) {
      console.error(error);
      alert('Error generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadInfographic = async () => {
    if (!infographicRef.current) return;
    try {
      const canvas = await html2canvas(infographicRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#0f172a' // match background
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `infographic-${currentProductTitle.slice(0, 15).replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating infographic image', err);
    }
  };
  
  const handlePinterestShare = () => {
    // In a real app, this would upload the image and open a share dialog.
    // We will just open Pinterest create URL.
    window.open('https://pinterest.com/pin/create/button/', '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">article</span>
            </span>
            <h2 className="font-bold text-lg text-on-surface">Blog &amp; Pinterest Growth Multiplier</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Turn your Shopify product into organic search blog posts and high-converting Pinterest pin copy.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <button
            onClick={handleGenerate}
            disabled={isGenerating || !currentProductTitle}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-on-primary-container text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Generate Content
              </>
            )}
          </button>
        </div>
      </div>

      {(blogHtml || pins.length > 0) && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
          <div className="flex items-center gap-2 bg-surface-container-low/60 border-b border-outline-variant p-3">
            <button
              onClick={() => setContentType('blog')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                contentType === 'blog'
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Shopify Blog Article
            </button>
            <button
              onClick={() => setContentType('pinterest')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                contentType === 'pinterest'
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Pinterest Pins & Infographic
            </button>
          </div>

          <div className="p-6">
            {contentType === 'blog' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Target: Shopify Online Store Blog
                  </span>
                  <button
                    onClick={() => handleCopy(blogHtml)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? 'Copied Article!' : 'Copy Blog HTML'}
                  </button>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-on-surface leading-relaxed font-sans bg-surface-container-low/20 p-5 rounded-xl border border-outline-variant/50">
                  <div dangerouslySetInnerHTML={{ __html: blogHtml }} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pins List */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold border-b border-outline-variant/60 pb-2">Generated Pin Text</h3>
                  {pins.map((pin, index) => (
                    <div
                      key={index}
                      className="border border-outline-variant rounded-xl p-4 bg-surface-container-low/30 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-primary uppercase bg-secondary-container/40 px-2 py-0.5 rounded">
                            Board Idea: {pin.board}
                          </span>
                          <button
                            onClick={() => handleCopy(`${pin.title}\n\n${pin.description}`)}
                            className="text-primary hover:text-on-primary-container text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            Copy Pin
                          </button>
                        </div>
                        <h4 className="font-bold text-sm text-on-surface mt-2">{pin.title}</h4>
                        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{pin.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Infographic Generator */}
                <div className="flex flex-col gap-4 border-l border-outline-variant/60 pl-8">
                  <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
                    <h3 className="text-sm font-bold">Auto-Generated Infographic</h3>
                    <div className="flex gap-2">
                       <button
                        onClick={downloadInfographic}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        PNG
                      </button>
                      <button
                        onClick={handlePinterestShare}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E60023] hover:bg-[#ad081b] text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                         <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.624.002 12.017.002z"/></svg>
                        Pin to Pinterest
                      </button>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="flex gap-2 mb-2 justify-center flex-wrap">
                    <button onClick={() => setInfographicTheme('editorial')} className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors ${infographicTheme === 'editorial' ? 'bg-[#e0a9a5] text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}>Editorial</button>
                    <button onClick={() => setInfographicTheme('dark-tech')} className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors ${infographicTheme === 'dark-tech' ? 'bg-emerald-600 text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}>Dark Tech</button>
                    <button onClick={() => setInfographicTheme('modern-pop')} className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors ${infographicTheme === 'modern-pop' ? 'bg-[#6366f1] text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}>Modern Pop</button>
                    <button onClick={() => setInfographicTheme('full-bleed')} className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors ${infographicTheme === 'full-bleed' ? 'bg-black text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}>Vogue</button>
                  </div>
                  
                  {/* Aesthetic Controls */}
                  <div className="flex gap-2 mb-4 justify-center">
                    <button onClick={() => setMagicBlend(!magicBlend)} className={`text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-colors border ${magicBlend ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[12px] align-text-bottom mr-1">auto_fix</span>
                      Magic Blend (No BG)
                    </button>
                    <select 
                      value={activeBadge} 
                      onChange={(e) => setActiveBadge(e.target.value as any)}
                      className="text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-wider bg-surface-container border border-outline-variant text-on-surface-variant outline-none"
                    >
                      <option value="none">No Badge</option>
                      <option value="bestseller">🏆 Bestseller</option>
                      <option value="eco">🌿 Eco-Friendly</option>
                      <option value="sale">🔥 50% Off</option>
                    </select>
                  </div>
                  
                  {/* Infographic Canvas (Aspect Ratio 2:3 for Pinterest) */}
                  <div className="flex justify-center bg-surface-container-low/20 rounded-xl p-4">
                    {infographicTheme === 'full-bleed' ? (
                      <div 
                        ref={infographicRef}
                        className="w-[340px] h-[510px] relative overflow-hidden bg-black flex flex-col justify-end p-6 cursor-pointer group"
                        onClick={() => imageInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleImageUpload}
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        
                        {!customImage && (
                          <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center z-0">
                            <span className="material-symbols-outlined text-slate-500 animate-spin">autorenew</span>
                          </div>
                        )}
                        
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          key={customImage ? 'custom' : currentProductTitle}
                          src={customImage || `/api/generate-image?prompt=${encodeURIComponent(currentProductTitle)}`} 
                          alt="Product Visual"
                          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0 ${magicBlend ? 'mix-blend-screen opacity-80' : ''}`}
                          crossOrigin="anonymous"
                          onLoad={(e) => {
                            if (!extractedColor) extractDominantColor(e.target as HTMLImageElement);
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none"></div>
                        
                        <div className="absolute inset-0 bg-black/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-sm">
                          <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                          Change Background Photo
                        </div>

                        {/* Vogue Badge */}
                        {activeBadge !== 'none' && (
                          <div className="absolute top-6 right-6 z-30 w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-center shadow-2xl rotate-[15deg]">
                            <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                              {activeBadge === 'bestseller' ? 'Best\nSeller' : activeBadge === 'eco' ? '100%\nEco' : 'Half\nPrice'}
                            </span>
                          </div>
                        )}

                        <div className="z-20 w-full relative">
                          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[8px] uppercase tracking-[0.3em] font-sans font-bold mb-4 rounded-sm border border-white/30 shadow-lg">New Arrival</div>
                          
                          <h2 className="text-white text-[28px] font-bold leading-none mb-6 drop-shadow-xl text-balance">
                            {currentProductTitle.length > 35 ? currentProductTitle.slice(0, 35) + '...' : currentProductTitle}
                          </h2>
                          
                          <div className="flex flex-col gap-2.5 mb-8 font-sans">
                             {specs.split(',').slice(0,2).map((spec, i) => (
                               <div key={i} className="text-white/90 text-[11px] flex gap-2.5 items-center">
                                 <div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
                                   <span className="material-symbols-outlined text-[10px] text-white">check</span>
                                 </div>
                                 <span className="leading-snug">{spec.trim()}</span>
                               </div>
                             ))}
                          </div>
                          
                          <div className="w-full border-2 border-white text-white text-center py-3 text-[10px] uppercase tracking-widest font-sans font-bold backdrop-blur-sm shadow-xl">
                            Shop Collection
                          </div>
                          <div className="w-full text-center mt-3">
                            <span className="text-white/50 text-[8px] font-sans tracking-[0.2em] uppercase font-bold">shopiespy.com</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        ref={infographicRef}
                        className={`w-[340px] min-h-[510px] h-fit overflow-hidden relative flex flex-col items-center pt-8 px-5 pb-8 
                          ${infographicTheme === 'editorial' ? 'bg-[#fdfaf6] border border-[#e5dfd5]' : 
                            infographicTheme === 'dark-tech' ? 'bg-slate-900 border border-white/10' : 
                            'bg-[#f4f4f5] border border-zinc-200'}`}
                        style={{
                           fontFamily: infographicTheme === 'editorial' ? "'Inter', sans-serif" : "'Plus Jakarta Sans', sans-serif",
                           background: infographicTheme === 'dark-tech' && extractedColor ? `linear-gradient(135deg, rgba(${extractedColor.r},${extractedColor.g},${extractedColor.b},0.3) 0%, #0f172a 100%)` :
                                       infographicTheme === 'dark-tech' ? "linear-gradient(135deg, #022c22 0%, #0f172a 100%)" : 
                                       infographicTheme === 'modern-pop' && extractedColor ? `linear-gradient(135deg, rgba(${extractedColor.r},${extractedColor.g},${extractedColor.b},0.1) 0%, rgba(${extractedColor.r},${extractedColor.g},${extractedColor.b},0.3) 100%)` :
                                       infographicTheme === 'modern-pop' ? "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)" : "",
                        }}
                      >
                        {/* Theme-Specific Decor */}
                        {infographicTheme === 'editorial' && (
                          <>
                            <div className="absolute top-4 right-4 text-[#e0a9a5] text-2xl font-serif leading-none">✦</div>
                            <div className="absolute bottom-32 left-6 text-[#e0a9a5] text-xl font-serif leading-none">✦</div>
                          </>
                        )}
                        {infographicTheme === 'dark-tech' && (
                          <>
                            <div className="absolute top-[-50px] left-[-50px] w-40 h-40 blur-[50px] rounded-full" style={{ backgroundColor: extractedColor ? `rgba(${extractedColor.r},${extractedColor.g},${extractedColor.b},0.3)` : 'rgba(16,185,129,0.2)' }}></div>
                            <div className="absolute bottom-10 right-[-30px] w-32 h-32 blur-[40px] rounded-full" style={{ backgroundColor: extractedColor ? `rgba(${extractedColor.r},${extractedColor.g},${extractedColor.b},0.2)` : 'rgba(52,211,153,0.1)' }}></div>
                          </>
                        )}
                        
                        {/* Top Label */}
                        <div className={`px-3 py-1 text-[8px] font-bold tracking-[0.2em] uppercase mb-3 
                          ${infographicTheme === 'editorial' ? 'bg-[#2d2d2d] text-white rounded-sm' : 
                            infographicTheme === 'dark-tech' ? 'border border-white/20 text-white rounded-full backdrop-blur-md' : 
                            'text-white rounded-md shadow-md'}`}
                            style={{ 
                              backgroundColor: infographicTheme === 'dark-tech' && extractedColor ? `rgba(${extractedColor.r},${extractedColor.g},${extractedColor.b},0.4)` : 
                                               infographicTheme === 'modern-pop' && extractedColor ? `rgb(${extractedColor.r},${extractedColor.g},${extractedColor.b})` : 
                                               infographicTheme === 'modern-pop' ? '#6366f1' : undefined
                            }}>
                          {infographicTheme === 'dark-tech' ? 'Trending on Shopify' : 'Curated Pick'}
                        </div>
                        
                        {/* Title */}
                        <h2 className={`text-[24px] leading-tight text-center z-10 text-balance mb-4 
                          ${infographicTheme === 'editorial' ? 'text-[#2d2d2d]' : 
                            infographicTheme === 'dark-tech' ? 'text-white text-[18px] drop-shadow-md' : 
                            'text-zinc-900 font-extrabold text-[22px]'}`}
                            style={{ fontFamily: infographicTheme === 'editorial' ? "'Playfair Display', serif" : "inherit", fontWeight: infographicTheme === 'editorial' ? 700 : 800 }}>
                          {currentProductTitle.length > 40 ? currentProductTitle.slice(0, 40) + '...' : currentProductTitle}
                        </h2>

                        {/* Image Container with Drag-and-Drop */}
                        <div 
                          className={`overflow-hidden z-10 shrink-0 relative group cursor-pointer transition-all duration-300
                            ${infographicTheme === 'editorial' ? 'w-[250px] h-[180px] rounded-[30px] shadow-lg border-4 border-white bg-[#f0ebe1] rotate-[-2deg] hover:rotate-0' : 
                              infographicTheme === 'dark-tech' ? 'rounded-2xl shadow-2xl border-2 border-emerald-500/20 bg-slate-800 w-36 h-36 mt-0' : 
                              'rounded-xl shadow-xl border-4 border-white bg-indigo-50 hover:-translate-y-1 w-[250px] h-[180px]'}`}
                          onClick={() => imageInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleImageUpload}
                        >
                          <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                            Upload photo
                          </div>

                          {/* Skeleton */}
                          {!customImage && (
                            <div className={`absolute inset-0 animate-pulse flex items-center justify-center ${infographicTheme === 'dark-tech' ? 'bg-slate-700' : 'bg-[#e5dfd5]'}`}>
                              <span className="material-symbols-outlined text-slate-400 animate-spin">autorenew</span>
                            </div>
                          )}
                          
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            key={customImage ? 'custom' : currentProductTitle}
                            src={customImage || `/api/generate-image?prompt=${encodeURIComponent(currentProductTitle)}`} 
                            alt="Product Visual"
                            className={`w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500 relative z-10 ${magicBlend ? (infographicTheme === 'dark-tech' ? 'mix-blend-screen opacity-80' : 'mix-blend-multiply contrast-125') : ''}`}
                            crossOrigin="anonymous"
                            onLoad={(e) => {
                              if (!extractedColor) extractDominantColor(e.target as HTMLImageElement);
                            }}
                          />
                          
                          {/* Standard Badges */}
                          {activeBadge !== 'none' && (
                            <div className={`absolute -top-3 -right-3 z-30 w-14 h-14 rounded-full flex items-center justify-center text-center shadow-xl rotate-[12deg] border-2 
                              ${infographicTheme === 'dark-tech' ? 'bg-emerald-500 text-slate-900 border-slate-900' : 
                                infographicTheme === 'modern-pop' ? 'bg-yellow-400 text-indigo-900 border-indigo-50' : 
                                'bg-[#2d2d2d] text-white border-[#f0ebe1]'}`}>
                              <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">
                                {activeBadge === 'bestseller' ? 'Top\nPick' : activeBadge === 'eco' ? 'Eco\nSafe' : '50%\nOff'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Specs */}
                        <div className={`w-full z-10 flex flex-col gap-2 ${infographicTheme === 'dark-tech' ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl mt-3 p-3 flex-1 justify-center shadow-2xl' : 'mt-4'}`}>
                          {infographicTheme !== 'dark-tech' && (
                            <div className={`text-center font-bold text-[10px] tracking-widest uppercase mb-1 
                              ${infographicTheme === 'editorial' ? 'text-[#a8958c]' : 'text-indigo-500'}`}>
                              Why We Love It
                            </div>
                          )}
                          <ul className={`text-[10px] flex flex-col gap-2.5 ${infographicTheme === 'dark-tech' ? 'text-slate-200 px-0' : 'text-[#4a4744] px-2'}`}>
                             {specs.split(',').slice(0,3).map((spec, i) => (
                               <li key={i} className={`flex items-center gap-3 ${infographicTheme === 'editorial' ? 'bg-white px-3 py-2 rounded-xl shadow-sm border border-[#f0ebe1]' : infographicTheme === 'modern-pop' ? 'bg-white px-3 py-2 rounded-lg shadow-sm border-l-4 border-indigo-500' : ''}`}>
                                 
                                 {infographicTheme === 'editorial' && (
                                   <div className="w-5 h-5 rounded-full bg-[#f9e8e6] flex items-center justify-center shrink-0 text-[#d48c85]">
                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                   </div>
                                 )}
                                 {infographicTheme === 'modern-pop' && (
                                   <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-500">
                                     <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                                   </div>
                                 )}
                                 {infographicTheme === 'dark-tech' && (
                                   <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                                     <span className="material-symbols-outlined text-emerald-400 text-[10px]">done</span>
                                   </div>
                                 )}
                                 
                                 <span className="leading-snug font-medium line-clamp-2">{spec.trim()}</span>
                               </li>
                             ))}
                          </ul>
                        </div>
                        
                        {/* CTA & Watermark */}
                        <div className={`w-full mt-auto text-center z-10 flex flex-col items-center ${infographicTheme === 'dark-tech' ? 'mt-3 mb-0' : ''}`}>
                          <div className={`inline-block px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md mb-2 
                            ${infographicTheme === 'editorial' ? 'bg-[#e0a9a5] text-white' : 
                              infographicTheme === 'dark-tech' ? 'bg-white text-slate-900 px-5 py-1.5' : 
                              'bg-zinc-900 text-white'}`}>
                            Shop Now
                          </div>
                          <p className={`text-[8px] tracking-[0.2em] uppercase font-bold 
                            ${infographicTheme === 'editorial' ? 'text-[#a8958c]' : 
                              infographicTheme === 'dark-tech' ? 'text-slate-500' : 
                              'text-zinc-400'}`}>
                            shopiespy.com
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs text-slate-500">1000x1500px logic scaled for preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
