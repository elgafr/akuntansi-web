"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NeracaLajurTable } from "@/components/neraca-lajur/NeracaLajurTable";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export function NeracaLajurClient() {
  const [profileData, setProfileData] = useState({ fullName: "Guest" });

  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
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
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                </Avatar>
                <div className="text-left mr-12">
                  <div className="text-sm font-medium">{profileData.fullName}</div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-6">
          <Tabs defaultValue="before" className="w-full">
            <TabsList className="w-full justify-between bg-muted/50">
              <TabsTrigger value="before" className="flex-1">
                Neraca Saldo Sebelum di Penyesuaian
              </TabsTrigger>
              <TabsTrigger value="after" className="flex-1">
                Neraca Saldo Setelah di Penyesuaian
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="before">
              <NeracaLajurTable type="before" />
            </TabsContent>
            
            <TabsContent value="after">
              <NeracaLajurTable type="after" />
            </TabsContent>
          </Tabs>
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
} 