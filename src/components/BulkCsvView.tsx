import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

interface BulkProduct {
  id: string;
  handle: string;
  title: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalRow: any; // Keep the rest of the Shopify CSV data intact
}

export const BulkCsvView: React.FC<{
  onOpenStoreModal: () => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
}> = ({ credits, setCredits }) => {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseCSV(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedProducts: BulkProduct[] = results.data.map((row: any, index) => {
          return {
            id: index.toString(),
            handle: row['Handle'] || '',
            title: row['Title'] || '',
            bodyHtml: row['Body (HTML)'] || '',
            seoTitle: row['SEO Title'] || '',
            seoDescription: row['SEO Description'] || '',
            status: 'pending',
            originalRow: row,
          };
        });
        
        // Filter out rows that are variants (in Shopify CSV, only the first row of a product has a Title)
        const mainProducts = parsedProducts.filter(p => p.title && p.title.trim() !== '');
        
        setProducts(mainProducts);
        setDownloadReady(false);
      }
    });
  };

  const handleProcessAll = async () => {
    if (products.length === 0) return;
    
    // Count how many need processing (e.g., empty descriptions)
    const toProcess = products.filter(p => p.status !== 'completed');
    
    if (credits < toProcess.length) {
      alert(`Not enough credits. You need ${toProcess.length} credits to process this batch.`);
      return;
    }

    setIsProcessingAll(true);
    let currentCredits = credits;

    const newProducts = [...products];

    for (let i = 0; i < newProducts.length; i++) {
      if (newProducts[i].status === 'completed') continue;

      // Optimistic update to 'processing'
      newProducts[i].status = 'processing';
      setProducts([...newProducts]);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newProducts[i].title,
            specs: 'Standard E-commerce specifications.', // In a real scenario, this might come from Metafields or Tags
            tone: 'Minimalist & Luxury',
            creativity: 0.65
          }),
        });

        if (!res.ok) throw new Error('API Error');

        const data = await res.json();
        
        newProducts[i].bodyHtml = data.htmlDescription;
        newProducts[i].seoTitle = data.seoTitle;
        newProducts[i].seoDescription = data.metaDescription;
        newProducts[i].status = 'completed';
        
        currentCredits -= 1;
        setCredits(currentCredits);
        
      } catch (err) {
        console.error("Error processing product:", err);
        newProducts[i].status = 'error';
      }
      
      setProducts([...newProducts]);
    }

    setIsProcessingAll(false);
    setDownloadReady(true);
  };

  const handleExportCsv = () => {
    // Reconstruct the full CSV by merging updated data back into original rows
    const exportData = products.map((p) => {
      return {
        ...p.originalRow,
        'Body (HTML)': p.bodyHtml,
        'SEO Title': p.seoTitle,
        'SEO Description': p.seoDescription
      };
    });

    const csvString = Papa.unparse(exportData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shopify_bulk_optimized.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedCount = products.filter((p) => p.status === 'completed').length;
  const progressPercent = products.length > 0 ? Math.round((completedCount / products.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
            </span>
            <h2 className="font-bold text-lg text-on-surface">Bulk CSV Copywriting Pipeline</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Batch-generate conversion-tuned Shopify descriptions and Google SERP metadata from official Shopify CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={!downloadReady || products.length === 0}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container-low text-on-surface flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Download Shopify CSV
          </button>
          <button
            onClick={handleProcessAll}
            disabled={isProcessingAll || products.length === 0}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-on-primary-container text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessingAll ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing Batch...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Run Bulk Copywriter
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      {products.length === 0 && (
        <div 
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container-low/20'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 mx-auto bg-surface-container-highest rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl">upload_file</span>
          </div>
          <h3 className="text-lg font-bold mb-2">Upload Shopify CSV Export</h3>
          <p className="text-sm text-on-surface-variant mb-6 max-w-md mx-auto">
            Drag and drop your official Shopify product export CSV here. We'll automatically identify products and fill in empty descriptions.
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-surface-container-highest hover:bg-outline-variant text-on-surface font-semibold rounded-lg transition-colors"
          >
            Select CSV File
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleChange} 
          />
        </div>
      )}

      {/* Progress Bar (Visible when processing) */}
      {isProcessingAll && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span>Processing...</span>
            <span>{progressPercent}% ({completedCount}/{products.length})</span>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* CSV Table Card */}
      {products.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Queue: {products.length} Products Loaded
            </span>
            <button onClick={() => setProducts([])} className="text-xs text-error hover:underline font-semibold cursor-pointer">
              Clear Queue
            </button>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs relative">
              <thead className="bg-surface-container-low/90 text-on-surface-variant font-semibold sticky top-0 backdrop-blur-sm shadow-sm z-10">
                <tr>
                  <th className="py-3 px-4">Handle</th>
                  <th className="py-3 px-4">Product Title</th>
                  <th className="py-3 px-4">SEO Title</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary">{item.handle}</td>
                    <td className="py-3 px-4 font-medium text-on-surface max-w-xs truncate" title={item.title}>{item.title}</td>
                    <td className="py-3 px-4 text-on-surface-variant max-w-xs truncate">{item.seoTitle || '-'}</td>
                    <td className="py-3 px-4">
                      {item.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Ready
                        </span>
                      ) : item.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                          Generating
                        </span>
                      ) : item.status === 'error' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold text-[11px]">
                          Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
