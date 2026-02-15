
import React, { useState, useRef } from 'react';
import { User, IntegrationConfig } from '../../types';
import { Button, ElectroLogo } from '../ui/UIComponents';
import { UploadCloud, CheckCircle, Clock, ShieldAlert, LogOut, Loader2, Camera, Smartphone } from 'lucide-react';
import { uploadToCloudinary, submitActivationProof } from '../../services/omegaServices';

interface ActivationViewProps {
    user: User;
    integrationConfig: IntegrationConfig;
    simulationMode: boolean;
    onLogout: () => void;
}

export const ActivationView: React.FC<ActivationViewProps> = ({ user, integrationConfig, simulationMode, onLogout }) => {
    const [step, setStep] = useState<'INFO' | 'UPLOAD' | 'WAITING'>('INFO');
    const [uploading, setUploading] = useState(false);
    const [proofUrl, setProofUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file, integrationConfig);
            setProofUrl(url);
        } catch (error) {
            alert("Error al subir la imagen. Intenta nuevamente.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!proofUrl) return;
        setUploading(true);
        try {
            await submitActivationProof(user.id, proofUrl, simulationMode);
            setStep('WAITING');
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    // If user already has proof uploaded but is still PENDING
    React.useEffect(() => {
        if (user.activationProofUrl) {
            setStep('WAITING');
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-electro-red/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <ElectroLogo className="h-10 w-auto mx-auto mb-6" />
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Cuenta en Revisión</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                    {step === 'INFO' && (
                        <div className="space-y-6 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                                <Smartphone className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Misión de Activación</h2>
                                <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                                    Para activar tu cuenta de revendedor, necesitamos verificar que eres real.
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 text-left">
                                <p className="text-[10px] font-black text-electro-red uppercase tracking-widest mb-2">Instrucciones:</p>
                                <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                                    <li>Sube un estado a WhatsApp promocionando "Electro Hogar".</li>
                                    <li>Espera a tener al menos <strong className="text-white">10 visualizaciones</strong>.</li>
                                    <li>Toma una captura de pantalla y súbela aquí.</li>
                                </ul>
                            </div>
                            <Button fullWidth onClick={() => setStep('UPLOAD')} className="h-14 bg-white text-slate-950 hover:bg-slate-200 font-black uppercase text-xs tracking-widest">
                                Comenzar Verificación
                            </Button>
                        </div>
                    )}

                    {step === 'UPLOAD' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-black text-white text-center italic uppercase">Subir Evidencia</h3>
                            
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />

                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${proofUrl ? 'border-green-500/50 bg-green-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}
                            >
                                {proofUrl ? (
                                    <img src={proofUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Proof" />
                                ) : (
                                    <div className="text-center p-6">
                                        {uploading ? <Loader2 className="w-10 h-10 text-electro-red animate-spin mx-auto" /> : <Camera className="w-10 h-10 text-slate-500 mx-auto mb-3 group-hover:text-white transition-colors" />}
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Toca para subir Captura</p>
                                    </div>
                                )}
                                {proofUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-bold text-xs uppercase">Cambiar Imagen</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setStep('INFO')} className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800">Atrás</Button>
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={!proofUrl || uploading}
                                    className={`flex-1 font-black uppercase text-xs tracking-widest ${!proofUrl ? 'bg-slate-800 text-slate-500' : 'bg-electro-red text-white'}`}
                                >
                                    {uploading ? 'Enviando...' : 'Confirmar'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'WAITING' && (
                        <div className="space-y-8 text-center animate-scale-up">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <Clock className="w-10 h-10 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Solicitud Enviada</h2>
                                <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                                    Tu líder revisará la captura en breve. Recibirás una notificación cuando tu cuenta esté activa.
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Tiempo estimado</p>
                                <p className="text-lg font-mono text-white font-bold">~2 horas</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <button onClick={onLogout} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 w-full">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};
