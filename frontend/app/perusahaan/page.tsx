"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  user: {
    name: string;
    nim: string;
  };
  foto?: string;
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

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/profile`
        );
        if (response.data.success) {
          const data = response.data.data;
          const fotoUrl = data.foto
            ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${data.foto}`
            : undefined;
          setProfileData({
            user: {
              name: data.user.name,
              nim: data.user.nim,
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

  // Fetch KRS ID
  useEffect(() => {
    const fetchKrsId = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/krs`
        );
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
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/perusahaan`
        );
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/perusahaan`
      );
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
        toast("Perusahaan berhasil dihapus");
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
                  <h1 className="text-2xl font-bold ml-6 text-black">Perusahaan</h1>
                  {/* <h2 className="text-sm ml-6">
                    Let&apos;s check your Company today
                  </h2> */}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="rounded-full p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0"
                    >
                      <Avatar>
                        <AvatarImage
                          src={
                            profileData?.foto || "https://github.com/shadcn.png"
                          }
                          alt="Profile"
                        />
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={async () => {
                        try {
                          await axios.post("/mahasiswa/logout");
                          localStorage.removeItem("token");
                          window.location.href = "/login";
                        } catch (error) {
                          console.error("Logout error:", error);
                        }
                      }}
                      className="cursor-pointer text-red-600 focus:bg-red-50"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                        className="rounded-xl"
                        onClick={() => handleSelectPerusahaan(company.id)}
                      >
                        Detail Akun Perusahaan
                      </Button>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="rounded-xl bg-transparent border
                      border-destructive text-destructive hover:bg-destructive
                      hover:text-white"
                            variant="outline"
                          >
                            Hapus Perusahaan
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Apakah anda yakin ingin menghapus data Perusahaan{" "}
                              {company.nama}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Data yang telah dihapus tidak dapat dikembalikan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-xl"
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
