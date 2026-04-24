"use client";
import { createContext, useContext, useState, useEffect } from "react";

type DummyDataContextType = {
  showDummy: boolean;
  setShowDummy: (v: boolean) => void;
};

const DummyDataContext = createContext<DummyDataContextType>({
  showDummy: true,
  setShowDummy: () => {},
});

export function DummyDataProvider({ children }: { children: React.ReactNode }) {
  const [showDummy, setShowDummyState] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("vairal-dummy-mode");
    if (stored !== null) {
      setShowDummyState(stored === "true");
    } else {
      // Initialize if missing
      window.localStorage.setItem("vairal-dummy-mode", "true");
    }
  }, []);

  const setShowDummy = (v: boolean) => {
    setShowDummyState(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("vairal-dummy-mode", String(v));
      window.dispatchEvent(new Event("vairal-dummy-toggled"));
    }
  };

  return (
    <DummyDataContext.Provider value={{ showDummy, setShowDummy }}>
      {children}
    </DummyDataContext.Provider>
  );
}

export function useDummyData() {
  return useContext(DummyDataContext);
}
