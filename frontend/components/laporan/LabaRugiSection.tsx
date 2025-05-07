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
import { useSelectedAkun } from "@/hooks/useSelectedAkun";

// Interfaces remain the same as in the previous code
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

interface NilaiKode {
  nilai: number;
  kode: number | string | null;
}

interface Penghasilan {
  Penjualan: NilaiKode;
  "Potongan Penjualan": NilaiKode;
  "Retur Penjualan": NilaiKode;
  "Hasil Retur Penjualan & Potongan Penjualan": NilaiKode;
  "Penjualan Bersih": { nilai: number };
  "pendapatan jasa servis kendaraan": NilaiKode;
  "laba atas transaki tukar tambah": NilaiKode;
  "blabla": NilaiKode;
  "Total Penghasilan": { nilai: number };
  "Total Penghasilan Akhir": { nilai: number };
}

interface KosBarangTerjual {
  Sediaan: NilaiKode;
  Pembelian: NilaiKode;
  "Biaya Angkut Pembelian": NilaiKode;
  "Potongan Pembelian": NilaiKode;
  "Retur Pembelian": NilaiKode;
  Total: NilaiKode;
  "Barang Siap Dijual": NilaiKode;
  "Sediaan Akhir": NilaiKode;
  "Kos Barang Terjual": { nilai: number };
  "Laba Kotor": { nilai: number };
}

interface BiayaUsaha {
  "Biaya Administrasi dan Umum": NilaiKode;
  "Biaya Pemasaran": NilaiKode;
  "Total Biaya Usaha": NilaiKode;
  "Laba Bersih Usaha": { nilai: number };
}

interface PendapatanBiayaDiluarUsaha {
  "Pendapatan diluar Usaha": NilaiKode;
  "Biaya Diluar Usaha": NilaiKode;
  "Total Pendapatan dan Biaya Diluar Usaha": { nilai: number };
  "Laba Bersih Sebelum Laba-Rugi Luar Biasa": { nilai: number };
}

interface LabaRugiLuarBiasa {
  "Laba Luar Biasa": NilaiKode;
  "Rugi Luar Biasa": NilaiKode;
  "Total Laba/Rugi": NilaiKode;
  "Laba Bersih Sebelum Pajak": { nilai: number };
  "Laba Bersih Setelah Pajak": { nilai: number };
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
  const router = useRouter();
  const { setSelectedAkunId } = useSelectedAkun();

  // Use React Query hook
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
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

  const handleAkunClick = (kode: number | string | null) => {
    if (typeof kode === 'number') {
      router.push(`/buku-besar?kode=${kode}`);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('laba-rugi-section');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: element.scrollHeight,
        height: element.scrollHeight
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'p' : 'l',
        unit: 'mm',
        format: [imgWidth, imgHeight + 20]
      });

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        10,
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
        creator: companyName,
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

  // Helper function to determine if an account is a deduction or negative adjustment
  const isDeductionAccount = (accountName: string) => {
    const deductionAccounts = [
      'Potongan Penjualan',
      'Retur Penjualan',
      'Hasil Retur Penjualan & Potongan Penjualan',
      'Biaya Angkut Pembelian',
      'Potongan Pembelian',
      'Retur Pembelian',
      'Biaya Diluar Usaha',
      'Rugi Luar Biasa',
      'Biaya Administrasi dan Umum',
      'Biaya Pemasaran',
      'Total Biaya Usaha',
      'Pajak Penghasilan',
    ];
    return deductionAccounts.includes(accountName);
  };

  // Helper function to format account values
  const formatAccountValue = (name: string, value: number, isTotal: boolean = false, isSubtotal: boolean = false) => {
    // If the value is negative or the account is a deduction, display in parentheses without minus sign
    const isNegativeOrDeduction = value < 0 || isDeductionAccount(name);
    const displayValue = Math.abs(value); // Remove the minus sign by using absolute value
    const formattedNumber = displayValue.toLocaleString('id-ID');

    if (isNegativeOrDeduction) {
      return (
        <div className="flex items-center gap-2 justify-end">
          <span>Rp</span>
          <span className={`tabular-nums w-36 text-right ${isTotal || isSubtotal ? 'font-bold' : ''}`}>
            ({formattedNumber})
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 justify-end">
        <span>Rp</span>
        <span className={`tabular-nums w-36 text-right ${isTotal || isSubtotal ? 'font-bold' : ''}`}>
          {formattedNumber}
        </span>
      </div>
    );
  };

  // Helper function to check if code is a numeric code or expression
  const isNumericCode = (kode: number | string | null): boolean => {
    return typeof kode === 'number';
  };

  // Update how we render account names based on code type
  const renderAccountName = (name: string, kode: number | string | null) => {
    if (isNumericCode(kode)) {
      return (
        <span 
          className="text-gray-700 cursor-pointer hover:text-red-600 hover:underline"
          onClick={() => handleAkunClick(kode)}
        >
          {name}
        </span>
      );
    }
    
    return (
      <span className="text-gray-700">
        {name}
      </span>
    );
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

  // Common styles for all sections with adjusted spacing
  const sectionStyles = "space-y-2"; // Reduced spacing between rows within a section
  const itemStyles = "flex items-center py-1"; // Reduced vertical padding for rows (from py-2 to py-1)
  const nameColumnStyles = "w-[400px] pr-4 text-left"; // Column 1: Name, explicitly left-aligned
  const calcColumnStyles = "w-[160px] text-right pr-4"; // Column 2: Calculation Result, right-aligned
  const sumColumnStyles = "w-[160px] text-right pr-4"; // Column 3: Summation of Column 2, right-aligned
  const finalSumColumnStyles = "w-[160px] text-right pr-4"; // Column 4: Summation of Column 3, right-aligned
  const indentedTextStyles = "pl-6";
  const doubleIndentedTextStyles = "pl-12";
  const totalStyles = "font-bold"; // Used only for section names and specific totals
  const underlineStyles = "border-t border-black mt-1"; // Single underline before final total

  // Calculate tax 
  const labaBersihSebelumPajak = labaRugiData["Laba/Rugi Luar Biasa"]["Laba Bersih Sebelum Pajak"].nilai;
  const pajakPenghasilan = labaBersihSebelumPajak * 0.25; // 25% tax rate 
  const labaBersihSetelahPajak = labaBersihSebelumPajak - pajakPenghasilan;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Laporan Laba Rugi</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card
        id="laba-rugi-section"
        className="p-8 w-full bg-white shadow-lg border border-gray-200 rounded-lg"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {perusahaan?.nama ? perusahaan.nama.toUpperCase() : 'PERUSAHAAN'}
          </h2>
          <h3 className="text-lg font-semibold text-gray-800 mt-2">Laporan Laba Rugi</h3>
          {perusahaan?.start_priode && perusahaan?.end_priode && (
            <p className="text-sm text-gray-600 mt-1">
              Periode {formatDate(perusahaan.start_priode)} s/d {formatDate(perusahaan.end_priode)}
            </p>
          )}
        </div>

        {/* Center the content with a max-width */}
        <div className="max-w-[900px] mx-auto space-y-12">
          {/* Penghasilan Section */}
          <div>
            <h4 className={`font-bold text-gray-800 mb-4 uppercase`}>Penghasilan</h4>
            <div className={sectionStyles}>
              {/* Penjualan */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Penjualan', labaRugiData.Penghasilan.Penjualan.kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Penjualan', labaRugiData.Penghasilan.Penjualan.nilai)}
                </div>
              </div>

              {/* Deductions */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Potongan Penjualan', labaRugiData.Penghasilan["Potongan Penjualan"].kode)}
                </div>
                <div className={calcColumnStyles}>
                  {formatAccountValue('Potongan Penjualan', labaRugiData.Penghasilan["Potongan Penjualan"].nilai)}
                </div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Retur Penjualan', labaRugiData.Penghasilan["Retur Penjualan"].kode || 'N/A')}
                </div>
                <div className={calcColumnStyles}>
                  {formatAccountValue('Retur Penjualan', labaRugiData.Penghasilan["Retur Penjualan"].nilai)}
                </div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>
              {/* Underline in Column 2 after Retur Penjualan */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={`${calcColumnStyles} ${underlineStyles}`}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>
              {/* Hasil Retur Penjualan & Potongan Penjualan (Hide Name, Show Value Only) */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div> {/* Hide the name */}
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Hasil Retur Penjualan & Potongan Penjualan', labaRugiData.Penghasilan["Hasil Retur Penjualan & Potongan Penjualan"].nilai)}
                </div>
              </div>
              {/* Explicit Underline in Column 4 */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={`${finalSumColumnStyles} ${underlineStyles}`}></div>
              </div>

              {/* Penjualan Bersih */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-800">Penjualan Bersih</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Penjualan Bersih', labaRugiData.Penghasilan["Penjualan Bersih"].nilai)}
                </div>
              </div>

              {/* Additional Income */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Pendapatan Jasa Servis Kendaraan', labaRugiData.Penghasilan["pendapatan jasa servis kendaraan"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('pendapatan jasa servis kendaraan', labaRugiData.Penghasilan["pendapatan jasa servis kendaraan"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Laba atas Transaksi Tukar Tambah', labaRugiData.Penghasilan["laba atas transaki tukar tambah"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('laba atas transaki tukar tambah', labaRugiData.Penghasilan["laba atas transaki tukar tambah"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Pendapatan Lain-lain', labaRugiData.Penghasilan["blabla"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('blabla', labaRugiData.Penghasilan["blabla"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>
              {/* Underline in Column 3 after Pendapatan Lain-lain */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={`${sumColumnStyles} ${underlineStyles}`}></div>
                <div className={finalSumColumnStyles}></div>
              </div>
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-700">Total Pendapatan Lain</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Total Penghasilan', labaRugiData.Penghasilan["Total Penghasilan"].nilai)}
                </div>
              </div>

              {/* Total Penghasilan Akhir */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-800">Total Penghasilan</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={`${finalSumColumnStyles} ${underlineStyles}`}>
                  {formatAccountValue('Total Penghasilan Akhir', labaRugiData.Penghasilan["Total Penghasilan Akhir"].nilai)}
                </div>
              </div>
            </div>
          </div>

          {/* Kos Barang Terjual Section */}
          <div>
            <h4 className={`font-bold text-gray-800 mb-4 uppercase`}>Kos Barang Terjual</h4>
            <div className={sectionStyles}>
              {/* Sediaan Awal */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Sediaan', labaRugiData["Kos Barang Terjual"].Sediaan.kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Sediaan', labaRugiData["Kos Barang Terjual"].Sediaan.nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Pembelian */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Pembelian', labaRugiData["Kos Barang Terjual"].Pembelian.kode)}
                </div>
                <div className={calcColumnStyles}>
                  {formatAccountValue('Pembelian', labaRugiData["Kos Barang Terjual"].Pembelian.nilai)}
                </div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Biaya Angkut Pembelian */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Biaya Angkut Pembelian', labaRugiData["Kos Barang Terjual"]["Biaya Angkut Pembelian"].kode)}
                </div>
                <div className={calcColumnStyles}>
                  {formatAccountValue('Biaya Angkut Pembelian', labaRugiData["Kos Barang Terjual"]["Biaya Angkut Pembelian"].nilai)}
                </div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Potongan Pembelian */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Potongan Pembelian', labaRugiData["Kos Barang Terjual"]["Potongan Pembelian"].kode)}
                </div>
                <div className={calcColumnStyles}>
                  {formatAccountValue('Potongan Pembelian', labaRugiData["Kos Barang Terjual"]["Potongan Pembelian"].nilai)}
                </div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Retur Pembelian */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Retur Pembelian', labaRugiData["Kos Barang Terjual"]["Retur Pembelian"].kode)}
                </div>
                <div className={calcColumnStyles}>
                  {formatAccountValue('Retur Pembelian', labaRugiData["Kos Barang Terjual"]["Retur Pembelian"].nilai)}
                </div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Underline in Column 2 after Retur Pembelian */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={`${calcColumnStyles} ${underlineStyles}`}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Total (Show Value Only in Column 3) */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Total', labaRugiData["Kos Barang Terjual"].Total.nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Underline in Column 3 after Total */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={`${sumColumnStyles} ${underlineStyles}`}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Barang Siap Dijual */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Barang Siap Dijual', labaRugiData["Kos Barang Terjual"]["Barang Siap Dijual"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Barang Siap Dijual', labaRugiData["Kos Barang Terjual"]["Barang Siap Dijual"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Sediaan Akhir */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Sediaan Akhir', labaRugiData["Kos Barang Terjual"]["Sediaan Akhir"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Sediaan Akhir', labaRugiData["Kos Barang Terjual"]["Sediaan Akhir"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Underline in Column 3 after Sediaan Akhir */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={`${sumColumnStyles} ${underlineStyles}`}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Kos Barang Terjual */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-700">Kos Barang Terjual</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Kos Barang Terjual', labaRugiData["Kos Barang Terjual"]["Kos Barang Terjual"].nilai)}
                </div>
              </div>

              {/* Underline in Column 4 after Kos Barang Terjual */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={`${finalSumColumnStyles} ${underlineStyles}`}></div>
              </div>

              {/* Laba Kotor */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-800">Laba Kotor</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Laba Kotor', labaRugiData["Kos Barang Terjual"]["Laba Kotor"].nilai)}
                </div>
              </div>
            </div>
          </div>

          {/* Biaya Usaha Section */}
          <div>
            <h4 className={`font-bold text-gray-800 mb-4 uppercase`}>Biaya Usaha</h4>
            <div className={sectionStyles}>
              {/* Biaya Administrasi dan Umum */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Biaya Administrasi dan Umum', labaRugiData["Biaya Usaha"]["Biaya Administrasi dan Umum"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Biaya Administrasi dan Umum', labaRugiData["Biaya Usaha"]["Biaya Administrasi dan Umum"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Biaya Pemasaran */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Biaya Pemasaran', labaRugiData["Biaya Usaha"]["Biaya Pemasaran"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Biaya Pemasaran', labaRugiData["Biaya Usaha"]["Biaya Pemasaran"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Underline in Column 3 after Biaya Pemasaran */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={`${sumColumnStyles} ${underlineStyles}`}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Total Biaya Usaha */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Total Biaya Usaha', labaRugiData["Biaya Usaha"]["Total Biaya Usaha"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Total Biaya Usaha', labaRugiData["Biaya Usaha"]["Total Biaya Usaha"].nilai)}
                </div>
              </div>

              {/* Underline in Column 4 after Total Biaya Usaha */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={`${finalSumColumnStyles} ${underlineStyles}`}></div>
              </div>

              {/* Laba Bersih Usaha */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-800">Laba Bersih Usaha</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Laba Bersih Usaha', labaRugiData["Biaya Usaha"]["Laba Bersih Usaha"].nilai)}
                </div>
              </div>
            </div>
          </div>

          {/* Pendapatan dan Biaya di Luar Usaha Section */}
          <div>
            <h4 className={`font-bold text-gray-800 mb-4 uppercase`}>Pendapatan dan Biaya di Luar Usaha</h4>
            <div className={sectionStyles}>
              {/* Pendapatan di Luar Usaha */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Pendapatan di Luar Usaha', labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Pendapatan diluar Usaha"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Pendapatan diluar Usaha', labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Pendapatan diluar Usaha"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Biaya di Luar Usaha */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Biaya Diluar Usaha', labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Biaya Diluar Usaha"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Biaya Diluar Usaha', labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Biaya Diluar Usaha"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Underline in Column 3 after Biaya di Luar Usaha */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={`${sumColumnStyles} ${underlineStyles}`}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Total Pendapatan dan Biaya di Luar Usaha */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-700">Total Pendapatan dan Biaya di Luar Usaha</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Total Pendapatan dan Biaya Diluar Usaha', labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Total Pendapatan dan Biaya Diluar Usaha"].nilai)}
                </div>
              </div>

              {/* Underline in Column 4 after Total Pendapatan dan Biaya di Luar Usaha */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={`${finalSumColumnStyles} ${underlineStyles}`}></div>
              </div>

              {/* Laba Bersih Sebelum Laba-Rugi Luar Biasa */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-800">Laba Bersih Sebelum Laba-Rugi Luar Biasa</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Laba Bersih Sebelum Laba-Rugi Luar Biasa', labaRugiData["Pendapatan dan Biaya Diluar Usaha"]["Laba Bersih Sebelum Laba-Rugi Luar Biasa"].nilai)}
                </div>
              </div>
            </div>
          </div>

          {/* Laba/Rugi Luar Biasa Section */}
          <div>
            <h4 className={`font-bold text-gray-800 mb-4 uppercase`}>Laba/Rugi Luar Biasa</h4>
            <div className={sectionStyles}>
              {/* Laba Luar Biasa */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Laba Luar Biasa', labaRugiData["Laba/Rugi Luar Biasa"]["Laba Luar Biasa"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Laba Luar Biasa', labaRugiData["Laba/Rugi Luar Biasa"]["Laba Luar Biasa"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Rugi Luar Biasa */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Rugi Luar Biasa', labaRugiData["Laba/Rugi Luar Biasa"]["Rugi Luar Biasa"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Rugi Luar Biasa', labaRugiData["Laba/Rugi Luar Biasa"]["Rugi Luar Biasa"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Underline in Column 3 after Rugi Luar Biasa */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={`${sumColumnStyles} ${underlineStyles}`}></div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Total Laba/Rugi Luar Biasa */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  {renderAccountName('Total Laba/Rugi Luar Biasa', labaRugiData["Laba/Rugi Luar Biasa"]["Total Laba/Rugi"].kode)}
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}>
                  {formatAccountValue('Total Laba/Rugi', labaRugiData["Laba/Rugi Luar Biasa"]["Total Laba/Rugi"].nilai)}
                </div>
                <div className={finalSumColumnStyles}></div>
              </div>

              {/* Underline in Column 4 after Total Laba/Rugi Luar Biasa */}
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={`${finalSumColumnStyles} ${underlineStyles}`}></div>
              </div>

              {/* Laba Bersih Sebelum Pajak */}
              <div className={`${itemStyles} ${totalStyles}`}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-800">Laba Bersih Sebelum Pajak</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Laba Bersih Sebelum Pajak', labaRugiData["Laba/Rugi Luar Biasa"]["Laba Bersih Sebelum Pajak"].nilai, true)}
                </div>
              </div>

              {/* Pajak Penghasilan (10%) */}
              <div className={itemStyles}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-700">Pajak Penghasilan (25%)</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Pajak Penghasilan', pajakPenghasilan)}
                </div>
              </div>
              <div className={itemStyles}>
                <div className={nameColumnStyles}></div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={`${finalSumColumnStyles} ${underlineStyles}`}></div>
              </div>

              {/* Laba Bersih Setelah Pajak */}
              <div className={`${itemStyles} ${totalStyles}`}>
                <div className={`${nameColumnStyles} ${indentedTextStyles}`}>
                  <span className="text-gray-800">Laba Bersih Setelah Pajak</span>
                </div>
                <div className={calcColumnStyles}></div>
                <div className={sumColumnStyles}></div>
                <div className={finalSumColumnStyles}>
                  {formatAccountValue('Laba Bersih Setelah Pajak', labaBersihSetelahPajak, true)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}