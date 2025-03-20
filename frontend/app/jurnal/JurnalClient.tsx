'use client';

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AddTransactionTable } from "@/components/jurnal/AddTransactionTable";
import { Button } from "@/components/ui/button";
import { revalidateJurnal } from './actions';

interface Transaction {
  id: string;
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  akun_id: string;
  debit: number;
  kredit: number;
  perusahaan_id: string;
  sub_akun_id: string | null | undefined;
}

interface JurnalClientProps {
  initialTransactions: Transaction[];
}

export function JurnalClient({ initialTransactions }: JurnalClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({ fullName: "Guest" });

  // Load profile data
  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  const handleTransactionsChange = async (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    // Revalidate cache setelah perubahan
    await revalidateJurnal();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-red-500">{error}</div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

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
                    Jurnal Umum
                  </h1>
                  <h2 className="text-sm ml-6">
                    Let&apos;s check your Journal today
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
                  <div className="text-sm font-medium">{profileData.fullName}</div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-6">
          <AddTransactionTable
            accounts={[]}
            transactions={transactions}
            onTransactionsChange={handleTransactionsChange}
          />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
} 