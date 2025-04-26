"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NeracaLajurTable } from "@/components/neraca-lajur/NeracaLajurTable";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, Suspense } from "react";
import axios from "@/lib/axios";
import { useQueryClient } from '@tanstack/react-query';

interface ProfileData {
  user : {
    name: string;
  };
  foto?: string;
}

// Simple loading component for Suspense
function NeracaLajurTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-64 bg-gray-200 rounded mb-4"></div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex justify-between py-3 border-b">
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NeracaLajurPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState('before');
  const queryClient = useQueryClient();
  
  // Prefetch all data on component mount
  useEffect(() => {
    const prefetchData = async () => {
      // Prefetch before adjustment data
      queryClient.prefetchQuery({
        queryKey: ['neracaLajur', 'before'],
        queryFn: async () => {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/neracalajur/sebelumpenyesuaian`);
          if (response.data.success) {
            return response.data.data;
          }
          throw new Error('Failed to fetch data');
        },
      });

      // Prefetch after adjustment data
      queryClient.prefetchQuery({
        queryKey: ['neracaLajur', 'after'],
        queryFn: async () => {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/neracalajur/setelahpenyesuaian`);
          if (response.data.success) {
            return response.data.data;
          }
          throw new Error('Failed to fetch data');
        },
      });
    };

    prefetchData();
  }, [queryClient]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/profile`);
        if (response.data.success) {
          const data = response.data.data;
          const fotoUrl = data.foto
            ? `http://127.0.0.1:8000/storage/${data.foto}`
            : undefined;
          setProfileData({
            user: {
              name: data.user.name,
            },
            foto: fotoUrl,
          });
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
                    Neraca Lajur
                  </h1>
                  <h2 className="text-sm ml-6">
                    Let&apos;s check your Neraca Lajur today
                  </h2>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={profileData?.foto || "https://github.com/shadcn.png"}
                    alt="Profile Picture"
                  />
                </Avatar>
                <div className="text-left mr-12">
                  <div className="text-sm font-medium">
                    {loadingProfile ? "Loading..." : profileData?.user?.name || "Nama tidak tersedia"}
                  </div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-6">
          <Tabs 
            defaultValue="before" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full justify-between bg-muted/50">
              <TabsTrigger value="before" className="flex-1">
                Neraca Lajur Sebelum di Penyesuaian
              </TabsTrigger>
              <TabsTrigger value="after" className="flex-1">
                Neraca Lajur Setelah di Penyesuaian
              </TabsTrigger>
            </TabsList>
            
            {/* Load both tables but hide the inactive one */}
            <div className="mt-4">
              <div className={activeTab === 'before' ? 'block' : 'hidden'}>
                <NeracaLajurTable type="before" />
              </div>
              <div className={activeTab === 'after' ? 'block' : 'hidden'}>
                <NeracaLajurTable type="after" />
              </div>
            </div>
          </Tabs>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Make sure the page is always rendered dynamically
export const dynamic = 'force-dynamic';