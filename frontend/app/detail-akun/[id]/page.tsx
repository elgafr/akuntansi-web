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
import axios from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaArrowLeft } from "react-icons/fa";
import { FaPlus } from "react-icons/fa"; // Use FaPlus for Add Sub Account button
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
import { useParams } from "next/navigation";

interface Company {
  nama: string;
  kategori_id: string;
  alamat: string;
  tahun_berdiri: number;
}

interface Account {
  name: string;
  subakun?: Account[]; // Optional subakun, an array of accounts
  kodeAkun: string;
  debit: number;
  kredit: number;
  isEditing: boolean;
}

export default function Page() {
  const [company, setCompany] = useState<Company | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([
    {
      name: "Kas Kecil",
      kodeAkun: "1111",
      debit: 0,
      kredit: 0,
      isEditing: false,
      subakun: [
        {
          name: "Kas Kecil Sub1",
          kodeAkun: "1111.1",
          debit: 0,
          kredit: 0,
          isEditing: false,
        },
        {
          name: "Kas Kecil Sub2",
          kodeAkun: "1111.2",
          debit: 0,
          kredit: 0,
          isEditing: false,
        },
      ],
    },
    {
      name: "Kas besar",
      kodeAkun: "1112",
      debit: 0,
      kredit: 0,
      isEditing: false,
      subakun: [
        {
          name: "Kas besar Sub1",
          kodeAkun: "1112.1",
          debit: 0,
          kredit: 0,
          isEditing: false,
        },
      ],
    },
    {
      name: "Kas bank",
      kodeAkun: "1113",
      debit: 0,
      kredit: 0,
      isEditing: false,
    },
  ]);
  const { id } = useParams();

  // Fetch company data based on company ID
  useEffect(() => {
    if (id) {
      const fetchCompanyData = async () => {
        try {
          const response = await axios.get(`/mahasiswa/perusahaan/${id}`);
          if (response.data.success) {
            setCompany(response.data.data);
            console.log("Company data:", response.data.data);
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
        }
      };

      fetchCompanyData();
    }
  }, [id]);

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Fungsi untuk mengaktifkan mode edit pada semua akun dan sub akun
  const handleEditAllAccounts = () => {
    const updatedAccounts = accounts.map((account) => ({
      ...account,
      isEditing: true,
      subakun: account.subakun?.map((subAccount) => ({
        ...subAccount,
        isEditing: true,
      })),
    }));
    setAccounts(updatedAccounts);
  };

  // Fungsi untuk menyimpan perubahan data akun (debit/kredit)
  const handleSaveAccount = () => {
    const updatedAccounts = [...accounts];
    updatedAccounts.forEach((account) => {
      account.isEditing = false;
      if (account.subakun) {
        account.subakun.forEach((subAccount) => {
          subAccount.isEditing = false;
        });
      }
    });
    setAccounts(updatedAccounts);

    // Simpan data akun ke localStorage dengan key spesifik perusahaan
    if (company) {
      const accountKey = `accounts_${company.nama}`;
      localStorage.setItem(accountKey, JSON.stringify(updatedAccounts));
    }
  };

  const handleDebitChange = (index: number, value: string, isSubAccount: boolean, subIndex: number = 0) => {
    const updatedAccounts = [...accounts];
    if (isSubAccount) {
      updatedAccounts[index].subakun![subIndex].debit = value ? parseInt(value) : 0;
    } else {
      updatedAccounts[index].debit = value ? parseInt(value) : 0;
    }
    setAccounts(updatedAccounts);
  };

  const handleKreditChange = (index: number, value: string, isSubAccount: boolean, subIndex: number = 0) => {
    const updatedAccounts = [...accounts];
    if (isSubAccount) {
      updatedAccounts[index].subakun![subIndex].kredit = value ? parseInt(value) : 0;
    } else {
      updatedAccounts[index].kredit = value ? parseInt(value) : 0;
    }
    setAccounts(updatedAccounts);
  };

  const handleAddSubAccount = (index: number) => {
    // Add new sub account to the selected account
    const newSubAccount: Account = {
      name: `New Sub Akun`,
      kodeAkun: `${accounts[index].kodeAkun}.1`, // Example sub account code
      debit: 0,
      kredit: 0,
      isEditing: true,
    };
    const updatedAccounts = [...accounts];
    if (!updatedAccounts[index].subakun) {
      updatedAccounts[index].subakun = [];
    }
    updatedAccounts[index].subakun.push(newSubAccount);
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
                  <h2 className="text-sm ml-10">Let&apos;s check your Company today</h2>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                </Avatar>
                <div className="text-left mr-12">
                  <div className="text-sm font-medium">Guest</div>
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
              <CardTitle className="text-5xl text-primary py-2 mb-4">{company.nama}</CardTitle>
              <CardTitle className="text-3xl text-primary">{company.kategori_id}</CardTitle>
              <CardDescription className="text-lg">Kelola Kredit dan debit akun perusahaan</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex justify-end mb-4">
                <Button variant="outline" className="w-32" onClick={handleEditAllAccounts}>
                  Edit Semua
                </Button>
              </div>

              <Table className="w-full border border-gray-300 rounded-xl overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-gray-200">
                    <TableHead className="text-center py-2">Nama Akun</TableHead>
                    <TableHead className="text-center py-2">Sub Akun</TableHead>
                    <TableHead className="text-center py-2">Kode Akun</TableHead>
                    <TableHead className="text-center py-2">Debit</TableHead>
                    <TableHead className="text-center py-2">Kredit</TableHead>
                    <TableHead className="text-center py-2">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account, index) => (
                    <React.Fragment key={index}>
                      {/* Akun Utama */}
                      <TableRow>
                        <TableCell className="text-center py-2">{account.name}</TableCell>
                        <TableCell className="text-center py-2"></TableCell>
                        <TableCell className="text-center py-2">{account.kodeAkun}</TableCell>
                        <TableCell className="text-center py-2">
                          {account.isEditing ? (
                            <Input
                              type="number"
                              value={account.debit || ""}
                              onChange={(e) => handleDebitChange(index, e.target.value, false)}
                              disabled={account.kredit > 0}
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
                              onChange={(e) => handleKreditChange(index, e.target.value, false)}
                              disabled={account.debit > 0}
                            />
                          ) : (
                            `Rp.${account.kredit.toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell className="text-center py-2">
                          <Button variant="outline" className="text-xs w-full" onClick={() => handleAddSubAccount(index)}>
                            <FaPlus /> Tambah Sub Akun
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Sub Akun */}
                      {account.subakun?.map((subAccount, subIndex) => (
                        <TableRow key={`${index}-${subIndex}`}>
                          <TableCell className="text-center py-2"></TableCell>
                          <TableCell className="text-center py-2">{subAccount.name}</TableCell>
                          <TableCell className="text-center py-2">{subAccount.kodeAkun}</TableCell>
                          <TableCell className="text-center py-2">
                            {subAccount.isEditing ? (
                              <Input
                                type="number"
                                value={subAccount.debit || ""}
                                onChange={(e) =>
                                  handleDebitChange(index, e.target.value, true, subIndex)
                                }
                                disabled={subAccount.kredit > 0}
                              />
                            ) : (
                              `Rp.${subAccount.debit.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            {subAccount.isEditing ? (
                              <Input
                                type="number"
                                value={subAccount.kredit || ""}
                                onChange={(e) =>
                                  handleKreditChange(index, e.target.value, true, subIndex)
                                }
                                disabled={subAccount.debit > 0}
                              />
                            ) : (
                              `Rp.${subAccount.kredit.toLocaleString()}`
                            )}
                          </TableCell>
                          <TableCell className="text-center py-2"></TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-24">
                <Button className="rounded-xl w-32 h-10 flex items-center" onClick={handleSaveAccount}>
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-primary text-3xl">Detail Perusahaan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-md w-full">
                <div className="grid grid-cols-[auto_20px_1fr] gap-x-4 gap-y-2 items-start">
                  <p className="font-semibold whitespace-nowrap">Nama Perusahaan</p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">{company.nama}</p>

                  <p className="font-semibold whitespace-nowrap">Kategori Perusahaan</p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">{company.kategori_id}</p>

                  <p className="font-semibold whitespace-nowrap">Alamat</p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">{company.alamat}</p>

                  <p className="font-semibold whitespace-nowrap">Tahun Berdiri</p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left">{company.tahun_berdiri}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
