"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AddTransactionTable } from "@/components/jurnal/AddTransactionTable";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";

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
}

interface Akun {
  id: string;
  kode: number;
  nama: string;
  status: string;
}

interface JurnalResponse {
  [key: string]: JurnalEntry[];
}

interface JurnalEntry {
  id: string;
  tanggal: string;
  bukti: string;
  keterangan: string;
  akun_id: string;
  debit: number | null;
  kredit: number | null;
  perusahaan_id: string;
  akun: {
    id: string;
    kode: number;
    nama: string;
    status: string;
  };
}

export default function JurnalPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({ fullName: "Guest" });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/mahasiswa/jurnal');
        if (response.data.success) {
          const jurnalData: JurnalResponse = response.data.data;
          const formattedTransactions: Transaction[] = [];

          Object.entries(jurnalData).forEach(([keterangan, entries]) => {
            entries.forEach(entry => {
              formattedTransactions.push({
                id: entry.id,
                date: entry.tanggal,
                documentType: entry.bukti,
                description: entry.keterangan,
                namaAkun: entry.akun.nama,
                kodeAkun: entry.akun.kode.toString(),
                akun_id: entry.akun_id,
                debit: entry.debit || 0,
                kredit: entry.kredit || 0,
                perusahaan_id: entry.perusahaan_id
              });
            });
          });

          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Gagal memuat data. Silakan periksa koneksi Anda.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load profile data
  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  const handleTransactionsChange = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
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