"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      
      if (!storedToken) {
        window.location.href = "/login";
        return;
      }

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      console.log(userData.id);

      const fetchProfile = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/profile`,
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            }
          );

          const currentUser = response.data.data.user;
          const userProfile = currentUser ? response.data.data : null;

          if (userProfile) {
            setProfileData({
              ...userProfile,
              user: {
                ...currentUser,
              },
              foto: userProfile.foto
                ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${userProfile.foto}`
                : undefined,
            });
            console.log("Profile Data:", userProfile);
          }
        } catch (error: any) {
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
    }
  }, []);

  const saveProfileData = async (formData: FormData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !profileData) {
        alert("Sesi telah berakhir, silakan login kembali");
        window.location.href = "/login";
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/profile/${profileData.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setProfileData((prev) => ({
          ...prev!,
          ...response.data.data,
          foto: response.data.data.foto
            ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${response.data.data.foto}`
            : prev?.foto,
        }));
        setIsEditModalOpen(false);
        alert("Data berhasil diperbarui!");
      }
    } catch (error: any) {
      console.error("Update Error:", error);
      alert(`Gagal menyimpan perubahan: ${getErrorMessage(error)}`);
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
      return error.response.data?.message || `Error ${error.response.status}`;
    }
    return error.message || "Terjadi kesalahan tidak terduga";
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
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                >
                  <Avatar>
                    <AvatarImage
                      src={profileData.foto || "https://github.com/shadcn.png"}
                      alt="Profile"
                    />
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                 onSelect={async () => {
                  try {
                    await axios.post('/mahasiswa/logout'); 
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }}
                  className="cursor-pointer text-red-600 focus:bg-red-50"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <AvatarImage
                  src={profileData.foto || "https://github.com/shadcn.png"}
                  alt="Profile"
                  className="object-cover"
                />
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
