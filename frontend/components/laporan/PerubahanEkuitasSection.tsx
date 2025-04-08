"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { id } from "date-fns/locale";
import { useRouter } from "next/navigation";

// Create interfaces to match the API response structure
interface Perusahaan {
  id: string;
  nama: string;
  alamat: string;
  tahun_berdiri: number;
  start_priode: string;
  end_priode: string;
  status: string;
  kategori_id: string;
  krs_id: string;
  created_at: string;
  updated_at: string;
}

interface ModalAkun {
  "Nama Akun": string;
  "Kode Akun": number;
  "Saldo Awal per 1 Januari 2025": number;
}

interface LabaBersih {
  "Laba Bersih Setelah Pajak": number;
}

interface LabaModal {
  [key: string]: number;
}

interface PriveAkun {
  "Nama Akun": string;
  "Kode Akun": number;
  "Saldo Awal per 1 Januari 2025": number;
}

interface DataAkhir {
  "DATA AKHIR": {
    [key: string]: number;
  }
}

type EkuitasItem = ModalAkun | LabaBersih | LabaModal | PriveAkun | DataAkhir;

interface EkuitasResponse {
  success: boolean;
  perusahaan: Perusahaan;
  data: EkuitasItem[];
}

// Helper function for type checking
const isModalAkun = (item: EkuitasItem): item is ModalAkun => {
  return 'Nama Akun' in item && typeof item["Nama Akun"] === 'string' && 
    item["Nama Akun"].includes('Modal');
};

const isPriveAkun = (item: EkuitasItem): item is PriveAkun => {
  return 'Nama Akun' in item && typeof item["Nama Akun"] === 'string' && 
    item["Nama Akun"].includes('Prive');
};

const isLabaBersih = (item: EkuitasItem): item is LabaBersih => {
  return 'Laba Bersih Setelah Pajak' in item;
};

const isDataAkhir = (item: EkuitasItem): item is DataAkhir => {
  return 'DATA AKHIR' in item;
};

// API fetch function
const fetchEkuitas = async (): Promise<EkuitasResponse> => {
  const response = await axios.get('/mahasiswa/laporan/ekuitas');
  if (!response.data.success) {
    throw new Error('Failed to fetch data');
  }
  return response.data;
};

// Format a date string to a readable format
const formatDate = (dateString: string): string => {
  try {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    return format(date, 'd MMMM yyyy', { locale: id });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export function PerubahanEkuitasSection() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Use React Query hook
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['ekuitas'],
    queryFn: fetchEkuitas,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Helper functions
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('perubahan-ekuitas-section');
    if (!element) return;

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const marginTop = 10;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        marginTop,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );

      pdf.setProperties({
        title: 'Laporan Perubahan Ekuitas - ' + (data?.perusahaan?.nama || 'CV FAJAR JAYA'),
        subject: 'Laporan Perubahan Ekuitas',
        author: data?.perusahaan?.nama || 'CV FAJAR JAYA',
        keywords: 'laporan, keuangan, perubahan ekuitas',
        creator: data?.perusahaan?.nama || 'CV FAJAR JAYA'
      });

      pdf.save('laporan-perubahan-ekuitas.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
  };

  const handleAkunClick = (kodeAkun: number) => {
    if (kodeAkun) {
      router.push(`/buku-besar?kode=${kodeAkun}`);
    }
  };

  // Render loading state
  if (isLoading) {
    return <div className="bg-white p-6 rounded-lg border text-center">Loading data...</div>;
  }

  // Render error state
  if (isError) {
    return (
      <div className="bg-white p-6 rounded-lg border text-center text-red-500">
        {error instanceof Error ? error.message : 'An error occurred while fetching data'}
        <div className="mt-4">
          <Button variant="outline" onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Extract data from response
  const ekuitasData = data?.data;
  const perusahaan = data?.perusahaan;

  if (!ekuitasData) {
    return <div className="bg-white p-6 rounded-lg border text-center text-red-500">No data available</div>;
  }

  // Extract required data from the ekuitasData array
  const modalAwalItems = ekuitasData.filter(isModalAkun);
  const labaBersihItem = ekuitasData.find(isLabaBersih);
  
  const labaModalItems = ekuitasData.filter(item => 
    Object.keys(item).some(key => typeof key === 'string' && key.startsWith('Laba (Modal')));
  
  const priveItems = ekuitasData.filter(isPriveAkun);
  const dataAkhirItem = ekuitasData.find(isDataAkhir);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Perubahan Ekuitas</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card 
        id="perubahan-ekuitas-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">{perusahaan?.nama.toUpperCase() || 'CV FAJAR JAYA'}</h2>
          <h3 className="text-lg font-semibold">LAPORAN PERUBAHAN EKUITAS</h3>
          {perusahaan && (
            <p className="text-sm mt-1">
              Periode {formatDate(perusahaan.start_priode)} s/d {formatDate(perusahaan.end_priode)}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Modal Awal */}
          <div>
            {modalAwalItems.map((modalItem, index) => (
              <div key={`modal-${index}`} className="flex justify-between py-1">
                <span 
                  className="cursor-pointer hover:text-red-600 hover:underline"
                  onClick={() => handleAkunClick(modalItem["Kode Akun"])}
                >
                  {modalItem["Nama Akun"]} (awal) per 1 Januari 2025
                </span>
                <span className="tabular-nums">{formatCurrency(modalItem["Saldo Awal per 1 Januari 2025"])}</span>
              </div>
            ))}
          </div>

          {/* Laba Rugi */}
          {labaBersihItem && (
            <div className="border-t pt-4">
              <div className="flex justify-between py-1">
                <span>Laba bersih setelah pajak</span>
                <span className="tabular-nums">{formatCurrency(labaBersihItem["Laba Bersih Setelah Pajak"])}</span>
              </div>
            </div>
          )}

          {/* Pembagian Laba - Updated */}
          <div className="border-t pt-4">
            <div className="flex justify-between py-1">
              <span>Pembagian Laba:</span>
            </div>
            {labaModalItems.map((item, index) => {
              const key = Object.keys(item)[0];
              const value = Object.values(item)[0] as number;
              return (
                <div key={`laba-${index}`} className="flex justify-between py-1">
                  <span>{key}</span>
                  <span className="tabular-nums">{formatCurrency(value)}</span>
                </div>
              );
            })}
          </div>

          {/* Prive */}
          <div>
            {priveItems.map((priveItem, index) => (
              <div key={`prive-${index}`} className="flex justify-between py-1">
                <span 
                  className="cursor-pointer hover:text-red-600 hover:underline"
                  onClick={() => handleAkunClick(priveItem["Kode Akun"])}
                >
                  {priveItem["Nama Akun"]}
                </span>
                <span className="tabular-nums">{formatCurrency(priveItem["Saldo Awal per 1 Januari 2025"])}</span>
              </div>
            ))}
          </div>

          {/* Modal Akhir */}
          {dataAkhirItem && (
            <div className="border-t pt-4">
              {Object.entries(dataAkhirItem["DATA AKHIR"]).map(([name, value], index) => {
                // Extract kode akun based on name pattern
                const matchingModal = modalAwalItems.find(item => 
                  item["Nama Akun"] === name.split(" per ")[0]
                );
                return (
                  <div key={`akhir-${index}`} className="flex justify-between py-1 font-medium">
                    <span 
                      className="cursor-pointer hover:text-red-600 hover:underline"
                      onClick={() => matchingModal && handleAkunClick(matchingModal["Kode Akun"])}
                    >
                      {name}
                    </span>
                    <span className="tabular-nums">{formatCurrency(value)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 