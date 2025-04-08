"use client";

import { useState, useEffect } from "react";
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

interface AkunDetails {
  akun: Akun;
  kode: number;
  total: number;
}

interface AsetLancar {
  akun: AkunDetails[];
  total_keseluruhan: number;
}

interface AsetTetapItem {
  akun: Akun;
  kode: number;
  total: number;
}

interface AsetTetap {
  akun: {
    [key: string]: AsetTetapItem;
  };
  total_keseluruhan: number;
}

interface KewajibanItem {
  akun: Akun;
  kode: number;
  total: number;
}

interface Kewajiban {
  akun: {
    [key: string]: KewajibanItem;
  };
  total_keseluruhan: number;
}

interface EkuitasItem {
  akun: Akun;
  kode: number;
  total: number;
}

interface Ekuitas {
  akun: {
    [key: string]: EkuitasItem;
  };
  total_keseluruhan: number;
}

interface PosisiKeuanganResponse {
  aset_lancar: AsetLancar;
  aset_tetap: AsetTetap;
  kewajiban: Kewajiban;
  ekuitas: Ekuitas;
  total_aset: number;
  total_kewajiban_ekuitas: number;
  perusahaan?: Perusahaan;
}

// Add an interface for the Laporan Keuangan response
interface LaporanKeuanganResponse {
  success: boolean;
  perusahaan: {
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
  };
  data: Array<any>; // We don't need the detailed structure for this purpose
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

// Fetch function for company data
const fetchPerusahaanData = async () => {
  try {
    const response = await axios.get('/mahasiswa/perusahaan');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('No company data available');
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw new Error('Failed to fetch company data');
  }
};

// Improved API fetch function
const fetchPosisiKeuangan = async (): Promise<PosisiKeuanganResponse> => {
  try {
    // Fetch posisi keuangan data
    const response = await axios.get('/mahasiswa/laporan/posisikeuangan');
    
    // Ensure we have a valid response
    if (!response.data) {
      throw new Error('Invalid response data from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching position data:', error);
    throw new Error('Failed to fetch financial position data');
  }
};

export function PosisiKeuanganSection() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Use React Query for posisi keuangan data - now this will also include company info
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['posisiKeuangan'],
    queryFn: fetchPosisiKeuangan,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  
  // Helper functions
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('posisi-keuangan-section');
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

      // Use data.perusahaan directly
      const companyName = data?.perusahaan?.nama || 'PERUSAHAAN';
      
      pdf.setProperties({
        title: 'Laporan Posisi Keuangan - ' + companyName,
        subject: 'Laporan Posisi Keuangan',
        author: companyName,
        keywords: 'laporan, keuangan, posisi keuangan',
        creator: companyName
      });

      pdf.save('laporan-posisi-keuangan.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
  };

  const handleAkunClick = (akunId: string, kodeAkun: string) => {
    if (akunId && kodeAkun) {
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

  if (!data) {
    return <div className="bg-white p-6 rounded-lg border text-center text-red-500">No financial position data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Posisi Keuangan</h2>
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
        id="posisi-keuangan-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">
            {data.perusahaan?.nama ? data.perusahaan.nama.toUpperCase() : "PERUSAHAAN"}
          </h2>
          <h3 className="text-lg font-semibold">LAPORAN POSISI KEUANGAN</h3>
          {data.perusahaan?.start_priode && data.perusahaan?.end_priode && (
            <p className="text-sm mt-1">
              Periode {formatDate(data.perusahaan.start_priode)} s/d {formatDate(data.perusahaan.end_priode)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-12">
          {/* Kolom ASET */}
          <div>
            <h4 className="font-bold mb-4 text-lg border-b pb-1">ASET</h4>
            
            {/* Aset Lancar */}
            <div className="mb-8">
              <h5 className="font-semibold mb-3">Aset Lancar :</h5>
              <div className="space-y-2">
                {data.aset_lancar?.akun?.map((item, index) => (
                  <div key={`aset-lancar-${index}`} className="flex justify-between py-1">
                    <span 
                      className="cursor-pointer hover:text-red-600 hover:underline"
                      onClick={() => handleAkunClick(item.akun?.id, item.akun?.kode.toString())}
                    >
                      {item.akun?.nama || 'Unnamed Account'}
                    </span>
                    <span className="tabular-nums">{formatCurrency(item.total || 0)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Aset Lancar</span>
                  <span className="tabular-nums">{formatCurrency(data.aset_lancar?.total_keseluruhan || 0)}</span>
                </div>
              </div>
            </div>

            {/* Aset Tetap */}
            <div>
              <h5 className="font-semibold mb-3">Aset Tetap :</h5>
              <div className="space-y-2">
                {data.aset_tetap?.akun && Object.values(data.aset_tetap.akun).map((item, index) => (
                  <div key={`aset-tetap-${index}`} className="flex justify-between py-1">
                    <span 
                      className="cursor-pointer hover:text-red-600 hover:underline"
                      onClick={() => handleAkunClick(item.akun?.id, item.akun?.kode.toString())}
                    >
                      {item.akun?.nama || 'Unnamed Account'}
                    </span>
                    <span className="tabular-nums">{formatCurrency(item.total || 0)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Aset Tetap</span>
                  <span className="tabular-nums">{formatCurrency(data.aset_tetap?.total_keseluruhan || 0)}</span>
                </div>
              </div>
            </div>

            {/* Total Aset */}
            <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
              <span>TOTAL ASET</span>
              <span className="tabular-nums">{formatCurrency(data.total_aset || 0)}</span>
            </div>
          </div>

          {/* Kolom KEWAJIBAN DAN EKUITAS */}
          <div>
            <h4 className="font-bold mb-4 text-lg border-b pb-1">KEWAJIBAN DAN EKUITAS</h4>

            {/* Kewajiban */}
            <div className="mb-8">
              <h5 className="font-semibold mb-3">Kewajiban :</h5>
              <div className="space-y-2">
                {data.kewajiban?.akun && Object.values(data.kewajiban.akun).map((item, index) => (
                  <div key={`kewajiban-${index}`} className="flex justify-between py-1">
                    <span 
                      className="cursor-pointer hover:text-red-600 hover:underline"
                      onClick={() => handleAkunClick(item.akun?.id, item.akun?.kode.toString())}
                    >
                      {item.akun?.nama || 'Unnamed Account'}
                    </span>
                    <span className="tabular-nums">{formatCurrency(item.total || 0)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Kewajiban</span>
                  <span className="tabular-nums">{formatCurrency(data.kewajiban?.total_keseluruhan || 0)}</span>
                </div>
              </div>
            </div>

            {/* Ekuitas */}
            <div>
              <h5 className="font-semibold mb-3">Ekuitas :</h5>
              <div className="space-y-2">
                {data.ekuitas?.akun && Object.values(data.ekuitas.akun).map((item, index) => (
                  <div key={`ekuitas-${index}`} className="flex justify-between py-1">
                    <span 
                      className="cursor-pointer hover:text-red-600 hover:underline"
                      onClick={() => handleAkunClick(item.akun?.id, item.akun?.kode.toString())}
                    >
                      {item.akun?.nama || 'Unnamed Account'}
                    </span>
                    <span className="tabular-nums">{formatCurrency(item.total || 0)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Ekuitas</span>
                  <span className="tabular-nums">{formatCurrency(data.ekuitas?.total_keseluruhan || 0)}</span>
                </div>
              </div>
            </div>

            {/* Total Kewajiban dan Ekuitas */}
            <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
              <span>TOTAL KEWAJIBAN DAN EKUITAS</span>
              <span className="tabular-nums">{formatCurrency(data.total_kewajiban_ekuitas || 0)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 