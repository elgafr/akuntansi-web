"use client";
import { useState, useEffect, useMemo } from "react";
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
}

export default function JurnalPage() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [searchParamsLoaded, setSearchParamsLoaded] = useState(false); // Flag to delay useSearchParams() usage
  const searchParams = useSearchParams(); // This will be safely used only on the client side
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { data: jurnalData } = useJurnal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    // Refetch data when navigating back to jurnal page
    queryClient.invalidateQueries({ queryKey: ["jurnal"] });
    queryClient.invalidateQueries({ queryKey: ["neracaLajur"] });
  }, [pathname, searchParams, queryClient]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("/mahasiswa/profile");
        if (response.data.success) {
          setProfileData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  // Handle the change in transactions
  const handleTransactionsChange = async (newTransactions: Transaction[]) => {
    if (newTransactions) {
      // Update transactions in local state
      setTransactions(newTransactions);

      // Set data to cache without invalidating
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

  // Delay searchParams until after client-side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParamsLoaded(true);
    }
  }, []);

  // Tampilkan loading state sampai searchParams dimuat
  if (!searchParamsLoaded) {
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
                  <div className="text-sm font-medium">
                    {loadingProfile
                      ? "Loading..."
                      : profileData?.user?.name || "Nama tidak tersedia"}
                  </div>
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
