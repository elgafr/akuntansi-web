"use client";

import { BukuBesarTable } from "@/components/buku-besar/BukuBesarTable";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, use } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams } from 'next/navigation';
import axios from "@/lib/axios";

interface ProfileData {
  user: {
    name: string;
  };
}


export default function BukuBesarPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  const queryClient = useQueryClient();
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Force refetch on navigation
  useEffect(() => {
    // Refetch data when navigating to buku besar page
    queryClient.invalidateQueries({ queryKey: ['bukuBesar'] });
    queryClient.invalidateQueries({ queryKey: ['akunList'] });
  }, [pathname, searchParams, queryClient]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("/mahasiswa/profile");
        if (response.data.success) {
          setProfileData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoadingProfile(false);
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
                    Buku Besar
                  </h1>
                  <h2 className="text-sm ml-6">
                    Let&apos;s check your Summary today
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
                  {loadingProfile
                        ? "Loading..."
                        : profileData?.user?.name || "Nama tidak tersedia"}
                  </div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-6">
          <BukuBesarTable />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
