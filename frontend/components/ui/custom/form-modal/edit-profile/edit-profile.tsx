import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    setFormData({
      gender: profileData.gender || '',
      tanggal_lahir: profileData.tanggal_lahir || '',
      alamat: profileData.alamat || '',
      hp: profileData.hp || '',
    });
  }, [profileData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileData(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
      <DialogContent className="rounded-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Read-only fields */}
            <div>
              <Label>Nama Lengkap</Label>
              <Input value={profileData.user.name} disabled />
            </div>
            <div>
              <Label>NIM</Label>
              <Input value={profileData.user.nim} disabled />
            </div>

            {/* Editable fields */}
            <div>
              <Label>Gender</Label>
              <Input
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Tanggal Lahir</Label>
              <div className="relative">
                <Input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir || ''}
                  onChange={handleChange}
                  className="rounded-xl pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <Label>Alamat</Label>
              <Input
                name="alamat"
                value={formData.alamat || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>No HP</Label>
              <Input
                name="hp"
                value={formData.hp || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}