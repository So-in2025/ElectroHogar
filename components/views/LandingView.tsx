

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_PRODUCTS } from '../../constants';
import { Button, Badge, ElectroLogo, Toast } from '../ui/UIComponents';
import { calculateShippingRate, generateTrackingId, processPayment, createOrder } from '../../services/omegaServices';
import { Product, IntegrationConfig, Order } from '../../types';
import { 
  User, 
  ArrowRight, 
  CreditCard, 
  X, 
  ShoppingBag, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  Star,
  Plus,
  Minus,
  Truck,
  Box,
  ShieldCheck,
  Tag,
  MessageCircle,
  MapPin,
  Package,
  Wifi,
  Link as LinkIcon,
  Copy,
  Palette,
  DollarSign,
  Wand2
} from 'lucide-react';

interface LandingViewProps {
  onLoginClick: () => void;
  products?: Product[];
  simulationMode?: boolean;
  integrationConfig?: IntegrationConfig;
}

interface CartItem extends Product {
    quantity: number;
}

interface ShippingInfo {
    zipCode: string;
    address: string;
    city: string;
    province: string;
    name: string;
    phone: string;
    email: string;
}

// --- MODAL DE CHECKOUT & LOGISTICA ---
const CheckoutModal = ({ 
    total, 
    cart,
    onClose, 
    onSuccess, 
    config,
    isSimulation,
    resellerId
}: { 
    total: number, 
    cart: CartItem[],
    onClose: () => void, 
    onSuccess: () => void, 
    config?: IntegrationConfig,
    isSimulation: boolean,
    resellerId: string | null
}) => {
    const [step, setStep] = useState<'SHIPPING' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('SHIPPING');
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({ zipCode: '', address: '', city: '', province: '', name: '', phone: '', email: '' });
    const [shippingRate, setShippingRate] = useState<{ cost: number, time: string, provider: string } | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [trackingId, setTrackingId] = useState('');
    
    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MP'>('CARD');
    const [paymentStatus, setPaymentStatus] = useState<string>('Esperando');

    const handleCalculateShipping = async () => {
        if (shippingInfo.zipCode.length < 4) return;
        setIsCalculating(true);
        try {
            // Usa el servicio real/simulado
            const rate = await calculateShippingRate(shippingInfo.zipCode, total, config!);
            setShippingRate(rate);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCalculating(false);
        }
    };

    const handlePay = async () => {
        setStep('PROCESSING');
        setPaymentStatus('Conectando con Pasarela de Pago...');
        
        try {
            // Simulamos pasos de conexión para realismo
            await new Promise(r => setTimeout(r, 1000));
            setPaymentStatus('Verificando fondos...');
            
            const result = await processPayment(
                total + (shippingRate?.cost || 0), 
                paymentMethod === 'MP' ? 'ACCOUNT_MONEY' : 'CREDIT_CARD', 
                {}, 
                config!, 
                isSimulation
            );

            if (result.status === 'approved') {
                setPaymentStatus('Generando Orden...');
                await new Promise(r => setTimeout(r, 800));
                
                const newTracking = generateTrackingId(shippingRate?.provider || 'OMEGA');
                setTrackingId(newTracking);

                // --- CREAR ORDEN REAL (OMS) ---
                const order: Order = {
                    id: `ord-${Date.now()}`,
                    trackingId: newTracking,
                    date: new Date().toISOString(),
                    status: 'PENDING', // Empieza pendiente hasta envío
                    total: total + (shippingRate?.cost || 0),
                    customer: {
                        name: shippingInfo.name,
                        address: shippingInfo.address,
                        // Added city to customer object to match updated Order interface and fix DashboardView error
                        city: shippingInfo.city,
                        phone: shippingInfo.phone,
                        email: shippingInfo.email,
                        zipCode: shippingInfo.zipCode
                    },
                    items: cart.map(item => ({
                        productId: item.id,
                        productName: item.name,
                        quantity: item.quantity,
                        price: item.priceList,
                        image: item.image
                    })),
                    shippingProvider: shippingRate?.provider || 'Retiro',
                    resellerId: resellerId || undefined
                };

                await createOrder(order, isSimulation);
                // ------------------------------

                setStep('SUCCESS');
            } else {
                alert(`Error en el pago: ${result.message}`);
                setStep('PAYMENT');
            }
        } catch (e) {
            console.error(e);
            alert('Error procesando pago. Intente nuevamente.');
            setStep('PAYMENT');
        }
    };

    const grandTotal = total + (shippingRate?.cost || 0);

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-up border border-white/20 flex flex-col max-h-[90vh]">
                
                {/* Header Steps */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {['SHIPPING', 'PAYMENT', 'SUCCESS'].map((s, i) => (
                            <div key={s} className={`w-2 h-2 rounded-full transition-all ${
                                step === s || (step === 'PROCESSING' && s === 'PAYMENT') ? 'bg-electro-red w-6' : 'bg-slate-300'
                            }`} />
                        ))}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {step === 'SHIPPING' && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">Datos de Envío</h3>
                                <p className="text-xs text-slate-500 mt-2">Ingresa tu ubicación para calcular el costo logístico.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Postal</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={shippingInfo.zipCode} 
                                            onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})} 
                                            placeholder="Ej: 1414" 
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold text-slate-900 focus:border-slate-900" 
                                        />
                                        <button 
                                            onClick={handleCalculateShipping}
                                            disabled={isCalculating || shippingInfo.zipCode.length < 4}
                                            className="bg-slate-900 text-white rounded-xl px-4 disabled:opacity-50"
                                        >
                                            {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {shippingRate && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-scale-up">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase text-blue-800 tracking-widest flex items-center gap-2">
                                                <Truck className="w-3 h-3" /> {shippingRate.provider}
                                            </span>
                                            <span className="font-black text-blue-900">
                                                {shippingRate.cost === 0 ? 'GRATIS' : `$ ${shippingRate.cost.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-blue-600 font-medium">Tiempo estimado: {shippingRate.time}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección de Entrega</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.address} 
                                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} 
                                        placeholder="Calle y Número" 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinatario</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.name} 
                                        onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})} 
                                        placeholder="Nombre Completo" 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium text-slate-900" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                        <input type="tel" value={shippingInfo.phone} onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" placeholder="+54..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                        <input type="email" value={shippingInfo.email} onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" placeholder="@" />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                fullWidth 
                                onClick={() => setStep('PAYMENT')} 
                                disabled={!shippingRate || !shippingInfo.address || !shippingInfo.phone}
                                className="h-14 rounded-2xl bg-electro-red text-white shadow-lg shadow-red-200"
                            >
                                Continuar al Pago
                            </Button>
                        </div>
                    )}

                    {step === 'PAYMENT' && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">Pago Seguro</h3>
                                <p className="text-xs text-slate-500 mt-2">Selecciona tu método de pago.</p>
                            </div>

                            {/* TOTAL SUMMARY */}
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total a Pagar</p>
                                    <p className="text-2xl font-black text-slate-900 italic tracking-tighter">$ {grandTotal.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <ShieldCheck className="w-6 h-6 text-green-500" />
                                </div>
                            </div>

                            {/* PAYMENT METHOD SELECTOR */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CARD' ? 'border-electro-red bg-red-50 text-electro-red' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}
                                >
                                    <CreditCard className="w-6 h-6" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Tarjeta</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('MP')}
                                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'MP' ? 'border-[#009EE3] bg-[#009EE3]/10 text-[#009EE3]' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}
                                >
                                    <div className="font-black italic">MP</div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">Mercado Pago</span>
                                </button>
                            </div>

                            {/* DYNAMIC FORM */}
                            {paymentMethod === 'CARD' ? (
                                <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    
                                    <div className="flex justify-between items-center mb-8">
                                        <Wifi className="w-6 h-6 rotate-90 opacity-50" />
                                        <span className="text-sm font-black italic">VISA</span>
                                    </div>
                                    
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex gap-2">
                                            {[1,2,3,4].map(i => <div key={i} className="flex-1 h-2 bg-white/20 rounded-full"></div>)}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] uppercase tracking-widest opacity-50">Titular</p>
                                                <p className="text-sm font-bold uppercase">{shippingInfo.name || 'NOMBRE APELLIDO'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] uppercase tracking-widest opacity-50">Expira</p>
                                                <p className="text-sm font-bold">12/28</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#009EE3] rounded-2xl p-6 text-white text-center shadow-lg shadow-blue-200">
                                    <p className="font-bold text-sm">Se te redirigirá a Mercado Pago</p>
                                    <p className="text-[10px] opacity-80 mt-1">Ambiente seguro SSL</p>
                                </div>
                            )}

                            <Button fullWidth onClick={handlePay} className="h-16 bg-slate-900 text-white shadow-xl hover:bg-black text-xs font-black uppercase tracking-widest rounded-2xl">
                                Confirmar Pago
                            </Button>
                        </div>
                    )}

                    {step === 'PROCESSING' && (
                        <div className="flex flex-col items-center justify-center space-y-8 text-center py-10">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
                                <div className="w-24 h-24 border-4 border-t-electro-red border-r-electro-red border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                <ShieldCheck className="w-8 h-8 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="animate-pulse">
                                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Procesando</h3>
                                <p className="text-xs text-slate-400 mt-2 font-medium">{paymentStatus}</p>
                            </div>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="flex flex-col items-center justify-center space-y-8 text-center py-6 animate-scale-up">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                                <Check className="w-12 h-12 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">¡Orden Exitosa!</h3>
                                <p className="text-xs text-slate-500 mt-2 max-w-[250px] mx-auto leading-relaxed">
                                    Tu pago fue aprobado. Recibirás actualizaciones por email.
                                </p>
                            </div>
                            
                            <div className="bg-slate-900 text-white p-4 rounded-2xl w-full">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tu Código de Seguimiento</p>
                                <p className="text-xl font-mono font-black tracking-widest text-amber-400">{trackingId}</p>
                            </div>

                            <Button 
                                fullWidth 
                                variant="outline" 
                                onClick={onSuccess} 
                                className="h-14 rounded-2xl border-slate-200 text-slate-900 font-black uppercase tracking-widest hover:bg-slate-50"
                            >
                                Volver a la Tienda
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- PRODUCT DETAIL MODAL (ELITE) ---
const ProductDetailModal = ({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: (p: Product) => void }) => {
    const isLowStock = product.stock > 0 && product.stock < 5;
    const hasStock = product.stock > 0;

    // Renderizado seguro de Specs
    const specsEntries = product.specs ? Object.entries(product.specs) : [];

    return createPortal(
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-0 md:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-fade-in" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-5xl md:rounded-[3rem] shadow-2xl overflow-hidden animate-scale-up flex flex-col md:flex-row h-full md:h-auto min-h-[100dvh] md:min-h-[600px] max-h-[90vh]">
                <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-white/50 hover:bg-white rounded-full backdrop-blur-md transition-all shadow-sm">
                    <X className="w-6 h-6 text-slate-900" />
                </button>

                {/* Left: Image Showcase */}
                <div className="w-full md:w-1/2 bg-[#F8F9FA] relative flex items-center justify-center p-8 md:p-12 group">
                    <div className="absolute top-8 left-8 flex flex-col gap-2 z-20">
                        {product.isPromo && <Badge type="premium">OFERTA ESPECIAL</Badge>}
                        <span className="px-3 py-1 rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/50 backdrop-blur-sm">
                            {product.category}
                        </span>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-50" />
                    <div className="absolute bottom-10 right-10 text-[10rem] font-black text-slate-900 opacity-[0.03] leading-none select-none pointer-events-none">
                        OMEGA
                    </div>

                    <img 
                        src={product.image} 
                        className="w-full h-full max-h-[400px] object-contain drop-shadow-2xl mix-blend-multiply transition-transform duration-700 group-hover:scale-105 z-10" 
                        alt={product.name}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>

                {/* Right: Info & Actions */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-white overflow-y-auto">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4 text-slate-400">
                            <Tag className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">SKU: {product.sku}</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 italic uppercase leading-[0.95] tracking-tight mb-6">
                            {product.name}
                        </h2>

                        <div className="flex items-end gap-4 mb-8 border-b border-slate-100 pb-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Precio Final</p>
                                <p className="text-5xl font-black text-slate-900 tracking-tighter">$ {product.priceList.toLocaleString()}</p>
                            </div>
                            {product.isPromo && (
                                <div className="mb-2">
                                    <span className="text-lg font-bold text-slate-300 line-through decoration-electro-red">$ {(product.priceList * 1.2).toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Box className="w-4 h-4 text-electro-red" /> Descripción
                                </h4>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                    {product.description || "Un producto premium seleccionado para la colección Omega. Calidad garantizada y rendimiento superior para el hogar moderno."}
                                </p>
                            </div>

                            {specsEntries.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Star className="w-4 h-4 text-electro-red" /> Especificaciones
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {specsEntries.map(([key, value]) => (
                                            <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{key}</p>
                                                <p className="text-xs font-bold text-slate-800">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${hasStock ? (isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-green-500') : 'bg-red-500'}`}></div>
                                <span className={`text-xs font-bold uppercase tracking-wide ${hasStock ? (isLowStock ? 'text-amber-600' : 'text-green-600') : 'text-red-600'}`}>
                                    {hasStock ? (isLowStock ? `Últimas ${product.stock} unidades` : 'Stock Disponible') : 'Sin Stock'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Truck className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Envío a todo el país</span>
                            </div>
                        </div>

                        <Button 
                            fullWidth 
                            onClick={() => { onAddToCart(product); onClose(); }} 
                            disabled={!hasStock}
                            className={`h-16 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all ${!hasStock ? 'bg-slate-100 text-slate-400 shadow-none' : 'bg-slate-900 text-white hover:bg-electro-red hover:shadow-red-200'}`}
                        >
                            {hasStock ? 'Agregar al Carrito' : 'Agotado Temporalmente'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const LandingView: React.FC<LandingViewProps> = ({ onLoginClick, products, simulationMode = true, integrationConfig }) => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'info' | 'error' });
  const [resellerRef, setResellerRef] = useState<string | null>(null);

  // Lógica segura: Si es simulación y no hay productos, usa MOCK. Si hay productos importados, usa esos.
  const displayProducts = useMemo(() => {
     if (simulationMode) {
         return (products && products.length > 0) ? products : MOCK_PRODUCTS;
     }
     return products || [];
  }, [products, simulationMode]);

  // --- ATTRIBUTION & DEEP LINKING LOGIC ---
  useEffect(() => {
      // 1. Parse URL Params
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      const sku = params.get('sku');

      // 2. Handle Referral
      if (ref) {
          localStorage.setItem('OMEGA_REFERRAL', ref);
          setResellerRef(ref);
      } else {
          // Fallback to LocalStorage (Sticky Attribution)
          const savedRef = localStorage.getItem('OMEGA_REFERRAL');
          if (savedRef) setResellerRef(savedRef);
      }

      // 3. Handle Product Deep Link (Auto-Open)
      if (sku) {
          const foundProduct = displayProducts.find(p => p.sku.toLowerCase() === sku.toLowerCase());
          if (foundProduct) {
              setSelectedProduct(foundProduct);
              // Clean URL to avoid reopening on refresh if desired (optional)
              // window.history.replaceState({}, document.title, "/"); 
          }
      }
  }, [displayProducts]);

  // Generar categorías dinámicas
  const dynamicCategories = useMemo(() => {
      const cats = new Set(displayProducts.map(p => p.category));
      return ['Todos', ...Array.from(cats)];
  }, [displayProducts]);

  const filteredProducts = activeCategory === 'Todos' ? displayProducts : displayProducts.filter(p => p.category === activeCategory);
  
  // Cart Logic
  const cartTotal = cart.reduce((acc, item) => acc + (item.priceList * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingThreshold = 1500000;
  const shippingProgress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - cartTotal, 0);

  const addToCart = (product: Product) => {
      if (product.stock <= 0) {
          setToast({ show: true, message: 'Producto sin stock', type: 'error' });
          return;
      }
      setCart(prev => {
          const existing = prev.find(item => item.id === product.id);
          if (existing) {
              if (existing.quantity >= product.stock) {
                  setToast({ show: true, message: 'Max stock alcanzado', type: 'info' });
                  return prev;
              }
              setToast({ show: true, message: 'Cantidad actualizada', type: 'success' });
              return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
          }
          setToast({ show: true, message: 'Producto agregado', type: 'success' });
          return [...prev, { ...product, quantity: 1 }];
      });
      setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.id === productId) {
              const newQuantity = Math.max(0, item.quantity + delta);
              if (newQuantity > item.stock) {
                  setToast({ show: true, message: 'No hay más stock disponible', type: 'info' });
                  return item;
              }
              return { ...item, quantity: newQuantity };
          }
          return item;
      }).filter(item => item.quantity > 0));
  };

  const handlePaymentSuccess = () => {
      setShowCheckoutModal(false);
      setCart([]);
      setIsCartOpen(false);
      setToast({ show: true, message: '¡Pedido realizado con éxito!', type: 'success' });
  };

  const handleWhatsAppCheckout = () => {
      const itemsList = cart.map(item => `▪ ${item.quantity}x ${item.name}`).join('\n');
      const shippingCost = shippingProgress >= 100 ? 0 : 5000;
      const finalTotal = cartTotal + shippingCost;
      
      const msg = `*NUEVO PEDIDO WEB*\n\n${itemsList}\n\nSubtotal: $ ${cartTotal.toLocaleString()}\nEnvío: ${shippingProgress >= 100 ? 'GRATIS' : '$ 5,000'}\n*TOTAL: $ ${finalTotal.toLocaleString()}*\n\nHola, quiero confirmar stock y coordinar el pago.${resellerRef ? ` (Ref: ${resellerRef})` : ''}`;
      
      window.open(`https://wa.me/5491155550000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const renderProductImage = (src: string, isPromo: boolean) => {
      if (!src || src.trim() === '') {
          return (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sin Imagen</span>
                  {isPromo && <div className="absolute top-6 left-6 bg-electro-red text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">OFERTA</div>}
              </div>
          );
      }
      return (
          <>
            <img src={src} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" alt="" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('bg-slate-100'); }} />
            {isPromo && <div className="absolute top-6 left-6 bg-electro-red text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">OFERTA</div>}
          </>
      );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-x-hidden animate-fade-in scroll-smooth">
      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}

      {showCheckoutModal && (
        <CheckoutModal 
            total={cartTotal} 
            cart={cart}
            onClose={() => setShowCheckoutModal(false)} 
            onSuccess={handlePaymentSuccess} 
            config={integrationConfig}
            isSimulation={simulationMode}
            resellerId={resellerRef}
        />
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-gray-100 h-20 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full flex justify-between items-center">
            <div className="cursor-pointer hover:opacity-70 transition-all transform active:scale-95" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <ElectroLogo className="h-8 lg:h-9 w-auto" />
            </div>

            <div className="flex items-center gap-4">
               {!simulationMode && <Badge type="success">Modo Real</Badge>}
               <button 
                onClick={onLoginClick} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
               >
                 <User className="w-4 h-4" />
                 <span className="hidden sm:inline">Partners</span>
               </button>
               
               <button 
                onClick={() => setIsCartOpen(true)} 
                className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center relative shadow-lg hover:bg-black transition-all group"
               >
                    <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-electro-red rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white animate-scale-up">
                            {cartCount}
                        </span>
                    )}
               </button>
            </div>
        </div>
      </nav>

      {/* CART DRAWER (PREMIUM REDESIGN) */}
      {createPortal(
          <div className={`fixed inset-0 z-[200] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
              <div className={`absolute top-0 right-0 h-[100dvh] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                  
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 bg-white z-10 flex-shrink-0">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-black text-slate-900 italic uppercase">Tu Bolsa ({cartCount})</h3>
                          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                      </div>
                      
                      {/* Shipping Gamification */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Envío Gratis</span>
                              <span className="text-[10px] font-bold text-slate-900">{Math.round(shippingProgress)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                              <div className={`h-full transition-all duration-1000 rounded-full ${shippingProgress >= 100 ? 'bg-green-500' : 'bg-slate-900'}`} style={{width: `${shippingProgress}%`}}></div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                              {shippingProgress >= 100 
                                  ? <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> ¡Tienes envío gratis!</span> 
                                  : `Agrega $ ${(remainingForFreeShipping).toLocaleString()} más para envío gratis.`}
                          </p>
                      </div>
                  </div>

                  {/* Item List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FA]">
                      {cart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-4">
                              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-slate-400" /></div>
                              <p className="font-bold uppercase tracking-widest text-sm text-slate-500">Tu bolsa está vacía</p>
                              <Button variant="outline" onClick={() => setIsCartOpen(false)} className="mt-4">Explorar Catálogo</Button>
                          </div>
                      ) : (
                          cart.map((item) => (
                              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                                  <div className="w-20 h-20 rounded-xl bg-slate-50 p-2 border border-slate-100 shrink-0 flex items-center justify-center">
                                    {item.image ? <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt="" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between">
                                      <div>
                                          <h4 className="font-bold text-xs text-slate-900 uppercase leading-tight line-clamp-1">{item.name}</h4>
                                          <p className="font-black text-sm text-slate-900 mt-1">$ {item.priceList.toLocaleString()}</p>
                                      </div>
                                      <div className="flex items-center justify-between mt-2">
                                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                              <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-red-500 transition-colors"><Minus className="w-3 h-3" /></button>
                                              <span className="text-xs font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                                              <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-green-500 transition-colors"><Plus className="w-3 h-3" /></button>
                                          </div>
                                          <p className="text-[10px] font-bold text-slate-400">$ {(item.priceList * item.quantity).toLocaleString()}</p>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>

                  {/* Footer */}
                  {cart.length > 0 && (
                      <div className="p-6 bg-white border-t border-slate-100 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                          <div className="space-y-2">
                              <div className="flex justify-between text-xs text-slate-500">
                                  <span>Subtotal</span>
                                  <span className="font-bold text-slate-900">$ {cartTotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                                  <span className="text-sm font-black uppercase text-slate-900">Total (sin envío)</span>
                                  <span className="text-2xl font-black text-slate-900 italic tracking-tighter">
                                      $ {cartTotal.toLocaleString()}
                                  </span>
                              </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                              <button onClick={() => setShowCheckoutModal(true)} className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group">
                                  Iniciar Checkout <CreditCard className="w-4 h-4" />
                              </button>
                              <button onClick={handleWhatsAppCheckout} className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 group">
                                  Pedir por WhatsApp <MessageCircle className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>,
          document.body
      )}

      {/* HERO SECTION */}
      <div className="relative bg-[#F5F5F7] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-20 md:pt-40 md:pb-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="md:w-1/2 space-y-6">
              <div className="animate-fade-in-up stagger-1">
                <Badge type="premium">TEMPORADA 2026</Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] animate-fade-in-up stagger-2">
                Tecnología que <span className="text-electro-red">transforma</span> tu hogar.
              </h1>
              <p className="text-lg text-gray-500 max-w-lg leading-relaxed animate-fade-in-up stagger-3">
                Accede a los mejores precios del mercado con garantía oficial y envíos a todo el país.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up stagger-4">
                <Button onClick={() => document.getElementById('productos')?.scrollIntoView({behavior: 'smooth'})} className="px-10 py-5 text-base rounded-full shadow-2xl shadow-red-200 hover:-translate-y-1 transition-transform">
                  VER CATÁLOGO <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <button onClick={onLoginClick} className="px-10 py-5 rounded-full border-2 border-slate-200 text-slate-600 font-black uppercase text-xs tracking-widest hover:bg-white hover:border-white hover:shadow-xl transition-all">
                  QUIERO SER REVENDEDOR
                </button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative animate-scale-up stagger-2">
               <div className="relative z-10 bg-white p-4 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] animate-float">
                  <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80" className="rounded-[2.5rem] w-full object-cover h-[350px] md:h-[500px]" alt="" />
                  
                  <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-float stagger-3 border border-slate-50">
                      <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                          <Star className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                          <p className="text-xl font-black text-slate-900 leading-none">4.9/5</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Valoración Clientes</p>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <section id="productos" className="py-20 md:py-32 max-w-7xl mx-auto px-6 scroll-mt-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">Nuestros Productos</h2>
          <div className="flex flex-wrap justify-center gap-3">
             {dynamicCategories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {filteredProducts.length > 0 ? (
             filteredProducts.map((product, idx) => (
               <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full hover:-translate-y-2 animate-fade-in-up cursor-pointer"
                  style={{animationDelay: `${idx * 0.1}s`}}
               >
                  <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-8 overflow-hidden">
                     {renderProductImage(product.image, !!product.isPromo)}
                     <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">Ver Detalle</span>
                     </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{product.category}</p>
                     <h3 className="font-bold text-slate-900 text-base mb-4 leading-tight line-clamp-2 min-h-[3em]">{product.name}</h3>
                     <div className="mt-auto space-y-6">
                         <p className="text-3xl font-black text-slate-900 italic tracking-tighter">$ {product.priceList.toLocaleString()}</p>
                         <Button 
                            fullWidth 
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                            className="rounded-2xl py-4 bg-slate-900 hover:bg-black font-black text-[10px] tracking-widest"
                         >
                            AGREGAR
                         </Button>
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-20 text-center">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ShoppingBag className="w-8 h-8 text-slate-300" />
               </div>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">
                   {simulationMode ? 'No hay productos de prueba cargados.' : 'El catálogo de producción está vacío actualmente.'}
               </p>
             </div>
           )}
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 py-20">
         <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
            <ElectroLogo className="h-10 w-auto mx-auto opacity-30 grayscale" />
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em] pt-8">© 2026 Electro Hogar Digital. Logística Premium.</p>
         </div>
      </footer>
    </div>
  );
};
