// context/province-context.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface ProvinceContextType {
  selectedProvince: string | null;
  setSelectedProvince: (name: string | null) => void;
}

const ProvinceContext = createContext<ProvinceContextType | undefined>(undefined);

export function ProvinceProvider({ children }: { children: ReactNode }) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  return (
    <ProvinceContext.Provider value={{ selectedProvince, setSelectedProvince }}>
      {children}
    </ProvinceContext.Provider>
  );
}

export const useProvince = () => {
  const context = useContext(ProvinceContext);
  if (!context) throw new Error("useProvince must be used within ProvinceProvider");
  return context;
};
