import { createContext, useContext, useState, ReactNode } from 'react';

export interface SeedContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  [key: string]: string;
}

export interface SeedList {
  id: string;
  name: string;
  contacts: SeedContact[];
  createdAt: Date;
  updatedAt: Date;
}

interface SeedListContextType {
  seedLists: SeedList[];
  addSeedList: (list: Omit<SeedList, 'id' | 'createdAt' | 'updatedAt'>) => SeedList;
  updateSeedList: (id: string, updates: Partial<Pick<SeedList, 'name' | 'contacts'>>) => void;
  deleteSeedList: (id: string) => void;
}

const SeedListContext = createContext<SeedListContextType | null>(null);

const INITIAL_LISTS: SeedList[] = [
  {
    id: 'sl-1',
    name: 'Internal QA Team',
    contacts: [
      { id: 'c1', email: 'qa1@company.com', firstName: 'Alice', lastName: 'Smith', company: 'Acme' },
      { id: 'c2', email: 'qa2@company.com', firstName: 'Bob', lastName: 'Jones', company: 'Acme' },
    ],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },
];

export const SeedListProvider = ({ children }: { children: ReactNode }) => {
  const [seedLists, setSeedLists] = useState<SeedList[]>(INITIAL_LISTS);

  const addSeedList = (list: Omit<SeedList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newList: SeedList = {
      ...list,
      id: `sl-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSeedLists((prev) => [...prev, newList]);
    return newList;
  };

  const updateSeedList = (id: string, updates: Partial<Pick<SeedList, 'name' | 'contacts'>>) => {
    setSeedLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l))
    );
  };

  const deleteSeedList = (id: string) => {
    setSeedLists((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <SeedListContext.Provider value={{ seedLists, addSeedList, updateSeedList, deleteSeedList }}>
      {children}
    </SeedListContext.Provider>
  );
};

export const useSeedLists = () => {
  const ctx = useContext(SeedListContext);
  if (!ctx) throw new Error('useSeedLists must be used within SeedListProvider');
  return ctx;
};
