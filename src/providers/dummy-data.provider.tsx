"use client";
import { createContext, useContext, useState } from "react";

type DummyDataContextType = {
  showDummy: boolean;
  setShowDummy: (v: boolean) => void;
};

const DummyDataContext = createContext<DummyDataContextType>({
  showDummy: false,
  setShowDummy: () => {},
});

export function DummyDataProvider({ children }: { children: React.ReactNode }) {
  const [showDummy, setShowDummy] = useState(true);

  return (
    <DummyDataContext.Provider value={{ showDummy, setShowDummy }}>
      {children}
    </DummyDataContext.Provider>
  );
}

export function useDummyData() {
  return useContext(DummyDataContext);
}
