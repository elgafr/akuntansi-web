"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import axios from "@/lib/axios";
import { Pencil, Trash2, Check } from "lucide-react";

interface JurnalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void;
  akunList: Akun[];
  subAkunList: SubAkun[];
}

interface Transaction {
  id: string;
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  akun_id: string;
  sub_akun_id: string | null;
  debit: number;
  kredit: number;
  perusahaan_id: string;
}

interface Akun {
  id: string;
  kode: number;
  nama: string;
  status: string;
}

interface SubAkun {
  id: string;
  kode: number;
  nama: string;
  akun: {
    id: string;
    kode: number;
    nama: string;
  };
}

// Add new interface for temporary transactions
interface TempTransaction {
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  akun_id: string;
  debit: number;
  kredit: number;
}

export function JurnalForm({ isOpen, onClose, onSubmit, akunList, subAkunList }: JurnalFormProps) {
  const [formData, setFormData] = useState<Transaction>({
    id: "",
    date: "",
    documentType: "",
    description: "",
    namaAkun: "",
    kodeAkun: "",
    akun_id: "",
    sub_akun_id: null,
    debit: 0,
    kredit: 0,
    perusahaan_id: ""
  });

  const [perusahaanId, setPerusahaanId] = useState<string | null>(null);

  // Add state for temporary transactions
  const [tempTransactions, setTempTransactions] = useState<TempTransaction[]>([]);

  // Tambahkan state untuk mode edit kejadian
  const [isEditingEvent, setIsEditingEvent] = useState(false);

  useEffect(() => {
    const fetchActivePerusahaan = async () => {
      try {
        const response = await axios.get('/mahasiswa/perusahaan');
        if (response.data.data) {
          if (response.data.data.status === 'online') {
            setPerusahaanId(response.data.data.id);
          } else if (Array.isArray(response.data.data)) {
            const onlinePerusahaan = response.data.data.find((p: any) => p.status === 'online');
            if (onlinePerusahaan) {
              setPerusahaanId(onlinePerusahaan.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching perusahaan:', error);
      }
    };

    fetchActivePerusahaan();
  }, []);

  // Add function to calculate totals
  const calculateTotals = () => {
    return tempTransactions.reduce(
      (acc, curr) => ({
        totalDebit: acc.totalDebit + (curr.debit || 0),
        totalKredit: acc.totalKredit + (curr.kredit || 0),
      }),
      { totalDebit: 0, totalKredit: 0 }
    );
  };

  // Modify handleSubmit to handle multiple transactions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.date || !formData.documentType || !formData.description || !formData.akun_id) {
        alert('Semua field harus diisi');
        return;
      }

      if (formData.debit === 0 && formData.kredit === 0) {
        alert('Masukkan nilai debit atau kredit');
        return;
      }

      // Jika ini transaksi pertama, simpan informasi kejadian
      if (tempTransactions.length === 0) {
        setFormData({
          ...formData,
          date: formData.date,
          documentType: formData.documentType,
          description: formData.description,
        });
      }

      // Add current transaction to temporary list
      setTempTransactions([...tempTransactions, {
        date: tempTransactions.length === 0 ? formData.date : tempTransactions[0].date,
        documentType: tempTransactions.length === 0 ? formData.documentType : tempTransactions[0].documentType,
        description: tempTransactions.length === 0 ? formData.description : tempTransactions[0].description,
        namaAkun: formData.namaAkun,
        kodeAkun: formData.kodeAkun,
        akun_id: formData.akun_id,
        debit: formData.debit,
        kredit: formData.kredit,
      }]);

      // Clear form except for date, documentType, and description if there are existing transactions
      setFormData({
        ...formData,
        namaAkun: "",
        kodeAkun: "",
        akun_id: "",
        debit: 0,
        kredit: 0,
      });
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      alert('Gagal menambahkan transaksi');
    }
  };

  // Add function to submit all transactions
  const handleSubmitAll = async () => {
    const { totalDebit, totalKredit } = calculateTotals();
    
    if (totalDebit !== totalKredit) {
      alert('Total debit dan kredit harus seimbang');
      return;
    }

    if (!perusahaanId) {
      alert('Perusahaan online tidak ditemukan');
      return;
    }

    try {
      // Submit all transactions
      for (const transaction of tempTransactions) {
        const payload = {
          tanggal: transaction.date,
          bukti: transaction.documentType,
          keterangan: transaction.description,
          akun_id: transaction.akun_id,
          sub_akun_id: transaction.sub_akun_id,
          debit: transaction.debit || null,
          kredit: transaction.kredit || null,
          perusahaan_id: perusahaanId
        };

        await axios.post('/mahasiswa/jurnal', payload);
      }

      alert('Semua transaksi berhasil disimpan');
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error('Error submitting transactions:', error);
      alert('Gagal menyimpan transaksi');
    }
  };

  // Tambahkan fungsi untuk menghapus transaksi
  const handleDeleteTransaction = (index: number) => {
    const newTransactions = [...tempTransactions];
    newTransactions.splice(index, 1);
    setTempTransactions(newTransactions);
  };

  // Tambahkan fungsi untuk edit kejadian
  const handleEditEvent = () => {
    setIsEditingEvent(true);
    setFormData({
      ...formData,
      date: tempTransactions[0].date,
      documentType: tempTransactions[0].documentType,
      description: tempTransactions[0].description,
    });
  };

  // Tambahkan fungsi untuk update kejadian
  const handleUpdateEvent = () => {
    const updatedTransactions = tempTransactions.map(transaction => ({
      ...transaction,
      date: formData.date,
      documentType: formData.documentType,
      description: formData.description,
    }));
    setTempTransactions(updatedTransactions);
    setIsEditingEvent(false);
  };

  // Update fungsi handleEditTransaction
  const handleEditTransaction = (transaction: TempTransaction, index: number) => {
    // Set form data dengan nilai transaksi yang akan diedit
    setFormData({
      ...formData,
      namaAkun: transaction.namaAkun,
      kodeAkun: transaction.kodeAkun,
      akun_id: transaction.akun_id,
      debit: transaction.debit,
      kredit: transaction.kredit,
    });
  };

  // Update fungsi handleUpdateTransaction
  const handleUpdateTransaction = (index: number) => {
    // Validasi form sebelum update
    if (!formData.namaAkun || !formData.kodeAkun || !formData.akun_id) {
      alert('Pilih akun terlebih dahulu');
      return;
    }

    if (formData.debit === 0 && formData.kredit === 0) {
      alert('Masukkan nilai debit atau kredit');
      return;
    }

    const updatedTransactions = [...tempTransactions];
    updatedTransactions[index] = {
      ...tempTransactions[index], // Pertahankan data lama
      namaAkun: formData.namaAkun,
      kodeAkun: formData.kodeAkun,
      akun_id: formData.akun_id,
      debit: formData.debit,
      kredit: formData.kredit,
    };
    setTempTransactions(updatedTransactions);
    
    // Reset form
    setFormData({
      ...formData,
      namaAkun: "",
      kodeAkun: "",
      akun_id: "",
      debit: 0,
      kredit: 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6">
          {/* Left side - Form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-[400px]">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label>Tanggal</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={tempTransactions.length > 0}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label>Bukti</label>
                <Input
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  disabled={tempTransactions.length > 0}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label>Keterangan</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={tempTransactions.length > 0}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label>Kode Akun</label>
                <Select
                  value={formData.kodeAkun}
                  onValueChange={async (value) => {
                    const selectedAkun = akunList.find(a => a.kode.toString() === value);
                    const selectedSubAkun = subAkunList.find(s => s.kode.toString() === value);
                    
                    if (selectedAkun) {
                      setFormData({
                        ...formData,
                        kodeAkun: selectedAkun.kode.toString(),
                        namaAkun: selectedAkun.nama,
                        akun_id: selectedAkun.id,
                        sub_akun_id: null
                      });
                    } else if (selectedSubAkun) {
                      try {
                        // Fetch data jurnal dengan sub akun
                        const response = await axios.post('/mahasiswa/jurnal/subakun', {
                          akun_id: selectedSubAkun.akun.id,
                          sub_akun_id: selectedSubAkun.id
                        });

                        if (response.data.success) {
                          setFormData({
                            ...formData,
                            kodeAkun: selectedSubAkun.kode.toString(),
                            namaAkun: selectedSubAkun.nama,
                            akun_id: selectedSubAkun.akun.id,
                            sub_akun_id: selectedSubAkun.id
                          });
                        }
                      } catch (error) {
                        console.error('Error fetching sub akun data:', error);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kode Akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Akun</SelectLabel>
                      {akunList.map((akun) => (
                        <SelectItem key={akun.id} value={akun.kode.toString()}>
                          {akun.kode}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Sub Akun</SelectLabel>
                      {subAkunList.map((subAkun) => (
                        <SelectItem key={subAkun.id} value={subAkun.kode.toString()}>
                          {subAkun.kode}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label>Nama Akun</label>
                <Select
                  value={formData.namaAkun}
                  onValueChange={(value) => {
                    const selectedAkun = akunList.find(a => a.nama === value);
                    const selectedSubAkun = subAkunList.find(s => s.nama === value);
                    
                    if (selectedAkun) {
                      setFormData({
                        ...formData,
                        kodeAkun: selectedAkun.kode.toString(),
                        namaAkun: selectedAkun.nama,
                        akun_id: selectedAkun.id
                      });
                    } else if (selectedSubAkun) {
                      setFormData({
                        ...formData,
                        kodeAkun: selectedSubAkun.kode.toString(),
                        namaAkun: selectedSubAkun.nama,
                        akun_id: selectedSubAkun.akun.id
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Nama Akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Akun</SelectLabel>
                      {akunList.map((akun) => (
                        <SelectItem key={akun.id} value={akun.nama}>
                          {akun.nama}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Sub Akun</SelectLabel>
                      {subAkunList.map((subAkun) => (
                        <SelectItem key={subAkun.id} value={subAkun.nama}>
                          {subAkun.nama}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label>Debit</label>
                <Input
                  type="number"
                  value={formData.debit}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    debit: Number(e.target.value),
                    kredit: 0
                  })}
                  disabled={formData.kredit > 0}
                  min="0"
                />
              </div>

              <div className="grid gap-2">
                <label>Kredit</label>
                <Input
                  type="number"
                  value={formData.kredit}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    kredit: Number(e.target.value),
                    debit: 0
                  })}
                  disabled={formData.debit > 0}
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit">Tambah ke Ringkasan</Button>
            </div>
          </form>

          {/* Right side - Summary Card */}
          <div className="flex-1 border rounded-lg p-4 space-y-4 min-w-[600px]">
            <h3 className="font-semibold text-lg">Ringkasan Transaksi</h3>
            
            {/* Header info untuk transaksi pertama */}
            {tempTransactions.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-700">Informasi Kejadian</h4>
                  {!isEditingEvent ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditEvent}
                      className="h-8 px-2 hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit Kejadian
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUpdateEvent}
                      className="h-8 px-2 hover:bg-gray-100 text-green-600"
                    >
                      Update Kejadian
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tanggal</p>
                    {isEditingEvent ? (
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-base font-medium mt-1">{tempTransactions[0].date}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bukti</p>
                    {isEditingEvent ? (
                      <Input
                        value={formData.documentType}
                        onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-base font-medium mt-1">{tempTransactions[0].documentType}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Keterangan</p>
                    {isEditingEvent ? (
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-base font-medium mt-1">{tempTransactions[0].description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Table untuk transaksi */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Kode Akun</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nama Akun</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Debit</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Kredit</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempTransactions.map((transaction, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{transaction.kodeAkun}</td>
                        <td className="px-4 py-2">{transaction.namaAkun}</td>
                        <td className="px-4 py-2 text-right">
                          {transaction.debit ? `Rp ${transaction.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {transaction.kredit ? `Rp ${transaction.kredit.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction, index)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Pencil className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateTransaction(index)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTransaction(index)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                      <td className="px-4 py-2 text-right">
                        Rp {calculateTotals().totalDebit.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        Rp {calculateTotals().totalKredit.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Status keseimbangan dan tombol submit */}
            {tempTransactions.length > 0 && (
              <>
                <div className="text-center py-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    calculateTotals().totalDebit === calculateTotals().totalKredit
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {calculateTotals().totalDebit === calculateTotals().totalKredit
                      ? "✓ Seimbang"
                      : "× Tidak seimbang"}
                  </span>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSubmitAll}
                  disabled={calculateTotals().totalDebit !== calculateTotals().totalKredit}
                >
                  Simpan ke Jurnal
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 