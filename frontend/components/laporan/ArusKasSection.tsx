"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from "@/lib/axios";

interface ArusKasData {
  operasi: {
    'Kewajiban Gaji': number;
    'Piutang Usaha': number;
    'Kewajiban Bunga': number;
    'Kewajiban Bank': number;
    'Piutang Bunga': number;
    'Kewajiban Usaha': number;
    'Penjualan': number;
    'Pembelian': number;
    'Pendapatan Jasa Servis': number;
    'Biaya Pemasaran': number;
    'Kewajiban Pajak': number;
    'Biaya Administrasi': number;
    'Biaya Lain-Lain': number;
    'Pendapatan Jasa Bank': number;
    'Persediaan': number;
  };
  investasi: {
    'Perlengkapan showroom': number;
    'Piutang deviden': number;
    'Pendapatan deviden': number;
  };
}

export function ArusKasSection() {
  const [data, setData] = useState<ArusKasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sample data
  const sampleData: ArusKasData = {
    operasi: {
      'Kewajiban Gaji': 34000000,
      'Piutang Usaha': 195510000,
      'Kewajiban Bunga': 9000000,
      'Kewajiban Bank': 45000000,
      'Piutang Bunga': 30000000,
      'Kewajiban Usaha': 776596500,
      'Penjualan': 240000000,
      'Pembelian': 257000000,
      'Pendapatan Jasa Servis': 40250000,
      'Biaya Pemasaran': 22290000,
      'Kewajiban Pajak': 3675000,
      'Biaya Administrasi': 12710000,
      'Biaya Lain-Lain': 550000,
      'Pendapatan Jasa Bank': 17380000,
      'Persediaan': 20500000
    },
    investasi: {
      'Perlengkapan showroom': 5000000,
      'Piutang deviden': 71500000,
      'Pendapatan deviden': 3500000
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Uncomment ini ketika API sudah tersedia
        // const response = await axios.get('/mahasiswa/laporan/arus-kas');
        // if (response.data.success) {
        //   setData(response.data.data);
        // }
        
        // Sementara gunakan sample data
        setData(sampleData);
      } catch (error) {
        console.error('Error fetching laporan:', error);
        // Fallback ke sample data jika error
        setData(sampleData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Tidak ada data</div>;

  // Hapus deklarasi sampleData di sini karena sudah dipindah ke atas
  const actualData = data;

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTotalArusKasOperasi = () => {
    return Object.values(actualData.operasi).reduce((a, b) => a + b, 0);
  };

  const getTotalArusKasInvestasi = () => {
    return Object.values(actualData.investasi).reduce((a, b) => a + b, 0);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('arus-kas-section');
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
        title: 'Laporan Arus Kas - CV FAJAR JAYA',
        subject: 'Laporan Arus Kas',
        author: 'CV FAJAR JAYA',
        keywords: 'laporan, keuangan, arus kas',
        creator: 'CV FAJAR JAYA'
      });

      pdf.save('laporan-arus-kas.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Arus Kas</h2>
        <Button 
          variant="outline" 
          onClick={handleExportPDF}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Card 
        id="arus-kas-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">CV FAJAR JAYA</h2>
          <h3 className="text-lg font-semibold">LAPORAN ARUS KAS</h3>
        </div>

        <div className="space-y-8">
          {/* Arus Kas dari Aktivitas Operasi */}
          <div>
            <h4 className="font-bold mb-4">Arus Kas Dari Aktivitas Operasi</h4>
            <div className="space-y-2 pl-4">
              {Object.entries(actualData.operasi).map(([name, value]) => (
                <div key={name} className="flex justify-between py-1">
                  <span>{name}</span>
                  <span className="tabular-nums">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold border-t mt-2">
                <span>Jumlah Arus Kas dari Aktivitas Operasi</span>
                <span className="tabular-nums">{formatCurrency(getTotalArusKasOperasi())}</span>
              </div>
            </div>
          </div>

          {/* Arus Kas dari Aktivitas Investasi */}
          <div>
            <h4 className="font-bold mb-4">Arus Kas dari Aktivitas Investasi</h4>
            <div className="space-y-2 pl-4">
              {Object.entries(actualData.investasi).map(([name, value]) => (
                <div key={name} className="flex justify-between py-1">
                  <span>{name}</span>
                  <span className="tabular-nums">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold border-t mt-2">
                <span>Jumlah Arus Kas dari Aktivitas Investasi</span>
                <span className="tabular-nums">{formatCurrency(getTotalArusKasInvestasi())}</span>
              </div>
            </div>
          </div>

          {/* Total Arus Kas */}
          <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
            <span>TOTAL ARUS KAS</span>
            <span className="tabular-nums">
              {formatCurrency(getTotalArusKasOperasi() + getTotalArusKasInvestasi())}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
} 