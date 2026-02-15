import React from 'react';
import { Shield, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import { MOCK_USERS } from '../../constants';
import { User } from '../../types';
import { ElectroLogo } from '../ui/UIComponents';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="mb-10 text-center animate-fade-in-up flex flex-col items-center">
        <ElectroLogo className="h-16 w-auto mb-4 drop-shadow-xl" />
        <p className="text-gray-500 mt-2 text-sm tracking-wide font-medium uppercase">Plataforma Digital de Negocios</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden animate-fade-in delay-100">
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Selecciona tu Perfil</h2>
          
          <div className="space-y-4">
            {/* Admin Option */}
            <button 
              onClick={() => onLogin(MOCK_USERS[0])}
              className="w-full p-4 rounded-xl border border-gray-100 hover:border-electro-red hover:bg-red-50 transition-all group flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-600 group-hover:text-electro-red transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 group-hover:text-electro-red transition-colors">Dueño / Admin</p>
                <p className="text-xs text-gray-500">Control total, métricas y gestión.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-electro-red opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
            </button>

            {/* Leader Option */}
            <button 
              onClick={() => onLogin(MOCK_USERS[1])}
              className="w-full p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-600 group-hover:text-blue-600 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Líder de Equipo</p>
                <p className="text-xs text-gray-500">Gestión de revendedores y comisiones.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
            </button>

            {/* Reseller Option */}
            <button 
              onClick={() => onLogin(MOCK_USERS[2])}
              className="w-full p-4 rounded-xl border border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all group flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-600 group-hover:text-green-600 transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Revendedor</p>
                <p className="text-xs text-gray-500">Ventas, catálogo y premios.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">Versión 2.5.0 - Producción</p>
        </div>
      </div>

      <div className="mt-8 text-center max-w-sm">
        <p className="text-xs text-gray-400">
          Al ingresar, aceptas los términos de confidencialidad de Electro Hogar Digital. 
          Sistema monitoreado.
        </p>
      </div>
    </div>
  );
};