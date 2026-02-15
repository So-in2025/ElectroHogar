import React, { useState } from 'react';
import { Card, Button, Badge } from '../ui/UIComponents';
import { Database, UploadCloud, Check, AlertCircle, ArrowRight, Server, Users } from 'lucide-react';

export const MigrationView = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);

  const startMigration = () => {
    setIsMigrating(true);
    let curr = 0;
    const interval = setInterval(() => {
      curr += 2;
      setProgress(curr);
      if (curr >= 100) {
        clearInterval(interval);
        setIsMigrating(false);
        setStep(3);
      }
    }, 50);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-12 text-left md:text-center">
        <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">Importación de Datos</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Carga masiva desde sistemas externos (Pedix / Excel)</p>
      </div>

      <div className="flex justify-between items-center mb-12 px-8 md:px-20 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100 -translate-y-1/2 -z-10"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic transition-all shadow-lg ${
              step >= s ? 'bg-electro-red text-white scale-110' : 'bg-white text-gray-300 border border-gray-100'
            }`}>
              {step > s ? <Check className="w-6 h-6" /> : s}
            </div>
            <span className={`text-[9px] mt-4 font-black uppercase tracking-widest italic ${step >= s ? 'text-gray-900' : 'text-gray-300'}`}>
              {s === 1 ? 'Conexión' : s === 2 ? 'Carga' : 'Listo'}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-12 rounded-[2.5rem] border-gray-100 shadow-xl overflow-hidden">
        {step === 1 && (
          <div className="flex flex-col items-center space-y-8 animate-fade-in">
            <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center shadow-inner">
              <Database className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">Seleccionar Archivo Fuente</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2 text-xs font-medium leading-relaxed">
                Se detectó un archivo CSV listo para procesar. 
                Contiene el listado de productos y clientes actualizados.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 w-full max-w-md flex items-center gap-4 shadow-inner">
              <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black text-gray-700 uppercase italic">CSV</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 italic tracking-tight truncate">export_pedix_2026.csv</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Listo para cargar (34MB)</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></div>
            </div>
            <Button onClick={() => setStep(2)} className="min-w-[250px] h-16 rounded-2xl text-lg font-black italic uppercase tracking-tighter border-none bg-electro-red shadow-xl shadow-red-100">
              INICIAR IMPORTACIÓN <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center space-y-10 py-6 animate-fade-in">
             <div className="w-full max-w-lg space-y-4">
               <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Estado</p>
                    <p className="text-lg font-black text-gray-900 italic uppercase tracking-tighter">Procesando Base de Datos...</p>
                 </div>
                 <span className="text-3xl font-black italic text-electro-red tracking-tighter">{progress}%</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden border border-gray-200 p-1 shadow-inner">
                 <div 
                   className="h-full bg-gradient-to-r from-electro-red to-red-500 rounded-full transition-all duration-75"
                   style={{ width: `${progress}%` }}
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                   <div className="p-3 bg-white rounded-2xl text-gray-400 shadow-sm"><Server className="w-6 h-6" /></div>
                   <div>
                     <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest italic">Productos</p>
                     <p className="font-black text-gray-900 text-sm italic">{Math.floor((1240 * progress) / 100)} / 1240</p>
                   </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                   <div className="p-3 bg-white rounded-2xl text-gray-400 shadow-sm"><Users className="w-6 h-6" /></div>
                   <div>
                     <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest italic">Clientes</p>
                     <p className="font-black text-gray-900 text-sm italic">{Math.floor((420 * progress) / 100)} / 420</p>
                   </div>
                </div>
             </div>

             {!isMigrating && progress === 0 && (
                <Button onClick={startMigration} className="h-14 px-12 uppercase italic font-black">CONTINUAR</Button>
             )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center space-y-8 animate-scale-up">
            <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl text-green-600">
              <Check className="w-12 h-12" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">¡DATOS ACTUALIZADOS!</h3>
              <p className="text-gray-500 mt-3 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                La importación se completó correctamente. El catálogo ya refleja los nuevos precios y stock.
              </p>
            </div>
            <div className="w-full max-w-md bg-amber-50/50 border border-amber-100 p-6 rounded-3xl flex gap-4 text-left shadow-sm">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest italic leading-none">Aviso del Sistema</p>
                <p className="text-[11px] text-amber-800 mt-2 font-medium leading-relaxed italic">
                  12 productos nuevos no tienen imagen. Se les asignó una imagen genérica temporalmente.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="h-14 rounded-2xl italic font-black text-xs uppercase tracking-widest">
                NUEVA CARGA
              </Button>
              <Button className="h-14 rounded-2xl italic font-black text-xs uppercase tracking-widest bg-gray-900 text-white border-none px-12">
                IR AL CATÁLOGO
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};