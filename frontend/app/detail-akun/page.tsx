"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaArrowLeft } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Company {
  name: string;
  category: string;
  alamat: string;
  tahunBerdiri: number;
}

interface Account {
  name: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
  isEditing: boolean;
}

interface ProfileData {
  fullName: string;
  // tambahkan properti lain jika diperlukan
}

export default function Page() {
  const searchParams = useSearchParams();
  const companyName = searchParams.get("name");
  const [company, setCompany] = useState<Company | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([
    {
      name: "Kas Kecil",
      kodeAkun: "1111",
      debit: 0,
      kredit: 0,
      isEditing: false,
    },
    {
      name: "Kas besar",
      kodeAkun: "1112",
      debit: 0,
      kredit: 0,
      isEditing: false,
    },
    {
      name: "Kas bank",
      kodeAkun: "1113",
      debit: 0,
      kredit: 0,
      isEditing: false,
    },
  ]);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "Guest",
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  useEffect(() => {
    if (companyName) {
      // Load detail perusahaan dari localStorage
      const savedCompanies = localStorage.getItem("companies");
      if (savedCompanies) {
        const companies: Company[] = JSON.parse(savedCompanies);
        const selectedCompany = companies.find((c) => c.name === companyName);
        setCompany(selectedCompany || null);
      }

      // Load data akun spesifik perusahaan dari localStorage (jika ada)
      const accountKey = `accounts_${companyName}`;
      const savedAccounts = localStorage.getItem(accountKey);
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      }
    }
  }, [companyName]);

  if (!company) {
    return <div>Perusahaan tidak ditemukan</div>;
  }

  // Fungsi untuk mengaktifkan mode edit pada akun tertentu
  const handleEditAccount = (index: number) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index].isEditing = true;
    setAccounts(updatedAccounts);
  };

  // Fungsi untuk menyimpan perubahan data akun (debit/kredit)
  const handleSaveAccount = () => {
    const updatedAccounts = [...accounts];
    updatedAccounts.forEach((account) => {
      account.isEditing = false;
    });
    setAccounts(updatedAccounts);

    // Simpan data akun ke localStorage dengan key spesifik perusahaan
    if (companyName) {
      const accountKey = `accounts_${companyName}`;
      localStorage.setItem(accountKey, JSON.stringify(updatedAccounts));
    }
  };

  const handleDebitChange = (index: number, value: string) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index].debit = value ? parseInt(value) : 0;
    setAccounts(updatedAccounts);
  };

  const handleKreditChange = (index: number, value: string) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index].kredit = value ? parseInt(value) : 0;
    setAccounts(updatedAccounts);
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
                  <h1 className="text-2xl font-bold ml-10">Perusahaan</h1>
                  <h2 className="text-sm ml-10">
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

        <div className="mt-10 ml-14">
          <Link href="/perusahaan">
            <Button className="rounded-xl w-32 h-10 flex items-center">
              <FaArrowLeft className="mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        <div className="mt-10 ml-14 flex gap-x-6">
          <Card className="w-[700px]">
            <CardHeader>
              <CardTitle className="text-5xl text-primary py-2 mb-4">
                {company.name}
              </CardTitle>
              <CardTitle className="text-3xl text-primary">
                {company.category}
              </CardTitle>
              <CardDescription className="text-lg">
                Kelola Kredit dan debit akun perusahaan
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table className="w-full border border-gray-300 rounded-xl overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-gray-200">
                    <TableHead className="text-center py-2">
                      Nama Akun
                    </TableHead>
                    <TableHead className="text-center py-2">
                      Kode Akun
                    </TableHead>
                    <TableHead className="text-center py-2">Debit</TableHead>
                    <TableHead className="text-center py-2">Kredit</TableHead>
                    <TableHead className="text-center py-2">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center py-2">
                        {account.name}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {account.kodeAkun}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {account.isEditing ? (
                          <Input
                            type="number"
                            value={account.debit || ""}
                            onChange={(e) =>
                              handleDebitChange(index, e.target.value)
                            }
                            disabled={account.kredit > 0} // Disable jika kredit sudah diisi
                          />
                        ) : (
                          `Rp.${account.debit.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {account.isEditing ? (
                          <Input
                            type="number"
                            value={account.kredit || ""}
                            onChange={(e) =>
                              handleKreditChange(index, e.target.value)
                            }
                            disabled={account.debit > 0} // Disable jika debit sudah diisi
                          />
                        ) : (
                          `Rp.${account.kredit.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <Button
                          variant="outline"
                          className="text-xs w-full"
                          onClick={() => handleEditAccount(index)}
                        >
                          <FaEdit />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-24">
                <Button
                  className="rounded-xl w-32 h-10 flex items-center"
                  onClick={handleSaveAccount}
                >
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-primary text-3xl">
                Detail Perusahaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-md w-full">
                <div className="grid grid-cols-[auto_20px_1fr] gap-x-4 gap-y-2 items-start">
                  <p className="font-semibold whitespace-nowrap">
                    Nama Perusahaan
                  </p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">{company.name}</p>

                  <p className="font-semibold whitespace-nowrap">
                    Kategori Perusahaan
                  </p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">{company.category}</p>

                  <p className="font-semibold whitespace-nowrap">Alamat</p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">{company.alamat}</p>

                  <p className="font-semibold whitespace-nowrap">
                    Tahun Berdiri
                  </p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left">{company.tahunBerdiri}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}