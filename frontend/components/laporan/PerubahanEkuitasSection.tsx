"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from "@/lib/axios";

interface PerubahanEkuitasData {
  modalAwal: {
    'Modal, Ahmad (awal) per 1 Januari 2021': number;
    'Modal, Adi (awal) per 1 Januari 2021': number;
    'Modal, Ida (awal) per 1 Januari 2021': number;
  };
  labaRugi: {
    'Laba bersih setelah pajak': number;
  };
  pembagianLaba: {
    'Laba Ahmad': number;
    'Laba Adi': number;
    'Laba Ida': number;
  };
  prive: {
    'Prive, Ahmad': number;
    'Prive, Adi': number;
    'Prive, Ida': number;
  };
  modalAkhir: {
    'Modal, Ahmad (akhir) per 31 Januari 2021': number;
    'Modal, Adi (akhir) per 31 Januari 2021': number;
    'Modal, Ida (akhir) per 31 Januari 2021': number;
  };
}

export function PerubahanEkuitasSection() {
  const [data, setData] = useState<PerubahanEkuitasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sampleData: PerubahanEkuitasData = {
    modalAwal: {
      'Modal, Ahmad (awal) per 1 Januari 2021': 1500000000,
      'Modal, Adi (awal) per 1 Januari 2021': 1500000000,
      'Modal, Ida (awal) per 1 Januari 2021': 2000000000,
    },
    labaRugi: {
      'Laba bersih setelah pajak': 144137800,
    },
    pembagianLaba: {
      'Laba Ahmad': 48045933,
      'Laba Adi': 48045933,
      'Laba Ida': 48045933,
    },
    prive: {
      'Prive, Ahmad': 0,
      'Prive, Adi': 0,
      'Prive, Ida': 50000000,
    },
    modalAkhir: {
      'Modal, Ahmad (akhir) per 31 Januari 2021': 1548045933,
      'Modal, Adi (akhir) per 31 Januari 2021': 1548045933,
      'Modal, Ida (akhir) per 31 Januari 2021': 1998045933,
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Uncomment ketika API sudah tersedia
        // const response = await axios.get('/mahasiswa/laporan/perubahan-ekuitas');
        // if (response.data.success) {
        //   setData(response.data.data);
        // }
        setData(sampleData);
      } catch (error) {
        console.error('Error fetching laporan:', error);
        setData(sampleData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Tidak ada data</div>;

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
        title: 'Laporan Perubahan Ekuitas - CV FAJAR JAYA',
        subject: 'Laporan Perubahan Ekuitas',
        author: 'CV FAJAR JAYA',
        keywords: 'laporan, keuangan, perubahan ekuitas',
        creator: 'CV FAJAR JAYA'
      });

      pdf.save('laporan-perubahan-ekuitas.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Perubahan Ekuitas</h2>
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
        id="perubahan-ekuitas-section" 
        className="p-8 w-full bg-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1">CV FAJAR JAYA</h2>
          <h3 className="text-lg font-semibold">LAPORAN PERUBAHAN EKUITAS</h3>
        </div>

        <div className="space-y-6">
          {/* Modal Awal */}
          {Object.entries(data.modalAwal).map(([name, value]) => (
            <div key={name} className="flex justify-between py-1">
              <span>{name}</span>
              <span className="tabular-nums">{formatCurrency(value)}</span>
            </div>
          ))}

          {/* Laba Rugi */}
          <div className="border-t pt-4">
            {Object.entries(data.labaRugi).map(([name, value]) => (
              <div key={name} className="flex justify-between py-1">
                <span>{name}</span>
                <span className="tabular-nums">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>

          {/* Pembagian Laba */}
          <div className="pl-4">
            <div className="font-medium mb-2">Pembagian Laba:</div>
            {Object.entries(data.pembagianLaba).map(([name, value]) => (
              <div key={name} className="flex justify-between py-1">
                <span>{name}</span>
                <span className="tabular-nums">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>

          {/* Prive */}
          <div>
            {Object.entries(data.prive).map(([name, value]) => (
              <div key={name} className="flex justify-between py-1">
                <span>{name}</span>
                <span className="tabular-nums">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>

          {/* Modal Akhir */}
          <div className="border-t pt-4">
            {Object.entries(data.modalAkhir).map(([name, value]) => (
              <div key={name} className="flex justify-between py-1 font-medium">
                <span>{name}</span>
                <span className="tabular-nums">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 