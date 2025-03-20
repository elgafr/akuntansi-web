"use client";

import { QueryClientWrapper } from "./QueryClientWrapper";
import { AccountProvider } from "@/contexts/AccountContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { Toaster } from "@/components/ui/sonner";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientWrapper>
      <AccountProvider>
        <TransactionProvider>
          {children}
        </TransactionProvider>
      </AccountProvider>
      <Toaster />
    </QueryClientWrapper>
  );
} 