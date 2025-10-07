"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SearchContextType {
  search: string;
  setSearch: (value: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    console.log("🔍 Nouveau terme de recherche :", search);
  }, [search]);

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook personnalisé pour accéder plus facilement au contexte
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch doit être utilisé à l'intérieur d'un SearchProvider");
  }
  return context;
};