"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { LabaRugiSection } from "@/components/laporan/LabaRugiSection";
import { PosisiKeuanganSection } from "@/components/laporan/PosisiKeuanganSection";
import { ArusKasSection } from "@/components/laporan/ArusKasSection";
import { PerubahanEkuitasSection } from "@/components/laporan/PerubahanEkuitasSection";
import { LaporanUmumSection } from "@/components/laporan/LaporanUmumSection";
import { useEffect, useState } from "react";
import axios from "axios";

interface Profile {
  user: {
    name: string;
  };
}

export default function LaporanPage() {

  const [profileData, setProfileData] = useState<Profile | null>(null);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Cek cache di localStorage terlebih dahulu
        const cachedProfile = localStorage.getItem('profileData');
        if (cachedProfile) {
          setProfileData(JSON.parse(cachedProfile));
        }

        // Ambil data terbaru dari API
        const response = await axios.get('/mahasiswa/profile');
        if (response.data.success) {
          setProfileData(response.data.data);
          localStorage.setItem('profileData', JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error('Gagal memuat profil:', error);
      }
    };

    fetchProfileData();
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
                    Laporan Keuangan
                  </h1>
                  <h2 className="text-sm ml-6">
                    Let&apos;s check your Financial Reports
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
                  <div className="text-sm font-medium">{profileData?.user?.name}</div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <section className="p-6">
          <Tabs defaultValue="laporan-umum" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="w-full justify-between bg-muted/50">
                <TabsTrigger value="laporan-umum" className="flex-1">Laporan Umum</TabsTrigger>
                <TabsTrigger value="laba-rugi" className="flex-1">Laporan Laba Rugi</TabsTrigger>
                <TabsTrigger value="perubahan-ekuitas" className="flex-1">Laporan Perubahan Ekuitas</TabsTrigger>
                <TabsTrigger value="posisi-keuangan" className="flex-1">Laporan Posisi Keuangan</TabsTrigger>
                <TabsTrigger value="arus-kas" className="flex-1">Laporan Arus Kas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="laporan-umum">
              <LaporanUmumSection />
            </TabsContent>

            <TabsContent value="laba-rugi">
              <LabaRugiSection />
            </TabsContent>

            <TabsContent value="posisi-keuangan">
              <PosisiKeuanganSection />
            </TabsContent>

            <TabsContent value="perubahan-ekuitas">
              <PerubahanEkuitasSection />
            </TabsContent>

            <TabsContent value="arus-kas">
              <ArusKasSection />
            </TabsContent>
          </Tabs>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
