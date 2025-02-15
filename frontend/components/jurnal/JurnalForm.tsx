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

export function JurnalForm({ isOpen, onClose, onSubmit, akunList, subAkunList }: JurnalFormProps) {
  const [formData, setFormData] = useState<Transaction>({
    id: "",
    date: "",
    documentType: "",
    description: "",
    namaAkun: "",
    kodeAkun: "",
    akun_id: "",
    debit: 0,
    kredit: 0,
    perusahaan_id: ""
  });

  const [perusahaanId, setPerusahaanId] = useState<string | null>(null);

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

      if (!perusahaanId) {
        alert('Perusahaan online tidak ditemukan');
        return;
      }

      const payload = {
        tanggal: formData.date,
        bukti: formData.documentType,
        keterangan: formData.description,
        akun_id: formData.akun_id,
        debit: formData.debit || null,
        kredit: formData.kredit || null,
        perusahaan_id: perusahaanId,
        sub_akun_id: null
      };

      console.log('Sending payload:', payload);

      const response = await axios.post('/mahasiswa/jurnal', payload);

      if (response.data) {
        const newTransaction = {
          id: response.data.id || response.data.data?.id || '',
          date: formData.date,
          documentType: formData.documentType,
          description: formData.description,
          namaAkun: formData.namaAkun,
          kodeAkun: formData.kodeAkun,
          akun_id: formData.akun_id,
          debit: formData.debit,
          kredit: formData.kredit,
          perusahaan_id: perusahaanId
        };
        
        onSubmit(newTransaction);
        onClose();
        
        setFormData({
          id: "",
          date: "",
          documentType: "",
          description: "",
          namaAkun: "",
          kodeAkun: "",
          akun_id: "",
          debit: 0,
          kredit: 0,
          perusahaan_id: ""
        });

        alert('Data berhasil disimpan');
        
        window.location.reload();
      } else {
        throw new Error('Gagal menyimpan data');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.log('Full response:', error.response);
      
      if (error.response?.data?.message) {
        alert(`Gagal menyimpan data: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Gagal menyimpan data. Pastikan semua field terisi dengan benar');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label>Tanggal</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label>Bukti</label>
              <Input
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <label>Keterangan</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <label>Kode Akun</label>
              <Select
                value={formData.kodeAkun}
                onValueChange={(value) => {
                  const selectedAkun = akunList.find(a => a.kode.toString() === value);
                  const selectedSubAkun = subAkunList.find(s => s.kode.toString() === value);
                  
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
            <Button type="submit">Tambah ke Jurnal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 