"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { fetchCategory, fetchCountries, Prop } from "@/services/hederService";

type MenuContextType = {
  categories: Prop[];
  countries: Prop[];
  loading: boolean;
};

const MenuContext = createContext<MenuContextType>({
  categories: [],
  countries: [],
  loading: true,
});

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Prop[]>([]);
  const [countries, setCountries] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategory(), fetchCountries()])
      .then(([cats, ctrs]) => {
        setCategories(cats);
        setCountries(ctrs);
      })
      .catch((err) => console.error("Lỗi load menu:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MenuContext.Provider value={{ categories, countries, loading }}>
      {children}
    </MenuContext.Provider>
  );
};
