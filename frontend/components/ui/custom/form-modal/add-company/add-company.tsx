import { useState, useEffect } from "react";
import axios from "axios";
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
  onSave?: (data: { name: string; category: string; alamat: string; tahunBerdiri: number }) => void;
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

  // Fetch categories ketika modal dibuka
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/instruktur/kategori');
        setCategories(response.data.data); // Pastikan Anda mengakses `data` dari response
      } catch (error) {
        console.error('Gagal mengambil kategori:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!companyName || !category || !alamat || !tahunBerdiri) return;
  
    try {
      // Mengambil token dari localStorage
      const token = localStorage.getItem("auth_token"); // Pastikan token ada
  
      // Cek apakah token ada
      if (!token) {
        console.error("User not authenticated");
        return;
      }
  
      const payload = {
        nama: companyName,
        alamat: alamat,
        tahun_berdiri: Number(tahunBerdiri),
        kategori_id: category, // Kirimkan ID kategori yang dipilih
        krs_id: krsId, // Kirimkan krsId
        status: "active" // Status default
      };
  
      // Mengirim data ke backend Laravel dengan menambahkan header Authorization
      const response = await axios.post(
        'http://localhost:8000/api/mahasiswa/perusahaan', // Pastikan URL backend Laravel benar
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Menambahkan token ke header Authorization
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.data.success) {
        // Reset form
        setCompanyName("");
        setCategory("");
        setAlamat("");
        setTahunBerdiri("");
        onOpenChange(false); // Menutup modal setelah berhasil menambahkan perusahaan
        
        // Panggil callback onSave jika ada
        if (onSave) {
          onSave({
            name: companyName,
            category: category,
            alamat: alamat,
            tahunBerdiri: Number(tahunBerdiri),
          });
        }
      }
    } catch (error) {
      console.error('Gagal menyimpan perusahaan:', error);
      // Tambahkan notifikasi error jika perlu
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

        <div className="p-8 space-y-6">
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
                    value={kategori.id.toString()} // Pastikan nilai kategori berupa ID
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
            <label className="text-primary text-lg">Tahun Berdiri</label>
            <Input
              placeholder="Input tahun berdiri perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
              type="string"
              value={tahunBerdiri}
              onChange={(e) => setTahunBerdiri(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="secondary"
              className="h-12 rounded-xl bg-red-200 hover:bg-red-300 text-base font-normal"
              onClick={() => onOpenChange(false)} // Close the modal on Cancel
            >
              Batal
            </Button>
            <Button
              className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-normal"
              onClick={handleSubmit} // Save data and close modal
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
