"use client";
import { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AddTransactionTable } from "@/components/jurnal/AddTransactionTable";
import { Button } from "@/components/ui/button";
import { useJurnal, usePostJurnal } from "@/hooks/useJurnal";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams } from 'next/navigation';

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

export default function JurnalPage() {
  const [profileData, setProfileData] = useState({ fullName: "Guest" });
  const queryClient = useQueryClient();
  
  const { data: jurnalData, isLoading, error } = useJurnal();
  const { mutate: postJurnal, isPending: isPosting } = usePostJurnal();
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Force refetch on navigation
  useEffect(() => {
    // Refetch data when navigating back to jurnal page
    queryClient.invalidateQueries({ queryKey: ['jurnal'] });
    queryClient.invalidateQueries({ queryKey: ['neracaLajur'] });
  }, [pathname, searchParams, queryClient]);

  // Transform data dengan pengecekan null/undefined
  const transactions: Transaction[] = useMemo(() => {
    if (!jurnalData) return [];
    
    return jurnalData
      .filter(entry => entry && entry.akun) // Filter data yang tidak valid
      .map(entry => ({
        id: entry.id || '',
        date: entry.tanggal || '',
        documentType: entry.bukti || '',
        description: entry.keterangan || '',
        namaAkun: entry.akun?.nama || '',
        kodeAkun: entry.akun?.kode?.toString() || '',
        akun_id: entry.akun_id || '',
        debit: entry.debit || 0,
        kredit: entry.kredit || 0,
        perusahaan_id: entry.perusahaan_id || '',
        sub_akun_id: entry.sub_akun_id || null,
      }));
  }, [jurnalData]);

  // Load profile data
  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  const handleTransactionsChange = async (newTransactions: Transaction[]) => {
    // Update local state dengan pengecekan
    if (newTransactions) {
      // Set data ke cache tanpa invalidasi
      queryClient.setQueryData(['jurnal'], newTransactions.map(t => ({
        id: t.id,
        tanggal: t.date,
        bukti: t.documentType,
        keterangan: t.description,
        akun_id: t.akun_id,
        debit: t.debit,
        kredit: t.kredit,
        perusahaan_id: t.perusahaan_id,
        sub_akun_id: t.sub_akun_id,
        akun: {
          id: t.akun_id,
          kode: parseInt(t.kodeAkun),
          nama: t.namaAkun,
          status: "active"
        }
      })));
    }
  };

  // Tampilkan loading state
  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Tampilkan error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-red-500">Gagal memuat data. Silakan periksa koneksi Anda.</div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['jurnal'] })}
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
            isLoading={isLoading || isPosting}
          />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}