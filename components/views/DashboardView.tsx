
import React, { useMemo } from 'react';
import { User, View, TeamMember, AuditLog } from '../../types';
import { StatCard, Card, Badge } from '../ui/UIComponents';
import { SALES_TRENDS } from '../../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, ShoppingBag, TrendingUp, Trophy, Wallet, Users, 
  ShieldAlert, Activity, Globe, Medal, Clock, CheckCircle, 
  UserCheck, ArrowRight, Zap, Copy, Share2, UserPlus, Gift,
  ChevronRight, Star
} from 'lucide-react';

interface DashboardProps {
  user: User;
  simulationMode: boolean;
  onNavigate: (view: View) => void;
  points: number;
  wallet: number;
  onWithdrawal: (amount: number) => void;
  teamMembers?: TeamMember[];
  auditLogs?: AuditLog[];
  stats?: {
      totalSales: number;
      netIncome: number;
      stockValue: number;
      pendingWithdrawals: number;
      lowStockCount: number;
      activeMembers: number;
  };
}

// --- ADMIN DASHBOARD (UNCHANGED BUT KEPT FOR CONSISTENCY) ---
const AdminDashboard = ({ simulationMode, onNavigate, stats, teamMembers = [], auditLogs = [] }: { simulationMode: boolean, onNavigate: any, stats: any, teamMembers?: TeamMember[], auditLogs?: AuditLog[] }) => {
  const chartDataKey = simulationMode ? 'simulation' : 'production';
  const chartColor = simulationMode ? '#fbbf24' : '#22c55e'; 

  const topSellers = [...teamMembers]
    .sort((a, b) => (b.salesThisMonth || 0) - (a.salesThisMonth || 0))
    .slice(0, 3);

  const recentActivity = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0"><ShieldAlert className="w-5 h-5" /></div>
          <div className="flex-1"><p className="omega-label text-[8px] leading-none">Acción Crítica</p><p className="font-bold text-sm text-red-950 mt-1">{stats?.pendingWithdrawals || 0} Retiros Pendientes</p></div>
          <button className="text-[9px] font-black italic uppercase text-red-600 hover:underline" onClick={() => onNavigate('TEAM')}>Ver</button>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><ShoppingBag className="w-5 h-5" /></div>
          <div className="flex-1"><p className="omega-label text-[8px] leading-none">Inventario</p><p className="font-bold text-sm text-amber-950 mt-1">{stats?.lowStockCount || 0} Faltantes</p></div>
          <button className="text-[9px] font-black italic uppercase text-amber-600 hover:underline" onClick={() => onNavigate('CATALOG')}>Reponer</button>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center shrink-0 border border-slate-100"><Users className="w-5 h-5" /></div>
          <div className="flex-1"><p className="omega-label text-[8px] leading-none">Miembros Activos</p><p className="font-bold text-sm text-slate-900 mt-1">{stats?.activeMembers || 0} Socios</p></div>
          <button className="text-[9px] font-black italic uppercase text-slate-900 hover:underline" onClick={() => onNavigate('TEAM')}>Revisar</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Ventas Globales" value={`$ ${(stats?.totalSales || 0).toLocaleString()}`} subtext="Mes actual" trend={12} icon={Globe} />
          <StatCard title="Ganancia Neta" value={`$ ${(stats?.netIncome || 0).toLocaleString()}`} subtext="Estimado" trend={5} icon={DollarSign} />
          <StatCard title="Valor Stock" value={`$ ${(stats?.stockValue || 0).toLocaleString()}`} subtext="Total" trend={-2} icon={ShoppingBag} />
          <StatCard title="Estado Web" value="99%" subtext="Uptime" trend={0.1} icon={Activity} />
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-slate-200 bg-white rounded-2xl">
        <div className="p-6 flex justify-between items-center border-b border-slate-50 bg-slate-50/50">
          <div><h3 className="omega-header text-lg text-slate-900 leading-none">Volumen de Ventas</h3><p className="omega-label text-[7px] mt-1">{simulationMode ? 'Datos Simulados' : 'Datos en Tiempo Real'}</p></div>
          <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full animate-pulse ${simulationMode ? 'bg-amber-400' : 'bg-green-500'}`}></span><span className={`text-[9px] font-black uppercase tracking-widest ${simulationMode ? 'text-amber-500' : 'text-green-600'}`}>{simulationMode ? 'Simulación' : 'Live'}</span></div>
        </div>
        <div className="p-6 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SALES_TRENDS}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis hide />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px'}} />
              <Area type="monotone" dataKey={chartDataKey} stroke={chartColor} strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-[2rem] border-slate-200 shadow-sm flex flex-col bg-white">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600"><Trophy className="w-5 h-5" /></div>
                      <div><h3 className="omega-header text-sm text-slate-900 leading-none">Ranking de Ventas</h3><p className="omega-label text-[7px] mt-1">Mejores vendedores del mes</p></div>
                  </div>
              </div>
              <div className="space-y-4 flex-1">
                  {topSellers.map((seller, index) => {
                      const maxSales = topSellers[0]?.salesThisMonth || 1;
                      const percent = (seller.salesThisMonth / maxSales) * 100;
                      return (
                          <div key={seller.id} className="flex items-center gap-4">
                              <div className="font-black text-slate-300 w-4 text-center text-xs italic">#{index + 1}</div>
                              <img src={seller.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" />
                              <div className="flex-1">
                                  <div className="flex justify-between items-end mb-1"><span className="text-xs font-bold text-slate-900 uppercase">{seller.name}</span><span className="text-xs font-black text-slate-900">$ {seller.salesThisMonth.toLocaleString()}</span></div>
                                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden"><div className={`h-full rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }}></div></div>
                              </div>
                              {index === 0 && <Medal className="w-5 h-5 text-yellow-400 shrink-0" />}
                          </div>
                      );
                  })}
                  {topSellers.length === 0 && <div className="text-center py-8 text-slate-400 text-xs italic">No hay datos de ventas aún.</div>}
              </div>
          </Card>

          <Card className="p-6 rounded-[2rem] border-slate-200 shadow-sm flex flex-col bg-white">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Activity className="w-5 h-5" /></div>
                      <div><h3 className="omega-header text-sm text-slate-900 leading-none">Actividad Reciente</h3><p className="omega-label text-[7px] mt-1">Bitácora del sistema</p></div>
                  </div>
              </div>
              <div className="space-y-0 flex-1 relative">
                  <div className="absolute left-[19px] top-2 bottom-4 w-px bg-slate-100"></div>
                  {recentActivity.map((log) => (
                      <div key={log.id} className="relative pl-10 py-3 group">
                          <div className={`absolute left-3 top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${log.action.includes('PAYOUT') ? 'bg-green-500' : log.action.includes('SALE') ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-2">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} <span className="text-slate-300">•</span> {log.userId}</p>
                              <p className="text-xs font-bold text-slate-800 leading-snug">{log.details}</p>
                          </div>
                      </div>
                  ))}
                  {recentActivity.length === 0 && <div className="text-center py-8 text-slate-400 text-xs italic">Sin actividad reciente.</div>}
              </div>
          </Card>
      </div>
    </div>
  );
};

// --- PARTNER DASHBOARD (LEADER & RESELLER) ---
const PartnerDashboard = ({ points, wallet, onWithdrawal, onNavigate, simulationMode, user, teamMembers = [] }: any) => {
  const isLeader = user.role === 'LEADER';
  
  // Calculate specific metrics
  const myTeam = teamMembers.filter((m: TeamMember) => m.leaderId === user.id);
  const teamSales = myTeam.reduce((acc: number, m: TeamMember) => acc + (m.salesThisMonth || 0), 0);
  const teamActive = myTeam.filter((m: TeamMember) => m.status === 'ACTIVE').length;
  
  // Next Level Logic (Mock)
  const nextLevel = (Math.floor(points / 1000) + 1) * 1000;
  const progress = (points % 1000) / 10; // % within current level

  // Mock Transactions for Feed
  const transactions = [
      { id: 1, type: 'COMISSION', amount: 15000, detail: 'Venta #8291 - Smart TV', time: 'Hace 2h' },
      { id: 2, type: 'BONUS', amount: 5000, detail: 'Bono Semanal Alcanzado', time: 'Ayer' },
      ...(isLeader ? [{ id: 3, type: 'OVERRIDE', amount: 2500, detail: 'Comisión de Red (Juan P.)', time: 'Ayer' }] : [])
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. HERO WALLET SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden transition-all duration-500 group ${simulationMode ? 'bg-slate-800' : 'bg-slate-950'}`}>
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
               <div className="flex justify-between items-start">
                   <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className={`w-4 h-4 ${simulationMode ? 'text-amber-400' : 'text-electro-red'}`} />
                            <span className="omega-label text-[8px] text-slate-400 italic tracking-[0.2em]">Saldo Disponible</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">$ {wallet.toLocaleString()}</h2>
                   </div>
                   {simulationMode && <Badge type="warning">MODO DEMO</Badge>}
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4 mt-8">
                   <button 
                        onClick={() => !simulationMode && onWithdrawal(wallet)} 
                        disabled={wallet <= 0 || simulationMode}
                        className="h-12 px-8 rounded-xl bg-white text-slate-950 font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                   >
                        <DollarSign className="w-4 h-4" /> Solicitar Retiro
                   </button>
                   <div className="h-12 px-6 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            {isLeader ? `Override Equipo: $ ${(teamSales * 0.05).toLocaleString()}` : `Ventas Mes: $ ${(user.salesThisMonth || 0).toLocaleString()}`}
                        </p>
                   </div>
               </div>
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-electro-red/10 to-transparent pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-electro-red/20 rounded-full blur-3xl pointer-events-none group-hover:bg-electro-red/30 transition-colors" />
          </div>

          {/* LEVEL & PROGRESS CARD */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 shadow-inner">
                          <Star className="w-6 h-6 fill-current" />
                      </div>
                      <span className="text-4xl font-black text-slate-900 italic">{points} <span className="text-sm text-slate-400 not-italic font-bold">XP</span></span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic leading-none">Nivel {Math.floor(points/1000) + 1}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Próximo objetivo: {nextLevel} XP</p>
              </div>
              
              <div className="relative z-10 mt-6">
                  <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-2">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>
              
              {/* Confetti Deco */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy className="w-32 h-32 text-yellow-500 rotate-12" />
              </div>
          </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => onNavigate('CATALOG')} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 group h-32">
              <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-slate-900 transition-colors flex items-center justify-center text-slate-900 group-hover:text-white">
                  <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Catálogo</span>
          </button>

          {isLeader ? (
              <button onClick={() => onNavigate('TEAM')} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 group h-32">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-blue-600 transition-colors flex items-center justify-center text-slate-900 group-hover:text-white">
                      <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Nuevo Socio</span>
              </button>
          ) : (
              <button onClick={() => {/* Copy Link Logic Triggered Here in Real App */}} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 group h-32">
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-green-500 transition-colors flex items-center justify-center text-slate-900 group-hover:text-white">
                      <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Link Referido</span>
              </button>
          )}

          <button onClick={() => onNavigate('GAMIFICATION')} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 group h-32">
              <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-amber-500 transition-colors flex items-center justify-center text-slate-900 group-hover:text-white">
                  <Gift className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Premios</span>
          </button>

          <button onClick={() => {/* Open Help */}} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2 group h-32">
              <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-red-500 transition-colors flex items-center justify-center text-slate-900 group-hover:text-white">
                  <Zap className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Soporte</span>
          </button>
      </div>

      {/* 3. METRICS & FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* A. PERFORMANCE METRICS (Role Based) */}
          <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase italic flex items-center gap-2">
                  <Activity className="w-5 h-5 text-electro-red" />
                  {isLeader ? 'Rendimiento de Red' : 'Mis Métricas'}
              </h3>
              
              {isLeader ? (
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Ventas Red</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">$ {teamSales.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Socios Activos</p>
                          <p className="text-2xl font-black text-blue-600 tracking-tighter">{teamActive} / {myTeam.length}</p>
                      </div>
                      <div className="col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-lg flex items-center justify-between">
                          <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Comisión Global</p>
                              <p className="text-3xl font-black italic tracking-tighter text-amber-400">5%</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-white/20" />
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Ventas Mes</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">$ {(user.salesThisMonth || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Clientes</p>
                          <p className="text-2xl font-black text-green-600 tracking-tighter">12</p>
                      </div>
                      <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conversión</p>
                              <Badge type="success">ALTA</Badge>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full w-[75%]"></div>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-2 font-medium">Estás convirtiendo el 75% de tus leads.</p>
                      </div>
                  </div>
              )}
          </div>

          {/* B. TRANSACTION FEED */}
          <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase italic flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  Movimientos
              </h3>
              <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
                  {transactions.map((tx, i) => (
                      <div key={tx.id} className={`flex items-center justify-between p-4 rounded-2xl transition-colors hover:bg-slate-50 ${i !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}>
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${tx.type === 'COMISSION' ? 'bg-green-100 text-green-600' : tx.type === 'BONUS' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                                  <DollarSign className="w-4 h-4" />
                              </div>
                              <div>
                                  <p className="text-xs font-black text-slate-900 uppercase">{tx.detail}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.time}</p>
                              </div>
                          </div>
                          <span className="text-sm font-black text-slate-900">+$ {tx.amount.toLocaleString()}</span>
                      </div>
                  ))}
                  <button className="w-full p-4 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
                      Ver Historial Completo <ChevronRight className="w-3 h-3" />
                  </button>
              </div>
          </div>

      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardProps> = ({ user, simulationMode, onNavigate, points, wallet, onWithdrawal, stats, teamMembers, auditLogs }) => {
  return (
    <div className="w-full">
       <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="omega-header text-3xl md:text-4xl text-slate-900 leading-none">
                {user.role === 'ADMIN' ? 'Panel de Control' : `Hola, ${user.name.split(' ')[0]}`}
            </h1>
            <p className="omega-label text-[9px] mt-2 flex items-center gap-2">
                <Activity className="w-3 h-3 text-electro-red" /> 
                {user.role === 'ADMIN' ? 'Vista Global del Sistema' : `Tu Oficina Virtual • ${user.role === 'LEADER' ? 'Líder de Equipo' : 'Socio Comercial'}`}
            </p>
          </div>
          {!user.role.includes('ADMIN') && (
              <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${simulationMode ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {simulationMode ? 'Modo Simulación' : 'Conectado'}
                  </span>
              </div>
          )}
       </div>

       {user.role === 'ADMIN' ? 
          <AdminDashboard simulationMode={simulationMode} onNavigate={onNavigate} stats={stats} teamMembers={teamMembers} auditLogs={auditLogs} /> 
          : 
          <PartnerDashboard points={points} wallet={wallet} onWithdrawal={onWithdrawal} onNavigate={onNavigate} simulationMode={simulationMode} user={user} teamMembers={teamMembers} />
       }
    </div>
  );
};
