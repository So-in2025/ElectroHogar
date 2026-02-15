
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, View, Notification, AuditLog, GlobalSettingsState, IntegrationConfig, Product, TeamMember, Client } from './types';
import { AuthView } from './components/views/AuthView';
import { DashboardView } from './components/views/DashboardView';
import { CatalogView } from './components/views/CatalogView';
import { TeamView } from './components/views/TeamView';
import { SettingsView } from './components/views/SettingsView';
import { GamificationView } from './components/views/GamificationView';
import { LandingView } from './components/views/LandingView';
import { AnalyticsView } from './components/views/AnalyticsView'; 
import { ActivationView } from './components/views/ActivationView'; // NEW IMPORT
import { NotificationPanel, HelpModal, OnboardingModal, ProfileModal } from './components/ui/Overlays'; 
import { ElectroLogo, Toast } from './components/ui/UIComponents';
import { 
  Bell, LogOut, HelpCircle, Lock, LayoutDashboard, ShoppingBag, Users, Trophy, Settings, Loader2, Download, X, BarChart2
} from 'lucide-react';

// SERVICES
import { initializeServices, fetchProducts, fetchTeam, fetchClients, fetchAuditLogs, registerPayout, loginUser, saveProduct, createTeamMember, updateUserProfile, registerSale, createClient } from './services/omegaServices';
import { MOCK_NOTIFICATIONS } from './constants';

const DEFAULT_SETTINGS: GlobalSettingsState = {
    markupPercentage: 0,
    leaderCommission: 5,
    withdrawalsPaused: false,
    maintenanceMode: false,
    platformName: 'Electro Hogar Digital',
    supportPhone: '5491155550000',
    whatsappTemplates: {
        welcome: '¡Hola {{name}}! Bienvenido al equipo de {{platform}}. Tu cuenta ha sido activada y ya puedes acceder al catálogo.',
        sale: '¡Felicitaciones {{name}}! Confirmamos tu venta de ${{amount}}. Tu comisión ya está en proceso.',
        payout: 'Hola {{name}}, te informamos que tu liquidación de ${{amount}} ha sido transferida a tu cuenta.'
    },
    economicAI: {
        enabled: false,
        lastCheck: null,
        inflationData: null,
        autoApply: false,
        frequencyHours: 24
    }
};

const DEFAULT_INTEGRATION: IntegrationConfig = {
    mercadoPago: { publicKey: '', accessToken: '', isActive: false },
    firebase: { apiKey: '', projectId: '', isActive: false },
    cloudinary: { cloudName: '', uploadPreset: '' },
    logistics: {
        correoArgentino: {
            isActive: false,
            cuit: '',
            serviceId: '',
            apiPassword: '',
            testMode: true
        }
    }
};

// --- COMPONENTE PWA INSTALL BANNER ---
const PWAInstallBanner = ({ installPrompt, onClose }: { installPrompt: any, onClose: () => void }) => {
    if (!installPrompt) return null;

    const handleInstall = () => {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            onClose();
        });
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-fade-in-up">
            <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-electro-red rounded-xl flex items-center justify-center shadow-lg">
                        <ElectroLogo className="w-8 h-auto text-white filter brightness-0 invert" />
                    </div>
                    <div>
                        <h4 className="text-white font-black italic uppercase text-sm leading-none">Instalar Omega OS</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Acceso Rápido & Offline</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <button onClick={handleInstall} className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg">
                        Instalar
                    </button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
  const [appMode, setAppMode] = useState<'LANDING' | 'AUTH' | 'APP'>('LANDING');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  
  const mainContentRef = useRef<HTMLDivElement>(null);

  // PWA STATE
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const [simulationMode, setSimulationMode] = useState<boolean>(() => {
      const saved = localStorage.getItem('OMEGA_SIMULATION_MODE');
      return saved !== null ? JSON.parse(saved) : true;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [globalSettings, setGlobalSettings] = useState<GlobalSettingsState>(DEFAULT_SETTINGS);
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>(DEFAULT_INTEGRATION);

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'success' | 'info' | 'error' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // PWA LISTENER
  useEffect(() => {
      const handler = (e: any) => {
          e.preventDefault();
          setInstallPrompt(e);
          setShowInstallBanner(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem('OMEGA_SETTINGS');
    const savedIntegrations = localStorage.getItem('OMEGA_INTEGRATIONS');
    
    if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setGlobalSettings({ ...DEFAULT_SETTINGS, ...parsed });
    }
    
    if (savedIntegrations) {
        const config = JSON.parse(savedIntegrations);
        // Merge with default to ensure logistics object exists if old config loaded
        setIntegrationConfig({
            ...DEFAULT_INTEGRATION,
            ...config,
            logistics: { ...DEFAULT_INTEGRATION.logistics, ...config.logistics }
        });
        initializeServices(config);
    }
  }, []);

  useEffect(() => {
      localStorage.setItem('OMEGA_SIMULATION_MODE', JSON.stringify(simulationMode));
  }, [simulationMode]);

  useEffect(() => {
      if (mainContentRef.current) {
          mainContentRef.current.scrollTo(0, 0);
      }
  }, [currentView]);

  useEffect(() => {
    const loadData = async () => {
        if (appMode === 'APP') setIsLoading(true);
        try {
            const prodData = await fetchProducts(simulationMode);
            setProducts(prodData);
            if (appMode === 'APP') {
                const [teamData, clientData, logData] = await Promise.all([
                    fetchTeam(simulationMode),
                    fetchClients(simulationMode),
                    fetchAuditLogs(simulationMode)
                ]);
                setTeamMembers(teamData);
                setClients(clientData);
                setAuditLogs(logData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, [simulationMode, appMode]);

  const dashboardStats = useMemo(() => {
      const totalSales = teamMembers.reduce((acc, member) => acc + (member.salesThisMonth || 0), 0);
      const margin = globalSettings.markupPercentage > 0 ? globalSettings.markupPercentage / 100 : 0.20;
      const netIncome = totalSales * margin;
      const stockValue = products.reduce((acc, prod) => acc + (prod.priceList * prod.stock), 0);
      const pendingWithdrawals = teamMembers.filter(m => m.wallet > 0).length;
      const lowStockCount = products.filter(p => p.stock < 5).length;
      return { totalSales, netIncome, stockValue, pendingWithdrawals, lowStockCount, activeMembers: teamMembers.length };
  }, [teamMembers, products, globalSettings.markupPercentage]);

  const handleMockLogin = (user: User) => {
      setCurrentUser(user);
      setAppMode('APP');
      if (user.status !== 'PENDING') {
          setShowOnboarding(true);
      }
  };

  const handleSale = async (product: Product, price: number) => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
          const { commission, auditId } = await registerSale(currentUser.id, product, price, 5, simulationMode);
          setCurrentUser(prev => prev ? ({ ...prev, wallet: (prev.wallet || 0) + commission, points: (prev.points || 0) + Math.floor(price / 1000) }) : null);
          setTeamMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, salesThisMonth: (m.salesThisMonth || 0) + price, points: (m.points || 0) + Math.floor(price / 1000), wallet: (m.wallet || 0) + commission } : m));
          showToast(`¡Venta registrada! Ganaste $${commission.toLocaleString()}`, 'success');
      } catch (e) {
          showToast('Error al registrar venta', 'error');
      } finally {
          setIsLoading(false);
      }
  };

  const handleImportCatalog = async (importedProducts: Product[]) => {
      setIsLoading(true);
      try {
          // 1. Actualizar estado local inmediatamente (Feedback visual rápido)
          setProducts(prevProducts => {
              const newSkus = new Set(importedProducts.map(p => p.sku));
              const filteredPrev = prevProducts.filter(p => !newSkus.has(p.sku));
              return [...filteredPrev, ...importedProducts];
          });

          // 2. Persistencia (Firebase en Prod / Log en Sim)
          await Promise.all(importedProducts.map(p => saveProduct(p, simulationMode)));

          showToast(`¡Importación exitosa! ${importedProducts.length} productos añadidos.`, 'success');
      } catch (error) {
          console.error("Error importando catálogo:", error);
          showToast('Error al guardar los productos en la base de datos.', 'error');
      } finally {
          setIsLoading(false);
      }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    // @ts-ignore
    setToast({ show: true, message, type });
  };

  // CHECK PENDING STATUS
  if (appMode === 'APP' && currentUser?.status === 'PENDING') {
      return (
          <ActivationView 
              user={currentUser} 
              integrationConfig={integrationConfig} 
              simulationMode={simulationMode}
              onLogout={() => { setCurrentUser(null); setAppMode('LANDING'); }}
          />
      );
  }

  return (
      <>
        {/* PWA BANNER */}
        {showInstallBanner && <PWAInstallBanner installPrompt={installPrompt} onClose={() => setShowInstallBanner(false)} />}

        {appMode === 'LANDING' && (
            <LandingView 
                onLoginClick={() => setAppMode('AUTH')} 
                products={products} 
                simulationMode={simulationMode}
                integrationConfig={integrationConfig}
            />
        )}
        
        {appMode === 'AUTH' && <AuthView onLogin={handleMockLogin} onBack={() => setAppMode('LANDING')} />}

        {appMode === 'APP' && currentUser && (
            <div className="flex h-screen bg-[#F5F5F7] text-slate-900 font-sans overflow-hidden">
                {/* @ts-ignore */}
                <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

                <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-50">
                <div 
                    onClick={() => setAppMode('LANDING')}
                    className="h-20 flex items-center px-6 border-b border-slate-100 cursor-pointer group"
                >
                    <ElectroLogo className="h-10 w-auto group-hover:opacity-80 transition-opacity" />
                </div>
                <nav className="flex-1 p-4 space-y-1.5 mt-4">
                    {[
                        { id: 'DASHBOARD', label: 'Inicio', icon: LayoutDashboard, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                        { id: 'ANALYTICS', label: 'Inteligencia', icon: BarChart2, roles: ['ADMIN'] }, // NEW MODULE
                        { id: 'CATALOG', label: 'Inventario', icon: ShoppingBag, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                        { id: 'TEAM', label: 'Líderes & Red', icon: Users, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                        { id: 'GAMIFICATION', label: 'Premios', icon: Trophy, roles: ['LEADER', 'RESELLER'] },
                        { id: 'SETTINGS', label: 'Config', icon: Settings, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                    ].filter(item => item.roles.includes(currentUser.role)).map((item) => (
                    <button key={item.id} onClick={() => setCurrentView(item.id as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${currentView === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <item.icon className={`w-4 h-4 ${currentView === item.id ? 'text-electro-red' : ''}`} />
                        <span className="omega-header text-[9px] tracking-[0.15em]">{item.label}</span>
                    </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => setAppMode('LANDING')} className="w-full flex items-center gap-3 p-4 text-slate-400 hover:text-electro-red transition-all group">
                    <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="omega-header text-[8px] tracking-widest">Logout Omega</span>
                    </button>
                </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-6 z-30 shrink-0">
                    <div className="flex items-center gap-4">
                    <div className="lg:hidden cursor-pointer active:scale-95 transition-transform" onClick={() => setAppMode('LANDING')}>
                        <ElectroLogo className="h-8 w-auto" />
                    </div>
                    {currentUser.role === 'ADMIN' && (
                        <div className="bg-slate-100/50 p-1 rounded-xl flex shrink-0 border border-slate-100">
                        <button onClick={() => setSimulationMode(true)} className={`px-4 py-1.5 rounded-lg omega-header text-[7px] tracking-widest transition-all ${simulationMode ? 'bg-amber-400 text-amber-950 shadow-sm' : 'text-slate-400'}`}>Simulación</button>
                        <button onClick={() => setSimulationMode(false)} className={`px-4 py-1.5 rounded-lg omega-header text-[7px] tracking-widest transition-all ${!simulationMode ? 'bg-green-500 text-white shadow-sm' : 'text-slate-400'}`}>Producción</button>
                        </div>
                    )}
                    </div>
                    <div className="flex items-center gap-4">
                    <button onClick={() => setShowNotifications(true)} className="p-2 text-slate-400 hover:text-slate-950 rounded-xl relative"><Bell className="w-5 h-5" /><span className="absolute top-2 right-2 w-2 h-2 bg-electro-red rounded-full border-2 border-white"></span></button>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfile(true)}>
                        <div className="text-right hidden sm:block"><p className="font-black text-[10px] text-slate-900 leading-none italic uppercase">{currentUser.name}</p><p className="text-[7px] text-electro-red font-bold tracking-widest mt-1 uppercase">{currentUser.role}</p></div>
                        <img src={currentUser.avatar} className="w-9 h-9 rounded-xl border-2 border-slate-100 object-cover" alt="User" />
                    </div>
                    </div>
                </header>

                <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F8F9FA] pb-24 lg:pb-10 scroll-smooth">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400"><Loader2 className="w-10 h-10 animate-spin mb-4 text-electro-red" /><p className="omega-header text-[10px] tracking-widest">Sincronizando Omega Cloud...</p></div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            {currentView === 'DASHBOARD' && <DashboardView user={currentUser} simulationMode={simulationMode} onNavigate={setCurrentView} points={currentUser.points} wallet={currentUser.wallet} onWithdrawal={() => showToast('Retiro solicitado', 'info')} stats={dashboardStats} teamMembers={teamMembers} auditLogs={auditLogs} />}
                            {currentView === 'ANALYTICS' && <AnalyticsView simulationMode={simulationMode} />}
                            {currentView === 'CATALOG' && <CatalogView user={currentUser} simulationMode={simulationMode} globalMarkup={globalSettings.markupPercentage} integrationConfig={integrationConfig} products={products} onSaleConfirm={handleSale} onPublish={() => showToast('Producto Publicado', 'success')} />}
                            {currentView === 'TEAM' && <TeamView clients={clients} auditLogs={auditLogs} user={currentUser} teamMembers={teamMembers} integrationConfig={integrationConfig} onPayout={(id, name, amt) => showToast(`Pago a ${name} registrado`, 'success')} simulationMode={simulationMode} />}
                            {currentView === 'GAMIFICATION' && <GamificationView user={currentUser} onRedeem={() => {}} />}
                            {currentView === 'SETTINGS' && <SettingsView user={currentUser} globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} integrationConfig={integrationConfig} setIntegrationConfig={setIntegrationConfig} simulationMode={simulationMode} onSave={() => showToast('Configuración guardada', 'success')} onImportCatalog={handleImportCatalog} />}
                        </div>
                    )}
                </main>

                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-[60] flex justify-around items-center h-16 pb-safe">
                    {[
                        { id: 'DASHBOARD', label: 'Inicio', icon: LayoutDashboard, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                        { id: 'ANALYTICS', label: 'Intel.', icon: BarChart2, roles: ['ADMIN'] }, // Added for Mobile
                        { id: 'CATALOG', label: 'Inv.', icon: ShoppingBag, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                        { id: 'TEAM', label: 'Red', icon: Users, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                        { id: 'GAMIFICATION', label: 'Premios', icon: Trophy, roles: ['LEADER', 'RESELLER'] },
                        { id: 'SETTINGS', label: 'Cfg', icon: Settings, roles: ['ADMIN', 'LEADER', 'RESELLER'] },
                    ].filter(item => item.roles.includes(currentUser.role)).map((item) => (
                    <button key={item.id} onClick={() => setCurrentView(item.id as View)} className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 duration-200 ${currentView === item.id ? 'text-electro-red' : 'text-slate-400 hover:text-slate-600'}`}><item.icon className={`w-6 h-6 ${currentView === item.id ? 'fill-current' : ''}`} /></button>
                    ))}
                </nav>
                </div>

                <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} notifications={MOCK_NOTIFICATIONS} onMarkAllAsRead={() => {}} />
                <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
                {currentUser && <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} user={currentUser} />}
                {currentUser && (
                <ProfileModal 
                    isOpen={showProfile} 
                    onClose={() => setShowProfile(false)} 
                    user={currentUser} 
                    integrationConfig={integrationConfig}
                    onUpdate={(d) => setCurrentUser(prev => prev ? ({...prev, ...d}) : null)} 
                />
                )}
            </div>
        )}
      </>
  );
};
export default App;
