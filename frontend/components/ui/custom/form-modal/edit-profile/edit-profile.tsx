import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

type ProfileData = {
  name: string;
  nim: string;
  gender: string;
  birthPlace: string;
  birthDate: string; 
  email: string;
  address: string;
  phone: string;
};

interface EditProfileProps {
  isEditModalOpen: boolean;
  closeEditModal: () => void;
  profileData: ProfileData;
  saveProfileData: (newData: ProfileData, profileId: string) => void;
  profileId: string;
}

export default function EditProfile({
  isEditModalOpen,
  closeEditModal,
  profileData,
  saveProfileData,
  profileId, 
}: EditProfileProps) {

  const [newProfileData, setNewProfileData] = useState({
    name: profileData.name || '',
    nim: profileData.nim || '',
    gender: profileData.gender || '',
    birthPlace: profileData.birthPlace || '',
    birthDate: profileData.birthDate || '',
    email: profileData.email || '',
    address: profileData.address || '',
    phone: profileData.phone || '',
  });

  useEffect(() => {
     setNewProfileData({
      name: profileData.name || '',
      nim: profileData.nim || '',
      gender: profileData.gender || '',
      birthPlace: profileData.birthPlace || '',
      birthDate: profileData.birthDate || '',
      email: profileData.email || '',
      address: profileData.address || '',
      phone: profileData.phone || '',
    });
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProfileData({
      ...newProfileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileData(newProfileData, profileId);
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
      <DialogContent className="rounded-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label className="block mb-1">Nama Lengkap</Label>
              <Input
                name="name"
                value={newProfileData.name}
                onChange={handleChange}
                disabled
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="block mb-1">NIM</Label>
              <Input
                name="nim"
                value={newProfileData.nim}
                onChange={handleChange}
                disabled
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="block mb-1">Gender</Label>
              <Input
                name="gender"
                value={newProfileData.gender}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="block mb-1">Tanggal Lahir</Label>
              <div className="relative">
                <Input
                  name="birthDate"
                  value={newProfileData.birthDate}
                  onChange={handleChange}
                  type="date"
                  className="rounded-xl pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <Label className="block mb-1">Email</Label>
              <Input
                name="email"
                value={newProfileData.email}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="block mb-1">Alamat Rumah</Label>
              <Input
                name="address"
                value={newProfileData.address}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="block mb-1">No Handphone</Label>
              <Input
                name="phone"
                value={newProfileData.phone}
                onChange={handleChange}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={closeEditModal} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
