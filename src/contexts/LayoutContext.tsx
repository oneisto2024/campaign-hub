import React, { createContext, useContext, useState, useEffect } from 'react';

type LayoutType = 'horizontal' | 'vertical';

interface LayoutContextType {
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [layout, setLayoutState] = useState<LayoutType>(() => {
    const saved = localStorage.getItem('crm-layout');
    return (saved as LayoutType) || 'vertical';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout);
    localStorage.setItem('crm-layout', newLayout);
  };

  useEffect(() => {
    const saved = localStorage.getItem('crm-layout');
    if (saved) {
      setLayoutState(saved as LayoutType);
    }
  }, []);

  return (
    <LayoutContext.Provider value={{ layout, setLayout, sidebarOpen, setSidebarOpen }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
