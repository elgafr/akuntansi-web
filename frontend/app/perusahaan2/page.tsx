"use client";
import { AddAccountTable } from "@/components/jurnal/AddAccountTable";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAccounts } from "@/contexts/AccountContext";

interface Account {
  kodeAkun: string;
  namaAkun: string;
  debit: number;
  kredit: number;
  parentId?: string;
  level: number;
}

export default function PerusahaanPage() {
  const { accounts, setAccounts } = useAccounts();

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
                    Daftar Akun
                  </h1>
                  <h2 className="text-sm ml-6">
                    Kelola daftar akun perusahaan Anda
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
                  <div className="text-sm font-medium">Arthur</div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="p-6">
          <AddAccountTable 
            accounts={accounts} 
            onAccountsChange={setAccounts} 
          />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
