"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import { FaBuilding } from "react-icons/fa";
import Link from "next/link";
import FormModal from "@/components/ui/custom/form-modal/add-company/add-company";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Company {
  name: string;
  category: string;
}

export default function Page() {
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  // Load companies from localStorage on mount
  useEffect(() => {
    const savedCompanies = localStorage.getItem("companies");
    if (savedCompanies) {
      setCompanyList(JSON.parse(savedCompanies));
    } else {
      // Initialize with default companies if none exist
      const defaultCompanies = [
        { name: "PT. Jaya Abadi", category: "Jasa" },
        { name: "PT. Sukses Makmur", category: "Manufaktur" },
        { name: "CV. Berkah Sejahtera", category: "Perdagangan" },
      ];
      setCompanyList(defaultCompanies);
      localStorage.setItem("companies", JSON.stringify(defaultCompanies));
    }
  }, []);

  // Handle adding new company from modal
  const handleAddCompany = (newCompany: Company) => {
    const updatedCompanies = [...companyList, newCompany];
    setCompanyList(updatedCompanies);
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
  };

  const hendleDeleteCompany = (companyName: string) =>{
    const updatedCompanies = companyList.filter((company) => company.name !== companyName);
    setCompanyList(updatedCompanies);
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
  }

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
                  <h1 className="text-2xl font-bold ml-6">Perusahaan</h1>
                  <h2 className="text-sm ml-6">
                    Let&apos;s check your Company today
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

        {/* Search and Add Button Section */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-full flex-1 ml-6">
              <Input
                placeholder="Cari Perusahaan"
                className="w-full pl-10 h-10 rounded-xl"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <FaBuilding className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            {/* Add Company Button is placed below the profile, triggering modal */}
            <Button
              className="flex items-center gap-2 flex-shrink-0 rounded-xl h-10 mr-10"
              onClick={() => setIsModalOpen(true)} // Open the modal when this button is clicked
            >
              <PlusCircle className="w-6 h-6 text-white" />
              Tambah Perusahaan
            </Button>
          </div>
        </div>

        {/* Company Cards Section */}
        <div className="flex flex-wrap gap-4 ml-24 mt-4">
          {companyList.map((company, index) => (
            <Card key={index} className="w-[350px]">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-destructive">
                  {company.name}
                </CardTitle>
                <CardDescription className="text-center">
                  Kategori - {company.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Button className="rounded-xl bg-transparent border border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => hendleDeleteCompany(company.name)}>
                      Hapus Perusahaan
                    </Button>
                  </div>
                  <Link href="/detail-akun">
                    <div className="flex flex-col space-y-1.5">
                      <Button className="rounded-xl">Detail dan Akun</Button>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Company Modal */}
        <FormModal
          title="Input Data Perusahaan"
          isOpen={isModalOpen} // Control the modal open state from parent
          onOpenChange={setIsModalOpen} // Close the modal when needed
          onSave={handleAddCompany} // Handle saving data to parent
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
