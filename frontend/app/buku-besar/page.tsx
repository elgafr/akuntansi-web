"use client";

import { BukuBesarTable } from "@/components/buku-besar/BukuBesarTable";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function BukuBesarPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="border-b">
          <div className="flex h-16 items-center px-4 gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>Buku Besar</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center space-x-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
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

        <section className="p-6">
          <BukuBesarTable />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
