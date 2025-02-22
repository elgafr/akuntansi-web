'use client';

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormModalProps {
  title?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: { name: string; category: string; alamat: string; tahunBerdiri: number; start_priode: Date; end_priode: Date }) => void;
  krsId: string; // Tambahkan prop untuk krs_id
}

export const FormModal = ({
  title = "Input Data Perusahaan",
  isOpen,
  onOpenChange,
  onSave,
  krsId // Terima krsId dari parent component
}: FormModalProps) => {
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");  // Kategori harus berupa string ID kategori
  const [alamat, setAlamat] = useState("");
  const [tahunBerdiri, setTahunBerdiri] = useState<number | string>("");
  const [categories, setCategories] = useState<{ id: number; nama: string }[]>([]);
  const [startPriode, setStartPriode] = useState(new Date());
  const [endPriode, setEndPriode] = useState(new Date());

  // Fetch categories ketika modal dibuka
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/instruktur/kategori');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil kategori:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!companyName || !category || !alamat || !tahunBerdiri || !startPriode || !endPriode) {
      alert("Harap isi semua field yang diperlukan!");
      return;
    }

    if (!krsId) {
      alert("KRS ID belum tersedia. Silakan refresh halaman dan coba lagi.");
      return;
    }

    try {
      // Format tanggal menjadi YYYY-MM-DD
      const startPriodeFormatted = startPriode.toISOString().split('T')[0];
      const endPriodeFormatted = endPriode.toISOString().split('T')[0];

      const payload = {
        nama: companyName,
        alamat: alamat,
        tahun_berdiri: Number(tahunBerdiri),
        kategori_id: category,
        krs_id: krsId,
        start_priode: startPriodeFormatted,  // Kirim dalam format YYYY-MM-DD
        end_priode: endPriodeFormatted,      // Kirim dalam format YYYY-MM-DD
      };

      const response = await axios.post('/mahasiswa/perusahaan', payload);

      if (response.data.success) {
        // Reset form
        setCompanyName("");
        setCategory("");
        setAlamat("");
        setTahunBerdiri("");
        setStartPriode(new Date());
        setEndPriode(new Date());
        onOpenChange(false);

        if (onSave) {
          onSave({
            name: companyName,
            category: category,
            alamat: alamat,
            tahunBerdiri: Number(tahunBerdiri),
            start_priode: startPriodeFormatted, // Kirim dalam format YYYY-MM-DD
            end_priode: endPriodeFormatted,     // Kirim dalam format YYYY-MM-DD
          });
        }
      }
    } catch (error: any) {
      console.error('Gagal menyimpan perusahaan:', error.response?.data);
      alert(
        `Gagal menyimpan perusahaan: ${
          error.response?.data?.message || "Terjadi kesalahan server"
        }`
      );
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-background rounded-3xl overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-[2rem] text-primary text-center">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-primary text-lg">Nama Perusahaan</label>
            <Input
              placeholder="Input nama perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Kategori Perusahaan</label>
            <Select onValueChange={(value) => setCategory(value)} value={category}>
              <SelectTrigger className="rounded-xl h-12 text-gray-500 text-base">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((kategori) => (
                  <SelectItem 
                    key={kategori.id} 
                    value={kategori.id.toString()}
                  >
                    {kategori.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Alamat</label>
            <Input
              placeholder="Input alamat perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Start Priode</label>
            <Input
              placeholder="Input alamat perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
              // value={startPriode.toISOString()}
              type="date"
              onChange={(e) => setStartPriode(new Date(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">End Priode</label>
            <Input
              placeholder="Input alamat perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
              // value={endPriode.toISOString()}
              type="date"
              onChange={(e) => setEndPriode(new Date(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Tahun Berdiri</label>
            <Input
              placeholder="Input tahun berdiri perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
              type="number"
              value={tahunBerdiri}
              onChange={(e) => setTahunBerdiri(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="secondary"
              className="h-12 rounded-xl bg-red-200 hover:bg-red-300 text-base font-normal"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-normal"
              onClick={handleSubmit}
            >
              Simpan data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
