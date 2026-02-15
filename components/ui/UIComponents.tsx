
import React, { useEffect, useState } from 'react';
import { Check, Info, X } from 'lucide-react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 ${className}`}>
    {children}
  </div>
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-bold transition-all duration-200 inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  const variants = {
    primary: "bg-electro-red text-white hover:bg-red-700 shadow-lg shadow-red-200",
    secondary: "bg-slate-900 text-white hover:bg-black",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100"
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'flex w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, type = 'neutral' }: { children?: React.ReactNode, type?: 'success' | 'warning' | 'danger' | 'neutral' | 'premium' }) => {
  const styles = {
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-100",
    premium: "bg-amber-100/50 text-amber-900 border-amber-200"
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block italic ${styles[type]}`}>
      {children}
    </span>
  );
};

export const StatCard = ({ title, value, subtext, trend, icon: Icon }: any) => (
  <Card className="hover:border-slate-300 transition-colors p-4 md:p-5 relative overflow-hidden">
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      {trend !== undefined && (
        <span className={`${trend > 0 ? 'text-green-600' : 'text-red-500'} text-[9px] font-black italic`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="omega-label text-[7px] leading-none mb-1.5">{title}</p>
      <h3 className="omega-header text-2xl text-slate-900 leading-none tracking-tighter italic">{value}</h3>
      <p className="text-[8px] text-slate-400 mt-2 italic font-medium">{subtext}</p>
    </div>
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-50 to-transparent -z-0" />
  </Card>
);

export const ElectroLogo = ({ className = "h-8 w-auto", onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    viewBox="0 0 800 220" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    preserveAspectRatio="xMidYMid meet"
    onClick={onClick}
  >
    <path 
      d="M 420,65 L 245,15 L 70,65 V 195 H 770" 
      stroke="#E60000" 
      strokeWidth="18" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    <text 
      x="100" 
      y="165" 
      fontFamily="'Inter', sans-serif" 
      fontWeight="900" 
      fontStyle="italic" 
      fontSize="85" 
      fill="#E60000" 
      letterSpacing="-0.03em"
    >
      Electro
    </text>
    
    <text 
      x="430" 
      y="165" 
      fontFamily="'Inter', sans-serif" 
      fontWeight="900" 
      fontStyle="italic" 
      fontSize="85" 
      fill="#0F172A" 
      letterSpacing="-0.03em"
    >
      Hogar
    </text>
  </svg>
);

export const Toast: React.FC<{message: string, isVisible: boolean, onClose: () => void, type?: 'success' | 'info' | 'error'}> = ({ message, isVisible, onClose, type = 'info' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-slate-900 text-white border-slate-800',
    info: 'bg-white text-slate-900 border-slate-200',
    error: 'bg-red-50 text-red-900 border-red-200'
  };

  return (
    <div className="fixed bottom-20 md:bottom-10 left-1/2 transform -translate-x-1/2 z-[300] animate-fade-in">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl border ${typeStyles[type]}`}>
        {type === 'success' ? <Check className="w-4 h-4 text-green-400" /> : <Info className="w-4 h-4 text-electro-red" />}
        <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
      </div>
    </div>
  );
};
