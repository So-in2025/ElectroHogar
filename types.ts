
export type Role = 'ADMIN' | 'LEADER' | 'RESELLER';
export type Environment = 'SIMULATION' | 'PRODUCTION';
export type PublicationStatus = 'PROGRAMMED' | 'PUBLISHED' | 'CANCELLED';

// Removed 'MIGRATION' as it is now part of SETTINGS
export type View = 'DASHBOARD' | 'CATALOG' | 'TEAM' | 'GAMIFICATION' | 'SETTINGS';

export interface GlobalSettingsState {
  markupPercentage: number;
  leaderCommission: number;
  withdrawalsPaused: boolean;
  maintenanceMode: boolean;
  // Branding & Identity
  platformName: string;
  supportPhone: string;
  // Communication Center
  whatsappTemplates: {
    welcome: string;
    sale: string;
    payout: string;
  };
  // Omega Economic AI
  economicAI: {
    enabled: boolean;
    lastCheck: string | null;
    inflationData: number | null; // Último % de inflación detectado
    autoApply: boolean; // Si es true, aplica el markup solo. Si es false, solo sugiere.
    frequencyHours: number; // Cada cuánto chequear (ej: 24h)
  };
}

export interface IntegrationConfig {
  mercadoPago: {
    publicKey: string;
    accessToken: string;
    isActive: boolean;
  };
  firebase: {
    apiKey: string;
    projectId: string;
    isActive: boolean;
  };
  cloudinary: {
    cloudName: string;
    uploadPreset: string;
  };
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  level: number;
  points: number;
  email: string;
  wallet: number; // Saldo pendiente de cobro
  // Extended Profile Data
  phone?: string;
  cbu?: string; // Para retiros
  alias?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  priceList: number;
  priceReseller: number;
  stock: number;
  category: string;
  image: string;
  isPromo?: boolean;
  specs?: Record<string, string>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  environment: Environment;
  proofUrl?: string; // Link al comprobante (Drive/Cloudinary)
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  salesThisMonth: number;
  activePromos: number;
  lastActive: string;
  avatar: string;
  points: number;
  wallet: number; // Comisiones acumuladas sin pagar
  cbu?: string;
  alias?: string;
  phone?: string; // Nuevo campo para WhatsApp
  email?: string; // Added field for communication
  leaderId?: string; // ID del líder asignado (si es revendedor)
  // New Management Fields
  customCommissionRate?: number; // Override del % global
  accumulatedBonuses?: number; // Bonos extra otorgados
  joinDate?: string;
}

export interface Client {
  id: string;
  name: string;
  status: 'POTENTIAL' | 'ACTIVE' | 'VIP' | 'BAD_DEBT';
  lastPurchase: string;
  totalSpent: number;
  phone: string;
  email?: string;
  address?: string;
  avatar: string;
  interestedIn: string;
  resellerId?: string; // ID del revendedor que gestiona la cuenta
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: 'trophy' | 'star' | 'zap' | 'target';
  unlocked: boolean;
  progress: number;
  dateUnlocked?: string;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  image: string;
  type: 'DIGITAL' | 'PHYSICAL' | 'CASH';
  description?: string;
}

export interface Coupon {
  id: string;
  code: string;
  rewardTitle: string;
  value: string; // Ej: "$10.000 OFF" o "Envío Gratis"
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  expiryDate: string;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardXP: number;
  progress: number;
  target: number;
  type: 'SALES_COUNT' | 'SALES_VOLUME' | 'NEW_CLIENTS';
  deadline: string; // Ej: "Termina en 2 días"
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'SALE' | 'SYSTEM' | 'PROMO' | 'ALERT';
  read: boolean;
}
