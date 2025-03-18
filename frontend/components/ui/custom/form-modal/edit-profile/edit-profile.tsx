"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

type ProfileData = {
  id: string;
  user: {
    id: string;
    name: string;
    nim: string;
    email: string;
  };
  gender?: string;
  tanggal_lahir?: string;
  alamat?: string;
  hp?: string;
};

interface EditProfileProps {
  isEditModalOpen: boolean;
  closeEditModal: () => void;
  profileData: ProfileData;
  saveProfileData: (newData: Partial<ProfileData>) => void;
}

export default function EditProfile({
  isEditModalOpen,
  closeEditModal,
  profileData,
  saveProfileData,
}: EditProfileProps) {
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    gender: '',
    tanggal_lahir: '',
    alamat: '',
    hp: '',
  });

  // Inisialisasi form data saat modal dibuka
  useEffect(() => {
    if (profileData && isEditModalOpen) {
      setFormData({
        gender: profileData.gender || '',
        tanggal_lahir: profileData.tanggal_lahir?.split('T')[0] || '',
        alamat: profileData.alamat || '',
        hp: profileData.hp || '',
      });
    }
  }, [profileData, isEditModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Siapkan payload dengan ID profil
    const payload = {
      ...formData,
      id: profileData.id // Pastikan ID profil dikirim
    };
    
    saveProfileData(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Hapus konversi ke Date dan langsung gunakan nilai dari input
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const errors = [];
    
    // Validasi nomor HP
    if (formData.hp && !/^[0-9]+$/.test(formData.hp)) {
      errors.push('Nomor HP harus berupa angka');
    }
  
    // Validasi format tanggal (YYYY-MM-DD)
    if (formData.tanggal_lahir && !/^\d{4}-\d{2}-\d{2}$/.test(formData.tanggal_lahir)) {
      errors.push('Format tanggal harus YYYY-MM-DD');
    }
  
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }
    
    return true;
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
      <DialogContent className="rounded-xl overflow-hidden max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Profil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informasi User (Read-only) */}
          <div className="space-y-2">
            <Label>Nama Lengkap</Label>
            <Input 
              value={profileData.user.name} 
              disabled 
              className="bg-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label>NIM</Label>
            <Input 
              value={profileData.user.nim} 
              disabled 
              className="bg-gray-100"
            />
          </div>

          {/* Field yang bisa diedit */}
          <div className="space-y-2">
            <Label>Jenis Kelamin</Label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Tanggal Lahir</Label>
            <div className="relative">
              <Input
                type="date"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alamat</Label>
            <Input
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          <div className="space-y-2">
            <Label>Nomor HP</Label>
            <Input
              name="hp"
              value={formData.hp}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              pattern="[0-9]*"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeEditModal}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}