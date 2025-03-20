"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import EditProfile from "@/components/ui/custom/form-modal/edit-profile/edit-profile";
import axios from "@/lib/axios";
import Krs from "@/components/ui/custom/form-modal/krs/krs";

type ProfileData = {
  id: string;
  user_id: string;
  gender?: string;
  tanggal_lahir?: string;
  alamat?: string;
  hp?: string;
  foto?: string;
  user: {
    id: string;
    name: string;
    nim: string;
    email: string;
  };
};

export default function Page() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    console.log(userData.id);

    // 1. Cek token tanpa redirect langsung
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchProfile = async () => {
      try {
        // 2. Validasi token dengan request ke endpoint yang sama
        const response = await axios.get(`/mahasiswa/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = response.data.data.user;
        console.log(currentUser);
        const userProfile = currentUser ? response.data.data : null;

        if (userProfile) {
          setProfileData({
            id: userProfile.id,
            user_id: userProfile.user_id,
            gender: userProfile.gender,
            tanggal_lahir: userProfile.tanggal_lahir,
            alamat: userProfile.alamat,
            hp: userProfile.hp,
            foto: userProfile.foto,
            user: {
              id: currentUser.id,
              name: currentUser.name,
              nim: currentUser.nim,
              email: currentUser.email,
            },
          });
        } else {
          setError("Profil belum dibuat");
        }
      } catch (error: any) {
        console.error("Error:", error);

        // 4. Handle error spesifik untuk invalid token
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          setError("Gagal memuat profil: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const saveProfileData = async (updatedData: Partial<ProfileData>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !profileData) {
        alert("Sesi telah berakhir, silakan login kembali");
        window.location.href = "/login";
        return;
      }

      // 1. Validasi data sebelum dikirim
      const validationErrors = validateProfileData(updatedData);
      if (validationErrors.length > 0) {
        alert(validationErrors.join("\n"));
        return;
      }

      // 2. Format data untuk backend
      const formattedData = formatProfileData(updatedData);

      // 3. Kirim request
      const response = await axios.put(
        `/mahasiswa/profile/${profileData.id}`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      // 4. Handle response
      if (response.data?.success) {
        setProfileData((prev) => ({
          ...(prev || {}),
          ...response.data.data,
          user: prev?.user || response.data.data.user || {},
          foto: prev?.foto || response.data.data.foto || {},
        }));
        closeEditModal();
        toast("Data berhasil diperbarui!");
      } else {
        throw new Error("Respon server tidak valid");
      }
    } catch (error: any) {
      // 5. Penanganan error terstruktur
      const errorMessage = getErrorMessage(error);
      console.error("Update Error:", errorMessage);
      toast(`Gagal menyimpan perubahan: ${errorMessage}`);
    }
  };

  // Fungsi format data terpisah
  const formatProfileData = (data: Partial<ProfileData>) => {
    const formatted = { ...data };

    // Hapus field kosong
    Object.keys(formatted).forEach((key) => {
      if (
        formatted[key as keyof ProfileData] === undefined ||
        formatted[key as keyof ProfileData] === ""
      ) {
        delete formatted[key as keyof ProfileData];
      }
    });
    return formatted;
  };

  // Fungsi validasi terpisah
  const validateProfileData = (data: Partial<ProfileData>): string[] => {
    const errors = [];
    if (data.hp && !/^\d+$/.test(data.hp)) {
      errors.push("Nomor HP harus berupa angka");
    }
    // Validasi format tanggal dengan regex
    if (data.tanggal_lahir && !/^\d{4}-\d{2}-\d{2}$/.test(data.tanggal_lahir)) {
      errors.push("Format tanggal lahir tidak valid (YYYY-MM-DD)");
    }
    return errors;
  };

  // Fungsi penanganan error terpusat
  const getErrorMessage = (error: any): string => {
    if (error.response) {
      // Error dari server
      return (
        error.response.data?.message ||
        error.response.data?.errors?.join("\n") ||
        `Error ${error.response.status}: ${error.response.statusText}`
      );
    } else if (error.request) {
      // Tidak ada response dari server
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    } else {
      // Error lainnya
      return error.message || "Terjadi kesalahan tidak terduga";
    }
  };

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center p-4 max-w-md">
          <h2 className="text-xl font-bold mb-2">⚠️ Terjadi Kesalahan</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-yellow-600 text-xl">
          Profil belum tersedia. Silakan buat profil terlebih dahulu.
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <h1 className="text-2xl font-bold text-black">Profile</h1>
                <h2 className="text-sm">Let's check your Profile today</h2>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="Profile"
              />
            </Avatar>
            <div>
              <p className="font-medium">{profileData.user?.name}</p>
              <p className="text-xs text-gray-600">Student</p>
            </div>
          </div>
        </header>

        {/* Profile Card */}
        <div className="flex gap-6 px-10 mt-6">
          <Card className="w-[440px] flex-shrink-0">
            <div className="flex flex-col items-center gap-8 p-6">
              <Avatar className="h-40 w-40">
                <AvatarImage src="https://github.com/shadcn.png" />
              </Avatar>
              <div className="w-full text-start">
                <h1 className="text-2xl font-semibold">
                  {profileData.user?.name || "Nama tidak tersedia"}
                </h1>
                <h2 className="text-xl text-gray-600">
                  {profileData.user?.nim || "NIM tidak tersedia"}
                </h2>
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

          {/* Data Diri Card */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-2xl">Informasi Data Diri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <p>{profileData.user?.name}</p>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <p>{profileData.gender || "-"}</p>
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Lahir</Label>
                  <p>
                    {profileData.tanggal_lahir
                      ? new Date(profileData.tanggal_lahir).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <p>{profileData.user?.email}</p>
                </div>

                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <p>{profileData.alamat || "-"}</p>
                </div>

                <div className="space-y-2">
                  <Label>No. HP</Label>
                  <p>{profileData.hp || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Krs />

        <EditProfile
          isEditModalOpen={isEditModalOpen}
          closeEditModal={closeEditModal}
          profileData={profileData}
          saveProfileData={saveProfileData}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
function toast(arg0: string) {
  throw new Error("Function not implemented.");
}
