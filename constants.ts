
import { User, Product, TeamMember, Achievement, Reward, Notification, Client, AuditLog } from './types';

// --- USUARIOS DE LOGIN (AUTH) ---
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Matías (Admin)',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    level: 99,
    points: 10000,
    email: 'matias@electrohogar.com',
    wallet: 0,
    phone: '5491155550001'
  },
  {
    id: 'u2',
    name: 'Laura (Líder)',
    role: 'LEADER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    level: 15,
    points: 4500,
    email: 'laura.leader@gmail.com',
    wallet: 150000, 
    cbu: '0000003123123123',
    alias: 'LAURA.VENTAS.MP',
    phone: '5491155550002'
  },
  {
    id: 'u3',
    name: 'Carlos (Revendedor)',
    role: 'RESELLER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    level: 4,
    points: 1200,
    email: 'carlos.vendedor@hotmail.com',
    wallet: 45000, 
    cbu: '000000123123123123',
    alias: 'CARLOS.PESOS',
    phone: '5491155550003',
    // Carlos reporta a Laura
    // leaderId no va en User type base necesariamente para auth, pero sí en TeamMember. 
    // Sin embargo, para consistencia global simulada:
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'SMART-55-4K',
    name: 'Smart TV 55" 4K UHD Samsung',
    description: 'Resolución Crystal 4K, Diseño AirSlim, Procesador Crystal 4K.',
    priceList: 850000,
    priceReseller: 720000,
    stock: 12,
    category: 'Televisores',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    isPromo: true,
    specs: { 'Pantalla': '55 pulgadas' }
  },
  {
    id: 'p2',
    sku: 'LAV-AUTO-8KG',
    name: 'Lavarropas Automático Drean 8kg',
    description: 'Carga frontal, inverter, 1200 RPM, eficiencia A+++.',
    priceList: 920000,
    priceReseller: 780000,
    stock: 5,
    category: 'Lavado',
    image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=800&q=80',
    specs: { 'Capacidad': '8 kg' }
  },
  {
    id: 'p3',
    sku: 'AUDIO-WH-1000',
    name: 'Auriculares Sony WH-1000XM5',
    description: 'Noise Cancelling líder en la industria, 30 horas de batería, sonido Hi-Res.',
    priceList: 550000,
    priceReseller: 460000,
    stock: 25,
    category: 'Pequeños',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    specs: { 'Tipo': 'Over-ear' }
  },
  {
    id: 'p4',
    sku: 'BEAUTY-DRYER-GBS',
    name: 'Secador de Pelo Profesional GBS',
    description: 'Motor AC de alto rendimiento.',
    priceList: 145000,
    priceReseller: 110000,
    stock: 40,
    category: 'Pequeños',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
    specs: { 'Potencia': '2200W' }
  },
  {
    id: 'p5',
    sku: 'JBL-FLIP-6',
    name: 'Parlante JBL Flip 6',
    description: 'Resistente al agua IP67, 12 horas de reproducción.',
    priceList: 180000,
    priceReseller: 145000,
    stock: 15,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?auto=format&fit=crop&w=800&q=80',
    specs: { 'Potencia': '20W' }
  },
  {
    id: 'p6',
    sku: 'IPHONE-15-PRO',
    name: 'iPhone 15 Pro Titanium',
    description: 'Chip A17 Pro, diseño de titanio, botón de acción.',
    priceList: 2100000,
    priceReseller: 1900000,
    stock: 8,
    category: 'Celulares',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    isPromo: true,
    specs: { 'Memoria': '256GB' }
  }
];

export const SALES_TRENDS = [
  { date: 'Lun', production: 400000, simulation: 650000 },
  { date: 'Mar', production: 300000, simulation: 420000 },
  { date: 'Mie', production: 200000, simulation: 890000 },
  { date: 'Jue', production: 278000, simulation: 310000 },
  { date: 'Vie', production: 189000, simulation: 520000 },
  { date: 'Sab', production: 239000, simulation: 740000 },
  { date: 'Dom', production: 349000, simulation: 910000 },
];

// --- ESTRUCTURA DE EQUIPO SIMULADA (Sincronizada con MOCK_USERS) ---
export const MOCK_TEAM: TeamMember[] = [
  // 1. LAURA (LÍDER - Login u2)
  {
    id: 'u2', // Mismo ID que en auth
    name: 'Laura (Líder)',
    role: 'LEADER',
    status: 'ACTIVE',
    salesThisMonth: 4500000,
    activePromos: 4,
    lastActive: 'Ahora',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 4500,
    wallet: 150000,
    alias: 'LAURA.VENTAS.MP',
    phone: '5491155550002',
    email: 'laura.leader@gmail.com'
  },
  
  // 2. EQUIPO DE LAURA
  {
    id: 'u3', // CARLOS (Revendedor - Login u3)
    name: 'Carlos (Revendedor)',
    role: 'RESELLER',
    status: 'ACTIVE',
    salesThisMonth: 1250000,
    activePromos: 2,
    lastActive: 'Ahora',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 1200,
    wallet: 45000,
    alias: 'CARLOS.PESOS',
    leaderId: 'u2', // Asignado a Laura
    phone: '5491155550003',
    email: 'carlos.vendedor@hotmail.com'
  },
  {
    id: 'tm_laura_1',
    name: 'Ana María Sosa',
    role: 'RESELLER',
    status: 'ACTIVE',
    salesThisMonth: 890000,
    activePromos: 1,
    lastActive: 'Hace 15m',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 1800,
    wallet: 32000,
    alias: 'ANA.SOSA.BBVA',
    leaderId: 'u2', // Asignado a Laura
    phone: '5491155552002'
  },
  {
    id: 'tm_laura_2',
    name: 'Roberto Gómez',
    role: 'RESELLER',
    status: 'INACTIVE',
    salesThisMonth: 0,
    activePromos: 0,
    lastActive: 'Hace 5d',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 250,
    wallet: 0,
    alias: 'ROBERTO.G',
    leaderId: 'u2', // Asignado a Laura
    phone: '5491155552001'
  },

  // 3. OTROS LÍDERES (Para que el Admin vea variedad)
  {
    id: 'tm_lead_2',
    name: 'Martín Vega',
    role: 'LEADER',
    status: 'ACTIVE',
    salesThisMonth: 3200000,
    activePromos: 2,
    lastActive: 'En línea',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 7200,
    wallet: 120000,
    alias: 'VEGA.IMPORT',
    phone: '5491155551002'
  },
  {
    id: 'tm_lead_3',
    name: 'Sofía Conti',
    role: 'LEADER',
    status: 'ACTIVE',
    salesThisMonth: 5100000,
    activePromos: 5,
    lastActive: 'Hace 1d',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 9800,
    wallet: 210000,
    alias: 'SOFI.CONTI.MP',
    phone: '5491155551003'
  },

  // 4. OTROS REVENDEDORES (De otros líderes)
  {
    id: 'tm_other_1',
    name: 'Julieta Rivas',
    role: 'RESELLER',
    status: 'ACTIVE',
    salesThisMonth: 2100000,
    activePromos: 1,
    lastActive: 'En línea',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 3200,
    wallet: 95000,
    alias: 'JULI.RIVAS',
    leaderId: 'tm_lead_2',
    phone: '5491155552003'
  },
  {
    id: 'tm_other_2',
    name: 'Fernando Torres',
    role: 'RESELLER',
    status: 'ACTIVE',
    salesThisMonth: 3400000,
    activePromos: 6,
    lastActive: 'Hace 5m',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 4500,
    wallet: 155000,
    alias: 'FER.TORRES.VENTAS',
    leaderId: 'tm_lead_3',
    phone: '5491155552006'
  },
  // HUÉRFANO (Para pruebas de admin)
  {
    id: 'tm_orphan_1',
    name: 'Valentina P.',
    role: 'RESELLER',
    status: 'INACTIVE',
    salesThisMonth: 0,
    activePromos: 0,
    lastActive: 'Hace 20d',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
    points: 100,
    wallet: 1200,
    alias: 'VALEN.P',
    phone: '5491155553001'
  }
];

export const MOCK_CLIENTS: Client[] = [
  // --- CLIENTES DE CARLOS (u3) ---
  { id: 'c1', name: 'Mariana López', status: 'VIP', lastPurchase: '20 Oct - TV 55"', totalSpent: 850000, phone: '+54 9 11 3322-1144', email: 'mariana.l@gmail.com', address: 'Av. Libertador 2200, CABA', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80', interestedIn: 'Lavado', resellerId: 'u3' },
  { id: 'c2', name: 'Juan Carlos Ibarra', status: 'POTENTIAL', lastPurchase: 'N/A', totalSpent: 0, phone: '+54 9 11 2233-4455', email: 'juancarlos@hotmail.com', address: 'San Martín 120, Ramos Mejía', avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80', interestedIn: 'Audio', resellerId: 'u3' },
  { id: 'c3', name: 'Restaurante El Faro', status: 'ACTIVE', lastPurchase: '12 Nov - Audio System', totalSpent: 550000, phone: '+54 9 223 555-0000', email: 'elfaro@restaurante.com', address: 'La Costa 100, Mar del Plata', avatar: 'https://ui-avatars.com/api/?name=El+Faro&background=F59E0B&color=fff', interestedIn: 'Audio', resellerId: 'u3' },

  // --- CLIENTES DE LAURA (u2) - VENTAS DIRECTAS ---
  { id: 'c4', name: 'Estudio Jurídico MM', status: 'VIP', lastPurchase: '15 Nov - 3x Aires', totalSpent: 2400000, phone: '+54 9 11 5566-7788', email: 'admin@estudiomm.com', address: 'Talcahuano 450, CABA', avatar: 'https://ui-avatars.com/api/?name=Estudio+MM&background=0D8ABC&color=fff', interestedIn: 'Climatización', resellerId: 'u2' },
  { id: 'c5', name: 'Hotel Las Cumbres', status: 'VIP', lastPurchase: '01 Nov - 10x Frigobares', totalSpent: 3500000, phone: '+54 9 294 445-5555', email: 'compras@lascumbres.com', address: 'Bustillo km 5, Bariloche', avatar: 'https://ui-avatars.com/api/?name=Hotel+Cumbres&background=random', interestedIn: 'Pequeños', resellerId: 'u2' },

  // --- CLIENTES DE ANA (tm_laura_1) - PARA QUE LAURA VEA EN SU RED ---
  { id: 'c6', name: 'Gimnasio FitLife', status: 'VIP', lastPurchase: '20 Nov - 2x TV 55"', totalSpent: 1700000, phone: '+54 9 11 1234-5678', email: 'info@fitlife.com', address: 'Cabildo 3000, CABA', avatar: 'https://ui-avatars.com/api/?name=Fit+Life&background=10B981&color=fff', interestedIn: 'Televisores', resellerId: 'tm_laura_1' },
  
  // --- OTROS (Sistema Global) ---
  { id: 'c7', name: 'Marta Quiroga', status: 'BAD_DEBT', lastPurchase: '15 Sep - Lavarropas', totalSpent: 920000, phone: '+54 9 261 555-9999', email: 'marta.q@gmail.com', address: 'Las Heras 400, Mendoza', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80', interestedIn: 'Lavado', resellerId: 'tm_other_1' },
  { id: 'c8', name: 'Tech Solutions SA', status: 'VIP', lastPurchase: '01 Dic - 5x iPhone 15', totalSpent: 10500000, phone: '+54 9 11 4444-4444', email: 'compras@techsolutions.com', address: 'Puerto Madero Dock 4, CABA', avatar: 'https://ui-avatars.com/api/?name=Tech+Sol&background=000&color=fff', interestedIn: 'Celulares', resellerId: 'tm_other_2' },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: 'Primera Venta',
    description: 'Realizaste tu primera venta.',
    iconName: 'star',
    unlocked: true,
    progress: 100
  }
];

export const MOCK_REWARDS: Reward[] = [
  {
    id: 'r1',
    title: 'Bono en Efectivo $10k',
    cost: 2000,
    image: 'https://images.unsplash.com/photo-1554672723-b208dc8513c6?auto=format&fit=crop&w=400&q=80',
    type: 'CASH'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Comisiones Pendientes',
    message: 'Tienes $150.000 acumulados.',
    time: 'Hace 5 min',
    type: 'ALERT',
    read: false
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'log-1',
        userId: 'u1',
        action: 'PAYOUT_PROCESSED',
        details: 'Liquidación a Laura Martínez por $85,000',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Hace 2 horas
        environment: 'SIMULATION',
        proofUrl: 'comprobante_mock_1.pdf'
    },
    {
        id: 'log-2',
        userId: 'u1',
        action: 'MEMBER_ADDED',
        details: 'Alta de nuevo revendedor: Pablo Estévez',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Hace 1 día
        environment: 'SIMULATION'
    },
    {
        id: 'log-3',
        userId: 'u3', // CARLOS VENDIÓ
        action: 'SALE_REGISTERED',
        details: 'Venta #9921 - Smart TV Samsung 55"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Hace 2 días
        environment: 'SIMULATION'
    },
    {
        id: 'log-4',
        userId: 'u1',
        action: 'SETTINGS_UPDATE',
        details: 'Actualización de Markup Global a 15%',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // Hace 3 días
        environment: 'SIMULATION'
    }
];
