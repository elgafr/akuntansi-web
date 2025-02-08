"use client";
import { useState } from "react";
import { TransactionCard } from "@/components/jurnal/TransactionCard";
import { TransactionTable } from "@/components/jurnal/TransactionTable";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import type { Transactions } from "@/components/ui/custom/form-modal/account.config";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AddTransactionTable } from "@/components/jurnal/AddTransactionTable";
import { AddAccountTable } from "@/components/jurnal/AddAccountTable";

interface Transaction {
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
}

interface Account {
  kodeAkun: string;
  namaAkun: string;
  debit: number;
  kredit: number;
  subAccounts?: {
    namaSubAkun: string;
    kodeAkunInduk: string;
    kodeSubAkun: string;
    debit: string | number;
    kredit: string | number;
  }[];
}

export default function JurnalPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Menghitung total untuk cards
  const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalKredit = transactions.reduce((sum, t) => sum + (t.kredit || 0), 0);
  const unbalanced = totalDebit - totalKredit;

  // Handler untuk menambah transaksi baru
  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <h1 className="text-2xl font-bold ml-6 text-black">
                    Dashboard
                  </h1>
                  <h2 className="text-sm ml-6">
                    Let&apos;s check your Dashboard today
                  </h2>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                </Avatar>
                <div className="text-left mr-12">
                  <div className="text-sm font-medium">Arthur</div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-6 space-y-6">
          {/* Transaction Cards */}
          <div className="grid grid-cols-3 gap-4">
            <TransactionCard
              title="Total Debit"
              value={`Rp ${totalDebit.toLocaleString()}`}
              type="debit"
            />
            <TransactionCard
              title="Total Credit"
              value={`Rp ${totalKredit.toLocaleString()}`}
              type="credit"
            />
            <TransactionCard
              title="Unbalanced"
              value={`Rp ${Math.abs(unbalanced).toLocaleString()}`}
              type="unbalanced"
            />
          </div>

          {/* Transaction Table */}
          <TransactionTable
            transactions={transactions}
            onTransactionsChange={setTransactions}
          />
          
          <AddAccountTable 
            accounts={accounts} 
            onAccountsChange={setAccounts} 
          />
          <AddTransactionTable 
            accounts={accounts || []}
            transactions={transactions}
            onTransactionsChange={setTransactions}
          />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}