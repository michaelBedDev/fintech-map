import { vi } from "vitest";

// Mock de telemetría de Vercel
vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}));

vi.mock("@vercel/speed-insights/react", () => ({
  SpeedInsights: () => null,
}));

// Mock global de Supabase
export const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn()
  },
  from: vi.fn(() => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    };
    // Hacemos que devuelva datos vacíos/exitosos por defecto
    // Las pruebas individuales pueden sobreescribir estos métodos
    const run = async () => ({ data: [], error: null, count: 0 });
    Object.setPrototypeOf(chain, Promise.prototype);
    // Hacemos que sea compatible con promesas asíncronas
    (chain as any).then = (onfulfilled: any) => run().then(onfulfilled);
    return chain as any;
  }),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn()
  })),
  functions: {
    invoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null }))
  }
};

vi.mock("@/services/auth/supabaseClient", () => ({
  supabase: mockSupabase
}));

// Mock simple de Leaflet para evitar fallos de lienzo en jsdom
vi.mock("leaflet", () => {
  return {
    default: {
      geoJSON: vi.fn(() => ({
        getBounds: vi.fn(() => ({
          getCenter: vi.fn(() => ({ lat: 40, lng: -3.7 }))
        }))
      })),
      divIcon: vi.fn((opt) => opt),
      Icon: {
        Default: {
          prototype: {
            _getIconUrl: vi.fn()
          }
        }
      }
    }
  };
});
