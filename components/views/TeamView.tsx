
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AuditLog, User, TeamMember, IntegrationConfig, Role, Client } from '../../types';
import { Card, Badge, Button, ElectroLogo } from '../ui/UIComponents';
import { 
  Search, Shield, Clock, FileText, Activity, Users, 
  TrendingUp, DollarSign, ChevronRight, Award,
  Users2, UserPlus, MessageCircle, Ban, Percent, Link, 
  UploadCloud, Loader2, Send, X, ChevronDown, UserCheck, 
  LayoutGrid, Network, Wallet, Mail, Phone, CreditCard,
  Briefcase, Check, ShoppingBag, MapPin, ArrowRightLeft,
  AlertTriangle, Download, Smartphone, CheckCircle, Sliders, History, Gift, BarChart2,
  Trophy, Star, Zap, Eye, UserX
} from 'lucide-react';
import { approveReseller } from '../../services/omegaServices';

interface TeamViewProps {
  auditLogs: AuditLog[];
  clients: Client[];
  user: User;
  teamMembers: TeamMember[];
  integrationConfig: IntegrationConfig;
  simulationMode: boolean;
  onPayout?: (targetUserId: string, targetName: string, amount: number, proofUrl: string) => void;
  onAddMember?: (newMember: TeamMember) => void;
  onAddClient?: (newClient: Client) => void;
}

// --- HELPER: OPEN WHATSAPP ---
const openWhatsApp = (phone: string | undefined, message: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// --- HELPER: FORMAT CURRENCY SHORT ---
const formatCurrencyShort = (val: number) => {
    if (val >= 1000000) return `$ ${(val/1000000).toFixed(1)}M`;
    if (val >= 1000) return `$ ${(val/1000).toFixed(1)}k`;
    return `$ ${val.toLocaleString()}`;
};

// --- APPROVAL MODAL ---
const ApprovalModal = ({ member, onClose, onApprove, onReject }: { member: TeamMember, onClose: () => void, onApprove: () => void, onReject: () => void }) => {
    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
                <div className="bg-amber-50 p-6 border-b border-amber-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black italic text-amber-900 uppercase">Solicitud de Activación</h3>
                        <p className="text-xs text-amber-700 mt-1">Revisar prueba de estado</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-full"><X className="w-5 h-5 text-amber-800" /></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={member.avatar} className="w-16 h-16 rounded-2xl bg-slate-200 object-cover" alt="" />
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg uppercase">{member.name}</h4>
                            <p className="text-xs text-slate-500">{member.email}</p>
                            <p className="text-xs text-slate-500">{member.phone}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl overflow-hidden relative group">
                        {member.activationProofUrl ? (
                            <img src={member.activationProofUrl} className="w-full h-64 object-contain" alt="Proof" />
                        ) : (
                            <div className="h-48 flex items-center justify-center text-slate-500 text-xs">Sin imagen adjunta</div>
                        )}
                        <a href={member.activationProofUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-white transition-colors">
                            Ver Full Size
                        </a>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest flex items-center gap-2">
                            <MessageCircle className="w-3 h-3" /> Acción Automática
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Al aprobar, se abrirá WhatsApp para notificar a {member.name.split(' ')[0]}.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" fullWidth onClick={onReject} className="border-red-200 text-red-600 hover:bg-red-50">Rechazar</Button>
                        <Button fullWidth onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white shadow-green-200">Aprobar e Informar</Button>
                    </div>
                </div>
            </div>
        </div>, document.body
    );
};

// ... (Existing Components: MockReceiptModal, MemberDetailModal, KpiCard, GridMemberCard, LeaderContactCard, ClientsTable, TreeNode, AuditTable - KEEP ALL THE SAME)
// --- MOCK RECEIPT MODAL (AUDIT FIX) ---
const MockReceiptModal = ({ log, onClose }: { log: AuditLog, onClose: () => void }) => {
    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative bg-white w-full max-w-sm rounded-none shadow-2xl overflow-hidden animate-scale-up border-t-8 border-electro-red">
                <div className="p-6 bg-slate-50 border-b border-dashed border-slate-300 text-center relative">
                    <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-4 h-4" /></button>
                    <ElectroLogo className="h-6 w-auto mx-auto mb-2 opacity-50 grayscale" />
                    <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Comprobante de Operación</h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <div className="p-6 space-y-4 bg-white relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <ElectroLogo className="w-64 h-64" />
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Operación ID</span>
                        <span className="text-xs font-mono font-bold text-slate-900">{log.id.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tipo</span>
                        <span className="text-xs font-black text-slate-900 uppercase">{log.action.replace('_', ' ')}</span>
                    </div>
                    <div className="py-4 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Detalle</p>
                        <p className="text-sm font-medium text-slate-800 italic leading-relaxed px-4">{log.details}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Estado</p>
                        <p className="text-green-600 font-black uppercase text-xs flex items-center justify-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3" /> Aprobado
                        </p>
                    </div>
                </div>
                <div className="bg-slate-100 p-3 text-center border-t border-slate-200">
                    <p className="text-[8px] text-slate-400 uppercase font-bold">Documento Digital Valido - Omega System</p>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- MEMBER DETAIL MODAL (NEXUS) ---
const MemberDetailModal = ({ member, onClose, onUpdate, isLeaderView }: { member: TeamMember, onClose: () => void, onUpdate: (m: TeamMember) => void, isLeaderView: boolean }) => {
    const [activeTab, setActiveTab] = useState<'RESUMEN' | 'HISTORIAL' | 'GESTION'>('RESUMEN');
    const [bonusAmount, setBonusAmount] = useState(0);
    const [commission, setCommission] = useState(member.customCommissionRate || 5);
    const [performanceView, setPerformanceView] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');

    const handleGrantBonus = () => {
        if (bonusAmount <= 0) return;
        const updatedMember = { 
            ...member, 
            wallet: (member.wallet || 0) + bonusAmount,
            accumulatedBonuses: (member.accumulatedBonuses || 0) + bonusAmount
        };
        onUpdate(updatedMember);
        setBonusAmount(0);
        alert(`Bono de $${bonusAmount} otorgado a ${member.name}`); 
    };

    // Chart Data Generation (Simulated)
    const chartData = useMemo(() => {
        const baseVal = member.salesThisMonth || 0;
        const data = [];
        let labels = [];
        if (performanceView === 'WEEK') {
            labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
            for (let i = 0; i < 7; i++) data.push(baseVal > 0 ? Math.floor(baseVal * Math.random() * 0.2) : 0);
        } else if (performanceView === 'MONTH') {
            labels = ['S1', 'S2', 'S3', 'S4'];
            for (let i = 0; i < 4; i++) data.push(baseVal > 0 ? Math.floor(baseVal * (0.2 + Math.random() * 0.1)) : 0);
        } else {
            labels = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
            for (let i = 0; i < 12; i++) data.push(baseVal > 0 ? Math.floor(baseVal * (0.8 + Math.random() * 0.4)) : 0);
        }
        const max = Math.max(...data, 1);
        return { values: data, labels, max };
    }, [member.salesThisMonth, performanceView]);

    const quickWhatsApp = (type: 'PAYMENT' | 'STOCK' | 'CONGRATS') => {
        let msg = '';
        switch(type) {
            case 'PAYMENT': msg = `Hola ${member.name}, te informo sobre tu liquidación.`; break;
            case 'STOCK': msg = `Hola ${member.name}, ¡atención al nuevo stock de TVs!`; break;
            case 'CONGRATS': msg = `¡Excelente trabajo con las ventas de este mes ${member.name}!`; break;
        }
        openWhatsApp(member.phone, msg);
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-electro-red opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    <div className="flex items-center gap-6 relative z-10">
                        <img src={member.avatar} className="w-24 h-24 rounded-3xl object-cover border-4 border-white/10 shadow-xl" alt="" />
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">{member.name}</h2>
                            <p className="text-white/60 text-xs font-mono mb-4">{member.email}</p>
                            <div className="flex gap-3">
                                <button onClick={() => openWhatsApp(member.phone, `Hola ${member.name}...`)} className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex px-8 border-b border-slate-100 shrink-0 bg-white">
                    {['RESUMEN', 'HISTORIAL', ...(isLeaderView ? ['GESTION'] : [])].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-5 mr-8 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab ? 'border-electro-red text-electro-red' : 'border-transparent text-slate-300 hover:text-slate-50'}`}>
                            {tab === 'GESTION' ? 'Gestión' : tab}
                        </button>
                    ))}
                </div>

                <div className="p-8 overflow-y-auto bg-[#F8F9FA] flex-1">
                    {activeTab === 'RESUMEN' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-3 h-3" /> Ventas Mes</p>
                                    <p className="text-2xl font-black text-slate-900 italic">$ {member.salesThisMonth.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Trophy className="w-3 h-3" /> Nivel XP</p>
                                    <p className="text-2xl font-black text-electro-red italic">{member.points} pts</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Rendimiento</p>
                                    <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
                                        {['WEEK', 'MONTH', 'YEAR'].map(view => (
                                            <button key={view} onClick={() => setPerformanceView(view as any)} className={`px-3 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${performanceView === view ? 'bg-white text-electro-red shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                                {view === 'WEEK' ? 'Sem' : view === 'MONTH' ? 'Mes' : 'Año'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 h-32 pt-4">
                                    {chartData.values.map((val, i) => (
                                        <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                                            <div className="relative w-full rounded-t-lg bg-slate-100 overflow-hidden group-hover:bg-slate-200 transition-colors h-full">
                                                <div className="absolute bottom-0 w-full bg-slate-900 group-hover:bg-electro-red transition-all duration-500" style={{ height: `${(val / chartData.max) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {isLeaderView && (
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">Acciones Rápidas</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button onClick={() => quickWhatsApp('PAYMENT')} className="p-3 bg-white border border-slate-200 rounded-2xl text-[9px] font-bold uppercase text-slate-600 hover:border-green-500 hover:text-green-600 transition-colors">Notificar Pago</button>
                                        <button onClick={() => quickWhatsApp('CONGRATS')} className="p-3 bg-white border border-slate-200 rounded-2xl text-[9px] font-bold uppercase text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-colors">Felicitar</button>
                                        <button onClick={() => quickWhatsApp('STOCK')} className="p-3 bg-white border border-slate-200 rounded-2xl text-[9px] font-bold uppercase text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors">Alertar Stock</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'GESTION' && isLeaderView && (
                        <div className="space-y-8">
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Percent className="w-4 h-4 text-slate-400" /> Comisión Individual</p></div>
                                    <Badge type="premium">{commission}%</Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="0" max="20" step="0.5" value={commission} onChange={(e) => setCommission(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                                </div>
                             </div>
                             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="mb-6"><p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Gift className="w-4 h-4 text-electro-red" /> Otorgar Bono</p></div>
                                <div className="flex gap-4">
                                    <div className="relative flex-1"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span><input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(Number(e.target.value))} className="w-full p-3 pl-8 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-electro-red" /></div>
                                    <Button onClick={handleGrantBonus} className="bg-electro-red text-white shadow-lg px-6">Otorgar</Button>
                                </div>
                             </div>
                        </div>
                    )}
                    {activeTab === 'HISTORIAL' && (
                        <div className="space-y-4">
                             {[1,2,3].map(i => (
                                 <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-xs"><DollarSign className="w-4 h-4" /></div>
                                         <div><p className="font-bold text-slate-900 text-sm">Comisión</p><p className="text-[10px] text-slate-400 font-mono">Hace {i} días</p></div>
                                     </div>
                                     <span className="font-black text-green-600">+$ 15,000</span>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- KPI CARD ---
const KpiCard = ({ title, value, subtext, percentage, color = 'green', icon: Icon = Activity }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
     <div className="flex justify-between items-start">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color === 'green' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
           <Icon className="w-4 h-4" />
        </div>
        <span className={`text-[10px] font-black italic ${color === 'green' ? 'text-green-500' : 'text-slate-400'}`}>
           {percentage}
        </span>
     </div>
     <div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">{value}</h3>
        <p className="text-[9px] text-slate-400 mt-1 font-medium">{subtext}</p>
     </div>
  </div>
);

// --- GRID MEMBER CARD ---
interface GridMemberCardProps {
    member: TeamMember;
    leaders: TeamMember[];
    onPay: (m: TeamMember) => void;
    onReassign: (m: TeamMember) => void;
    onOpenDetail: (m: TeamMember) => void;
    isViewerAdmin: boolean;
    isViewerLeader: boolean;
}

const GridMemberCard: React.FC<GridMemberCardProps> = ({ member, leaders, onPay, onReassign, onOpenDetail, isViewerAdmin, isViewerLeader }) => {
    const leaderName = leaders.find(l => l.id === member.leaderId)?.name || 'Sin Asignar';
    
    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        openWhatsApp(member.phone, `Hola ${member.name.split(' ')[0]}...`);
    };

    return (
        <div onClick={() => onOpenDetail(member)} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden cursor-pointer">
             <button onClick={handleWhatsApp} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all shadow-sm z-10">
                 <MessageCircle className="w-4 h-4" />
             </button>

             <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                     <img src={member.avatar} className="w-14 h-14 rounded-2xl object-cover border border-slate-100" alt="" />
                     <div>
                         <h4 className="font-black italic text-slate-900 uppercase text-sm group-hover:text-electro-red transition-colors">{member.name}</h4>
                         <span className={`text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest inline-block mt-1 ${member.role === 'LEADER' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-500'}`}>
                             {member.role === 'LEADER' ? 'Líder' : 'Revendedor'}
                         </span>
                     </div>
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-50 p-3 rounded-2xl">
                 <div>
                     <p className="text-[8px] text-slate-400 font-bold uppercase">Ventas Mes</p>
                     <p className="text-sm font-black text-slate-900">$ {(member.salesThisMonth || 0).toLocaleString()}</p>
                 </div>
                 <div>
                     <p className="text-[8px] text-slate-400 font-bold uppercase">Estado</p>
                     <p className={`text-sm font-black uppercase ${member.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400'}`}>{member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</p>
                 </div>
             </div>

             <div className="mt-auto pt-4 border-t border-slate-100">
                 <div className="flex justify-between items-center">
                     <div>
                         <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Saldo Billetera</p>
                         <p className={`text-lg font-black italic ${member.wallet > 0 ? 'text-green-600' : 'text-slate-300'}`}>$ {(member.wallet || 0).toLocaleString()}</p>
                     </div>
                     {member.wallet > 0 && isViewerAdmin && (
                         <button onClick={(e) => { e.stopPropagation(); onPay(member); }} className="h-10 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105">
                             <Wallet className="w-4 h-4" /><span className="text-[9px] font-black uppercase">Liquidar</span>
                         </button>
                     )}
                 </div>
             </div>
        </div>
    );
};

// --- LEADER CONTACT CARD (FOR RESELLERS) ---
const LeaderContactCard = ({ leader }: { leader: TeamMember }) => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
                <div className="absolute inset-0 bg-electro-red rounded-full blur-xl opacity-20"></div>
                <img src={leader.avatar} className="w-32 h-32 rounded-full border-4 border-white/10 shadow-2xl relative z-10 object-cover" alt={leader.name} />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20 whitespace-nowrap">
                    Tu Líder
                </div>
            </div>
            <div className="text-center md:text-left space-y-4">
                <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{leader.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">¿Necesitas ayuda con una venta o stock?</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <button onClick={() => openWhatsApp(leader.phone, "Hola, necesito soporte con...")} className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                        <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
                    </button>
                    <div className="px-6 py-3 bg-white/10 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" /> Nivel {leader.points > 5000 ? 'Master' : 'Senior'}
                    </div>
                </div>
            </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    </div>
);

// --- CLIENTS TABLE (Existing code - shortened for brevity but keeping it) ---
const ClientsTable = ({ clients, teamMembers, user }: { clients: Client[], teamMembers: TeamMember[], user: User }) => {
    // ... (Keep existing implementation)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const getResellerName = (id?: string) => { if (!id) return 'Sin Asignar'; return teamMembers.find(t => t.id === id)?.name || 'Desconocido'; };
    return (
        <>
        <div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
             <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-widest text-slate-500 font-black"><tr><th className="p-5">Cliente</th><th className="p-5">Estado</th><th className="p-5">Revendedor Asignado</th><th className="p-5">Última Compra</th><th className="p-5 text-right">Total Gastado</th><th className="p-5 text-center">Acciones</th></tr></thead><tbody className="divide-y divide-slate-50">{clients.map((client) => (<tr key={client.id} className="hover:bg-slate-50/50 transition-colors"><td className="p-5"><div className="flex items-center gap-3"><img src={client.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" /><div><p className="text-sm font-bold text-slate-900 italic">{client.name}</p><p className="text-[10px] text-slate-400 truncate w-32">{client.address || 'Sin dirección'}</p></div></div></td><td className="p-5"><span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${client.status === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{client.status}</span></td><td className="p-5"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${client.resellerId ? 'bg-green-400' : 'bg-red-400'}`}></div><span className="text-xs font-bold text-slate-600 uppercase">{getResellerName(client.resellerId)}</span></div></td><td className="p-5"><div className="flex items-center gap-2 text-slate-500"><ShoppingBag className="w-3 h-3" /><span className="text-xs font-medium">{client.lastPurchase}</span></div></td><td className="p-5 text-right"><span className="font-black text-slate-900">$ {client.totalSpent.toLocaleString()}</span></td><td className="p-5 text-center"><button onClick={() => setSelectedClient(client)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-electro-red border border-slate-200 hover:border-electro-red px-3 py-1 rounded-lg transition-all">Ver Contacto</button></td></tr>))}</tbody></table></div></div>
        <div className="md:hidden space-y-4">{clients.map((client) => (<div key={client.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"><div className="flex items-start justify-between mb-4"><div className="flex items-center gap-3"><img src={client.avatar} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" alt="" /><div><h4 className="font-black text-slate-900 uppercase italic text-sm">{client.name}</h4><span className="inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-slate-100 text-slate-500 border-slate-200">{client.status}</span></div></div><div className="text-right"><p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p><p className="text-sm font-black text-slate-900">$ {client.totalSpent.toLocaleString()}</p></div></div><button onClick={() => setSelectedClient(client)} className="w-full py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"><Smartphone className="w-4 h-4" /> Ver Contacto</button></div>))}</div>
        {selectedClient && createPortal(<div className="fixed inset-0 z-[200] flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedClient(null)} /><div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up"><div className="bg-slate-900 p-8 text-white relative overflow-hidden"><button onClick={() => setSelectedClient(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button><div className="flex items-center gap-6 relative z-10"><img src={selectedClient.avatar} className="w-20 h-20 rounded-2xl border-4 border-white/10 shadow-lg" alt="" /><div><h2 className="text-2xl font-black italic uppercase tracking-tighter">{selectedClient.name}</h2><p className="text-white/60 text-xs mt-1">{selectedClient.email || 'Sin email'}</p></div></div></div><div className="p-8 space-y-6"><div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Phone className="w-3 h-3" /> Teléfono</p><p className="text-sm font-bold text-slate-900">{selectedClient.phone}</p><button onClick={() => openWhatsApp(selectedClient.phone, `Hola ${selectedClient.name}, te escribo por una oferta.`)} className="mt-3 w-full py-2 bg-green-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md">Iniciar Chat</button></div></div></div></div>, document.body)}
        </>
    );
}

// ... (TreeNode, AuditTable - Keep same)
const TreeNode: React.FC<{node: any; onOpenDetail: (m: TeamMember) => void;}> = ({ node, onOpenDetail }) => {const [expanded, setExpanded] = useState(true); const hasChildren = node.children && node.children.length > 0; const member = node.data as TeamMember; return (<div className="ml-4 md:ml-8 border-l-2 border-slate-100 pl-4 md:pl-8 py-2"><div className="flex items-center gap-3">{hasChildren && (<button onClick={() => setExpanded(!expanded)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">{expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>)}<div onClick={() => onOpenDetail(member)} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-all min-w-[250px]"><img src={member.avatar} className="w-8 h-8 rounded-lg object-cover" alt="" /><div><p className="text-xs font-black uppercase text-slate-900">{member.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.role === 'LEADER' ? 'Líder' : 'Revendedor'}</p></div><span className={`ml-auto text-[9px] font-bold px-2 py-1 rounded uppercase ${member.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>{member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</span></div></div>{expanded && hasChildren && (<div className="mt-2">{node.children.map((child: any) => (<TreeNode key={child.id} node={child} onOpenDetail={onOpenDetail} />))}</div>)}</div>);};
const AuditTable = ({ logs }: { logs: AuditLog[] }) => {
    // ... Simplified for brevity, assume same content
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    return (<>{/* Table Content ... */}<div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-widest text-slate-500 font-black"><tr><th className="p-5 whitespace-nowrap">Fecha / Hora</th><th className="p-5">Usuario</th><th className="p-5">Acción</th><th className="p-5">Detalle</th><th className="p-5 text-center">Prueba</th></tr></thead><tbody className="divide-y divide-slate-50">{logs.map((log) => (<tr key={log.id} className="hover:bg-slate-50/50 transition-colors"><td className="p-5 whitespace-nowrap"><div className="flex items-center gap-2 text-slate-500 font-medium text-xs"><Clock className="w-3 h-3" />{new Date(log.timestamp).toLocaleDateString()} <span className="opacity-50">|</span> {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></td><td className="p-5"><div className="font-bold text-slate-900 text-xs truncate max-w-[120px]">{log.userId}</div></td><td className="p-5 whitespace-nowrap"><span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border inline-flex items-center gap-1 ${log.action.includes('PAYOUT') ? 'bg-green-50 text-green-700 border-green-100' : log.action.includes('SALE') ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{log.action.replace('_', ' ')}</span></td><td className="p-5 text-xs text-slate-600 font-medium max-w-xs truncate" title={log.details}>{log.details}</td><td className="p-5 text-center">{log.proofUrl && (<button onClick={() => setSelectedLog(log)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-electro-red transition-colors"><FileText className="w-4 h-4" /></button>)}</td></tr>))}</tbody></table></div>{logs.length === 0 && <div className="p-12 text-center text-slate-400 text-sm italic">No hay registros de auditoría disponibles.</div>}</div>{selectedLog && <MockReceiptModal log={selectedLog} onClose={() => setSelectedLog(null)} />}</>);
};

export const TeamView: React.FC<TeamViewProps> = ({ auditLogs, clients: initialClients, user, teamMembers: initialMembers, integrationConfig, simulationMode, onPayout, onAddMember, onAddClient }) => {
  const isAdmin = user.role === 'ADMIN';
  const isLeader = user.role === 'LEADER';
  const isReseller = user.role === 'RESELLER';
  
  const visibleMembers = useMemo(() => {
      if (isAdmin) return initialMembers.filter(m => m.status !== 'PENDING');
      if (isLeader) return initialMembers.filter(m => (m.leaderId === user.id || m.id === user.id) && m.status !== 'PENDING');
      return []; 
  }, [initialMembers, user, isAdmin, isLeader]);

  // NEW: Filter Pending Members for Approval
  const pendingMembers = useMemo(() => {
      if (isAdmin) return initialMembers.filter(m => m.status === 'PENDING');
      if (isLeader) return initialMembers.filter(m => m.leaderId === user.id && m.status === 'PENDING');
      return [];
  }, [initialMembers, user, isAdmin, isLeader]);

  const myLeader = useMemo(() => {
      if (isReseller) return initialMembers.find(m => m.id === user.leaderId);
      return null;
  }, [initialMembers, user, isReseller]);

  const visibleClients = useMemo(() => {
      if (isAdmin) return initialClients;
      if (isLeader) {
          const myTeamIds = initialMembers.filter(m => m.leaderId === user.id).map(m => m.id);
          return initialClients.filter(c => c.resellerId === user.id || (c.resellerId && myTeamIds.includes(c.resellerId)));
      }
      return initialClients.filter(c => c.resellerId === user.id);
  }, [initialClients, user, isAdmin, isLeader, initialMembers]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentTab, setCurrentTab] = useState<'STRUCTURE' | 'CLIENTS' | 'AUDIT' | 'REQUESTS'>((isAdmin || isLeader) && pendingMembers.length > 0 ? 'REQUESTS' : isReseller ? 'CLIENTS' : 'STRUCTURE');
  const [viewMode, setViewMode] = useState<'TREE' | 'GRID'>('GRID');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [approvalMember, setApprovalMember] = useState<TeamMember | null>(null);

  const [newMemberForm, setNewMemberForm] = useState({ name: '', email: '', role: 'RESELLER' as Role, alias: '' });
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', interest: 'Varios' });
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [payoutStep, setPayoutStep] = useState<'INPUT' | 'SUCCESS'>('INPUT');

  const displayLogs = auditLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const stats = useMemo(() => {
      const volume = visibleMembers.reduce((acc, m) => acc + (m.salesThisMonth || 0), 0);
      const activeCount = visibleMembers.filter(m => m.status === 'ACTIVE').length;
      return { volume, activeCount };
  }, [visibleMembers]);

  const openPayout = (member: TeamMember) => { setSelectedMember(member); setPayoutAmount(member.wallet); setPayoutStep('INPUT'); setShowPayoutModal(true); };
  const openReassign = (member: TeamMember) => { setSelectedMember(member); setShowReassignModal(true); };
  const handleReassign = (newLeaderId: string) => { setShowReassignModal(false); setSelectedMember(null); };
  const confirmPayout = () => { if (!onPayout || !selectedMember) return; onPayout(selectedMember.id, selectedMember.name, payoutAmount, "https://example.com/proof.pdf"); setPayoutStep('SUCCESS'); };
  const handlePayoutWhatsApp = () => { if (!selectedMember) return; openWhatsApp(selectedMember.phone, `Hola...`); setShowPayoutModal(false); };
  const handleCreateMember = () => {
      if (!onAddMember) return;
      onAddMember({ id: `new-${Date.now()}`, name: newMemberForm.name || 'Nuevo Socio', role: newMemberForm.role, email: newMemberForm.email, alias: newMemberForm.alias, status: 'ACTIVE', salesThisMonth: 0, activePromos: 0, lastActive: 'Ahora', avatar: `https://ui-avatars.com/api/?name=${newMemberForm.name}&background=random`, points: 0, wallet: 0, leaderId: user.id } as any);
      setShowAddModal(false); setNewMemberForm({ name: '', email: '', role: 'RESELLER', alias: '' });
  };
  
  const handleCreateClient = () => {
      if (!onAddClient) return;
      onAddClient({
          id: `cli-${Date.now()}`,
          name: newClientForm.name || 'Nuevo Cliente',
          phone: newClientForm.phone,
          email: newClientForm.email,
          status: 'POTENTIAL',
          lastPurchase: 'N/A',
          totalSpent: 0,
          avatar: `https://ui-avatars.com/api/?name=${newClientForm.name}&background=random`,
          interestedIn: newClientForm.interest,
          resellerId: user.id
      });
      setShowAddClientModal(false);
      setNewClientForm({ name: '', phone: '', email: '', interest: 'Varios' });
  };

  const handleApprove = async () => {
      if (!approvalMember) return;
      await approveReseller(approvalMember.id, true, simulationMode);
      
      // AUTO-NOTIFICATION: OPEN WHATSAPP
      if (approvalMember.phone) {
          const msg = `¡Hola ${approvalMember.name.split(' ')[0]}! 👋\n\nTu cuenta en Electro Hogar Digital ha sido APROBADA.\n\nYa puedes ingresar a la plataforma y acceder a tu panel de revendedor para empezar a vender.\n\n¡Bienvenido al equipo! 🚀`;
          openWhatsApp(approvalMember.phone, msg);
      }

      setApprovalMember(null);
  };

  const handleReject = async () => {
      if (!approvalMember) return;
      await approveReseller(approvalMember.id, false, simulationMode);
      setApprovalMember(null);
  };

  const handleSmartExport = () => {
    const dataToExport = visibleClients.map(c => ({ ID: c.id, Nombre: c.name, Telefono: c.phone, Total: c.totalSpent }));
    const headers = Object.keys(dataToExport[0] || {}).join(',');
    const rows = dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute('download', 'clientes_omega.csv'); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const treeData = isAdmin ? initialMembers.filter(m => m.role === 'LEADER').map(leader => ({
      id: leader.id, type: 'LEADER', data: leader,
      children: initialMembers.filter(r => r.leaderId === leader.id && r.role === 'RESELLER' && r.status === 'ACTIVE').map(r => ({ id: r.id, type: 'RESELLER', data: r, children: [] }))
  })) : [];

  const filteredMembers = visibleMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const leadersList = initialMembers.filter(m => m.role === 'LEADER');

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-10">
      {selectedMember && <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} onUpdate={() => {}} isLeaderView={isLeader || isAdmin} />}
      {approvalMember && <ApprovalModal member={approvalMember} onClose={() => setApprovalMember(null)} onApprove={handleApprove} onReject={handleReject} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div className="text-left">
            <h2 className="omega-header text-2xl text-slate-900 leading-none italic">{isReseller ? 'Mi Red de Apoyo' : isAdmin ? 'Red Global' : 'Gestión de Equipo'}</h2>
            <div className="flex items-center gap-3 mt-2">
                {!isReseller && <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">{visibleMembers.length} Miembros</span>}
                <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">{visibleClients.length} Clientes</span>
                {simulationMode && <Badge type="warning">Modo Simulación</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <div className="bg-white border border-slate-200 p-1 rounded-xl flex gap-1 shadow-sm shrink-0">
                 {!isReseller && (
                     <>
                        <button onClick={() => setCurrentTab('STRUCTURE')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${currentTab === 'STRUCTURE' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Estructura</button>
                        <button onClick={() => setCurrentTab('REQUESTS')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all relative ${currentTab === 'REQUESTS' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                            Solicitudes
                            {pendingMembers.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-electro-red rounded-full border-2 border-white"></span>}
                        </button>
                     </>
                 )}
                 {isReseller && <button onClick={() => setCurrentTab('STRUCTURE')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${currentTab === 'STRUCTURE' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Mi Líder</button>}
                 <button onClick={() => setCurrentTab('CLIENTS')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${currentTab === 'CLIENTS' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{isReseller ? 'Mis Clientes' : 'Clientes'}</button>
                 {isAdmin && <button onClick={() => setCurrentTab('AUDIT')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${currentTab === 'AUDIT' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Auditoría</button>}
             </div>
          </div>
      </div>

      {/* KPIs (Hidden for Resellers) */}
      {!isReseller && currentTab !== 'AUDIT' && currentTab !== 'REQUESTS' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <KpiCard title="Total Equipo" value={visibleMembers.length} subtext="Socios Asignados" percentage="" color="green" icon={Users} />
             <KpiCard title="Volumen Red" value={formatCurrencyShort(stats.volume)} subtext="Facturación Total" percentage="" color="green" icon={Activity} />
             <KpiCard title="Activos" value={stats.activeCount} subtext="Socios Vendiendo" percentage={`${Math.round((stats.activeCount/(visibleMembers.length || 1))*100)}%`} color="gray" icon={Zap} />
             {isAdmin && <KpiCard title="Liquidaciones" value={formatCurrencyShort(user.wallet)} subtext="Pendientes" percentage="" color="gray" icon={Wallet} />}
          </div>
      )}

      {/* --- TAB: REQUESTS (PENDING APPROVAL) --- */}
      {currentTab === 'REQUESTS' && (isAdmin || isLeader) && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 rounded-xl text-amber-700"><UserCheck className="w-6 h-6" /></div>
                      <div>
                          <h3 className="text-lg font-black text-amber-900 italic uppercase">Solicitudes Pendientes</h3>
                          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mt-1">Requiere revisión de estado WhatsApp</p>
                      </div>
                  </div>
                  <Badge type="warning">{pendingMembers.length} Pendientes</Badge>
              </div>

              {pendingMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {pendingMembers.map(member => (
                          <div key={member.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                              <div className="flex items-center gap-4 mb-4">
                                  <img src={member.avatar} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                                  <div>
                                      <h4 className="font-bold text-slate-900 text-sm uppercase">{member.name}</h4>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registrado: {new Date().toLocaleDateString()}</p>
                                  </div>
                              </div>
                              <div className="flex-1 bg-slate-50 rounded-xl p-3 mb-4">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado Evidencia</p>
                                  <div className="flex items-center gap-2">
                                      {member.activationProofUrl ? (
                                          <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Subida</span>
                                      ) : (
                                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Esperando carga</span>
                                      )}
                                  </div>
                              </div>
                              <Button fullWidth onClick={() => setApprovalMember(member)} disabled={!member.activationProofUrl} className="text-xs uppercase font-black">
                                  {member.activationProofUrl ? 'Revisar & Aprobar' : 'Esperando Usuario...'}
                              </Button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-20 text-slate-400 text-sm italic">
                      No hay solicitudes pendientes.
                  </div>
              )}
          </div>
      )}

      {/* --- TAB: STRUCTURE (TEAM / LEADER) --- */}
      {currentTab === 'STRUCTURE' && (
          <div className="animate-fade-in space-y-6">
              {isReseller ? (
                  /* VISTA REVENDEDOR: TARJETA DEL LÍDER */
                  <div className="max-w-2xl mx-auto">
                      {myLeader ? <LeaderContactCard leader={myLeader} /> : <div className="text-center py-12 text-slate-400 text-sm italic">No tienes un líder asignado. Contacta a soporte.</div>}
                  </div>
              ) : (
                  /* VISTA LÍDER/ADMIN: GRID DE EQUIPO */
                  <>
                    <div className="flex justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="BUSCAR SOCIO..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-slate-300" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            {isAdmin && (
                                <div className="bg-white border border-slate-200 p-1 rounded-xl flex gap-1">
                                    <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutGrid className="w-4 h-4" /></button>
                                    <button onClick={() => setViewMode('TREE')} className={`p-2 rounded-lg transition-all ${viewMode === 'TREE' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}><Network className="w-4 h-4" /></button>
                                </div>
                            )}
                            <button onClick={() => setShowAddModal(true)} className="h-10 px-4 bg-electro-red text-white rounded-xl shadow-lg shadow-red-200 flex items-center gap-2 font-black italic uppercase text-xs hover:scale-105 transition-transform">
                                <UserPlus className="w-4 h-4" /> <span className="hidden md:inline">Nuevo Socio</span>
                            </button>
                        </div>
                    </div>

                    {viewMode === 'GRID' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map(member => (
                                    <GridMemberCard key={member.id} member={member} leaders={leadersList} onPay={openPayout} onReassign={openReassign} onOpenDetail={setSelectedMember} isViewerAdmin={isAdmin} isViewerLeader={isLeader} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-slate-400 italic text-sm">No hay socios visibles.</div>
                            )}
                        </div>
                    )}

                    {viewMode === 'TREE' && isAdmin && (
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px]">
                            {treeData.length > 0 ? treeData.map((node: any) => <TreeNode key={node.id} node={node} onOpenDetail={setSelectedMember} />) : <div className="text-center py-12 text-slate-400 italic text-sm">Sin estructura visible.</div>}
                        </div>
                    )}
                  </>
              )}
          </div>
      )}

      {/* ... (CLIENTS & AUDIT TABS - Same as before) */}
      {currentTab === 'CLIENTS' && (
          <div className="animate-fade-in space-y-6">
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div>
                       <h3 className="text-lg font-black text-slate-900 italic uppercase">Cartera de Clientes</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                           {isReseller ? 'Tus compradores directos' : 'Gestión global de cartera'}
                       </p>
                   </div>
                   <div className="flex gap-2">
                       <button onClick={() => setShowAddClientModal(true)} className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95">
                           <UserPlus className="w-4 h-4" /> Nuevo Cliente
                       </button>
                       <button onClick={handleSmartExport} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95">
                           <Download className="w-4 h-4" /> Exportar para Bot
                       </button>
                   </div>
               </div>
               <ClientsTable clients={visibleClients} teamMembers={visibleMembers} user={user} />
          </div>
      )}

      {currentTab === 'AUDIT' && isAdmin && (
          <div className="animate-fade-in space-y-6">
              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-700"><Shield className="w-6 h-6" /></div>
                  <div><h3 className="text-lg font-black text-amber-900 italic uppercase">Auditoría del Sistema</h3><p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mt-1">Registro inmutable</p></div>
              </div>
              <AuditTable logs={displayLogs} />
          </div>
      )}

      {/* ... (MODALS - Same as before + Reassign + Add Member) */}
      {showReassignModal && selectedMember && isAdmin && createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReassignModal(false)} />
              <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
                  <div className="bg-blue-50 p-6 border-b border-blue-100 flex justify-between items-center"><div><h3 className="text-xl font-black italic text-blue-900 uppercase">Reasignar Líder</h3></div><button onClick={() => setShowReassignModal(false)} className="p-2 hover:bg-blue-100 rounded-full"><X className="w-5 h-5 text-blue-600" /></button></div>
                  <div className="p-6"><div className="space-y-2 max-h-60 overflow-y-auto pr-2">{leadersList.map(leader => (<button key={leader.id} onClick={() => handleReassign(leader.id)} className="w-full p-3 rounded-xl border flex items-center gap-3 transition-all hover:bg-slate-50"><img src={leader.avatar} className="w-8 h-8 rounded-lg bg-slate-200" alt="" /><span className="font-bold text-xs text-slate-700 uppercase">{leader.name}</span></button>))}</div></div>
              </div>
          </div>, document.body
      )}

      {showAddModal && (isAdmin || isLeader) && createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
              <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
                  <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center"><div><h3 className="text-xl font-black italic text-slate-900 uppercase">Nuevo Socio</h3></div><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-400" /></button></div>
                  <div className="p-6 space-y-4">
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label><input type="text" value={newMemberForm.name} onChange={e => setNewMemberForm({...newMemberForm, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" placeholder="Nombre" /></div>
                      {isAdmin && <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label><div className="grid grid-cols-2 gap-3"><button onClick={() => setNewMemberForm({...newMemberForm, role: 'LEADER'})} className={`p-3 rounded-xl border text-xs font-bold uppercase ${newMemberForm.role === 'LEADER' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white'}`}>Líder</button><button onClick={() => setNewMemberForm({...newMemberForm, role: 'RESELLER'})} className={`p-3 rounded-xl border text-xs font-bold uppercase ${newMemberForm.role === 'RESELLER' ? 'bg-slate-100' : 'bg-white'}`}>Revendedor</button></div></div>}
                      <Button fullWidth onClick={handleCreateMember} className="h-14 mt-4">Crear Cuenta</Button>
                  </div>
              </div>
          </div>, document.body
      )}

      {showAddClientModal && createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddClientModal(false)} />
              <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
                  <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center"><div><h3 className="text-xl font-black italic text-slate-900 uppercase">Nuevo Cliente</h3></div><button onClick={() => setShowAddClientModal(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-400" /></button></div>
                  <div className="p-6 space-y-4">
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label><input type="text" value={newClientForm.name} onChange={e => setNewClientForm({...newClientForm, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" placeholder="Ej: Juan Pérez" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label><input type="tel" value={newClientForm.phone} onChange={e => setNewClientForm({...newClientForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" placeholder="+54 9 11..." /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label><input type="email" value={newClientForm.email} onChange={e => setNewClientForm({...newClientForm, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold" placeholder="juan@email.com" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interés</label><select value={newClientForm.interest} onChange={e => setNewClientForm({...newClientForm, interest: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border font-bold outline-none"><option value="Varios">Varios</option><option value="Televisores">Televisores</option><option value="Celulares">Celulares</option><option value="Lavado">Lavado</option></select></div>
                      <Button fullWidth onClick={handleCreateClient} className="h-14 mt-4 bg-slate-900 text-white shadow-xl">Guardar Prospecto</Button>
                  </div>
              </div>
          </div>, document.body
      )}

      {showPayoutModal && isAdmin && createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)} />
              <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
                  <div className="p-6 border-b flex justify-between items-center bg-green-50"><div><h3 className="text-xl font-black italic text-green-900 uppercase">Liquidación</h3></div><button onClick={() => setShowPayoutModal(false)} className="p-2 hover:bg-green-100 rounded-full"><X className="w-5 h-5" /></button></div>
                  {payoutStep === 'INPUT' ? <div className="p-8 space-y-4"><input type="number" value={payoutAmount} onChange={e => setPayoutAmount(Number(e.target.value))} className="w-full p-4 rounded-xl border text-xl font-black" /><Button fullWidth onClick={confirmPayout} className="h-14 bg-green-500">Confirmar</Button></div> : <div className="p-8 text-center space-y-6"><h3 className="text-2xl font-black text-slate-900">¡Pago Exitoso!</h3><Button onClick={handlePayoutWhatsApp} className="w-full bg-[#25D366]">Enviar Comprobante</Button></div>}
              </div>
          </div>, document.body
      )}
    </div>
  );
};
