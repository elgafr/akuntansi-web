"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from "@/lib/axios";

interface PosisiKeuanganData {
  aset: {
    lancar: {
      'Kas Kecil': number;
      'Kas Bank': number;
      'Surat Berharga Saham': number;
      'Surat Berharga Obligasi': number;
      'Asuransi Dibayar Dimuka': number;
      'Perlengkapan Showroom': number;
      'Perlengkapan Service': number;
      'Piutang Bunga': number;
      'Piutang Usaha': number;
      'Cadangan Kerugian Piutang': number;
      'Piutang Deviden': number;
      'Persediaan': number;
    };
    tetap: {
      'Tanah': number;
      'Gedung': number;
      'Akumulasi Penyusutan Gedung': number;
      'Peralatan Showroom': number;
      'Akum. Penyusutan Peralatan Showroom': number;
      'Peralatan Servis': number;
      'Akum. Penyusutan Peralatan Servis': number;
      'Kendaraan': number;
      'Akum. Penyusutan Kendaraan': number;
    };
  };
  kewajiban: {
    'Kewajiban Usaha': number;
    'Kewajiban Gaji': number;
    'Kewajiban Bunga': number;
    'Kewajiban Pajak Penghasilan Badan': number;
    'Kewajiban Wesel': number;
    'Kewajiban Bank': number;
    'Kewajiban Hipotik': number;
  };
  ekuitas: {
    'Modal, Ahmad': number;
    'Modal, Adi': number;
    'Modal, Ida': number;
  };
}

export function PosisiKeuanganSection() {
  const [data, setData] = useState<PosisiKeuanganData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/mahasiswa/laporan/keuangan');
        if (response.data.success) {
          const transformedData: PosisiKeuanganData = {
            aset: {
              lancar: {
                'Kas Kecil': response.data.data.aset?.lancar?.['Kas Kecil'] || 0,
                'Kas Bank': response.data.data.aset?.lancar?.['Kas Bank'] || 0,
                'Surat Berharga Saham': response.data.data.aset?.lancar?.['Surat Berharga Saham'] || 0,
                'Surat Berharga Obligasi': response.data.data.aset?.lancar?.['Surat Berharga Obligasi'] || 0,
                'Asuransi Dibayar Dimuka': response.data.data.aset?.lancar?.['Asuransi Dibayar Dimuka'] || 0,
                'Perlengkapan Showroom': response.data.data.aset?.lancar?.['Perlengkapan Showroom'] || 0,
                'Perlengkapan Service': response.data.data.aset?.lancar?.['Perlengkapan Service'] || 0,
                'Piutang Bunga': response.data.data.aset?.lancar?.['Piutang Bunga'] || 0,
                'Piutang Usaha': response.data.data.aset?.lancar?.['Piutang Usaha'] || 0,
                'Cadangan Kerugian Piutang': response.data.data.aset?.lancar?.['Cadangan Kerugian Piutang'] || 0,
                'Piutang Deviden': response.data.data.aset?.lancar?.['Piutang Deviden'] || 0,
                'Persediaan': response.data.data.aset?.lancar?.['Persediaan'] || 0,
              },
              tetap: {
                'Tanah': response.data.data.aset?.tetap?.['Tanah'] || 0,
                'Gedung': response.data.data.aset?.tetap?.['Gedung'] || 0,
                'Akumulasi Penyusutan Gedung': response.data.data.aset?.tetap?.['Akumulasi Penyusutan Gedung'] || 0,
                'Peralatan Showroom': response.data.data.aset?.tetap?.['Peralatan Showroom'] || 0,
                'Akum. Penyusutan Peralatan Showroom': response.data.data.aset?.tetap?.['Akum. Penyusutan Peralatan Showroom'] || 0,
                'Peralatan Servis': response.data.data.aset?.tetap?.['Peralatan Servis'] || 0,
                'Akum. Penyusutan Peralatan Servis': response.data.data.aset?.tetap?.['Akum. Penyusutan Peralatan Servis'] || 0,
                'Kendaraan': response.data.data.aset?.tetap?.['Kendaraan'] || 0,
                'Akum. Penyusutan Kendaraan': response.data.data.aset?.tetap?.['Akum. Penyusutan Kendaraan'] || 0,
              }
            },
            kewajiban: {
              'Kewajiban Usaha': response.data.data.kewajiban?.['Kewajiban Usaha'] || 0,
              'Kewajiban Gaji': response.data.data.kewajiban?.['Kewajiban Gaji'] || 0,
              'Kewajiban Bunga': response.data.data.kewajiban?.['Kewajiban Bunga'] || 0,
              'Kewajiban Pajak Penghasilan Badan': response.data.data.kewajiban?.['Kewajiban Pajak Penghasilan Badan'] || 0,
              'Kewajiban Wesel': response.data.data.kewajiban?.['Kewajiban Wesel'] || 0,
              'Kewajiban Bank': response.data.data.kewajiban?.['Kewajiban Bank'] || 0,
              'Kewajiban Hipotik': response.data.data.kewajiban?.['Kewajiban Hipotik'] || 0,
            },
            ekuitas: {
              'Modal, Ahmad': response.data.data.ekuitas?.['Modal, Ahmad'] || 0,
              'Modal, Adi': response.data.data.ekuitas?.['Modal, Adi'] || 0,
              'Modal, Ida': response.data.data.ekuitas?.['Modal, Ida'] || 0
            }
          };
          setData(transformedData);
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

  const actualData = data || {
    aset: {
      lancar: {
        'Kas Kecil': 9000000,
        'Kas Bank': 483193500,
        'Surat Berharga Saham': 116250000,
        'Surat Berharga Obligasi': 500000000,
        'Asuransi Dibayar Dimuka': 10500000,
        'Perlengkapan Showroom': 55700000,
        'Perlengkapan Service': 60050000,
        'Piutang Bunga': 5000000,
        'Piutang Usaha': 801190000,
        'Cadangan Kerugian Piutang': 24335700,
        'Piutang Deviden': 0,
        'Persediaan': 839000000
      },
      tetap: {
        'Tanah': 1200000000,
        'Gedung': 2500000000,
        'Akumulasi Penyusutan Gedung': 395917000,
        'Peralatan Showroom': 100000000,
        'Akum. Penyusutan Peralatan Showroom': 35833000,
        'Peralatan Servis': 300000000,
        'Akum. Penyusutan Peralatan Servis': 107500000,
        'Kendaraan': 175000000,
        'Akum. Penyusutan Kendaraan': 53750000
      }
    },
    kewajiban: {
      'Kewajiban Usaha': 545500000,
      'Kewajiban Gaji': 34000000,
      'Kewajiban Bunga': 8550000,
      'Kewajiban Pajak Penghasilan Badan': 360000,
      'Kewajiban Wesel': 0,
      'Kewajiban Bank': 855000000,
      'Kewajiban Hipotik': 0
    },
    ekuitas: {
      'Modal, Ahmad': 1548045933,
      'Modal, Adi': 1548045933,
      'Modal, Ida': 1998045933
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTotalAsetLancar = () => {
    return actualData.aset?.lancar ? Object.values(actualData.aset.lancar).reduce((a, b) => a + b, 0) : 0;
  };

  const getTotalAsetTetap = () => {
    return actualData.aset?.tetap ? Object.values(actualData.aset.tetap).reduce((a, b) => a + b, 0) : 0;
  };

  const getTotalKewajiban = () => {
    return actualData.kewajiban ? Object.values(actualData.kewajiban).reduce((a, b) => a + b, 0) : 0;
  };

  const getTotalEkuitas = () => {
    return actualData.ekuitas ? Object.values(actualData.ekuitas).reduce((a, b) => a + b, 0) : 0;
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

      pdf.setProperties({
        title: 'Laporan Posisi Keuangan - CV FAJAR JAYA',
        subject: 'Laporan Posisi Keuangan',
        author: 'CV FAJAR JAYA',
        keywords: 'laporan, keuangan, posisi keuangan',
        creator: 'CV FAJAR JAYA'
      });

      pdf.save('laporan-posisi-keuangan.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Posisi Keuangan</h2>
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
        id="posisi-keuangan-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">CV FAJAR JAYA</h2>
          <h3 className="text-lg font-semibold">LAPORAN POSISI KEUANGAN</h3>
        </div>

        <div className="grid grid-cols-2 gap-12">
          {/* Kolom ASET */}
          <div>
            <h4 className="font-bold mb-4 text-lg">ASET</h4>
            
            {/* Aset Lancar */}
            <div className="mb-8">
              <h5 className="font-semibold mb-3">Aset Lancar :</h5>
              <div className="space-y-2">
                {actualData.aset?.lancar && Object.entries(actualData.aset.lancar).map(([name, value]) => (
                  <div key={name} className="flex justify-between py-1">
                    <span>{name}</span>
                    <span className="tabular-nums">{formatCurrency(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Aset Lancar</span>
                  <span className="tabular-nums">{formatCurrency(getTotalAsetLancar())}</span>
                </div>
              </div>
            </div>

            {/* Aset Tetap */}
            <div>
              <h5 className="font-semibold mb-3">Aset Tetap :</h5>
              <div className="space-y-2">
                {actualData.aset?.tetap && Object.entries(actualData.aset.tetap).map(([name, value]) => (
                  <div key={name} className="flex justify-between py-1">
                    <span>{name}</span>
                    <span className="tabular-nums">{formatCurrency(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Aset Tetap</span>
                  <span className="tabular-nums">{formatCurrency(getTotalAsetTetap())}</span>
                </div>
              </div>
            </div>

            {/* Total Aset */}
            <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
              <span>TOTAL ASET</span>
              <span className="tabular-nums">{formatCurrency(getTotalAsetLancar() + getTotalAsetTetap())}</span>
            </div>
          </div>

          {/* Kolom KEWAJIBAN DAN EKUITAS */}
          <div>
            <h4 className="font-bold mb-4 text-lg">KEWAJIBAN DAN EKUITAS</h4>

            {/* Kewajiban */}
            <div className="mb-8">
              <h5 className="font-semibold mb-3">Kewajiban :</h5>
              <div className="space-y-2">
                {actualData.kewajiban && Object.entries(actualData.kewajiban).map(([name, value]) => (
                  <div key={name} className="flex justify-between py-1">
                    <span>{name}</span>
                    <span className="tabular-nums">{formatCurrency(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Kewajiban</span>
                  <span className="tabular-nums">{formatCurrency(getTotalKewajiban())}</span>
                </div>
              </div>
            </div>

            {/* Ekuitas */}
            <div>
              <h5 className="font-semibold mb-3">Ekuitas :</h5>
              <div className="space-y-2">
                {actualData.ekuitas && Object.entries(actualData.ekuitas).map(([name, value]) => (
                  <div key={name} className="flex justify-between py-1">
                    <span>{name}</span>
                    <span className="tabular-nums">{formatCurrency(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t mt-2">
                  <span>Total Ekuitas</span>
                  <span className="tabular-nums">{formatCurrency(getTotalEkuitas())}</span>
                </div>
              </div>
            </div>

            {/* Total Kewajiban dan Ekuitas */}
            <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
              <span>TOTAL KEWAJIBAN DAN EKUITAS</span>
              <span className="tabular-nums">{formatCurrency(getTotalKewajiban() + getTotalEkuitas())}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 