import React, { createContext, useContext, useState } from 'react';

type PointContextType = {
  points: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
};

const PointContext = createContext<PointContextType | undefined>(undefined);

export function PointProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState(1250);

  const addPoints = (amount: number) => {
    setPoints((prev) => prev + amount);
  };

  const spendPoints = (amount: number) => {
    if (points < amount) {
      return false;
    }
    setPoints((prev) => prev - amount);
    return true;
  };

  return (
    <PointContext.Provider value={{ points, addPoints, spendPoints }}>
      {children}
    </PointContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointContext);
  if (!context) {
    throw new Error('usePoints は PointProvider の中で使ってください');
  }
  return context;
}