
import React, { useState, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Bell, MessageCircle, FileText, Youtube, ArrowRight, Camera, Save, User as UserIcon, Key, Phone as PhoneIcon, Loader2 } from 'lucide-react';
import { Button } from './UIComponents';
import { User, Notification, IntegrationConfig } from '../../types';
import { uploadToCloudinary } from '../../services/omegaServices';

// --- NOTIFICATION PANEL ---
interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, onMarkAllAsRead }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[80] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white z-[90] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-electro-red" /> Notificaciones
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {notifications.length > 0 ? (
               notifications.map((notif) => (
                 <div key={notif.id} className={`p-4 rounded-xl border transition-all duration-300 ${notif.read ? 'bg-white border-gray-100 opacity-75' : 'bg-red-50/50 border-red-100 shadow-sm animate-fade-in'}`}>
                   <div className="flex items-start gap-3">
                      <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${
                        notif.type === 'SALE' ? 'bg-green-100 text-green-600' :
                        notif.type === 'ALERT' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                         {notif.type === 'SALE' ? <CheckCircle className="w-4 h-4" /> :
                          notif.type === 'ALERT' ? <AlertTriangle className="w-4 h-4" /> :
                          <Info className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">{notif.time}</p>
                      </div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                 <Bell className="w-12 h-12 opacity-20" />
                 <p className="text-sm font-medium">No hay notificaciones</p>
               </div>
             )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <Button variant="ghost" fullWidth className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-electro-red" onClick={onMarkAllAsRead}>
              Marcar todo como leído
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// --- HELP MODAL ---
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Info className="w-8 h-8 text-gray-600" />
           </div>
           <h3 className="text-xl font-bold text-gray-900">Centro de Ayuda</h3>
           <p className="text-sm text-gray-500">¿En qué podemos ayudarte hoy?</p>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group text-left">
             <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                <MessageCircle className="w-6 h-6" />
             </div>
             <div>
               <p className="font-bold text-gray-900">Soporte Directo</p>
               <p className="text-xs text-gray-500">Chat con administración (Admin Only)</p>
             </div>
          </button>

          <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all group text-left">
             <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                <Youtube className="w-6 h-6" />
             </div>
             <div>
               <p className="font-bold text-gray-900">Tutoriales de Plataforma</p>
               <p className="text-xs text-gray-500">Aprende a usar el nuevo panel</p>
             </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ONBOARDING MODAL ---
interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
         <div className="h-2 bg-electro-red w-full"></div>
         <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 italic">
              ¡Bienvenido, {user.name.split(' ')[0]}!
            </h2>
            <p className="text-gray-500 mb-6">
              Tu panel de <span className="font-black text-gray-900 uppercase tracking-tighter">{user.role}</span> está listo para operar.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6 space-y-3 shadow-inner">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tareas Prioritarias:</p>
               {user.role === 'ADMIN' ? (
                 <>
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                      <span className="text-sm font-medium text-gray-700">Auditá los márgenes de ganancia global.</span>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                      <span className="text-sm font-medium text-gray-700">Explorá las ofertas flash del catálogo.</span>
                   </div>
                 </>
               )}
            </div>

            <Button onClick={onClose} fullWidth className="py-4 text-base font-bold shadow-xl">
              Acceder al Panel <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
         </div>
      </div>
    </div>
  );
};

// --- PROFILE MODAL CON CLOUDINARY ---
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  integrationConfig: IntegrationConfig;
  onUpdate: (updatedUser: Partial<User>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, integrationConfig, onUpdate }) => {
  const [formData, setFormData] = useState({ ...user });
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'PAYMENT'>('GENERAL');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file, integrationConfig);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
    } catch (error) {
      alert("Error al subir imagen. Revisa la configuración de Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
       <div className="relative bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />

          {/* Header */}
          <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
             <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                   <img src={formData.avatar} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-4 border-white" alt="Profile" />
                   <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                   </div>
                </div>
                <div>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">{formData.name}</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[8px] text-white ${formData.role === 'ADMIN' ? 'bg-slate-900' : formData.role === 'LEADER' ? 'bg-blue-600' : 'bg-green-600'}`}>{formData.role}</span>
                       ID: {formData.id}
                   </p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-8">
             <button onClick={() => setActiveTab('GENERAL')} className={`py-4 px-2 text-[10px] font-black uppercase tracking-widest mr-6 border-b-2 transition-colors ${activeTab === 'GENERAL' ? 'border-electro-red text-electro-red' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Datos Personales</button>
             <button onClick={() => setActiveTab('PAYMENT')} className={`py-4 px-2 text-[10px] font-black uppercase tracking-widest mr-6 border-b-2 transition-colors ${activeTab === 'PAYMENT' ? 'border-electro-red text-electro-red' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Pagos y Retiros</button>
             <button onClick={() => setActiveTab('SECURITY')} className={`py-4 px-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'SECURITY' ? 'border-electro-red text-electro-red' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Seguridad</button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto flex-1 bg-white">
             {activeTab === 'GENERAL' && (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-slate-300 transition-colors">
                         <UserIcon className="w-5 h-5 text-slate-300" />
                         <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-transparent w-full outline-none text-sm font-bold text-slate-900 uppercase italic" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-slate-300 transition-colors">
                         <MessageCircle className="w-5 h-5 text-slate-300" />
                         <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-transparent w-full outline-none text-sm font-bold text-slate-900" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono (WhatsApp)</label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-slate-300 transition-colors">
                         <PhoneIcon className="w-5 h-5 text-slate-300" />
                         <input type="tel" placeholder="+54 9 11..." value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-transparent w-full outline-none text-sm font-bold text-slate-900" />
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'PAYMENT' && (
                <div className="space-y-6">
                   <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-xs mb-4">
                      Estos datos se usarán para transferir tus comisiones automáticamente.
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CBU / CVU</label>
                      <input type="text" placeholder="0000000000000000000000" value={formData.cbu || ''} onChange={(e) => setFormData({...formData, cbu: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-mono font-bold text-slate-900 focus:border-electro-red" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alias</label>
                      <input type="text" placeholder="MI.ALIAS.MP" value={formData.alias || ''} onChange={(e) => setFormData({...formData, alias: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-black text-slate-900 uppercase italic focus:border-electro-red" />
                   </div>
                </div>
             )}

             {activeTab === 'SECURITY' && (
                <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña Actual</label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <Key className="w-5 h-5 text-slate-300" />
                         <input type="password" placeholder="••••••••" className="bg-transparent w-full outline-none text-sm" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <Key className="w-5 h-5 text-slate-300" />
                         <input type="password" placeholder="••••••••" className="bg-transparent w-full outline-none text-sm" />
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <Button variant="outline" onClick={onClose} className="border-none hover:bg-slate-200 text-slate-500">Cancelar</Button>
             <Button onClick={handleSave} className="bg-slate-900 text-white shadow-xl hover:scale-105 active:scale-95 px-8">Guardar Cambios</Button>
          </div>
       </div>
    </div>
  );
};
