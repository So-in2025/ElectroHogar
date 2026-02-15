import React, { useState } from 'react';
import { User, Coupon, Quest, Reward } from '../../types';
import { MOCK_REWARDS } from '../../constants';
import { Card, Button, Badge, Toast } from '../ui/UIComponents';
import { redeemReward } from '../../services/omegaServices';
import { Trophy, Star, Zap, Target, Lock, Gift, Check, Clock, Ticket, Copy, ArrowRight, Loader2 } from 'lucide-react';

interface GamificationProps {
  user: User;
  onRedeem: (cost: number, itemName: string) => void;
}

// --- MOCK QUESTS DATA ---
const MOCK_QUESTS: Quest[] = [
    { id: 'q1', title: 'Experto en Pantallas', description: 'Vende 3 Smart TVs esta semana.', rewardXP: 500, progress: 1, target: 3, type: 'SALES_COUNT', deadline: '2 días' },
    { id: 'q2', title: 'Bienvenida Digital', description: 'Completa tu perfil y añade CBU.', rewardXP: 200, progress: 1, target: 1, type: 'NEW_CLIENTS', deadline: 'Siempre' },
    { id: 'q3', title: 'Volumen Master', description: 'Factura $1M en un solo mes.', rewardXP: 1000, progress: 450000, target: 1000000, type: 'SALES_VOLUME', deadline: '20 días' }
];

// --- COMPONENT: COUPON TICKET ---
const CouponTicket: React.FC<{ coupon: Coupon }> = ({ coupon }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            {/* Cutout Circles Logic via CSS mask/gradient or simpler layout */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F8F9FA] rounded-full"></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F8F9FA] rounded-full"></div>
            
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 text-amber-600">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{coupon.rewardTitle}</p>
                        <h4 className="text-xl font-black text-slate-900 italic tracking-tighter">{coupon.value}</h4>
                        <p className="text-[9px] text-slate-400 mt-1">Expira: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex-1 md:flex-none p-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center">
                        <p className="font-mono text-sm font-bold text-slate-700 tracking-wider">{coupon.code}</p>
                    </div>
                    <button 
                        onClick={handleCopy}
                        className={`p-3 rounded-xl transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: QUEST CARD ---
const QuestCard: React.FC<{ quest: Quest }> = ({ quest }) => {
    const percent = Math.min((quest.progress / quest.target) * 100, 100);
    
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-6 group hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${percent >= 100 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {percent >= 100 ? <Check className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{quest.title}</h4>
                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest bg-slate-50 px-2 py-0.5 rounded">{quest.deadline}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{quest.description}</p>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 w-12 text-right">{quest.progress}/{quest.target}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center pl-6 border-l border-slate-100">
                <span className="text-xs font-black text-electro-red">+{quest.rewardXP}</span>
                <span className="text-[8px] font-bold uppercase text-slate-400">XP</span>
            </div>
        </div>
    );
};

export const GamificationView: React.FC<GamificationProps> = ({ user: initialUser, onRedeem }) => {
  const [localUser, setLocalUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState<'REWARDS' | 'QUESTS' | 'WALLET'>('REWARDS');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  const nextLevelPoints = 5000;
  const progressPercent = Math.min(((localUser.points || 0) / nextLevelPoints) * 100, 100);

  const handleRedeemClick = async (reward: Reward) => {
      if ((localUser.points || 0) < reward.cost) return;
      
      setProcessingId(reward.id);
      
      try {
          // Llamada al servicio simulada o real
          const result = await redeemReward(localUser, reward, true); // true = simulation mode for UI speed in demo
          
          // Update Local State for instant feedback
          setLocalUser(prev => ({ ...prev, points: result.remainingPoints }));
          setCoupons(prev => [result.coupon, ...prev]);
          setToast({ show: true, msg: `¡Canjeaste ${reward.title}!` });
          
          // Switch to wallet to show the prize
          setTimeout(() => {
              setProcessingId(null);
              setActiveTab('WALLET');
          }, 1000);

      } catch (e) {
          console.error(e);
          setProcessingId(null);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* HEADER LEVEL CARD */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-electro-red/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <div className="relative">
                 <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center border-4 border-slate-800 shadow-2xl z-10 relative">
                    <Trophy className="w-10 h-10 text-white drop-shadow-md" />
                 </div>
                 <div className="absolute -inset-2 bg-yellow-500/30 rounded-[2rem] blur-md -z-0 animate-pulse"></div>
             </div>
             <div>
               <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Nivel Actual</p>
               <h3 className="text-5xl font-black italic tracking-tighter leading-none">NIVEL {localUser.level}</h3>
               <p className="text-xl font-bold mt-1 text-slate-300">{localUser.points?.toLocaleString()} <span className="text-sm font-normal opacity-70">XP Totales</span></p>
             </div>
          </div>
          
          <div className="w-full md:w-96 bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
             <div className="flex justify-between text-xs font-bold text-slate-300 mb-3 uppercase tracking-widest">
                 <span>Progreso Nvl {Number(localUser.level) + 1}</span>
                 <span>{nextLevelPoints} XP</span>
             </div>
             <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-electro-red h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: `${progressPercent}%` }}></div>
             </div>
             <p className="text-[9px] text-center mt-3 text-slate-400 font-medium">Te faltan {nextLevelPoints - (localUser.points || 0)} XP para subir de nivel.</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex justify-center">
          <div className="inline-flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              {[
                  { id: 'REWARDS', label: 'Premios', icon: Gift },
                  { id: 'QUESTS', label: 'Misiones', icon: Target },
                  { id: 'WALLET', label: 'Mi Billetera', icon: Ticket }
              ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.id === 'WALLET' && coupons.length > 0 && (
                          <span className="bg-electro-red text-white text-[8px] px-1.5 py-0.5 rounded ml-1">{coupons.length}</span>
                      )}
                  </button>
              ))}
          </div>
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[400px]">
          {/* --- REWARDS TAB --- */}
          {activeTab === 'REWARDS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                  {MOCK_REWARDS.map(reward => {
                      const canAfford = (localUser.points || 0) >= reward.cost;
                      const isProcessing = processingId === reward.id;
                      
                      return (
                        <div key={reward.id} className={`bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 ${canAfford ? 'hover:shadow-xl hover:-translate-y-1' : 'opacity-60 grayscale'}`}>
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                <img src={reward.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={reward.title} />
                                <div className="absolute top-4 left-4 z-20">
                                    <Badge type={reward.type === 'CASH' ? 'success' : 'premium'}>{reward.type === 'CASH' ? 'EFECTIVO' : 'DIGITAL'}</Badge>
                                </div>
                                <div className="absolute bottom-4 left-4 z-20 text-white">
                                    <p className="font-black text-2xl italic tracking-tighter shadow-black drop-shadow-md">{reward.cost.toLocaleString()} <span className="text-xs font-normal">XP</span></p>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg uppercase leading-none">{reward.title}</h4>
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">Canjea tus puntos por este beneficio exclusivo.</p>
                                </div>
                                <button 
                                    onClick={() => handleRedeemClick(reward)}
                                    disabled={!canAfford || isProcessing}
                                    className={`mt-6 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                        canAfford 
                                            ? 'bg-slate-900 text-white hover:bg-electro-red shadow-lg hover:shadow-red-200' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    {isProcessing ? 'Procesando...' : canAfford ? 'Canjear Ahora' : 'Puntos Insuficientes'}
                                </button>
                            </div>
                        </div>
                      );
                  })}
              </div>
          )}

          {/* --- QUESTS TAB --- */}
          {activeTab === 'QUESTS' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
                  <div className="lg:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white flex items-center justify-between shadow-lg mb-4">
                      <div>
                          <h4 className="font-black italic uppercase text-xl">Misiones Semanales</h4>
                          <p className="text-xs opacity-80 mt-1">Completa tareas para ganar XP extra y subir de nivel más rápido.</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                          <Star className="w-6 h-6 text-white" />
                      </div>
                  </div>
                  {MOCK_QUESTS.map(quest => <QuestCard key={quest.id} quest={quest} />)}
              </div>
          )}

          {/* --- WALLET TAB --- */}
          {activeTab === 'WALLET' && (
              <div className="animate-slide-in space-y-6">
                  {coupons.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                          {coupons.map(coupon => <CouponTicket key={coupon.id} coupon={coupon} />)}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border border-slate-200 border-dashed">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                              <Ticket className="w-10 h-10 text-slate-300" />
                          </div>
                          <h3 className="text-lg font-black text-slate-900 uppercase">Tu billetera está vacía</h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Canjea tus puntos por premios para ver tus cupones digitales aquí.</p>
                          <Button variant="outline" className="mt-6" onClick={() => setActiveTab('REWARDS')}>Ir a Premios</Button>
                      </div>
                  )}
              </div>
          )}
      </div>

      <Toast isVisible={toast.show} message={toast.msg} onClose={() => setToast({...toast, show: false})} type="success" />
    </div>
  );
};