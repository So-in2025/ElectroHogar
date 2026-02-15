
import React, { useState, useEffect } from 'react';
import { Shield, Users, ShoppingBag, ArrowLeft, ArrowRight, Mail, Lock, User as UserIcon, Phone, AlertTriangle } from 'lucide-react';
import { MOCK_USERS } from '../../constants';
import { User } from '../../types';
import { ElectroLogo, Button } from '../ui/UIComponents';
import { registerNewReseller } from '../../services/omegaServices';

interface AuthViewProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isSimulation, setIsSimulation] = useState(true);

  // Check initial state
  useEffect(() => {
      const saved = localStorage.getItem('OMEGA_SIM_MODE');
      if (saved !== null) {
          setIsSimulation(JSON.parse(saved));
      }
  }, []);

  // MOCK LOGIN FOR DEMO PURPOSES
  const handleMockLogin = (type: number) => {
      onLogin(MOCK_USERS[type]);
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const newUser = await registerNewReseller({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              pass: formData.password
          }, isSimulation);

          onLogin(newUser);
      } catch (error) {
          alert("Error en el registro. Intenta nuevamente.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4 relative">
      
      {/* Back Button (Mobile & PC) */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm group active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest italic">Volver</span>
      </button>

      {/* Brand Header */}
      <div className="mb-8 text-center animate-fade-in-up flex flex-col items-center">
        <button onClick={onBack} className="transition-transform active:scale-95">
            <ElectroLogo className="h-14 w-auto mb-3 drop-shadow-xl" />
        </button>
        <p className="text-slate-400 mt-1 text-[10px] tracking-[0.2em] font-black uppercase">Omega System OS</p>
        
        {/* Environment Indicator */}
        <div className={`mt-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-2 ${isSimulation ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isSimulation ? 'bg-amber-500' : 'bg-green-500'}`}></div>
            {isSimulation ? 'Entorno de Simulación' : 'Conectado a Producción'}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-fade-in delay-100 relative">
        
        {/* Toggle Tabs */}
        <div className="flex p-2 bg-slate-50 border-b border-slate-100">
            <button 
                onClick={() => setMode('LOGIN')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Ingresar
            </button>
            <button 
                onClick={() => setMode('REGISTER')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Registro
            </button>
        </div>

        <div className="p-8">
          {mode === 'LOGIN' ? (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-black text-slate-900 uppercase italic text-center mb-6">Selecciona Perfil Demo</h2>
                
                {/* Admin Option */}
                <button 
                  onClick={() => handleMockLogin(0)}
                  className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-electro-red hover:bg-white transition-all group flex items-center gap-4 text-left shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-electro-red transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-electro-red transition-colors uppercase">Admin Global</p>
                    <p className="text-[10px] text-slate-500 font-medium">Control total</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-electro-red opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </button>

                {/* Leader Option */}
                <button 
                  onClick={() => handleMockLogin(1)}
                  className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-white transition-all group flex items-center gap-4 text-left shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase">Líder de Equipo</p>
                    <p className="text-[10px] text-slate-500 font-medium">Gestión de red</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </button>

                {/* Reseller Option */}
                <button 
                  onClick={() => handleMockLogin(2)}
                  className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-green-500 hover:bg-white transition-all group flex items-center gap-4 text-left shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-green-600 transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-green-600 transition-colors uppercase">Revendedor</p>
                    <p className="text-[10px] text-slate-500 font-medium">Ventas y catálogo</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </button>
              </div>
          ) : (
              <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                  <h2 className="text-lg font-black text-slate-900 uppercase italic text-center mb-6">Nueva Cuenta</h2>
                  
                  {isSimulation && (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-[10px] text-amber-800 flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Estás registrándote en el simulador local.</span>
                      </div>
                  )}

                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 transition-colors">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-transparent w-full text-sm font-bold text-slate-900 outline-none placeholder-slate-300" placeholder="Ej: Juan Pérez" />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 transition-colors">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-transparent w-full text-sm font-bold text-slate-900 outline-none placeholder-slate-300" placeholder="juan@mail.com" />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 transition-colors">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-transparent w-full text-sm font-bold text-slate-900 outline-none placeholder-slate-300" placeholder="+54 9 11..." />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 transition-colors">
                          <Lock className="w-4 h-4 text-slate-400" />
                          <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-transparent w-full text-sm font-bold text-slate-900 outline-none placeholder-slate-300" placeholder="••••••••" />
                      </div>
                  </div>

                  <Button fullWidth className="h-12 bg-slate-900 text-white mt-4" disabled={loading}>
                      {loading ? 'Creando...' : 'Crear Cuenta'}
                  </Button>
              </form>
          )}
        </div>
      </div>

      <div className="mt-8 text-center max-w-sm">
        <p className="text-[10px] text-slate-400 font-medium">
          Sistema protegido por Omega Security. <br/>
          Solo personal autorizado.
        </p>
      </div>
    </div>
  );
};
