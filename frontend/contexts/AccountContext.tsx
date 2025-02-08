"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';


interface Account {
  kodeAkun: string;
  namaAkun: string;
  subKodeAkun?: string;
  subNamaAkun?: string;
  debit: number;
  kredit: number;
  parentId?: string;
  level: number;
}

interface AccountContextType {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    // Load initial data from localStorage if available
    if (typeof window !== 'undefined') {
      const savedAccounts = localStorage.getItem('accounts');
      return savedAccounts ? JSON.parse(savedAccounts) : [];
    }
    return [];
  });

  // Save to localStorage whenever accounts change
  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  return (
    <AccountContext.Provider value={{ accounts, setAccounts }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
} 