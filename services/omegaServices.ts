
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, updateDoc, query, where, getDoc, increment } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { GoogleGenAI, Type } from "@google/genai"; // IMPORTACIÓN CORRECTA
import { 
  MOCK_PRODUCTS, MOCK_USERS, MOCK_TEAM, MOCK_CLIENTS, 
  MOCK_NOTIFICATIONS, MOCK_AUDIT_LOGS, SALES_TRENDS 
} from '../constants';
import { User, Product, IntegrationConfig, AuditLog, TeamMember, Client, Coupon, Reward } from '../types';

// --- CONFIGURACIÓN E INICIALIZACIÓN ---
let db: any = null;
let auth: any = null;

export const initializeServices = (config: IntegrationConfig) => {
  if (config.firebase.isActive && config.firebase.apiKey) {
    try {
      const app = initializeApp({
        apiKey: config.firebase.apiKey,
        projectId: config.firebase.projectId,
        authDomain: `${config.firebase.projectId}.firebaseapp.com`,
        storageBucket: `${config.firebase.projectId}.appspot.com`,
      });
      db = getFirestore(app);
      auth = getAuth(app);
      console.log("🔥 Firebase Conectado [Producción]");
    } catch (e) {
      console.error("Error iniciando Firebase", e);
    }
  }
};

// --- SERVICIO DE IMÁGENES (CLOUDINARY) ---
export const uploadToCloudinary = async (file: File, config: IntegrationConfig): Promise<string> => {
  if (!config.cloudinary.cloudName || !config.cloudinary.uploadPreset) {
    throw new Error("Faltan credenciales de Cloudinary");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.cloudinary.uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error subiendo imagen", error);
    throw error;
  }
};

// --- SERVICIO DE DATOS (PRODUCTOS) ---
export const fetchProducts = async (isSimulation: boolean): Promise<Product[]> => {
  if (isSimulation) return MOCK_PRODUCTS;
  
  if (!db) return []; 
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (e) {
    console.error("Error fetching products", e);
    return [];
  }
};

export const saveProduct = async (product: Product, isSimulation: boolean): Promise<void> => {
  if (isSimulation) {
      console.log("[SIM] Producto guardado:", product.name);
      return; 
  }
  
  if (!db) throw new Error("Base de datos no conectada");
  try {
    // Si el producto tiene ID, usamos setDoc (upsert), si no, addDoc genera ID
    if (product.id && !product.id.startsWith('new-')) {
        await setDoc(doc(db, "products", product.id), product);
    } else {
        const { id, ...data } = product; // Removemos ID temporal si existe
        await addDoc(collection(db, "products"), data);
    }
  } catch (e) {
    console.error("Error saving product", e);
    throw e;
  }
};

// --- SERVICIO DE EQUIPO Y USUARIOS ---
export const fetchTeam = async (isSimulation: boolean): Promise<TeamMember[]> => {
  if (isSimulation) return MOCK_TEAM;
  
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    // Mapeamos docs de usuarios a estructura TeamMember
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            name: data.name,
            role: data.role,
            status: data.status || 'ACTIVE',
            salesThisMonth: data.salesThisMonth || 0,
            activePromos: data.activePromos || 0,
            lastActive: data.lastActive || 'Reciente',
            avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.name}`,
            points: data.points || 0,
            wallet: data.wallet || 0,
            email: data.email,
            phone: data.phone,
            leaderId: data.leaderId,
            alias: data.alias
        } as TeamMember;
    });
  } catch (e) {
    console.error("Error fetching team", e);
    return [];
  }
};

export const createTeamMember = async (member: TeamMember, isSimulation: boolean): Promise<void> => {
    if (isSimulation) {
        console.log("[SIM] Miembro creado:", member.name);
        return;
    }

    if (!db) throw new Error("Base de datos no conectada");

    try {
        // En un flujo real, aquí crearíamos el Auth User via Cloud Function.
        // Como estamos en frontend, solo creamos el documento en Firestore.
        // El ID 'new-...' debe ser removido o reemplazado por el de Auth si fuera posible.
        // Usamos addDoc para generar un ID automático de Firestore si el ID es temporal.
        
        const { id, ...memberData } = member;
        await addDoc(collection(db, "users"), {
            ...memberData,
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error creando miembro", e);
        throw e;
    }
};

export const updateUserProfile = async (userId: string, data: Partial<User>, isSimulation: boolean): Promise<void> => {
    if (isSimulation) {
        console.log("[SIM] Perfil actualizado:", userId, data);
        return;
    }

    if (!db) throw new Error("Base de datos no conectada");

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, data);
    } catch (e) {
        console.error("Error actualizando perfil", e);
        throw e;
    }
};

// --- SERVICIO DE VENTAS Y COMISIONES (CORE) ---
export const registerSale = async (
    resellerId: string, 
    product: Product, 
    salePrice: number, 
    commissionRate: number, // Porcentaje (ej: 5 para 5%)
    isSimulation: boolean
): Promise<{ commission: number, auditId: string }> => {
    
    // Calcular comisión
    const commission = salePrice * (commissionRate / 100);
    const pointsEarned = Math.floor(salePrice / 1000); // 1 punto por cada $1000

    if (isSimulation) {
        console.log(`[SIM] Venta registrada. Revendedor: ${resellerId}, Comisión: $${commission}, Puntos: ${pointsEarned}`);
        return { commission, auditId: `sim-sale-${Date.now()}` };
    }

    if (!db) throw new Error("DB No conectada");

    try {
        // 1. Registrar Venta en colección 'sales'
        const saleRef = await addDoc(collection(db, "sales"), {
            resellerId,
            productId: product.id,
            productName: product.name,
            amount: salePrice,
            commission,
            timestamp: new Date().toISOString(),
            status: 'COMPLETED'
        });

        // 2. Actualizar Usuario (Wallet + Puntos + SalesThisMonth)
        const userRef = doc(db, "users", resellerId);
        await updateDoc(userRef, {
            wallet: increment(commission),
            points: increment(pointsEarned),
            salesThisMonth: increment(salePrice)
        });

        // 3. Crear Log Auditoría
        const auditLog: AuditLog = {
            id: `audit-${saleRef.id}`,
            userId: resellerId,
            action: 'SALE_REFERRAL',
            details: `Venta Referida: ${product.name} (SKU: ${product.sku}). Comisión: $${commission}`,
            timestamp: new Date().toISOString(),
            environment: 'PRODUCTION'
        };
        await addDoc(collection(db, "audit_logs"), auditLog);

        return { commission, auditId: auditLog.id };

    } catch (e) {
        console.error("Error registrando venta", e);
        throw e;
    }
};

// --- SERVICIO DE CLIENTES ---
export const fetchClients = async (isSimulation: boolean): Promise<Client[]> => {
  if (isSimulation) return MOCK_CLIENTS;
  
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  } catch (e) {
    return [];
  }
};

export const createClient = async (client: Client, isSimulation: boolean): Promise<void> => {
    if (isSimulation) {
        console.log("[SIM] Cliente creado:", client.name);
        return;
    }

    if (!db) throw new Error("DB No conectada");

    try {
        const { id, ...clientData } = client;
        await addDoc(collection(db, "clients"), {
            ...clientData,
            createdAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error creando cliente", e);
        throw e;
    }
};

// --- SERVICIO DE AUDITORÍA ---
export const fetchAuditLogs = async (isSimulation: boolean): Promise<AuditLog[]> => {
  if (isSimulation) return MOCK_AUDIT_LOGS;
  
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "audit_logs"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  } catch (e) {
    return [];
  }
};

// --- SERVICIO DE PAGOS Y AUDITORÍA ---
export const registerPayout = async (
  adminUser: User, 
  targetUser: TeamMember, 
  amount: number, 
  proofUrl: string, 
  isSimulation: boolean
): Promise<void> => {
  if (isSimulation) return;

  if (!db) throw new Error("DB No conectada");

  // 1. Crear Log de Auditoría
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    userId: adminUser.id,
    action: 'PAYOUT_PROCESSED',
    details: `Liquidación a ${targetUser.name} por $${amount}`,
    timestamp: new Date().toISOString(),
    environment: 'PRODUCTION',
    proofUrl: proofUrl
  };
  
  await addDoc(collection(db, "audit_logs"), newLog);

  // 2. Descontar saldo de la billetera del usuario destino
  // Nota: Esto asume que el usuario existe en la colección users con ese ID
  const userRef = doc(db, "users", targetUser.id);
  
  // Verificamos si existe antes de updatear para evitar crashes en datos corruptos
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
      await updateDoc(userRef, {
        wallet: (targetUser.wallet || 0) - amount
      });
  } else {
      console.warn("Usuario destino no encontrado en BD, solo se guardó log.");
  }
};

// --- SERVICIO DE GAMIFICACIÓN (CANJES) ---
export const redeemReward = async (
    user: User,
    reward: Reward,
    isSimulation: boolean
): Promise<{ coupon: Coupon, remainingPoints: number }> => {
    
    // Generar código aleatorio
    const code = `OMEGA-${reward.type === 'CASH' ? 'CASH' : 'PROMO'}-${Math.floor(1000 + Math.random() * 9000)}`;
    const value = reward.type === 'CASH' ? `$${reward.cost / 2}` : reward.title; // Valor simulado del premio

    const newCoupon: Coupon = {
        id: `cpn-${Date.now()}`,
        code: code,
        rewardTitle: reward.title,
        value: value,
        status: 'ACTIVE',
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 días
        createdAt: new Date().toISOString()
    };

    if (isSimulation) {
        console.log(`[SIM] Canje realizado: ${reward.title} por ${reward.cost} pts`);
        return { 
            coupon: newCoupon, 
            remainingPoints: (user.points || 0) - reward.cost 
        };
    }

    if (!db) throw new Error("DB No conectada");

    try {
        const userRef = doc(db, "users", user.id);
        
        // Descontar puntos
        await updateDoc(userRef, {
            points: increment(-reward.cost)
        });

        // Guardar cupón en colección 'coupons'
        await addDoc(collection(db, "coupons"), {
            ...newCoupon,
            userId: user.id
        });

        // Log
        await addDoc(collection(db, "audit_logs"), {
            id: `audit-redeem-${Date.now()}`,
            userId: user.id,
            action: 'REWARD_REDEEMED',
            details: `Canje de premio: ${reward.title} (-${reward.cost} pts)`,
            timestamp: new Date().toISOString(),
            environment: 'PRODUCTION'
        });

        return {
            coupon: newCoupon,
            remainingPoints: (user.points || 0) - reward.cost
        };

    } catch (e) {
        console.error("Error canjeando premio", e);
        throw e;
    }
};

// --- OMEGA ECONOMIC AI (GEMINI) ---
// Requiere apiKey en process.env.API_KEY o pasarla por config si es frontend-only (riesgo de seguridad si no es via proxy)
// Para esta demo asumimos que la Key está en process.env o en la config simulada
export const getInflationRecommendation = async (currentMarkup: number): Promise<{
    inflationRate: number;
    recommendedMarkup: number;
    reasoning: string;
}> => {
    // NOTA: En un entorno real de producción, la API Key no debe estar expuesta en el frontend.
    // Debería usarse un Cloud Function. Para el Blueprint, simulamos o usamos si está disponible.
    // Usaremos process.env.API_KEY como marca el estándar.
    
    // Si no hay key, retornamos mock inteligente
    if (!process.env.API_KEY) {
        console.warn("Gemini API Key missing. Returning simulation.");
        return new Promise(resolve => setTimeout(() => resolve({
            inflationRate: 4.2,
            recommendedMarkup: currentMarkup + 2,
            reasoning: "[SIMULACIÓN] Basado en IPC INDEC (Estimado). La inflación del último mes sugiere un ajuste correctivo para mantener márgenes operativos."
        }), 2000));
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Usamos Flash para velocidad + Google Search para datos frescos
        const model = "gemini-3-flash-preview"; 
        
        const response = await ai.models.generateContent({
            model: model,
            contents: `Actúa como un economista experto en retail argentino. 
            Busca la inflación mensual más reciente de Argentina (INDEC o estimaciones privadas serias).
            El markup actual de la tienda es ${currentMarkup}%.
            
            Retorna un JSON con:
            - inflationRate: número (ej: 4.5)
            - recommendedMarkup: número (sugerencia de nuevo markup total para no perder contra la inflación)
            - reasoning: breve explicación de 1 frase citando la fuente y fecha.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        inflationRate: { type: Type.NUMBER },
                        recommendedMarkup: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    }
                }
            }
        });

        const data = JSON.parse(response.text || "{}");
        return {
            inflationRate: data.inflationRate || 0,
            recommendedMarkup: data.recommendedMarkup || currentMarkup,
            reasoning: data.reasoning || "No se pudo obtener el razonamiento."
        };

    } catch (e) {
        console.error("Error consultando Omega AI", e);
        throw e;
    }
};

// --- AUTHENTICATION ---
export const loginUser = async (email: string, pass: string, isSimulation: boolean): Promise<User | null> => {
  if (isSimulation) {
    // Mock Login Logic
    // Intentamos buscar coincidencia exacta
    const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (mockUser) return mockUser;
    
    // Si no coincide, pero es un email válido, devolvemos un rol basado en el email para facilitar pruebas
    if (email.includes('admin')) return MOCK_USERS[0];
    if (email.includes('lider') || email.includes('leader')) return MOCK_USERS[1];
    if (email.includes('vendo') || email.includes('reseller')) return MOCK_USERS[2];

    return null; 
  }

  if (!auth) throw new Error("Auth no configurado");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    // Buscar datos extra del usuario en Firestore
    // Asumimos que el documento del usuario tiene el mismo ID que el UID de Auth
    const userRef = doc(db, "users", userCredential.user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userCredential.user.uid, ...userDoc.data() } as User;
    } else {
      // Fallback si el usuario está en Auth pero no tiene documento en 'users'
      // Esto puede pasar si se crea manualmente en consola Firebase
      return {
          id: userCredential.user.uid,
          name: userCredential.user.email?.split('@')[0] || 'Usuario',
          email: userCredential.user.email || '',
          role: 'RESELLER', // Rol por defecto
          level: 1,
          points: 0,
          wallet: 0,
          avatar: `https://ui-avatars.com/api/?name=${userCredential.user.email}`
      };
    }
  } catch (e) {
    console.error("Login error", e);
    throw e;
  }
};
