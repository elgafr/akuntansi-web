"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from "@/lib/axios";

interface Akun {
  id: string;
  kode: number;
  nama: string;
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
}

interface LaporanResponse {
  success: boolean;
  perusahaan: PerusahaanData;
  data: LaporanData[];
  total_keseluruhan: number;
}

export function LaporanUmumSection() {
  const [data, setData] = useState<LaporanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/mahasiswa/laporan/keuangan');
        if (response.data.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching laporan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Tidak ada data</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('laporan-umum-section');
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
        title: `Laporan Umum - ${data.perusahaan.nama}`,
        subject: 'Laporan Umum',
        author: data.perusahaan.nama,
        keywords: 'laporan, keuangan, umum',
        creator: data.perusahaan.nama
      });

      pdf.save('laporan-umum.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const groupAccountsByCategory = (data: LaporanData[]) => {
    const groups = {
      asetLancar: data.filter(item => item.akun.kode >= 1100 && item.akun.kode < 1200),
      asetTetap: data.filter(item => item.akun.kode >= 1200 && item.akun.kode < 1300),
      kewajiban: data.filter(item => item.akun.kode >= 2000 && item.akun.kode < 3000),
      modal: data.filter(item => item.akun.kode >= 3000 && item.akun.kode < 4000),
      pendapatan: data.filter(item => item.akun.kode >= 4000 && item.akun.kode < 5000),
      beban: data.filter(item => item.akun.kode >= 5000 && item.akun.kode < 6000),
    };

    return groups;
  };

  const renderAccountGroup = (title: string, accounts: LaporanData[]) => {
    if (accounts.length === 0) return null;

    const total = accounts.reduce((sum, item) => sum + item.total, 0);

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">{title}</h4>
        <div className="pl-4 space-y-1">
          {accounts.map((item) => (
            <div key={item.akun.id} className="flex justify-between py-1">
              <span>{item.akun.nama}</span>
              <span className="tabular-nums">{formatCurrency(item.total)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 border-t font-medium">
            <span>Total {title}</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    );
  };

  const accountGroups = groupAccountsByCategory(data.data);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Umum</h2>
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
        id="laporan-umum-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">{data.perusahaan.nama}</h2>
          <h3 className="text-lg font-semibold">LAPORAN UMUM</h3>
          <p className="text-sm text-gray-600 mt-2">
            Periode: {new Date(data.perusahaan.start_priode).toLocaleDateString('id-ID')} - {new Date(data.perusahaan.end_priode).toLocaleDateString('id-ID')}
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Aset</h3>
            {renderAccountGroup("Aset Lancar", accountGroups.asetLancar)}
            {renderAccountGroup("Aset Tetap", accountGroups.asetTetap)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold">Kewajiban</h3>
            {renderAccountGroup("Kewajiban", accountGroups.kewajiban)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold">Modal</h3>
            {renderAccountGroup("Modal", accountGroups.modal)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold">Pendapatan</h3>
            {renderAccountGroup("Pendapatan", accountGroups.pendapatan)}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold">Beban</h3>
            {renderAccountGroup("Beban", accountGroups.beban)}
          </div>

          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total Keseluruhan</span>
            <span className="tabular-nums">{formatCurrency(data.total_keseluruhan)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
} 