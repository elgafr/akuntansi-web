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
  user?: {
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/mahasiswa/profile');
        setProfileData(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil data profil:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const saveProfileData = async (updatedData: Partial<ProfileData>) => {
    try {
      if (!profileData) return;

      const response = await axios.patch(
        `/mahasiswa/profile/${profileData.id}`,
        {
          gender: updatedData.gender,
          tanggal_lahir: updatedData.tanggal_lahir,
          alamat: updatedData.alamat,
          hp: updatedData.hp
        }
      );

      if (response.data.success) {
        setProfileData(prev => ({
          ...prev!,
          ...response.data.data
        }));
        closeEditModal();
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  if (loading) return <div>Loading...</div>;
  if (!profileData || !profileData.user) return <div>Data profil tidak ditemukan</div>;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
                    {profileData.user?.name || 'Nama tidak tersedia'}
                  </div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex gap-6 px-10 mt-6">
          <Card className="w-[400px] flex-shrink-0">
            <div className="flex flex-col items-center gap-10 p-6">
              <Avatar className="h-40 w-40">
                <AvatarImage src="https://github.com/shadcn.png" />
              </Avatar>
              <div className="w-full text-start">
                <h1 className="text-2xl font-semibold">
                  {profileData.user?.name || 'Nama tidak tersedia'}
                </h1>
                <h2 className="text-xl text-gray-600">
                  {profileData.user?.nim || 'NIM tidak tersedia'}
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

          <Card className="flex-1">
            <CardHeader className="pb-6 text-3xl">
              <CardTitle>Informasi Data Diri</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="grid grid-cols-2 gap-6 h-full px-6 pb-6">
                <div className="space-y-1">
                  <Label className="text-xl">Nama Lengkap</Label>
                  <p className="text-gray-600 text-lg">
                    {profileData.user?.name || 'Nama tidak tersedia'}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">Gender</Label>
                  <p className="text-gray-600 text-lg">
                    {profileData.gender || 'Belum diisi'}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">Tanggal Lahir</Label>
                  <p className="text-gray-600 text-lg">
                    {profileData.tanggal_lahir || 'Belum diisi'}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">Alamat Email</Label>
                  <p className="text-gray-600 text-lg">
                    {profileData.user?.email || 'Email tidak tersedia'}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">Alamat Rumah</Label>
                  <p className="text-gray-600 text-lg">
                    {profileData.alamat || 'Belum diisi'}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xl">No Handphone</Label>
                  <p className="text-gray-600 text-lg">
                    {profileData.hp || 'Belum diisi'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Krs />

        <EditProfile
          isEditModalOpen={isEditModalOpen}
          closeEditModal={closeEditModal}
          profileData={{
            id: profileData.id,
            user: profileData.user,
            gender: profileData.gender,
            tanggal_lahir: profileData.tanggal_lahir,
            alamat: profileData.alamat,
            hp: profileData.hp
          }}
          saveProfileData={saveProfileData}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}