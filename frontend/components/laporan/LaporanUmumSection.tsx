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

interface Akun {
  id: string;
  kode: number;
  nama: string;
  saldo_normal: string;
  status: string;
  kategori_id: string;
  created_at: string;
  updated_at: string;
}

interface LaporanData {
  akun: Akun;
  total: number;
}

interface PerusahaanData {
  id: string;
  nama: string;
  alamat: string;
  tahun_berdiri: number;
  status: string;
  start_priode: string;
  end_priode: string;
  kategori_id?: string;
  krs_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface LaporanResponse {
  success: boolean;
  perusahaan: PerusahaanData;
  data: LaporanData[];
  total_keseluruhan: number;
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

// API fetch function with better error handling
const fetchLaporanKeuangan = async (): Promise<LaporanResponse> => {
  try {
    const response = await axios.get('/mahasiswa/laporan/keuangan');
    
    if (!response.data || !response.data.success) {
      throw new Error('Invalid response data from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching laporan keuangan data:', error);
    throw new Error('Failed to fetch laporan keuangan data');
  }
};

export function LaporanUmumSection() {
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
    queryKey: ['laporanKeuangan'],
    queryFn: fetchLaporanKeuangan,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Helper functions
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('laporan-keuangan-section');
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
        title: `Laporan Keuangan - ${data?.perusahaan?.nama || 'Perusahaan'}`,
        subject: 'Laporan Keuangan',
        author: data?.perusahaan?.nama || 'Perusahaan',
        keywords: 'laporan, keuangan',
        creator: data?.perusahaan?.nama || 'Perusahaan'
      });

      pdf.save('laporan-keuangan.pdf');
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

  if (!data || !data.data) {
    return <div className="bg-white p-6 rounded-lg border text-center text-red-500">No data available</div>;
  }

  const groupAccountsByCategory = (data: LaporanData[]) => {
    const groups = {
      asetLancar: data.filter(item => 
        item.akun.kode >= 1100 && item.akun.kode < 1200 || 
        (item.akun.kode >= 1111 && item.akun.kode < 1200)),
      asetTetap: data.filter(item => 
        (item.akun.kode >= 1200 && item.akun.kode < 1300) || 
        (item.akun.kode >= 1210 && item.akun.kode < 1300)),
      kewajiban: data.filter(item => 
        item.akun.kode >= 2000 && item.akun.kode < 3000),
      modal: data.filter(item => 
        item.akun.kode >= 3000 && item.akun.kode < 4000),
      pendapatan: data.filter(item => 
        item.akun.kode >= 4000 && item.akun.kode < 5000),
      hargaPokok: data.filter(item => 
        item.akun.kode >= 5300 && item.akun.kode < 5400),
      beban: data.filter(item => 
        (item.akun.kode >= 5000 && item.akun.kode < 5300) || 
        (item.akun.kode >= 5400 && item.akun.kode < 6000)),
      pendapatanLain: data.filter(item => 
        item.akun.kode >= 6100 && item.akun.kode < 6200),
      bebanLain: data.filter(item => 
        item.akun.kode >= 6200 && item.akun.kode < 6400),
      labaRugiLuarBiasa: data.filter(item => 
        item.akun.kode >= 6400 && item.akun.kode < 8000),
      pajak: data.filter(item => 
        item.akun.kode >= 8000 && item.akun.kode < 9000),
    };

    return groups;
  };

  const renderAccountGroup = (title: string, accounts: LaporanData[]) => {
    if (accounts.length === 0) return null;

    // Sum only the amounts where kode matches the specific pattern
    const total = accounts.reduce((sum, item) => sum + item.total, 0);

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">{title}</h4>
        <div className="pl-4 space-y-1">
          {accounts.map((item) => (
            <div key={item.akun.id} className="flex justify-between py-1">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">{item.akun.kode}</span>
                <span>{item.akun.nama}</span>
              </div>
              <span className={`tabular-nums ${item.total < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-1 border-t font-medium">
            <span>Total {title}</span>
            <span className={`tabular-nums ${total < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const accountGroups = groupAccountsByCategory(data.data);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Keuangan</h2>
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
        id="laporan-keuangan-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">
            {data?.perusahaan?.nama ? data.perusahaan.nama.toUpperCase() : 'PERUSAHAAN'}
          </h2>
          <h3 className="text-lg font-semibold">LAPORAN KEUANGAN</h3>
          {data?.perusahaan?.start_priode && data?.perusahaan?.end_priode && (
            <p className="text-sm mt-1">
              Periode {formatDate(data.perusahaan.start_priode)} s/d {formatDate(data.perusahaan.end_priode)}
            </p>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Aset</h3>
            {renderAccountGroup("Aset Lancar", accountGroups.asetLancar)}
            {renderAccountGroup("Aset Tetap", accountGroups.asetTetap)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Kewajiban</h3>
            {renderAccountGroup("Kewajiban", accountGroups.kewajiban)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Modal</h3>
            {renderAccountGroup("Modal", accountGroups.modal)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Pendapatan</h3>
            {renderAccountGroup("Pendapatan", accountGroups.pendapatan)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Harga Pokok Penjualan</h3>
            {renderAccountGroup("Harga Pokok Penjualan", accountGroups.hargaPokok)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Beban</h3>
            {renderAccountGroup("Beban", accountGroups.beban)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Pendapatan & Beban di Luar Usaha</h3>
            {renderAccountGroup("Pendapatan Lain", accountGroups.pendapatanLain)}
            {renderAccountGroup("Beban Lain", accountGroups.bebanLain)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Laba/Rugi Luar Biasa</h3>
            {renderAccountGroup("Laba/Rugi Luar Biasa", accountGroups.labaRugiLuarBiasa)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-1">Pajak</h3>
            {renderAccountGroup("Pajak", accountGroups.pajak)}
          </div>

          <div className="border-t border-black pt-4 flex justify-between font-bold">
            <span>Total Keseluruhan</span>
            <span className={`tabular-nums ${data.total_keseluruhan < 0 ? 'text-red-600' : ''}`}>
              {formatCurrency(data.total_keseluruhan)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
} 