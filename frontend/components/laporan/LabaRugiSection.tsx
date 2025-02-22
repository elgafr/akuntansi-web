"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LabaRugiData {
  penjualan: number;
  potonganPenjualan: number;
  returPenjualan: number;
  pendapatanJasa: number;
  labaTransaksi: number;
  sediaanAwal: number;
  pembelian: number;
  biayaAngkut: number;
  potonganPembelian: number;
  returPembelian: number;
  sediaanAkhir: number;
}

export function LabaRugiSection() {
  const data: LabaRugiData = {
    penjualan: 920200000,
    potonganPenjualan: 0,
    returPenjualan: 0,
    pendapatanJasa: 68500000,
    labaTransaksi: 9500000,
    sediaanAwal: 528750000,
    pembelian: 1115675000,
    biayaAngkut: 0,
    potonganPembelian: 12403500,
    returPembelian: 0,
    sediaanAkhir: 839000000
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTotalPenghasilan = () => {
    return data.penjualan - data.potonganPenjualan - data.returPenjualan + 
           data.pendapatanJasa + data.labaTransaksi;
  };

  const getKosBarangTerjual = () => {
    return data.sediaanAwal + data.pembelian + data.biayaAngkut - 
           data.potonganPembelian - data.returPembelian - data.sediaanAkhir;
  };

  const getLabaKotor = () => {
    return getTotalPenghasilan() - getKosBarangTerjual();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('laba-rugi-section');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('laporan-laba-rugi.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Laporan Laba Rugi</h2>
        <Button 
          variant="outline" 
          onClick={handleExportPDF}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div id="laba-rugi-section" className="bg-white p-6 rounded-lg border">
        <div className="text-center mb-6">
          <h3 className="font-bold">CV FAJAR JAYA</h3>
          <p className="font-medium">LAPORAN LABA RUGI</p>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold mb-4">Penghasilan</h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between py-1">
                <span>Penjualan</span>
                <span className="tabular-nums">{formatCurrency(data.penjualan)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Potongan Penjualan</span>
                <span className="tabular-nums">({formatCurrency(data.potonganPenjualan)})</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Retur Penjualan</span>
                <span className="tabular-nums">({formatCurrency(data.returPenjualan)})</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pendapatan Jasa</span>
                <span className="tabular-nums">{formatCurrency(data.pendapatanJasa)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Laba Transaksi</span>
                <span className="tabular-nums">{formatCurrency(data.labaTransaksi)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Total Penghasilan</span>
                <span className="tabular-nums">{formatCurrency(getTotalPenghasilan())}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Kos Barang Terjual</h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between py-1">
                <span>Sediaan Awal</span>
                <span className="tabular-nums">{formatCurrency(data.sediaanAwal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pembelian</span>
                <span className="tabular-nums">{formatCurrency(data.pembelian)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Potongan Pembelian</span>
                <span className="tabular-nums">({formatCurrency(data.potonganPembelian)})</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sediaan Akhir</span>
                <span className="tabular-nums">({formatCurrency(data.sediaanAkhir)})</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2">
                <span>Kos Barang Terjual</span>
                <span className="tabular-nums">{formatCurrency(getKosBarangTerjual())}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between py-3 font-bold border-t border-black mt-4">
            <span>Laba Kotor</span>
            <span className="tabular-nums">{formatCurrency(getLabaKotor())}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 