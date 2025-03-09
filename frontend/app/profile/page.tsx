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
    
    // 1. Cek token tanpa redirect langsung
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchProfile = async () => {
      try {
        // 2. Validasi token dengan request ke endpoint yang sama
        const response = await axios.get('/mahasiswa/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // 3. Handle response yang tidak valid
        if (!response.data?.success || !response.data.user) {
          throw new Error('Invalid session');
        }

        const currentUser = response.data.user;
        const userProfile = response.data.data.find(
          (p: any) => p.user_id === currentUser.id
        );

        if (userProfile) {
          setProfileData({
            id: userProfile.id,
            user_id: userProfile.user_id,
            gender: userProfile.gender,
            tanggal_lahir: userProfile.tanggal_lahir,
            alamat: userProfile.alamat,
            hp: userProfile.hp,
            user: {
              id: currentUser.id,
              name: currentUser.name,
              nim: currentUser.nim,
              email: currentUser.email
            }
          });
        } else {
          setError('Profil belum dibuat');
        }
        
      } catch (error: any) {
        console.error('Error:', error);
        
        // 4. Handle error spesifik untuk invalid token
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = '/login';
        } else {
          setError('Gagal memuat profil: ' + error.message);
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
      if (!token || !profileData) return;

      const response = await axios.patch(
        `/mahasiswa/profile/${profileData.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setProfileData((prev) => ({
          ...prev!,
          ...response.data.data,
        }));
        closeEditModal();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      setError(error.response?.data?.message || "Gagal menyimpan perubahan");
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
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
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
              <BreadcrumbItem>
                <h1 className="text-2xl font-bold text-black">Dashboard</h1>
                <h2 className="text-sm">Let's check your Dashboard today</h2>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
            </Avatar>
            <div>
              <p className="font-medium">{profileData.user?.name}</p>
              <p className="text-xs text-gray-600">Student</p>
            </div>
          </div>
        </header>

        {/* Profile Card */}
        <div className="flex gap-6 px-10 mt-6">
          <Card className="w-[400px] flex-shrink-0">
            <div className="flex flex-col items-center gap-10 p-6">
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
