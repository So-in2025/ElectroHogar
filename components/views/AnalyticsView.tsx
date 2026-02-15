
import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, 
  Package, Users, Activity, ArrowRight, Zap, Target, RefreshCw
} from 'lucide-react';
import { Card, StatCard, Badge, Button } from '../ui/UIComponents';
import { getAdvancedAnalytics } from '../../services/omegaServices';

// --- COMPONENTS FOR CHARTS ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-2xl z-50">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs font-bold text-slate-800" style={{ color: p.color }}>
            {p.name}: $ {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsView = ({ simulationMode }: { simulationMode: boolean }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
      setLoading(true);
      const result = await getAdvancedAnalytics(simulationMode);
      setData(result);
      setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [simulationMode]);

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
              <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded-full"></div>
              <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Analizando Big Data...</p>
          </div>
      );
  }

  if (!data) return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Activity className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase italic">Sin Datos Suficientes</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">No se pudo generar el reporte. Verifica la conexión a la base de datos o genera ventas en modo simulación.</p>
          <Button onClick={loadData} className="mt-6 bg-slate-900">Reintentar</Button>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
              <h2 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter leading-none">
                  Inteligencia de Negocio
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-electro-red" />
                  Análisis Financiero & Operativo {simulationMode ? '(Simulado)' : '(Producción)'}
              </p>
          </div>
          <div className="flex gap-2 items-center w-full md:w-auto">
              <button onClick={loadData} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
                  <RefreshCw className="w-5 h-5" />
              </button>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 flex-1 md:flex-none justify-between md:justify-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Proyección Mes Próximo:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-green-600">$ {data.projection.nextMonthRevenue.toLocaleString()}</span>
                    <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">+{data.projection.trend}%</span>
                  </div>
              </div>
          </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electro-red/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-slate-400">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Flujo Neto Real</span>
                  </div>
                  {/* Safely access the last element */}
                  <h3 className="text-4xl font-black italic tracking-tighter mb-1">$ {data.cashFlow.length > 0 ? data.cashFlow[data.cashFlow.length-1].profit.toLocaleString() : '0'}</h3>
                  <p className="text-xs font-medium text-slate-400">Ganancia limpia último mes</p>
              </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-slate-400">
                      <Package className="w-5 h-5 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Stock Inmovilizado</span>
                  </div>
                  <h3 className="text-4xl font-black italic tracking-tighter mb-1 text-slate-900">$ {data.stockHealth.slowMovingValue.toLocaleString()}</h3>
                  <p className="text-xs font-medium text-slate-400">Productos sin rotación (+90 días)</p>
              </div>
              <div className="absolute bottom-4 right-4">
                  <Button variant="outline" className="h-8 text-[9px] px-3">Liquidar</Button>
              </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4 text-slate-400">
                      <Users className="w-5 h-5 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Riesgo de Fuga</span>
                  </div>
                  <h3 className="text-4xl font-black italic tracking-tighter mb-1 text-slate-900">{data.churnRisk.length}</h3>
                  <p className="text-xs font-medium text-slate-400">Socios inactivos críticos</p>
              </div>
          </div>
      </div>

      {/* MAIN CHART: CASH FLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black text-slate-900 uppercase italic">Evolución Financiera</h3>
                  <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-900"></div><span className="text-[9px] font-bold uppercase text-slate-400">Ingresos</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[9px] font-bold uppercase text-slate-400">Ganancia</span></div>
                  </div>
              </div>
              {/* Increased height for mobile readability */}
              <div className="h-[300px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.cashFlow}>
                          <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                          <YAxis hide />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="revenue" name="Ingresos" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          <Area type="monotone" dataKey="profit" name="Ganancia Neta" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* STOCK COMPOSITION */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-black text-slate-900 uppercase italic mb-8">Composición de Stock</h3>
              <div className="flex-1 min-h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                              data={data.stockHealth.categories} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={60} 
                              outerRadius={80} 
                              paddingAngle={5}
                          >
                              {data.stockHealth.categories.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={['#0f172a', '#e11d48', '#f59e0b', '#3b82f6'][index % 4]} />
                              ))}
                          </Pie>
                          <Tooltip />
                      </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-slate-900">{data.stockHealth.categories.length}</span>
                      <span className="text-[8px] font-bold uppercase text-slate-400">Cats</span>
                  </div>
              </div>
              <div className="mt-4 space-y-3">
                  {data.stockHealth.categories.map((cat: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: ['#0f172a', '#e11d48', '#f59e0b', '#3b82f6'][i % 4] }}></div>
                              <span className="text-xs font-bold text-slate-600 uppercase">{cat.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-900">{cat.value}%</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* RISK RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                      <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="text-lg font-black text-red-900 uppercase italic">Radar de Riesgo (Churn)</h3>
                      <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest">Usuarios inactivos detectados</p>
                  </div>
              </div>
              <div className="space-y-3">
                  {data.churnRisk.length > 0 ? (
                      data.churnRisk.map((user: any) => (
                          <div key={user.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                      {user.name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="text-xs font-black text-slate-900 uppercase">{user.name}</p>
                                      <p className="text-[9px] text-slate-400 font-bold">Inactivo: {user.lastSale}</p>
                                  </div>
                              </div>
                              <Badge type="danger">{user.risk}</Badge>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-8 text-slate-400 italic text-xs">¡Excelente! Todo el equipo está activo.</div>
                  )}
              </div>
              {data.churnRisk.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-red-100">
                      <Button fullWidth className="bg-red-600 text-white hover:bg-red-700 h-12 text-[10px]">Iniciar Campaña de Reactivación</Button>
                  </div>
              )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                      <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase italic">Oportunidades</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Insights generados por IA</p>
                  </div>
              </div>
              <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                      <Target className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                      <div>
                          <p className="text-xs font-black text-slate-900 uppercase mb-1">Aumentar Stock TV 55"</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                              La demanda creció un 20% esta semana. Se proyecta quiebre de stock en 4 días si no se repone.
                          </p>
                      </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                      <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                      <div>
                          <p className="text-xs font-black text-slate-900 uppercase mb-1">Líder Estrella: Laura</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                              Superó su objetivo mensual en un 150%. Sugerencia: Otorgar bono de retención.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};
