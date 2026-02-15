
import React, { useState, useRef } from 'react';
import readXlsxFile from 'read-excel-file';
import { Card, Button, Badge } from '../ui/UIComponents';
import { 
  User as UserIcon, Shield, Smartphone, Server, 
  LogOut, ChevronRight, Zap, Percent, Database, 
  ShieldAlert, Globe, Briefcase, Lock, 
  Settings as SettingsIcon, BarChart, Users, Image as ImageIcon,
  DollarSign, Power, Search, AlertTriangle, Check, CreditCard, Cloud, Key, UploadCloud, ArrowRight, MessageCircle, Phone, Tag, BrainCircuit, RefreshCw
} from 'lucide-react';
import { User as UserType, GlobalSettingsState, IntegrationConfig, Product } from '../../types';
import { MOCK_TEAM } from '../../constants';
import { getInflationRecommendation } from '../../services/omegaServices';

interface SettingsProps {
  user: UserType;
  globalSettings: GlobalSettingsState;
  setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettingsState>>;
  integrationConfig: IntegrationConfig;
  setIntegrationConfig: React.Dispatch<React.SetStateAction<IntegrationConfig>>;
  simulationMode: boolean;
  onSave: () => void;
  onImportCatalog: (products: Product[]) => void;
}

const Toggle = ({ active, onToggle, color = 'bg-electro-red' }: { active: boolean, onToggle: () => void, color?: string }) => (
  <button onClick={onToggle} className={`w-14 h-8 rounded-full relative transition-colors duration-300 shadow-inner ${active ? color : 'bg-slate-700'}`}>
    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
);

// --- COMPONENTE: IMPORTACIÓN DE DATOS (REAL) ---
const DataImportPanel = ({ onComplete }: { onComplete: (products: Product[]) => void }) => {
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState<'CSV' | 'EXCEL' | 'UNKNOWN'>('UNKNOWN');
    const [processedProducts, setProcessedProducts] = useState<Product[]>([]);
    
    // Referencia al input file oculto
    const fileInputRef = useRef<HTMLInputElement>(null);

    // LOGICA CSV
    const processCSV = (text: string) => {
        const lines = text.split('\n');
        if (lines.length < 2) return []; 
        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
        
        return parseRows(lines.slice(1), headers, separator);
    };

    // LOGICA EXCEL (REAL)
    const processExcel = async (file: File) => {
        try {
            const rows = await readXlsxFile(file);
            if (rows.length < 2) return [];
            
            // Fila 0 son headers
            const headers = rows[0].map((h: any) => String(h).trim().toLowerCase());
            
            // Convertir filas restantes a string para reutilizar lógica o procesar directo
            // Aquí procesamos directo mapeando los indices
            return mapDataToProducts(rows.slice(1), headers);
        } catch (error) {
            console.error("Error leyendo Excel:", error);
            return [];
        }
    };

    // Helper unificado para mapear datos a Productos
    const mapDataToProducts = (rows: any[], headers: string[]) => {
        const idxSKU = headers.findIndex(h => h.includes('sku') || h.includes('codigo') || h.includes('id'));
        const idxName = headers.findIndex(h => h.includes('nombre') || h.includes('producto') || h.includes('descripcion') || h.includes('titulo'));
        const idxPrice = headers.findIndex(h => h.includes('precio') || h.includes('costo') || h.includes('valor'));
        const idxStock = headers.findIndex(h => h.includes('stock') || h.includes('cantidad') || h.includes('disponible'));
        const idxCat = headers.findIndex(h => h.includes('categoria') || h.includes('rubro') || h.includes('familia'));
        const idxImg = headers.findIndex(h => h.includes('imagen') || h.includes('foto') || h.includes('url'));

        const products: Product[] = [];

        rows.forEach((row, i) => {
             // Si es CSV row es string, si es Excel row es array de celdas
             let cols: any[] = [];
             if (typeof row === 'string') { // CSV
                 if (!row.trim()) return;
                 // Hack simple para CSV (no maneja comas dentro de comillas perfectamente, pero sirve para exports simples)
                 cols = row.split(headers.length > 1 ? (row.includes(';') ? ';' : ',') : ',').map(c => c.trim().replace(/^"|"$/g, ''));
             } else { // Excel (Array)
                 cols = row;
             }
             
             if (cols.length < 2) return;

             const name = idxName > -1 ? String(cols[idxName]) : `Producto Importado ${i+1}`;
             
             // Price Parsing
             let price = 0;
             if (idxPrice > -1) {
                 const rawPrice = cols[idxPrice];
                 if (typeof rawPrice === 'number') price = rawPrice;
                 else if (typeof rawPrice === 'string') {
                     // Limpiar moneda
                     price = parseFloat(rawPrice.replace(/[^\d.,-]/g, '').replace(',', '.'));
                 }
             }

             const stock = idxStock > -1 ? parseInt(String(cols[idxStock])) : 0;
             const cat = idxCat > -1 ? String(cols[idxCat]) : 'Varios';
             
             // IMAGEN - LÓGICA LIMPIA
             // Si viene en el archivo, la usamos. Si no, vacío.
             let image = idxImg > -1 ? String(cols[idxImg]) : '';
             if (image === 'null' || image === 'undefined' || image.length < 5) {
                 image = ''; // Dejar vacío para que el Catálogo muestre el placeholder "SIN IMAGEN"
             }

             products.push({
                id: `imp-${Date.now()}-${i}`,
                sku: idxSKU > -1 ? String(cols[idxSKU]) : `IMP-${1000+i}`,
                name: name,
                description: 'Importado masivamente.',
                priceList: price || 0,
                priceReseller: (price || 0) * 0.85, 
                stock: stock || 0,
                category: cat,
                image: image,
                isPromo: false,
                specs: { 'Origen': 'Importación' }
            });
        });
        return products;
    };
    
    // Legacy CSV parser wrapper
    const parseRows = (rows: string[], headers: string[], separator: string) => {
        // En CSV pasamos rows como strings, el mapDataToProducts lo maneja
        return mapDataToProducts(rows, headers); 
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // VALIDACIÓN MANUAL DE EXTENSIÓN (Solución Android "Gray Files")
        // Al usar accept="*" el sistema deja elegir todo. Aquí filtramos.
        const fileNameLower = file.name.toLowerCase();
        const isValid = fileNameLower.endsWith('.csv') || 
                        fileNameLower.endsWith('.txt') || 
                        fileNameLower.endsWith('.xlsx') || 
                        fileNameLower.endsWith('.xls');

        if (!isValid) {
            alert("⚠️ Formato no compatible.\n\nPor favor selecciona un archivo Excel (.xlsx, .xls) o CSV.");
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            return;
        }

        setFileName(file.name);
        setStep(2); 
        
        const isExcel = fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls');
        setFileType(isExcel ? 'EXCEL' : 'CSV');

        if (isExcel) {
             const data = await processExcel(file);
             setProcessedProducts(data);
             simulateProgress();
        } else {
             const reader = new FileReader();
             reader.onload = (event) => {
                 const text = event.target?.result as string;
                 const data = processCSV(text);
                 setProcessedProducts(data);
                 simulateProgress();
             };
             reader.readAsText(file);
        }
    };

    const simulateProgress = () => {
        let curr = 0;
        const interval = setInterval(() => {
            curr += 10;
            setProgress(curr);
            if (curr >= 100) {
                clearInterval(interval);
            }
        }, 80);
    };

    const handleComplete = () => {
        onComplete(processedProducts);
        setStep(3);
    };

    const handleReset = () => {
        setStep(1);
        setProgress(0);
        setProcessedProducts([]);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="p-6 md:p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
             <div className="flex justify-between items-center mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= s ? 'bg-electro-red text-white' : 'bg-slate-100 text-slate-300'}`}>
                            {step > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        <span className={`text-[9px] uppercase font-bold tracking-widest hidden md:block ${step >= s ? 'text-slate-900' : 'text-slate-300'}`}>{s === 1 ? 'Archivo' : s === 2 ? 'Proceso' : 'Fin'}</span>
                    </div>
                ))}
             </div>

             <input 
                type="file" 
                accept="*"
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
             />

             {step === 1 && (
                <div className="text-center space-y-6">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                    >
                        <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-electro-red transition-colors" />
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Haz clic para subir Archivo</p>
                        <p className="text-[9px] text-slate-300 mt-1">Soporta: Excel (.xlsx), CSV</p>
                    </div>
                </div>
             )}

             {step === 2 && (
                <div className="space-y-6">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span>Procesando {fileName}...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div className="bg-electro-red h-full transition-all duration-75" style={{width: `${progress}%`}}></div>
                    </div>
                    {progress === 100 && (
                         <div className={`p-4 rounded-xl border flex items-center gap-3 bg-green-50 border-green-100`}>
                             <Check className="w-5 h-5 text-green-600" />
                             <div>
                                 <p className="font-bold text-xs text-green-800">Lectura Completada</p>
                                 <p className="text-[10px] text-green-600">
                                     {processedProducts.length} productos listos para importar.
                                 </p>
                             </div>
                         </div>
                    )}
                    {progress === 100 && <Button onClick={handleComplete} fullWidth className="h-12 bg-slate-900">Confirmar e Importar</Button>}
                </div>
             )}

             {step === 3 && (
                <div className="text-center space-y-4 animate-scale-up">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                        <Check className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900">¡Carga Exitosa!</h3>
                    <p className="text-xs text-slate-500">Tus {processedProducts.length} productos ya están en el catálogo.</p>
                    <Button onClick={handleReset} variant="outline" fullWidth>Cargar Otro Archivo</Button>
                </div>
             )}
        </div>
    );
};

export const SettingsView: React.FC<SettingsProps> = ({ user, globalSettings, setGlobalSettings, integrationConfig, setIntegrationConfig, simulationMode, onSave, onImportCatalog }) => {
  const isAdmin = user.role === 'ADMIN';
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'COMMUNICATION' | 'INTEGRATION' | 'DATA'>('GENERAL');
  
  // AI STATE
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [aiResult, setAiResult] = useState<{rate: number, rec: number, reason: string} | null>(null);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave();
    }, 1000);
  };

  const updateSetting = (key: keyof GlobalSettingsState, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const updateTemplate = (key: 'welcome' | 'sale' | 'payout', value: string) => {
      setGlobalSettings(prev => ({
          ...prev,
          whatsappTemplates: {
              ...prev.whatsappTemplates,
              [key]: value
          }
      }));
  };

  const updateEconomicAI = (key: string, value: any) => {
      setGlobalSettings(prev => ({
          ...prev,
          economicAI: {
              ...prev.economicAI,
              [key]: value
          }
      }));
  };

  const insertVariable = (variable: string, templateKey: 'welcome' | 'sale' | 'payout') => {
      const current = globalSettings.whatsappTemplates[templateKey] || '';
      updateTemplate(templateKey, current + ` {{${variable}}} `);
  };
  
  const updateIntegration = (provider: 'mercadoPago' | 'firebase' | 'cloudinary', field: string, value: any) => {
    setIntegrationConfig(prev => ({
        ...prev,
        [provider]: {
            ...prev[provider],
            [field]: value
        }
    }));
  };

  const handleCheckInflation = async () => {
      setIsCheckingAI(true);
      setAiResult(null);
      try {
          const result = await getInflationRecommendation(globalSettings.markupPercentage);
          setAiResult({
              rate: result.inflationRate,
              rec: result.recommendedMarkup,
              reason: result.reasoning
          });
      } catch (e) {
          alert("Error consultando Omega AI. Verifica la conexión o API Key.");
      } finally {
          setIsCheckingAI(false);
      }
  };

  const applyAiRecommendation = () => {
      if (aiResult) {
          updateSetting('markupPercentage', aiResult.rec);
          // Also save the inflation data for future reference
          updateEconomicAI('inflationData', aiResult.rate);
          updateEconomicAI('lastCheck', new Date().toISOString());
          setAiResult(null); // Clear result after applying
      }
  };

  if (isAdmin) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-32">
        
        {/* HEADER */}
        <div className="bg-slate-950 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                 <div className={`w-3 h-3 rounded-full animate-pulse ${simulationMode ? 'bg-amber-400' : 'bg-green-500'}`}></div>
                 <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${simulationMode ? 'text-amber-400' : 'text-green-400'}`}>
                    {simulationMode ? 'Modo Simulación' : 'Modo Producción'}
                 </p>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                 Configuración
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4 max-w-lg leading-relaxed">
                 Panel de administración global. Gestiona identidad, comunicación y economía.
              </p>
           </div>
           
           {/* Decorative Background */}
           <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-electro-red via-slate-900 to-transparent pointer-events-none" />
           <Globe className="absolute -bottom-10 -right-10 w-80 h-80 text-white opacity-5 pointer-events-none" />
        </div>

        {/* NAVIGATION GRID (BOXES - NO SCROLL) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { id: 'GENERAL', label: 'General', sub: 'Marca & Economía', icon: SettingsIcon },
                { id: 'COMMUNICATION', label: 'Mensajería', sub: 'Templates WhatsApp', icon: MessageCircle },
                { id: 'INTEGRATION', label: 'Conexiones', sub: 'APIs Externas', icon: Cloud },
                { id: 'DATA', label: 'Base de Datos', sub: 'Importar / Exportar', icon: Database }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all ${
                        activeTab === tab.id 
                            ? 'bg-electro-red text-white shadow-xl shadow-red-200 scale-[1.02]' 
                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <tab.icon className="w-5 h-5" /> 
                    </div>
                    <div className="text-center">
                        <p className="font-black uppercase italic text-xs tracking-widest">{tab.label}</p>
                        <p className={`text-[9px] uppercase font-bold tracking-tight mt-1 ${activeTab === tab.id ? 'text-red-100' : 'text-slate-300'}`}>{tab.sub}</p>
                    </div>
                </button>
            ))}
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[400px]">
            
            {/* TAB: GENERAL */}
            {activeTab === 'GENERAL' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-in">
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* IDENTITY SECTION */}
                        <Card className="p-8 md:p-10 rounded-[2.5rem] border-slate-200 shadow-xl bg-white">
                            <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center"><Tag className="w-6 h-6 text-white" /></div>
                                Identidad de Marca
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Plataforma</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-slate-300">
                                        <Globe className="w-5 h-5 text-slate-300" />
                                        <input type="text" value={globalSettings.platformName || ''} onChange={(e) => updateSetting('platformName', e.target.value)} placeholder="Ej: Electro Hogar" className="bg-transparent w-full outline-none text-sm font-bold text-slate-900" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Soporte</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-slate-300">
                                        <Phone className="w-5 h-5 text-slate-300" />
                                        <input type="text" value={globalSettings.supportPhone || ''} onChange={(e) => updateSetting('supportPhone', e.target.value)} placeholder="Ej: 54911..." className="bg-transparent w-full outline-none text-sm font-bold text-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* ECONOMY SECTION WITH AI */}
                        <Card className="p-8 md:p-10 rounded-[2.5rem] border-slate-200 shadow-xl relative overflow-hidden bg-white">
                            <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter mb-8 flex items-center gap-3 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center"><Percent className="w-6 h-6 text-indigo-600" /></div>
                                Economía Global
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest italic">Markup (Inflación)</p>
                                    <Badge type="premium">+{globalSettings.markupPercentage}%</Badge>
                                    </div>
                                    <input 
                                    type="range" 
                                    min="0" max="100" step="1"
                                    value={globalSettings.markupPercentage}
                                    onChange={(e) => updateSetting('markupPercentage', Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium italic">
                                    Aumenta porcentualmente TODOS los precios del catálogo público.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest italic">Comisión Líderes</p>
                                    <Badge type="success">{globalSettings.leaderCommission}%</Badge>
                                    </div>
                                    <input 
                                    type="range" 
                                    min="1" max="20" step="0.5"
                                    value={globalSettings.leaderCommission}
                                    onChange={(e) => updateSetting('leaderCommission', Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium italic">
                                    Ganancia pasiva sobre ventas de red.
                                    </p>
                                </div>
                            </div>

                            {/* OMEGA AI SECTION */}
                            <div className="mt-8 relative z-10">
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                    
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                                <BrainCircuit className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black italic uppercase text-lg leading-none">Omega Economic AI</h4>
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 mt-1">Ajuste Inteligente de Precios (Gemini 3 Flash)</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[9px] font-black uppercase tracking-widest">Auto-Pilot</p>
                                                <p className="text-[9px] opacity-70">Cada 24hs</p>
                                            </div>
                                            <Toggle 
                                                active={globalSettings.economicAI?.enabled || false} 
                                                onToggle={() => updateEconomicAI('enabled', !globalSettings.economicAI?.enabled)}
                                                color="bg-white/30"
                                            />
                                        </div>
                                    </div>

                                    {/* AI Actions Area */}
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        {isCheckingAI ? (
                                            <div className="flex items-center gap-3 text-white/80 animate-pulse">
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Consultando Inflación en Tiempo Real...</span>
                                            </div>
                                        ) : aiResult ? (
                                            <div className="animate-fade-in">
                                                <div className="flex items-start gap-4 mb-4 bg-black/20 p-4 rounded-xl">
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Análisis Completado</p>
                                                        <p className="text-sm font-medium leading-snug">{aiResult.reason}</p>
                                                        <div className="mt-3 flex gap-4">
                                                            <div>
                                                                <span className="text-[9px] block opacity-70 uppercase font-bold">Inflación Detectada</span>
                                                                <span className="text-lg font-black">{aiResult.rate}%</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] block opacity-70 uppercase font-bold">Markup Sugerido</span>
                                                                <span className="text-lg font-black text-amber-300">{aiResult.rec}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={applyAiRecommendation} className="px-4 py-2 bg-white text-indigo-900 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                                                        Aplicar Recomendación
                                                    </button>
                                                    <button onClick={() => setAiResult(null)} className="px-4 py-2 bg-transparent border border-white/30 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                                                        Descartar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <p className="text-xs text-white/70 max-w-sm">
                                                    Consulta fuentes económicas en tiempo real para ajustar tu Markup y proteger tu rentabilidad.
                                                </p>
                                                <button onClick={handleCheckInflation} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                                                    <Search className="w-4 h-4" /> Consultar Ahora
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* SAFETY CONTROLS */}
                    <div className="space-y-8">
                        <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                            <h3 className="text-lg font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3 relative z-10">
                                <ShieldAlert className="w-6 h-6 text-red-500" />
                                Zona de Riesgo
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Pausar Retiros</p>
                                    <p className="text-[9px] text-slate-400 mt-1">Bloquea salidas de dinero.</p>
                                    </div>
                                    <Toggle 
                                    active={globalSettings.withdrawalsPaused} 
                                    onToggle={() => updateSetting('withdrawalsPaused', !globalSettings.withdrawalsPaused)} 
                                    color="bg-red-500" 
                                    />
                                </div>

                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Mantenimiento</p>
                                    <p className="text-[9px] text-slate-400 mt-1">Cierra el acceso a la app.</p>
                                    </div>
                                    <Toggle 
                                    active={globalSettings.maintenanceMode} 
                                    onToggle={() => updateSetting('maintenanceMode', !globalSettings.maintenanceMode)} 
                                    color="bg-amber-500" 
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB: COMMUNICATION */}
            {activeTab === 'COMMUNICATION' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-in">
                    
                    {/* Welcome Template */}
                    <Card className="p-8 rounded-[2.5rem] border-slate-200 shadow-xl bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center"><UserIcon className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 italic uppercase">Bienvenida</h3>
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Nuevo Socio</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                value={globalSettings.whatsappTemplates?.welcome || ''}
                                onChange={(e) => updateTemplate('welcome', e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-600 resize-none focus:border-green-500 font-medium leading-relaxed"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => insertVariable('name', 'welcome')} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-200 uppercase tracking-wider">{'{{name}}'}</button>
                                <button onClick={() => insertVariable('platform', 'welcome')} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-200 uppercase tracking-wider">{'{{platform}}'}</button>
                            </div>
                        </div>
                    </Card>

                    {/* Sale Template */}
                    <Card className="p-8 rounded-[2.5rem] border-slate-200 shadow-xl bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><Tag className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 italic uppercase">Venta Confirmada</h3>
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Notificación</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                value={globalSettings.whatsappTemplates?.sale || ''}
                                onChange={(e) => updateTemplate('sale', e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-600 resize-none focus:border-blue-500 font-medium leading-relaxed"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => insertVariable('name', 'sale')} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-200 uppercase tracking-wider">{'{{name}}'}</button>
                                <button onClick={() => insertVariable('amount', 'sale')} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-200 uppercase tracking-wider">{'{{amount}}'}</button>
                            </div>
                        </div>
                    </Card>

                    {/* Payout Template */}
                    <Card className="p-8 rounded-[2.5rem] border-slate-200 shadow-xl bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 italic uppercase">Liquidación</h3>
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Pago Enviado</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                value={globalSettings.whatsappTemplates?.payout || ''}
                                onChange={(e) => updateTemplate('payout', e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-600 resize-none focus:border-yellow-500 font-medium leading-relaxed"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => insertVariable('name', 'payout')} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-200 uppercase tracking-wider">{'{{name}}'}</button>
                                <button onClick={() => insertVariable('amount', 'payout')} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-200 uppercase tracking-wider">{'{{amount}}'}</button>
                            </div>
                        </div>
                    </Card>

                    {/* Info Box */}
                    <div className="p-8 rounded-[2.5rem] border border-dashed border-slate-300 flex items-center justify-center flex-col text-center">
                        <MessageCircle className="w-10 h-10 text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-500">Variables Dinámicas</p>
                        <p className="text-xs text-slate-400 mt-2 max-w-xs">
                            Usa las etiquetas <strong>{'{{...}}'}</strong> para que el sistema inserte automáticamente los datos del cliente o la transacción.
                        </p>
                    </div>
                </div>
            )}

            {/* TAB: INTEGRATIONS */}
            {activeTab === 'INTEGRATION' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-in">
                    {/* MERCADO PAGO */}
                    <Card className="p-8 rounded-[2.5rem] border-slate-200 shadow-xl bg-white">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center"><CreditCard className="w-6 h-6" /></div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 italic uppercase">Mercado Pago</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pasarela de Pagos</p>
                            </div>
                            <div className="ml-auto"><Toggle active={integrationConfig.mercadoPago.isActive} onToggle={() => updateIntegration('mercadoPago', 'isActive', !integrationConfig.mercadoPago.isActive)} /></div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Key</label>
                                <input type="text" value={integrationConfig.mercadoPago.publicKey} onChange={(e) => updateIntegration('mercadoPago', 'publicKey', e.target.value)} placeholder="TEST-..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono text-slate-600 focus:border-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Token</label>
                                <div className="flex items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500">
                                    <Key className="w-4 h-4 text-slate-400" />
                                    <input type="password" value={integrationConfig.mercadoPago.accessToken} onChange={(e) => updateIntegration('mercadoPago', 'accessToken', e.target.value)} placeholder="APP_USR-..." className="w-full bg-transparent outline-none text-xs font-mono text-slate-600" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* FIREBASE & CLOUDINARY */}
                    <div className="space-y-8">
                        <Card className="p-8 rounded-[2.5rem] border-slate-200 shadow-xl bg-white">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center"><Database className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 italic uppercase">Firebase Config</h3>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Base de Datos</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input type="text" value={integrationConfig.firebase.projectId} onChange={(e) => updateIntegration('firebase', 'projectId', e.target.value)} placeholder="Project ID" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono text-slate-600 focus:border-orange-500" />
                                <input type="password" value={integrationConfig.firebase.apiKey} onChange={(e) => updateIntegration('firebase', 'apiKey', e.target.value)} placeholder="API Key" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono text-slate-600 focus:border-orange-500" />
                            </div>
                        </Card>

                        <Card className="p-8 rounded-[2.5rem] border-slate-200 shadow-xl bg-white">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-indigo-500 text-white rounded-2xl flex items-center justify-center"><Cloud className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 italic uppercase">Cloudinary</h3>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Hosting de Imágenes</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input type="text" value={integrationConfig.cloudinary.cloudName} onChange={(e) => updateIntegration('cloudinary', 'cloudName', e.target.value)} placeholder="Cloud Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono text-slate-600 focus:border-indigo-500" />
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB: DATA (MIGRATION) */}
            {activeTab === 'DATA' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-in">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 italic uppercase mb-4">Importación Masiva</h3>
                        <p className="text-slate-500 text-sm mb-8">Utiliza esta herramienta para migrar datos desde sistemas Legacy (Pedix, Excel) hacia la nueva base de datos.</p>
                        <DataImportPanel onComplete={onImportCatalog} />
                    </div>
                    <div className="space-y-4">
                        <Card className="p-6 bg-slate-50 border-slate-200">
                             <h4 className="font-bold text-slate-900 uppercase italic mb-2">Instrucciones CSV</h4>
                             <ul className="list-disc list-inside text-xs text-slate-500 space-y-2">
                                <li>El archivo debe tener codificación UTF-8.</li>
                                <li>Las columnas obligatorias son: <strong>SKU, Nombre, Precio, Stock</strong>.</li>
                                <li>Las imágenes deben ser URLs públicas o se asignarán genéricas.</li>
                             </ul>
                             <Button variant="outline" className="mt-4 text-xs h-10 bg-white border-slate-300">Descargar Plantilla.csv</Button>
                        </Card>
                    </div>
                </div>
            )}
            
        </div>

        {/* FLOATING SAVE DOCK (ALWAYS VISIBLE) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none">
            <div className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl shadow-black/20 transform hover:scale-[1.02] transition-transform">
               <Button onClick={handleSave} className="w-full h-14 rounded-xl bg-slate-900 text-white shadow-lg hover:shadow-xl hover:bg-black font-black italic uppercase tracking-widest text-sm flex items-center justify-center gap-2" disabled={saving}>
                  {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
               </Button>
            </div>
        </div>

      </div>
    );
  }

  // Vista User (NO ADMIN)
  return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
          <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Acceso Restringido</h2>
          <p className="text-slate-500 max-w-md mt-2">No tienes permisos de administrador para acceder a esta configuración.</p>
      </div>
  );
};
