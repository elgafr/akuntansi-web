"use client";
import { TransactionCard } from "@/components/jurnal/TransactionCard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AddTransactionTable } from "@/components/jurnal/AddTransactionTable";
import { useTransactions } from "@/contexts/TransactionContext";
import { useEffect, useState } from "react";

export default function JurnalPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { transactions, setTransactions } = useTransactions();
  const [totals, setTotals] = useState({
    totalDebit: 0,
    totalKredit: 0,
    unbalanced: 0
  });

  useEffect(() => {
    // Calculate totals whenever transactions change
    const newTotalDebit = transactions.reduce((sum, t) => sum + (Number(t.debit) || 0), 0);
    const newTotalKredit = transactions.reduce((sum, t) => sum + (Number(t.kredit) || 0), 0);
    const newUnbalanced = newTotalDebit - newTotalKredit;

    setTotals({
      totalDebit: newTotalDebit,
      totalKredit: newTotalKredit,
      unbalanced: newUnbalanced
    });
  }, [transactions]); // Re-run when transactions change

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
        <header className="border-b">
          <div className="flex h-16 items-center px-4 gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>Jurnal</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center space-x-4">
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
        </header>

        <section className="p-6 space-y-6">
          {/* Transaction Cards */}
          <div className="grid grid-cols-3 gap-4">
            <TransactionCard
              title="Total Debit"
              value={totals.totalDebit}
              type="debit"
            />
            <TransactionCard
              title="Total Kredit"
              value={totals.totalKredit}
              type="credit"
            />
            <TransactionCard
              title="Selisih"
              value={Math.abs(totals.unbalanced)}
              type="unbalanced"
              isBalanced={totals.unbalanced === 0}
            />
          </div>

          {/* Add Transaction Table */}
          <AddTransactionTable 
            accounts={accounts}
            transactions={transactions}
            onTransactionsChange={setTransactions}
          />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}