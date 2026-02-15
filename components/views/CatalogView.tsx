
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product, User, PublicationStatus, IntegrationConfig } from '../../types';
import { Button, Badge, Toast } from '../ui/UIComponents';
import { uploadToCloudinary } from '../../services/omegaServices';
import { 
  Search, X, Save, Palette, UploadCloud,
  DollarSign, Check, Type, Loader2,
  Box, LayoutTemplate, Trash2, Edit3, 
  LayoutList, Grid, Columns, Filter,
  ArrowUpDown, Hash, Calendar, Layers, Plus, Image as ImageIcon, ChevronDown, ZoomIn, Download, Minus,
  Zap, Monitor, Gem, Wand2, ImageOff, Share2, Link, Copy, MessageCircle, ArrowRight
} from 'lucide-react';

interface CatalogProps {
  user: User;
  onSaleConfirm: (product: Product, price: number) => void;
  onPublish: (productId: string, format: string, status: PublicationStatus) => void;
  globalMarkup?: number;
  products: Product[];
  integrationConfig: IntegrationConfig;
  simulationMode?: boolean;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

// --- COMPONENTE: PRODUCT IMAGE HANDLER (Smart Placeholder) ---
const ProductImage = ({ src, alt, className = "", onClick }: { src?: string, alt?: string, className?: string, onClick?: () => void }) => {
    const [error, setError] = useState(false);

    if (!src || error || src.trim() === '') {
        return (
            <div 
                onClick={onClick}
                className={`w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-300 gap-2 cursor-pointer group hover:bg-slate-100 transition-colors ${className}`}
                title="Haz clic para ver"
            >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 text-slate-300 group-hover:text-electro-red transition-colors" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Ver Producto</span>
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            className={`${className} object-contain mix-blend-multiply`} 
            onError={() => setError(true)}
            onClick={onClick}
        />
    );
};


// --- UTILS: LOGO SVG TO DATA URL ---
const getLogoDataUrl = (colorMode: 'ORIGINAL' | 'WHITE' | 'BLACK' | 'CYAN' | 'GOLD') => {
  let fillElectro, fillHogar, strokeTecho;

  switch (colorMode) {
    case 'WHITE':
      fillElectro = '#FFFFFF';
      fillHogar = '#FFFFFF';
      strokeTecho = '#FFFFFF';
      break;
    case 'BLACK':
      fillElectro = '#000000';
      fillHogar = '#000000';
      strokeTecho = '#000000';
      break;
    case 'CYAN':
      fillElectro = '#06b6d4'; // Cyan
      fillHogar = '#FFFFFF';
      strokeTecho = '#06b6d4';
      break;
    case 'GOLD':
      fillElectro = '#fbbf24'; // Gold
      fillHogar = '#FFFFFF';
      strokeTecho = '#fbbf24';
      break;
    case 'ORIGINAL':
    default:
      fillElectro = '#E60000';
      fillHogar = '#0F172A';
      strokeTecho = '#E60000';
      break;
  }

  const svgString = `
  <svg viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg">
    <path d="M 420,65 L 245,15 L 70,65 V 195 H 770" stroke="${strokeTecho}" stroke-width="25" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <text x="100" y="165" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="85" fill="${fillElectro}" letter-spacing="-0.03em">Electro</text>
    <text x="430" y="165" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="85" fill="${fillHogar}" letter-spacing="-0.03em">Hogar</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svgString);
};

// --- DEFINICIÓN DE TEMAS PREMIUM ---
const THEMES = [
  { id: 'RED_ELITE', label: 'Red', bgType: 'RADIAL', colors: ['#dc2626', '#7f1d1d'], textColor: '#FFFFFF', priceColor: '#fbbf24', logoMode: 'WHITE', fontStyle: 'MODERN', decor: 'LINES_DIAGONAL' },
  { id: 'TITANIUM', label: 'Titan', bgType: 'LINEAR', colors: ['#374151', '#111827'], textColor: '#F3F4F6', priceColor: '#FFFFFF', logoMode: 'WHITE', fontStyle: 'TECH', decor: 'TECH_HUD' },
  { id: 'CYBER_PUNK', label: 'Cyber', bgType: 'RADIAL', colors: ['#2e1065', '#020617'], textColor: '#e879f9', priceColor: '#22d3ee', logoMode: 'CYAN', fontStyle: 'MODERN', decor: 'CYBER_GRID' },
  { id: 'AURORA_LUX', label: 'Luxe', bgType: 'MESH', colors: ['#000000', '#1e1b4b'], textColor: '#e2e8f0', priceColor: '#fbbf24', logoMode: 'GOLD', fontStyle: 'SERIF', decor: 'ELEGANT_BORDERS' },
  { id: 'VANTABLACK', label: 'Dark', bgType: 'RADIAL', colors: ['#27272a', '#000000'], textColor: '#e4e4e7', priceColor: '#E60000', logoMode: 'WHITE', fontStyle: 'LUXURY', decor: 'GOLD_CIRCLE' },
  { id: 'POLAR', label: 'White', bgType: 'LINEAR', colors: ['#ffffff', '#f3f4f6'], textColor: '#18181b', priceColor: '#ef4444', logoMode: 'ORIGINAL', fontStyle: 'CLEAN', decor: 'MINIMAL_GRID' },
  { id: 'MIDNIGHT', label: 'Blue', bgType: 'RADIAL', colors: ['#2563eb', '#020617'], textColor: '#f1f5f9', priceColor: '#38bdf8', logoMode: 'WHITE', fontStyle: 'MODERN', decor: 'NEON_GLOW' },
  { id: 'GOLD_RUSH', label: 'Gold', bgType: 'RADIAL', colors: ['#b45309', '#451a03'], textColor: '#fef3c7', priceColor: '#ffffff', logoMode: 'WHITE', fontStyle: 'SERIF', decor: 'LUXURY_FRAME' }
];

// --- SHARE MODAL (REFERRAL SYSTEM) ---
const ShareModal = ({ product, user, onClose, onOpenStudio, onSimulateSale }: { product: Product, user: User, onClose: () => void, onOpenStudio: () => void, onSimulateSale: () => void }) => {
    const [copied, setCopied] = useState(false);
    const referralLink = `https://electrohogar.app/p/${product.sku.toLowerCase()}?ref=${user.id}`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = `Hola! Mirá este producto: ${product.name} a un precio increíble. Conseguilo acá: ${referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                
                {/* Header Image */}
                <div className="h-48 bg-slate-100 relative group overflow-hidden">
                    <img src={product.image} className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500" alt="" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full backdrop-blur-sm transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <h3 className="text-lg font-black text-slate-900 uppercase italic leading-tight">{product.name}</h3>
                        <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">SKU: {product.sku}</p>
                    </div>

                    {/* ACTIONS GRID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center h-32 hover:border-blue-300 transition-colors group relative overflow-hidden">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                </div>
                                <Link className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="text-xs font-black text-blue-900 uppercase">Link Referido</p>
                                <p className="text-[9px] text-blue-600/70 leading-tight mt-1 px-2">Gana comisiones compartiendo</p>
                            </div>
                            <button onClick={handleWhatsApp} className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Enviar
                            </button>
                            <button onClick={handleCopy} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado' : 'Copiar Link'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div 
                                onClick={() => { onClose(); onOpenStudio(); }}
                                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center h-32 cursor-pointer hover:scale-105 transition-transform group shadow-xl"
                            >
                                <Palette className="w-8 h-8 text-electro-red mb-2 group-hover:rotate-12 transition-transform" />
                                <p className="text-xs font-black text-white uppercase">Studio 2.0</p>
                                <p className="text-[9px] text-slate-400 leading-tight mt-1 px-2">Crea placas de venta profesionales</p>
                            </div>
                            <button onClick={() => { onClose(); onOpenStudio(); }} className="w-full py-3 bg-electro-red text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                                <Wand2 className="w-4 h-4" /> Diseñar
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => { onClose(); onSimulateSale(); }}
                            className="w-full py-3 border border-dashed border-slate-300 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-electro-red hover:text-electro-red hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                            <DollarSign className="w-4 h-4" /> Simular Compra de Cliente (Test)
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- STUDIO GENERATOR ---
const ProductGenerator = ({ product, onClose, initialPrice }: { product: Product, onClose: () => void, initialPrice: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [scale, setScale] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    if (words.length === 1) {
       ctx.fillText(words[0], x, currentY);
       return currentY + lineHeight;
    }

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight; 
  };

  const drawDecor = (ctx: CanvasRenderingContext2D, decorType: string) => {
      ctx.save();
      if (decorType === 'LINES_DIAGONAL') {
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.lineWidth = 4;
          for (let i = -1000; i < 3000; i += 50) {
              ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - 1000, CANVAS_HEIGHT); ctx.stroke();
          }
      } else if (decorType === 'TECH_HUD') {
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 3;
          const margin = 50; const cornerLen = 100;
          ctx.beginPath(); ctx.moveTo(margin, margin + cornerLen); ctx.lineTo(margin, margin); ctx.lineTo(margin + cornerLen, margin); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH - margin - cornerLen, margin); ctx.lineTo(CANVAS_WIDTH - margin, margin); ctx.lineTo(CANVAS_WIDTH - margin, margin + cornerLen); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(margin, CANVAS_HEIGHT - margin - cornerLen); ctx.lineTo(margin, CANVAS_HEIGHT - margin); ctx.lineTo(margin + cornerLen, CANVAS_HEIGHT - margin); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH - margin - cornerLen, CANVAS_HEIGHT - margin); ctx.lineTo(CANVAS_WIDTH - margin, CANVAS_HEIGHT - margin); ctx.lineTo(CANVAS_WIDTH - margin, CANVAS_HEIGHT - margin - cornerLen); ctx.stroke();
      } else if (decorType === 'CYBER_GRID') {
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'; ctx.lineWidth = 2;
          for(let y = CANVAS_HEIGHT/2; y < CANVAS_HEIGHT; y+=80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke(); }
          for(let x = -500; x < CANVAS_WIDTH + 500; x+=150) { ctx.beginPath(); ctx.moveTo(x, CANVAS_HEIGHT); ctx.lineTo(CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 200); ctx.stroke(); }
      } else if (decorType === 'ELEGANT_BORDERS') {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)'; ctx.lineWidth = 1;
          ctx.strokeRect(30, 30, CANVAS_WIDTH-60, CANVAS_HEIGHT-60);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)'; ctx.lineWidth = 1;
          ctx.strokeRect(45, 45, CANVAS_WIDTH-90, CANVAS_HEIGHT-90);
      }
      ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let gradient;
    if (activeTheme.bgType === 'RADIAL') {
        gradient = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 100, CANVAS_WIDTH/2, CANVAS_HEIGHT, 1500);
        gradient.addColorStop(0, activeTheme.colors[0]);
        gradient.addColorStop(1, activeTheme.colors[1]);
    } else {
        gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, activeTheme.colors[0]);
        gradient.addColorStop(1, activeTheme.colors[1]);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawDecor(ctx, activeTheme.decor as string);

    const containerSize = 900; 
    const containerX = (CANVAS_WIDTH - containerSize) / 2;
    const containerY = 180;
    const radius = 50;

    const img = new Image();
    img.src = product.image;
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 40;
        ctx.beginPath(); ctx.roundRect(containerX, containerY, containerSize, containerSize, radius);
        ctx.fillStyle = "rgba(0,0,0,0)"; ctx.fill(); ctx.clip();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        const scaledWidth = containerSize * scale; const scaledHeight = containerSize * scale;
        const drawX = containerX + (containerSize - scaledWidth) / 2;
        const drawY = containerY + (containerSize - scaledHeight) / 2;
        ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
        ctx.restore();

        let cursorY = containerY + containerSize + 80; 
        ctx.textAlign = "center"; ctx.textBaseline = "top";

        ctx.fillStyle = activeTheme.id === 'POLAR' ? '#18181b' : activeTheme.textColor;
        ctx.font = `600 55px 'Inter'`; 
        cursorY = wrapText(ctx, product.name.toUpperCase(), CANVAS_WIDTH / 2, cursorY, CANVAS_WIDTH - 140, 70);
        cursorY += 50; 

        const oldPrice = initialPrice * 1.35;
        ctx.font = "bold 50px 'Inter'"; 
        ctx.fillStyle = activeTheme.id === 'POLAR' ? '#9ca3af' : 'rgba(255,255,255,0.5)';
        const oldPriceText = `$ ${Math.round(oldPrice).toLocaleString()}`;
        ctx.fillText(oldPriceText, CANVAS_WIDTH / 2, cursorY);
        const oldWidth = ctx.measureText(oldPriceText).width;
        ctx.fillRect((CANVAS_WIDTH/2) - (oldWidth/2) - 10, cursorY + 25, oldWidth + 20, 5);
        cursorY += 70;

        const priceText = `$${initialPrice.toLocaleString()}`;
        ctx.font = `italic 900 300px 'Inter'`;
        const textMetrics = ctx.measureText(priceText);
        if (textMetrics.width > (CANVAS_WIDTH - 200)) {
            const factor = (CANVAS_WIDTH - 200) / textMetrics.width;
            ctx.font = `italic 900 ${Math.floor(300 * factor)}px 'Inter'`;
        }
        ctx.fillStyle = activeTheme.priceColor;
        ctx.fillText(priceText, CANVAS_WIDTH / 2, cursorY);

        const logoImg = new Image();
        logoImg.src = getLogoDataUrl(activeTheme.logoMode as any);
        logoImg.onload = () => {
            const logoW = 380; const logoH = (220/800) * logoW; 
            ctx.drawImage(logoImg, (CANVAS_WIDTH - logoW) / 2, CANVAS_HEIGHT - logoH - 100, logoW, logoH);
        };
    };
  }, [product, activeTheme, scale, initialPrice]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
        const link = document.createElement('a'); link.download = `omega-${product.sku}.png`;
        link.href = canvasRef.current?.toDataURL('image/png', 1.0) || ''; link.click(); setIsGenerating(false);
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-row h-[100dvh] w-screen overflow-hidden overscroll-none touch-none">
        <div className="relative flex-1 bg-[#09090b] flex items-center justify-center overflow-hidden">
            <div className="absolute top-6 left-6 z-[100]">
                <button onClick={onClose} className="w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors shadow-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100]">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
                    <Minus className="w-4 h-4 text-white/70 cursor-pointer hover:text-white" onClick={() => setScale(Math.max(0.7, scale - 0.1))} />
                    <input type="range" min="0.7" max="1.5" step="0.05" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-24 h-1 accent-white bg-white/20 rounded-lg appearance-none cursor-pointer" />
                    <ZoomIn className="w-4 h-4 text-white/70 cursor-pointer hover:text-white" onClick={() => setScale(Math.min(1.5, scale + 0.1))} />
                </div>
            </div>
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="max-w-full max-h-[100dvh] object-contain shadow-2xl" />
        </div>
        <div className="flex-none w-24 bg-[#0F0F10] border-l border-white/5 flex flex-col items-center py-6 gap-6 z-[200] h-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="flex flex-col items-center gap-1 shrink-0 mt-2"><span className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em]">ESTILO</span><div className="w-8 h-[1px] bg-white/10 mt-1"></div></div>
             <div className="flex-1 flex flex-col gap-5 overflow-y-auto w-full items-center px-2 scrollbar-hide py-2">
                 {THEMES.map(t => (
                     <button key={t.id} onClick={() => setActiveTheme(t)} className={`relative w-14 h-14 rounded-xl transition-all duration-300 shrink-0 group ${activeTheme.id === t.id ? 'scale-105 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}>
                        <div className="absolute inset-0 rounded-xl overflow-hidden" style={{background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`}}></div>
                        {activeTheme.id === t.id && <div className="absolute inset-0 flex items-center justify-center"><Check className="w-6 h-6 text-white drop-shadow-md" /></div>}
                     </button>
                 ))}
             </div>
             <div className="mt-auto px-2 pb-6 w-full flex justify-center shrink-0 border-t border-white/5 pt-6">
                 <button onClick={handleDownload} disabled={isGenerating} className="w-16 h-16 bg-white text-black rounded-2xl flex flex-col items-center justify-center shadow-lg hover:bg-electro-red hover:text-white transition-all">
                    {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-7 h-7 mb-1" />}
                    <span className="text-[8px] font-black uppercase tracking-widest">Guardar</span>
                 </button>
             </div>
        </div>
    </div>,
    document.body
  );
};

export const CatalogView: React.FC<CatalogProps> = ({ user, onSaleConfirm, products, globalMarkup = 0, integrationConfig, simulationMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [sortOrder, setSortOrder] = useState('DEFAULT');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID_1' | 'GRID_2'>('GRID_2');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'DATOS' | 'PRECIO'>('VISUAL');
  const [showShareModal, setShowShareModal] = useState(false);

  const isAdmin = user.role === 'ADMIN';
  const applyMarkup = (price: number) => globalMarkup === 0 ? price : price * (1 + globalMarkup / 100);

  const handleProductClick = (p: Product) => {
      setSelectedProduct(p);
      if (isAdmin) {
          setEditForm({...p});
          setActiveTab('VISUAL');
      } else {
          setShowShareModal(true);
      }
  };
  
  const handleStudio = (e: React.MouseEvent, p: Product) => {
      e.stopPropagation(); setSelectedProduct(p); setShowGenerator(true);
  };

  const filteredProducts = useMemo(() => {
      let result = [...products].filter(p => {
          const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchCat = selectedCategory === 'TODOS' || p.category.toUpperCase() === selectedCategory.toUpperCase();
          return matchSearch && matchCat;
      });
      if (sortOrder === 'PRICE_ASC') result.sort((a,b) => applyMarkup(a.priceList) - applyMarkup(b.priceList));
      if (sortOrder === 'PRICE_DESC') result.sort((a,b) => applyMarkup(b.priceList) - applyMarkup(a.priceList));
      if (sortOrder === 'NAME') result.sort((a,b) => a.name.localeCompare(b.name));
      return result;
  }, [products, searchTerm, selectedCategory, sortOrder]);

  const categories = ['TODOS', 'TELEVISORES', 'LAVADO', 'PEQUEÑOS', 'AUDIO'];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {showGenerator && selectedProduct && <ProductGenerator product={selectedProduct} initialPrice={applyMarkup(selectedProduct.priceList)} onClose={() => setShowGenerator(false)} />}
      {showShareModal && selectedProduct && !isAdmin && <ShareModal product={selectedProduct} user={user} onClose={() => { setShowShareModal(false); setSelectedProduct(null); }} onOpenStudio={() => { setShowShareModal(false); setShowGenerator(true); }} onSimulateSale={() => onSaleConfirm(selectedProduct, applyMarkup(selectedProduct.priceList))} />}
      
      {/* EDIT MODAL ADMIN */}
      {selectedProduct && !showGenerator && !showShareModal && editForm && isAdmin && createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
              <div className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                      <div><h3 className="text-xl font-black italic text-slate-900 uppercase">{editForm.id ? 'Editar Producto' : 'Nuevo Producto'}</h3></div>
                      <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
                  </div>
                  <div className="flex px-8 border-b border-slate-100">
                      {['VISUAL', 'DATOS', 'PRECIO'].map((tab) => (
                          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-4 mr-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab ? 'border-electro-red text-electro-red' : 'border-transparent text-slate-300 hover:text-slate-500'}`}>{tab}</button>
                      ))}
                  </div>
                  <div className="p-8 overflow-y-auto bg-[#F8F9FA]">
                      {activeTab === 'VISUAL' && <div className="flex flex-col items-center gap-6"><div className="w-64 h-64 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4 shadow-sm relative group cursor-pointer hover:border-electro-red"><ProductImage src={editForm.image} className="w-full h-full" /><div className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity"><UploadCloud className="w-8 h-8 mb-2" /><span className="text-[10px] font-bold uppercase">Cambiar Imagen</span></div></div></div>}
                      {activeTab === 'DATOS' && <div className="space-y-5"><div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre Comercial</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:border-electro-red outline-none" /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">SKU</label><input type="text" value={editForm.sku} onChange={e => setEditForm({...editForm, sku: e.target.value})} className="w-full p-4 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-slate-600" /></div><div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Categoría</label><select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full p-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 outline-none">{categories.filter(c => c !== 'TODOS').map(c => <option key={c} value={c}>{c}</option>)}</select></div></div></div>}
                      {activeTab === 'PRECIO' && <div className="space-y-6"><div className="bg-slate-900 rounded-2xl p-6 text-white text-center shadow-lg"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Precio Público Final</p><p className="text-4xl font-black italic tracking-tighter">$ {applyMarkup(editForm.priceList).toLocaleString()}</p></div><div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Costo Base (Lista)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span><input type="number" value={editForm.priceList} onChange={e => setEditForm({...editForm, priceList: Number(e.target.value)})} className="w-full p-4 pl-8 rounded-xl border border-slate-200 bg-white font-black text-xl text-slate-900 focus:border-electro-red outline-none" /></div></div></div>}
                  </div>
                  <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                      <Button variant="outline" fullWidth onClick={() => setSelectedProduct(null)} className="h-14 border-slate-200 text-slate-500">CANCELAR</Button>
                      <Button fullWidth onClick={() => { setSelectedProduct(null); }} className="h-14 bg-slate-900 text-white shadow-xl">GUARDAR PRODUCTO</Button>
                  </div>
              </div>
          </div>, document.body
      )}

      {/* HEADER */}
      <div className="flex-none mb-6 space-y-4">
          <div className="flex justify-between items-end">
              <div>
                  <h1 className="text-3xl font-black italic text-slate-900 uppercase tracking-tight leading-none">Catálogo de Productos</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{filteredProducts.length} ITEMS EN ESTE MODO</p>
              </div>
              {!simulationMode && <Badge type="success">Producción Real</Badge>}
          </div>
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center p-3">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input type="text" placeholder="BUSCAR PRODUCTOS..." className="w-full h-full pl-4 pr-4 py-1 bg-transparent text-sm font-bold uppercase outline-none placeholder:text-slate-300" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
              <div className="relative z-20">
                  <button onClick={() => setShowFilters(!showFilters)} className={`h-14 px-6 rounded-2xl border flex items-center gap-3 transition-all ${showFilters ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 hover:border-slate-300'}`}><Filter className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Filtros</span></button>
                  {showFilters && <div className="absolute top-16 left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-fade-in z-50"><div className="mb-4"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoría</p><div className="space-y-1">{categories.map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase ${selectedCategory === cat ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>{cat}</button>))}</div></div></div>}
              </div>
              <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-1 h-14 items-center">
                  <button onClick={() => setViewMode('LIST')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'LIST' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}><LayoutList className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('GRID_1')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'GRID_1' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}><Grid className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('GRID_2')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'GRID_2' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}><Columns className="w-5 h-5" /></button>
              </div>
          </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="flex-1 overflow-y-auto pb-32 pr-2">
          {filteredProducts.length > 0 ? (
              <div className={viewMode === 'LIST' ? 'space-y-4' : `grid gap-6 ${viewMode === 'GRID_2' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {filteredProducts.map((product, idx) => (
                      <div key={product.id} onClick={() => handleProductClick(product)} className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col animate-fade-in-up`} style={{animationDelay: `${idx * 0.05}s`}}>
                          <div className="relative aspect-square bg-white p-6 flex items-center justify-center border-b border-slate-50">
                              <ProductImage src={product.image} className="w-full h-full group-hover:scale-110 transition-transform duration-500" />
                              {product.isPromo && <div className="absolute top-4 left-4 bg-electro-red text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Promo</div>}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]"><button onClick={(e) => handleStudio(e, product)} className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-electro-red hover:text-white transition-colors flex items-center gap-2 shadow-2xl transform hover:scale-105"><Palette className="w-4 h-4" /> Crear Diseño</button></div>
                          </div>
                          <div className="p-6 flex flex-col flex-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
                              <h3 className="font-bold text-slate-900 text-sm leading-snug mb-4 line-clamp-2 min-h-[2.5em]">{product.name}</h3>
                              <div className="mt-auto"><p className="text-[10px] font-bold text-slate-400 uppercase">Precio Final</p><p className="text-2xl font-black text-slate-900 italic tracking-tighter">$ {applyMarkup(product.priceList).toLocaleString()}</p></div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6"><Box className="w-10 h-10 opacity-20" /></div>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic">Inventario Vacío</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs text-center">
                      {simulationMode ? 'No hay productos de prueba.' : 'Aún no has cargado productos en tu base de datos de producción.'}
                  </p>
                  {!simulationMode && isAdmin && (
                    <Button onClick={() => window.location.reload()} className="mt-8 bg-slate-900">Importar Productos</Button>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};
