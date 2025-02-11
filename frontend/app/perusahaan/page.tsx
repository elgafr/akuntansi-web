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
  alamat: string;
  tahunBerdiri: number;
}

interface ProfileData {
  fullName: string;
}

export default function Page() {
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [filteredCompanyList, setFilteredCompanyList] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "Guest",
  });

  // Ambil data profil dari localStorage (sama seperti di halaman profile)
  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  // Load companies from localStorage on mount
  useEffect(() => {
    const savedCompanies = localStorage.getItem("companies");
    if (savedCompanies) {
      const companies = JSON.parse(savedCompanies);
      setCompanyList(companies);
      setFilteredCompanyList(companies); // Initialize filtered list with all companies
    }
  }, []);

  // Handle adding new company from modal
  const handleAddCompany = (newCompany: Company) => {
    const updatedCompanies = [...companyList, newCompany];
    setCompanyList(updatedCompanies);
    setFilteredCompanyList(updatedCompanies); // Update filtered list as well
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
  };

  const handleDeleteCompany = (companyName: string) => {
    // Filter daftar perusahaan untuk mengeluarkan perusahaan yang ingin dihapus
    const updatedCompanies = companyList.filter(
      (company) => company.name !== companyName
    );
    setCompanyList(updatedCompanies);
    setFilteredCompanyList(updatedCompanies);

    // Perbarui data perusahaan di localStorage
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));

    // Jika ada data akun atau data lain yang terkait dengan perusahaan tersebut, hapus juga
    localStorage.removeItem(`accounts_${companyName}`);

    // Jika perusahaan yang dihapus merupakan perusahaan yang sedang dipilih, hapus key-nya
    const selectedCompany = localStorage.getItem("selectedCompany");
    if (selectedCompany === companyName) {
      localStorage.removeItem("selectedCompany");
    }
  };

  // Handle search functionality
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Filter companies based on search term
    const filteredCompanies = companyList.filter((company) =>
      company.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanyList(filteredCompanies);
  };

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
                  <div className="text-sm font-medium">
                    {profileData.fullName}
                  </div>
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
                value={searchTerm}
                onChange={handleSearchChange} // Call the search handler
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <FaBuilding className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            {/* Add Company Button */}
            <Button
              className="flex items-center gap-2 flex-shrink-0 rounded-xl h-10 mr-10"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle className="w-6 h-6 text-white" />
              Tambah Perusahaan
            </Button>
          </div>
        </div>

        {/* Company Cards Section */}
        <div className="px-6 mr-8 ml-4">
          {" "}
          {/* Padding untuk sejajar dengan header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCompanyList.map((company, index) => (
              <Card key={index} className="w-full">
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
                      <Button
                        className="rounded-xl bg-transparent border border-destructive text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleDeleteCompany(company.name)}
                      >
                        Hapus Perusahaan
                      </Button>
                    </div>
                    <Link
                      href={`/detail-akun?name=${encodeURIComponent(
                        company.name
                      )}`}
                    >
                      <div className="flex flex-col space-y-1.5">
                        <Button className="rounded-xl">Detail dan Akun</Button>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Company Modal */}
        <FormModal
          title="Input Data Perusahaan"
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSave={handleAddCompany}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
