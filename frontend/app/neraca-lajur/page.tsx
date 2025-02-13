"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NeracaLajurTable } from "@/components/neraca-lajur/NeracaLajurTable";

export default function NeracaLajurPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Neraca Lajur</h1>
          
          <Tabs defaultValue="before" className="w-full">
            <TabsList>
              <TabsTrigger value="before">Neraca Saldo Sebelum di Penyesuaian</TabsTrigger>
              <TabsTrigger value="after">Neraca Saldo Setelah di Penyesuaian</TabsTrigger>
            </TabsList>
            <TabsContent value="before">
              <NeracaLajurTable type="before" />
            </TabsContent>
            <TabsContent value="after">
              <NeracaLajurTable type="after" />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
