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

interface Penghasilan {
  Penjualan: number;
  "Potongan Penjualan": number;
  "Retur Penjualan": number;
  "Hasil Retur Penjualan & Potongan Penjualan": number;
  "Penjualan Bersih": number;
  "pendapatan jasa servis kendaraan": number;
  "laba atas transaki tukar tambah": number;
  "blabla": number;
  "Total Penghasilan": number;
  "Total Penghasilan Akhir": number;
}

interface KosBarangTerjual {
  Sediaan: number;
  Pembelian: number;
  "Biaya Angkut Pembelian": number;
  "Potongan Pembelian": number;
  "Retur Pembelian": number;
  Total: number;
  "Barang Siap Dijual": number;
  "Sediaan Akhir": number;
  "Kos Barang Terjual": number;
  "Laba Kotor": number;
}

interface BiayaUsaha {
  "Biaya Administrasi dan Umum": number;
  "Biaya Pemasaran": number;
  "Total Biaya Usaha": number;
  "Laba Bersih Usaha": number;
}

interface PendapatanBiayaDiluarUsaha {
  "Pendapatan diluar Usaha": number;
  "Biaya Diluar Usaha": number;
  "Total Pendapatan dan Biaya Diluar Usaha": number;
  "Laba Bersih Sebelum Laba-Rugi Luar Biasa": number;
}

interface LabaRugiLuarBiasa {
  "Laba Luar Biasa": number;
  "Rugi Luar Biasa": number;
  "Total Laba/Rugi": number;
  "Laba Bersih Sebelum Pajak": number;
  "Laba Bersih Setelah Pajak": number;
}

interface LabaRugiData {
  Penghasilan: Penghasilan;
  "Kos Barang Terjual": KosBarangTerjual;
  "Biaya Usaha": BiayaUsaha;
  "Pendapatan dan Biaya Diluar Usaha": PendapatanBiayaDiluarUsaha;
  "Laba/Rugi Luar Biasa": LabaRugiLuarBiasa;
}

interface LabaRugiResponse {
  success: boolean;
  perusahaan: Perusahaan;
  data: LabaRugiData;
}

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

// API fetch function
const fetchLabaRugi = async (): Promise<LabaRugiResponse> => {
  const response = await axios.get('/mahasiswa/laporan/labarugi');
  if (!response.data.success) {
    throw new Error('Failed to fetch data');
  }
  return response.data;
};

export function LabaRugiSection() {
  const queryClient = useQueryClient();
  
  // Use React Query hook
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['labaRugi'],
    queryFn: fetchLabaRugi,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Helper functions
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('laba-rugi-section');
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

      const companyName = data?.perusahaan?.nama || 'PERUSAHAAN';
      
      pdf.setProperties({
        title: 'Laporan Laba Rugi - ' + companyName,
        subject: 'Laporan Laba Rugi',
        author: companyName,
        keywords: 'laporan, keuangan, laba rugi',
        creator: companyName
      });

      pdf.save('laporan-laba-rugi.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
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

  const labaRugiData = data?.data;
  const perusahaan = data?.perusahaan;

  if (!labaRugiData) {
    return <div className="bg-white p-6 rounded-lg border text-center text-red-500">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Laba Rugi</h2>
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
        id="laba-rugi-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">
            {perusahaan?.nama ? perusahaan.nama.toUpperCase() : 'PERUSAHAAN'}
          </h2>
          <h3 className="text-lg font-semibold">LAPORAN LABA RUGI</h3>
          {perusahaan?.start_priode && perusahaan?.end_priode && (
            <p className="text-sm mt-1">
              Periode {formatDate(perusahaan.start_priode)} s/d {formatDate(perusahaan.end_priode)}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Penghasilan Section */}
          <div>
            <h4 className="font-bold mb-4">Penghasilan</h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between py-1">
                <span>Penjualan</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData.Penghasilan.Penjualan)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Potongan Penjualan</span>
                <span className="tabular-nums">
                  {labaRugiData.Penghasilan["Potongan Penjualan"] > 0 ? 
                    `(${formatCurrency(labaRugiData.Penghasilan["Potongan Penjualan"])})` :
                    formatCurrency(0)
                  }
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Retur Penjualan</span>
                <span className="tabular-nums">
                  {labaRugiData.Penghasilan["Retur Penjualan"] > 0 ?
                    `(${formatCurrency(labaRugiData.Penghasilan["Retur Penjualan"])})` :
                    formatCurrency(0)
                  }
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-gray-200 mt-2">
                <span>Penjualan Bersih</span>
                <span className="tabular-nums font-medium">{formatCurrency(labaRugiData.Penghasilan["Penjualan Bersih"])}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pendapatan Jasa Servis Kendaraan</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData.Penghasilan["pendapatan jasa servis kendaraan"])}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Laba atas Transaksi Tukar Tambah</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData.Penghasilan["laba atas transaki tukar tambah"])}</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Penghasilan</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData.Penghasilan["Total Penghasilan Akhir"])}</span>
              </div>
            </div>
          </div>

          {/* Kos Barang Terjual Section */}
          <div>
            <h4 className="font-bold mb-4">Kos Barang Terjual</h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between py-1">
                <span>Sediaan Awal</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Kos Barang Terjual"].Sediaan)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pembelian</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Kos Barang Terjual"].Pembelian)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Biaya Angkut Pembelian</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Kos Barang Terjual"]["Biaya Angkut Pembelian"])}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Potongan Pembelian</span>
                <span className="tabular-nums">
                  {labaRugiData["Kos Barang Terjual"]["Potongan Pembelian"] < 0 ?
                    `(${formatCurrency(Math.abs(labaRugiData["Kos Barang Terjual"]["Potongan Pembelian"]))})` :
                    formatCurrency(labaRugiData["Kos Barang Terjual"]["Potongan Pembelian"])
                  }
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Retur Pembelian</span>
                <span className="tabular-nums">
                  {labaRugiData["Kos Barang Terjual"]["Retur Pembelian"] < 0 ?
                    `(${formatCurrency(Math.abs(labaRugiData["Kos Barang Terjual"]["Retur Pembelian"]))})` :
                    formatCurrency(labaRugiData["Kos Barang Terjual"]["Retur Pembelian"])
                  }
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-gray-200 mt-2">
                <span>Pembelian Bersih</span>
                <span className="tabular-nums font-medium">{formatCurrency(labaRugiData["Kos Barang Terjual"].Total)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Barang Siap Dijual</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Kos Barang Terjual"]["Barang Siap Dijual"])}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sediaan Akhir</span>
                <span className="tabular-nums">
                  {`(${formatCurrency(labaRugiData["Kos Barang Terjual"]["Sediaan Akhir"])})`}
                </span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Kos Barang Terjual</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Kos Barang Terjual"]["Kos Barang Terjual"])}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
            <span>Laba Kotor</span>
            <span className="tabular-nums">{formatCurrency(labaRugiData["Kos Barang Terjual"]["Laba Kotor"])}</span>
          </div>
          
          {/* Biaya Usaha Section */}
          <div>
            <h4 className="font-bold mb-4">Biaya Usaha</h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between py-1">
                <span>Biaya Administrasi dan Umum</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Biaya Usaha"]["Biaya Administrasi dan Umum"])}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Biaya Pemasaran</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Biaya Usaha"]["Biaya Pemasaran"])}</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Biaya Usaha</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Biaya Usaha"]["Total Biaya Usaha"])}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
            <span>Laba Bersih Usaha</span>
            <span className={`tabular-nums ${labaRugiData["Biaya Usaha"]["Laba Bersih Usaha"] < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(labaRugiData["Biaya Usaha"]["Laba Bersih Usaha"])}
            </span>
          </div>
          
          {/* Pendapatan dan Biaya Di Luar Usaha Section */}
          <div>
            <h4 className="font-bold mb-4">Pendapatan dan Biaya Diluar Usaha</h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between py-1">
                <span>Pendapatan Diluar Usaha</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Pendapatan diluar Usaha"])}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Biaya Diluar Usaha</span>
                <span className="tabular-nums">
                  {`(${formatCurrency(labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Biaya Diluar Usaha"])})`}
                </span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Pendapatan dan Biaya Diluar Usaha</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Total Pendapatan dan Biaya Diluar Usaha"])}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
            <span>Laba Bersih Sebelum Laba-Rugi Luar Biasa</span>
            <span className={`tabular-nums ${labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Laba Bersih Sebelum Laba-Rugi Luar Biasa"] < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Laba Bersih Sebelum Laba-Rugi Luar Biasa"])}
            </span>
          </div>
          
          {/* Laba/Rugi Luar Biasa Section */}
          <div>
            <h4 className="font-bold mb-4">Laba/Rugi Luar Biasa</h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between py-1">
                <span>Laba Luar Biasa</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Laba/Rugi Luar Biasa"]["Laba Luar Biasa"])}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Rugi Luar Biasa</span>
                <span className="tabular-nums">
                  {`(${formatCurrency(labaRugiData["Laba/Rugi Luar Biasa"]["Rugi Luar Biasa"])})`}
                </span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Laba/Rugi Luar Biasa</span>
                <span className="tabular-nums">{formatCurrency(labaRugiData["Laba/Rugi Luar Biasa"]["Total Laba/Rugi"])}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
            <span>Laba Bersih Sebelum Pajak</span>
            <span className={`tabular-nums ${labaRugiData["Laba/Rugi Luar Biasa"]["Laba Bersih Sebelum Pajak"] < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(labaRugiData["Laba/Rugi Luar Biasa"]["Laba Bersih Sebelum Pajak"])}
            </span>
          </div>
          
          <div className="flex justify-between py-3 font-bold border-t border-black mt-4 text-lg">
            <span>Laba Bersih Setelah Pajak</span>
            <span className={`tabular-nums ${labaRugiData["Laba/Rugi Luar Biasa"]["Laba Bersih Setelah Pajak"] < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(labaRugiData["Laba/Rugi Luar Biasa"]["Laba Bersih Setelah Pajak"])}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
} 