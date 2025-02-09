"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Page() {
  // State untuk data diri
  const [profileData, setProfileData] = React.useState({
    fullName: "Arthur",
    nim: "202210370311066",
    gender: "Laki-laki",
    birthPlace: "Yutopia",
    birthDate: "13 Juni 899",
    email: "Arthur@example.com",
    address: "Yutopia",
    phone: "+628123456789",
  });

  // State untuk mengontrol pop-up modal
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // Fungsi untuk membuka modal edit
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  // Fungsi untuk menutup modal edit
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Fungsi untuk menyimpan perubahan ke localStorage
  interface ProfileData {
    fullName: string;
    nim: string;
    gender: string;
    birthPlace: string;
    birthDate: string;
    email: string;
    address: string;
    phone: string;
  }

  const saveProfileData = (newData: ProfileData) => {
    setProfileData(newData);
    localStorage.setItem("profileData", JSON.stringify(newData));
    closeEditModal();
  };

  // Mengambil data dari localStorage saat komponen dimuat
  React.useEffect(() => {
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      setProfileData(JSON.parse(savedData));
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <h1 className="text-2xl font-bold ml-6 text-black">
                    Dashboard
                  </h1>
                  <h2 className="text-sm ml-6">
                    Let&apos;s check your Dashboard today
                  </h2>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                </Avatar>
                <div className="text-left mr-12">
                  <div className="text-sm font-medium">Arthur</div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex gap-6 px-10 mt-6">
          {/* Profile Card */}
          <Card className="w-[400px] flex-shrink-0">
            <div className="flex flex-col items-center gap-10 p-6">
              <Avatar className="h-40 w-40">
                <AvatarImage src="https://github.com/shadcn.png" />
              </Avatar>
              <div className="w-full text-start">
                <h1 className="text-2xl font-semibold">{profileData.fullName}</h1>
                <h2 className="text-xl text-gray-600">{profileData.nim}</h2>
                <Button className="text-black font-bold rounded-xl mt-2">
                  Student
                </Button>
              </div>
              <Button
                className="text-black font-bold rounded-xl w-full"
                onClick={openEditModal}
              >
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Informasi Data Diri Card */}
          <Card className="flex-1">
            <CardHeader className="pb-6 text-3xl">
              <CardTitle>Informasi Data Diri</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="grid grid-cols-2 gap-6 h-full px-6 pb-6">
                {/* Kiri */}
                <div className="space-y-1">
                  <Label className="text-xl">Nama Lengkap</Label>
                  <p className="text-gray-600 text-lg">{profileData.fullName}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">Gender</Label>
                  <p className="text-gray-600 text-lg">{profileData.gender}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">Tempat, Tanggal Lahir</Label>
                  <p className="text-gray-600 text-lg">
                    {profileData.birthPlace}, {profileData.birthDate}
                  </p>
                </div>

                {/* Kanan */}
                <div className="space-y-1">
                  <Label className="text-xl">Alamat Email</Label>
                  <p className="text-gray-600 text-lg">{profileData.email}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">Alamat Rumah</Label>
                  <p className="text-gray-600 text-lg">{profileData.address}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">No Handphone</Label>
                  <p className="text-gray-600 text-lg">{profileData.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Edit Profile */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const newData: ProfileData = {
                  fullName: formData.get("fullName") as string,
                  nim: formData.get("nim") as string,
                  gender: formData.get("gender") as string,
                  birthPlace: formData.get("birthPlace") as string,
                  birthDate: formData.get("birthDate") as string,
                  email: formData.get("email") as string,
                  address: formData.get("address") as string,
                  phone: formData.get("phone") as string,
                };
                saveProfileData(newData);
              }}
            >
              <div className="space-y-4">
                <Input
                  name="fullName"
                  defaultValue={profileData.fullName}
                  placeholder="Nama Lengkap"
                />
                <Input
                  name="nim"
                  defaultValue={profileData.nim}
                  placeholder="NIM"
                />
                <Input
                  name="gender"
                  defaultValue={profileData.gender}
                  placeholder="Gender"
                />
                <Input
                  name="birthPlace"
                  defaultValue={profileData.birthPlace}
                  placeholder="Tempat Lahir"
                />
                <Input
                  name="birthDate"
                  defaultValue={profileData.birthDate}
                  placeholder="Tanggal Lahir"
                />
                <Input
                  name="email"
                  defaultValue={profileData.email}
                  placeholder="Email"
                />
                <Input
                  name="address"
                  defaultValue={profileData.address}
                  placeholder="Alamat Rumah"
                />
                <Input
                  name="phone"
                  defaultValue={profileData.phone}
                  placeholder="No Handphone"
                />
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
      </SidebarInset>
    </SidebarProvider>
  );
}