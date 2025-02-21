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
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  nama: string;
  alamat: string;
  tahun_berdiri: number;
  status: string;
  start_priode: Date;
  end_priode: Date;
  kategori: {
    id: string;
    nama: string;
  };
}

interface ProfileData {
  fullName: string;
}

export default function Page() {
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [filteredCompanyList, setFilteredCompanyList] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [krsId, setKrsId] = useState<string>(""); // Definisikan state untuk krsId
  const [selectedPerusahaan, setSelectedPerusahaan] = useState<Company | null>(
    null
  );
  const router = useRouter();
  const [companyData, setCompanyData] = useState<Company | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "Guest",
  });

  // Ambil data profil dari localStorage
  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  // Fetch KRS ID
  useEffect(() => {
    const fetchKrsId = async () => {
      try {
        const response = await axios.get("/mahasiswa/krs");
        if (response.data.success && response.data.data.length > 0) {
          setKrsId(response.data.data[0].id);
        }
      } catch (error) {
        console.error("Gagal mengambil krsId:", error);
      }
    };

    fetchKrsId();
  }, []);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/mahasiswa/perusahaan");
        if (response.data.success) {
          const companies = response.data.data.map((item: any) => ({
            id: item.id,
            nama: item.nama,
            alamat: item.alamat,
            tahun_berdiri: item.tahun_berdiri,
            status: item.status,
            start_priode: item.start_priode,
            end_priode: item.end_priode,
            kategori: item.kategori,
          }));
          setCompanyList(companies);
          setFilteredCompanyList(companies);
        }
      } catch (error) {
        console.error("Gagal mengambil data perusahaan:", error);
      }
    };

    fetchCompanies();
  }, []);


  const refreshCompanyList = async () => {
    try {
      const response = await axios.get("/mahasiswa/perusahaan");
      if (response.data.success) {
        const companies = response.data.data.map((item: any) => ({
          id: item.id,
          nama: item.nama,
          alamat: item.alamat,
          tahun_berdiri: item.tahun_berdiri,
          status: item.status,
          start_priode: item.start_priode,
          end_priode: item.end_priode,
          kategori: item.kategori,
        }));
        setCompanyList(companies);
        setFilteredCompanyList(companies);
      }
    } catch (error) {
      console.error("Gagal mengambil data perusahaan:", error);
    }
  };

  const handleSelectPerusahaan = (companyId: string) => {
    router.push(`/detail-akun/${companyId}`);
  };

  // Handle deleting a company
  const handleDeleteCompany = async (companyId: string) => {
    try {
      // Kirim request DELETE ke backend dengan companyId
      const response = await axios.delete(`/mahasiswa/perusahaan/${companyId}`);

      if (response.data.success) {
        // Hapus perusahaan dari state companyList dan filteredCompanyList
        const updatedCompanies = companyList.filter(
          (company) => company.id !== companyId
        );
        setCompanyList(updatedCompanies);
        setFilteredCompanyList(updatedCompanies);

        // Tampilkan pesan sukses (opsional)
        alert("Perusahaan berhasil dihapus");
      } else {
        // Tampilkan pesan error jika penghapusan gagal
        alert("Gagal menghapus perusahaan");
      }
    } catch (error) {
      console.error("Gagal menghapus perusahaan:", error);
      alert("Terjadi kesalahan saat menghapus perusahaan");
    }
  };

  // Handle search functionality
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    const filteredCompanies = companyList.filter((company) =>
      company.nama.toLowerCase().includes(value.toLowerCase())
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
                onChange={handleSearchChange}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <FaBuilding className="w-5 h-5 text-gray-700" />
              </div>
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCompanyList.map((company) => (
              <Card key={company.id} className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-destructive">
                    {company.nama}
                  </CardTitle>
                  <CardDescription className="text-center">
                    Kategori - {company.kategori.nama}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Button
                        className="rounded-xl bg-transparent border border-destructive text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleDeleteCompany(company.id)}
                      >
                        Hapus Perusahaan
                      </Button>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Button
                        className="rounded-xl"
                        onClick={() => handleSelectPerusahaan(company.id)}
                      >
                        Detail dan Akun
                      </Button>
                    </div>
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
          onSave={refreshCompanyList}
          krsId={krsId}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
