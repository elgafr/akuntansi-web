"use client";
import { useState, useEffect, Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AddTransactionTable } from "@/components/jurnal/AddTransactionTable";
import { Button } from "@/components/ui/button";
import { useJurnal, usePostJurnal } from "@/hooks/useJurnal";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import axios from "@/lib/axios";

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
  sub_akun_id: string | null;
}

interface ProfileData {
  user: {
    name: string;
  };
  foto?: string;
}

// Component that uses search params (this should be wrapped in Suspense)
function JurnalContent() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { data: jurnalData, isLoading: jurnalLoading } = useJurnal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    // Only invalidate queries when necessary, not on every render
    if (pathname && searchParams) {
      queryClient.invalidateQueries({ queryKey: ["jurnal"] });
      queryClient.invalidateQueries({ queryKey: ["neracaLajur"] });
    }
  }, [pathname, searchParams, queryClient]);

  useEffect(() => {
    if (jurnalData) {
      const formattedTransactions = Array.isArray(jurnalData) 
        ? jurnalData.map(t => ({
            id: t.id,
            date: t.tanggal,
            documentType: t.bukti,
            description: t.keterangan,
            namaAkun: t.akun?.nama || '',
            kodeAkun: t.akun?.kode?.toString() || '',
            akun_id: t.akun_id,
            debit: t.debit || 0,
            kredit: t.kredit || 0,
            perusahaan_id: t.perusahaan_id,
            sub_akun_id: t.sub_akun_id || null
          }))
        : [];
      setTransactions(formattedTransactions);
    }
  }, [jurnalData]);

  const handleTransactionsChange = async (newTransactions: Transaction[]) => {
    if (newTransactions) {
      setTransactions(newTransactions);
      queryClient.setQueryData(
        ["jurnal"],
        newTransactions.map((t) => ({
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
            status: "active",
          },
        }))
      );
    }
  };

  return (
    <AddTransactionTable
      accounts={[]}
      transactions={transactions}
      onTransactionsChange={handleTransactionsChange}
      isLoading={jurnalLoading || isPosting}
    />
  );
}

// Loading fallback component for suspense
function JurnalContentLoading() {
  return (
    <div className="space-y-4 p-2 rounded-xl relative">
      <div className="flex gap-4 mb-6">
        {/* Skeleton for cards */}
        <div className="flex flex-1 flex-grow">
          <div className="bg-gray-200 animate-pulse p-4 rounded-l-xl flex-1 h-24"></div>
          <div className="bg-gray-200 animate-pulse p-4 rounded-r-xl flex-1 h-24"></div>
        </div>
        <div className="bg-gray-200 animate-pulse p-4 rounded-xl w-1/3 h-24"></div>
      </div>
      
      {/* Skeleton for controls */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="h-10 w-[300px] bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
      
      {/* Skeleton for table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex py-4 border-b">
              <div className="h-6 w-1/5 bg-gray-200 animate-pulse rounded mr-4"></div>
              <div className="h-6 w-1/5 bg-gray-200 animate-pulse rounded mr-4"></div>
              <div className="h-6 w-1/5 bg-gray-200 animate-pulse rounded mr-4"></div>
              <div className="h-6 w-1/5 bg-gray-200 animate-pulse rounded mr-4"></div>
              <div className="h-6 w-1/5 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function JurnalPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/profile`);
        if (response.data.success) {
          const data = response.data.data;
          const fotoUrl = data.foto
            ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${data.foto}`
            : undefined;
          setProfileData({
            user: {
              name: data.user.name,
            },
            foto: fotoUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section - Render this immediately */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <h1 className="text-2xl font-bold ml-6 text-black">
                    Jurnal Umum
                  </h1>
                  <h2 className="text-sm ml-6">
                    Cek jurnal harianmu di sini
                  </h2>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={profileData?.foto || "https://github.com/shadcn.png"}
                    alt="Foto Profil"
                  />
                </Avatar>
                <div className="text-left mr-12">
                  <div className="text-sm font-medium">
                    {loadingProfile
                      ? "Memuat..."
                      : profileData?.user?.name || "Nama tidak tersedia"}
                  </div>
                  <div className="text-xs text-gray-800">Mahasiswa</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-2">
          {/* Properly wrap JurnalContent with Suspense to fix the error */}
          <Suspense fallback={<JurnalContentLoading />}>
            <JurnalContent />
          </Suspense>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';