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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  // State untuk menyimpan kelas yang dipilih
  const [selectedClasses, setSelectedClasses] = React.useState({
    akuntansiSyariah: "",
    pemeriksaanAkuntansi: "",
    akuntansiSektorPublik: "",
  });

  // Fungsi untuk membuka modal edit
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  // Fungsi untuk menutup modal edit
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Interface untuk data profil
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

  // Fungsi untuk menyimpan perubahan ke localStorage
  const saveProfileData = (newData: ProfileData) => {
    setProfileData(newData);
    localStorage.setItem("profileData", JSON.stringify(newData));
    closeEditModal();
  };

  // Fungsi untuk mengatur kelas yang dipilih
  const handleClassSelection = (category: string, className: string) => {
    setSelectedClasses((prev) => ({
      ...prev,
      [category]: className,
    }));
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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 w-full justify-between">
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
                  <div className="text-sm font-medium">
                    {profileData.fullName}
                  </div>
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
                <h1 className="text-2xl font-semibold">
                  {profileData.fullName}
                </h1>
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
                  <p className="text-gray-600 text-lg">
                    {profileData.fullName}
                  </p>
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
          <DialogContent className="rounded-xl overflow-hidden">
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
                <div>
                  <Label className="block mb-1">Nama Lengkap</Label>
                  <Input
                    name="fullName"
                    defaultValue={profileData.fullName}
                    placeholder="Nama Lengkap"
                    disabled
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="block mb-1">NIM</Label>
                  <Input
                    name="nim"
                    defaultValue={profileData.nim}
                    placeholder="NIM"
                    disabled
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="block mb-1">Gender</Label>
                  <Input
                    name="gender"
                    defaultValue={profileData.gender}
                    placeholder="Gender"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="block mb-1">Tempat Lahir</Label>
                  <Input
                    name="birthPlace"
                    defaultValue={profileData.birthPlace}
                    placeholder="Tempat Lahir"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="block mb-1">Tanggal Lahir</Label>
                  <Input
                    name="birthDate"
                    defaultValue={profileData.birthDate}
                    placeholder="Tanggal Lahir"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="block mb-1">Email</Label>
                  <Input
                    name="email"
                    defaultValue={profileData.email}
                    placeholder="Email"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="block mb-1">Alamat Rumah</Label>
                  <Input
                    name="address"
                    defaultValue={profileData.address}
                    placeholder="Alamat Rumah"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="block mb-1">No Handphone</Label>
                  <Input
                    name="phone"
                    defaultValue={profileData.phone}
                    placeholder="No Handphone"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Text untuk Pilih Kelas dan Kelas yang Dipilih */}
        <div className="flex justify-between items-center mt-6 px-10">
          <div className="text-xl font-medium text-gray-700">Pilih Kelas</div>
          <div className="text-xl font-medium text-gray-700 mr-[400px]">
            Kelas yang Dipilih
          </div>
        </div>

        {/* Accordion Card */}
        <div className="flex gap-6">
          <Card className="w-1/2 mt-4 ml-10">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Akuntansi Syariah</AccordionTrigger>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "akuntansiSyariah",
                        "Akuntansi Syariah A"
                      )
                    }
                  >
                    Akuntansi Syariah A
                  </AccordionContent>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "akuntansiSyariah",
                        "Akuntansi Syariah B"
                      )
                    }
                  >
                    Akuntansi Syariah B
                  </AccordionContent>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "akuntansiSyariah",
                        "Akuntansi Syariah C"
                      )
                    }
                  >
                    Akuntansi Syariah C
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Pemeriksaan Akuntansi</AccordionTrigger>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "pemeriksaanAkuntansi",
                        "Pemeriksaan Akuntansi A"
                      )
                    }
                  >
                    Pemeriksaan Akuntansi A
                  </AccordionContent>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "pemeriksaanAkuntansi",
                        "Pemeriksaan Akuntansi B"
                      )
                    }
                  >
                    Pemeriksaan Akuntansi B
                  </AccordionContent>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "pemeriksaanAkuntansi",
                        "Pemeriksaan Akuntansi C"
                      )
                    }
                  >
                    Pemeriksaan Akuntansi C
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Akuntansi Sektor Publik</AccordionTrigger>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "akuntansiSektorPublik",
                        "Akuntansi Sektor Publik A"
                      )
                    }
                  >
                    Akuntansi Sektor Publik A
                  </AccordionContent>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "akuntansiSektorPublik",
                        "Akuntansi Sektor Publik B"
                      )
                    }
                  >
                    Akuntansi Sektor Publik B
                  </AccordionContent>
                  <AccordionContent
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                    onClick={() =>
                      handleClassSelection(
                        "akuntansiSektorPublik",
                        "Akuntansi Sektor Publik C"
                      )
                    }
                  >
                    Akuntansi Sektor Publik C
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Kelas yang Dipilih Card */}
          <Card className="w-1/2 mt-4 mr-10">
            <CardContent className="p-6 space-y-4">
              {selectedClasses.akuntansiSyariah && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-3">
                    <p className="text-lg font-medium">Akuntansi Syariah</p>
                    <p className="text-gray-600">
                      {selectedClasses.akuntansiSyariah}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedClasses.pemeriksaanAkuntansi && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-3">
                    <p className="text-lg font-medium">Pemeriksaan Akuntansi</p>
                    <p className="text-gray-600">
                      {selectedClasses.pemeriksaanAkuntansi}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedClasses.akuntansiSektorPublik && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-3">
                    <p className="text-lg font-medium">
                      Akuntansi Sektor Publik
                    </p>
                    <p className="text-gray-600">
                      {selectedClasses.akuntansiSektorPublik}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!selectedClasses.akuntansiSyariah &&
                !selectedClasses.pemeriksaanAkuntansi &&
                !selectedClasses.akuntansiSektorPublik && (
                  <p className="text-gray-500 text-center py-4">
                    Belum ada kelas yang dipilih
                  </p>
                )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
