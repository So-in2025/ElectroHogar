
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_PRODUCTS } from '../../constants';
import { Button, Badge, ElectroLogo, Toast } from '../ui/UIComponents';
import { Product, IntegrationConfig } from '../../types';
import { 
  User, 
  ArrowRight, 
  CreditCard, 
  X, 
  ShoppingBag, 
  Check, 
  Loader2, 
  Plus,
  Smartphone,
  ShieldCheck,
  Zap,
  Star
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

const PaymentModal = ({ total, onClose, onSuccess, mode }: { total: number, onClose: () => void, onSuccess: () => void, mode: 'SIMULATION' | 'PRODUCTION' }) => {
    const [step, setStep] = useState<'DETAILS' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
    const handlePay = () => {
        setStep('PROCESSING');
        setTimeout(() => setStep('SUCCESS'), 2000);
    };

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
            <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-up border border-slate-100">
                {step === 'DETAILS' && (
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900 uppercase italic">Pago Seguro</h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                                <p className="text-2xl font-black text-slate-900 italic tracking-tighter">$ {total.toLocaleString()}</p>
                            </div>
                            <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <Button fullWidth onClick={handlePay} className="h-14 bg-slate-900 text-white shadow-xl hover:bg-black">Pagar Ahora</Button>
                    </div>
                )}
                {step === 'PROCESSING' && (
                    <div className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <h3 className="text-lg font-black text-slate-900 uppercase italic">Procesando...</h3>
                    </div>
                )}
                {step === 'SUCCESS' && (
                    <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"><Check className="w-10 h-10 text-white" /></div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic">¡Pago Exitoso!</h3>
                        <Button fullWidth onClick={onSuccess} className="bg-slate-900 text-white">Entendido</Button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export const LandingView: React.FC<LandingViewProps> = ({ onLoginClick, products, simulationMode = true, integrationConfig }) => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'info' | 'error' });

  // LÓGICA DE DATOS SEGURA:
  // Si estamos en SIMULACIÓN: Usamos productos cargados o fallback a MOCK.
  // Si estamos en PRODUCCIÓN: Usamos SOLAMENTE productos cargados de la DB.
  const displayProducts = simulationMode 
    ? (products && products.length > 0 ? products : MOCK_PRODUCTS)
    : (products || []);

  const filteredProducts = activeCategory === 'Todos' ? displayProducts : displayProducts.filter(p => p.category === activeCategory);
  const cartTotal = cart.reduce((acc, item) => acc + (item.priceList * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: Product) => {
      setCart(prev => {
          const existing = prev.find(item => item.id === product.id);
          if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
          return [...prev, { ...product, quantity: 1 }];
      });
      setIsCartOpen(true);
  };

  const handlePaymentSuccess = () => {
      setShowPaymentModal(false);
      setCart([]);
      setIsCartOpen(false);
      setToast({ show: true, message: '¡Pedido realizado con éxito!', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-gray-900 overflow-x-hidden animate-fade-in scroll-smooth">
      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      {showPaymentModal && (
        <PaymentModal total={cartTotal} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} mode={simulationMode ? 'SIMULATION' : 'PRODUCTION'} />
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

      {/* CART DRAWER */}
      {createPortal(
          <div className={`fixed inset-0 z-[200] ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-700 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
              <div className={`absolute top-0 right-0 h-[100dvh] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                  <div className="p-8 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="text-2xl font-black text-slate-900 italic uppercase">Mi Carrito</h3>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white rounded-full shadow-sm transition-all"><X className="w-6 h-6 text-gray-500" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      {cart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                              <ShoppingBag className="w-16 h-16" />
                              <p className="font-bold uppercase tracking-widest text-sm">Vacío</p>
                          </div>
                      ) : (
                          cart.map((item, idx) => (
                              <div key={item.id} className="flex gap-6 animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                                  <div className="w-20 h-20 rounded-2xl bg-slate-50 p-2 border border-slate-100 shrink-0">
                                    <img src={item.image} className="w-full h-full object-contain" alt="" />
                                  </div>
                                  <div className="flex-1">
                                      <h4 className="font-bold text-xs text-slate-900 uppercase leading-tight mb-1">{item.name}</h4>
                                      <p className="font-black text-sm text-slate-900">$ {item.priceList.toLocaleString()} x {item.quantity}</p>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
                  {cart.length > 0 && (
                      <div className="p-8 bg-white border-t border-gray-100 space-y-4">
                          <div className="flex justify-between items-end">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</p>
                              <p className="text-3xl font-black text-slate-900">$ {cartTotal.toLocaleString()}</p>
                          </div>
                          <button onClick={() => setShowPaymentModal(true)} className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Finalizar Compra</button>
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
             {['Todos', 'Televisores', 'Lavado', 'Audio'].map(cat => (
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
                  className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full hover:-translate-y-2 animate-fade-in-up"
                  style={{animationDelay: `${idx * 0.1}s`}}
               >
                  <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-8 overflow-hidden">
                     <img src={product.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="" />
                     {product.isPromo && <div className="absolute top-6 left-6 bg-electro-red text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">OFERTA</div>}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{product.category}</p>
                     <h3 className="font-bold text-slate-900 text-base mb-4 leading-tight line-clamp-2 min-h-[3em]">{product.name}</h3>
                     <div className="mt-auto space-y-6">
                         <p className="text-3xl font-black text-slate-900 italic tracking-tighter">$ {product.priceList.toLocaleString()}</p>
                         <Button fullWidth onClick={() => addToCart(product)} className="rounded-2xl py-4 bg-slate-900 hover:bg-black font-black text-[10px] tracking-widest">
                            AGREGAR AL CARRITO
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
