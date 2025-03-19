"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Company {
  id: string;
  nama: string;
  kategori_id: string;
  alamat: string;
  tahun_berdiri: number;
}

interface Category {
  id: string;
  nama: string;
}

interface Account {
  id: string;
  nama: string;
  kode: string;
  status: string;
  debit: number;
  kredit: number;
  isEditing: boolean;
  subakun: SubAccount[];
}

interface SubAccount {
  id: string;
  kode: string;
  nama: string;
  akun_id: string;
  perusahaan_id: string;
  isEditing: boolean;
  isNew?: boolean;
  debit: number;
  kredit: number;
}

interface TransactionPayload {
  akun_id: string;
  perusahaan_id: string;
  debit: number;
  kredit: number;
  sub_akun_id?: string | null;
}

export default function Page() {
  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingSubAccountIndex, setAddingSubAccountIndex] = useState<number | null>(null);
  const { id } = useParams();

  const fetchAccounts = async (kategoriId: string) => {
    try {
      const response = await axios.get("/instruktur/akun");
      const filteredAccounts = response.data.data.filter((account: any) => account.kategori_id === kategoriId);

      const accountsData = filteredAccounts.map((account: any) => ({
        id: account.id,
        nama: account.nama,
        kode: account.kode,
        status: account.status,
        debit: 0,
        kredit: 0,
        isEditing: false,
        subakun:
          account.subakun?.map((sub: any) => ({
            id: sub.id,
            kode: sub.kode,
            nama: sub.nama,
            akun_id: account.id,
            perusahaan_id: company?.id || "",
            isEditing: false,
          })) || [],
      }));

      setAccounts(accountsData);
    } catch (error) {
      toast.error("Gagal memuat data akun");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, categoriesRes] = await Promise.all([
          axios.get(`/mahasiswa/perusahaan/${id}`),
          axios.get("/instruktur/kategori"),
        ]);

        if (companyRes.data.success) {
          setCompany(companyRes.data.data);
          await fetchAccounts(companyRes.data.data.kategori_id);
        }

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data perusahaan");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const getCategoryNameById = (kategoriId: string) => {
    const category = categories.find((cat) => cat.id === kategoriId);
    return category ? category.nama : "Kategori Tidak Diketahui";
  };

  const handleEditAllAccounts = () => {
    const updatedAccounts = accounts.map((account) => ({
      ...account,
      isEditing: account.status === "open",
      subakun:
        account.subakun?.map((sub) => ({
          ...sub,
          isEditing: account.status === "open",
        })) || [],
    }));
    setAccounts(updatedAccounts);
  };

  const startAddSubAccount = (accountIndex: number) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun.unshift({
      id: "temp-" + Date.now(),
      kode: "",
      nama: "",
      akun_id: accounts[accountIndex].id,
      perusahaan_id: company?.id || "",
      isEditing: true,
      isNew: true,
    });

    setAccounts(updatedAccounts);
    setAddingSubAccountIndex(accountIndex);
  };

  const saveNewSubAccount = async (accountIndex: number, subIndex: number) => {
    try {
      const account = accounts[accountIndex];
      const subAccount = account.subakun[subIndex];

      if (!subAccount.nama || !subAccount.kode) {
        toast.error("Nama dan kode sub akun harus diisi");
        return;
      }

      const response = await axios.post("/mahasiswa/subakun", {
        nama: subAccount.nama,
        kode: subAccount.kode,
        akun_id: account.id,
        perusahaan_id: company?.id,
      });

      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex].subakun[subIndex] = {
        ...response.data.data,
        isEditing: false,
        akun_id: account.id,
        perusahaan_id: company?.id || "",
      };

      setAccounts(updatedAccounts);
      setAddingSubAccountIndex(null);
      toast.success("Sub akun berhasil ditambahkan!");
    } catch (error) {
      console.error("Gagal menyimpan sub akun:", error);
      toast.error("Gagal menyimpan sub akun");
    }
  };

  const cancelAddSubAccount = (accountIndex: number, subIndex: number) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun = updatedAccounts[accountIndex].subakun.filter((_, idx) => idx !== subIndex);
    setAccounts(updatedAccounts);
    setAddingSubAccountIndex(null);
  };

  const handleSubAccountNameChange = (accountIndex: number, subIndex: number, value: string) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun[subIndex].nama = value;
    setAccounts(updatedAccounts);
  };

  const handleSubAccountKodeChange = (accountIndex: number, subIndex: number, value: string) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun[subIndex].kode = value;
    setAccounts(updatedAccounts);
  };

  const handleSaveAccount = async () => {
    try {
      if (!company?.id) {
        toast.error("Perusahaan tidak valid");
        return;
      }

      const transactions: TransactionPayload[] = [];

      accounts.forEach((account) => {
        if (account.debit !== 0 || account.kredit !== 0) {
          transactions.push({
            akun_id: account.id,
            perusahaan_id: company.id,
            debit: Number(account.debit),
            kredit: Number(account.kredit),
            sub_akun_id: null,
          });
        }

        account.subakun.forEach((sub) => {
          if (sub.debit !== 0 || sub.kredit !== 0) {
            transactions.push({
              akun_id: account.id,
              perusahaan_id: company.id,
              debit: Number(sub.debit),
              kredit: Number(sub.kredit),
              sub_akun_id: sub.id,
            });
          }
        });
      });

      console.log("Transactions:", { transactions });

      if (transactions.length === 0) {
        toast.error("Tidak ada transaksi untuk disimpan");
        return;
      }

      transactions.forEach(async (element) => {
        await axios.post("/mahasiswa/keuangan", element);
      });

      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          debit: 0,
          kredit: 0,
          subakun: acc.subakun.map((sub) => ({
            ...sub,
            debit: 0,
            kredit: 0,
          })),
        }))
      );

      toast.success("Data berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Gagal menyimpan data");
    }
  };

  const handleDebitChange = (index: number, value: string, isSubAccount: boolean, subIndex: number = 0) => {
    const updatedAccounts = [...accounts];
    if (isSubAccount) {
      updatedAccounts[index].subakun[subIndex].debit = Number(value) || 0;
      updatedAccounts[index].subakun[subIndex].kredit = 0;
    } else {
      updatedAccounts[index].debit = Number(value) || 0;
      updatedAccounts[index].kredit = 0;
    }
    setAccounts(updatedAccounts);
  };

  const handleKreditChange = (index: number, value: string, isSubAccount: boolean, subIndex: number = 0) => {
    const updatedAccounts = [...accounts];
    if (isSubAccount) {
      updatedAccounts[index].subakun[subIndex].kredit = Number(value) || 0;
      updatedAccounts[index].subakun[subIndex].debit = 0;
    } else {
      updatedAccounts[index].kredit = Number(value) || 0;
      updatedAccounts[index].debit = 0;
    }
    setAccounts(updatedAccounts);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Perusahaan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <h1 className="text-2xl font-bold ml-10">Perusahaan</h1>
                  <h2 className="text-sm ml-10">Let's check your Company today</h2>
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
              <CardTitle className="text-3xl text-primary">{getCategoryNameById(company.kategori_id)}</CardTitle>
              <CardDescription className="text-lg">Kelola Kredit dan debit akun perusahaan</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex justify-end mb-4 gap-2">
                <Button variant="outline" className="w-32 rounded-xl h-10" onClick={handleEditAllAccounts}>
                  Edit Semua
                </Button>
                <Button className="rounded-xl w-32 h-10" onClick={handleSaveAccount}>
                  Simpan
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
                    <React.Fragment key={account.id}>
                      <TableRow>
                        <TableCell>{account.nama}</TableCell>
                        <TableCell></TableCell>
                        <TableCell>{account.kode}</TableCell>

                        <TableCell>
                          {account.isEditing ? (
                            <Input
                              type="number"
                              value={account.debit || ""}
                              onChange={(e) => handleDebitChange(index, e.target.value, false)}
                            />
                          ) : (
                            account.debit
                          )}
                        </TableCell>

                        <TableCell>
                          {account.isEditing ? (
                            <Input
                              type="number"
                              value={account.kredit || ""}
                              onChange={(e) => handleKreditChange(index, e.target.value, false)}
                            />
                          ) : (
                            account.kredit
                          )}
                        </TableCell>

                        <TableCell>
                          <Button onClick={() => startAddSubAccount(index)} disabled={account.status !== "open"}>
                            <FaPlus /> Tambah Sub
                          </Button>
                        </TableCell>
                      </TableRow>

                      {account.subakun?.map((subAccount, subIndex) => (
                        <TableRow key={subAccount.id}>
                          <TableCell></TableCell>

                          <TableCell>
                            {subAccount.isNew ? (
                              <Input
                                value={subAccount.nama}
                                onChange={(e) => handleSubAccountNameChange(index, subIndex, e.target.value)}
                                placeholder="Nama sub akun"
                              />
                            ) : (
                              subAccount.nama
                            )}
                          </TableCell>

                          <TableCell>
                            {subAccount.isNew ? (
                              <Input
                                value={subAccount.kode}
                                onChange={(e) => handleSubAccountKodeChange(index, subIndex, e.target.value)}
                                placeholder="Kode sub akun"
                              />
                            ) : (
                              subAccount.kode
                            )}
                          </TableCell>

                          <TableCell>
                            {subAccount.isEditing ? (
                              <Input
                                type="number"
                                value={subAccount.debit || ""}
                                onChange={(e) => handleDebitChange(index, e.target.value, true, subIndex)}
                              />
                            ) : (
                              subAccount.debit
                            )}
                          </TableCell>

                          <TableCell>
                            {subAccount.isEditing ? (
                              <Input
                                type="number"
                                value={subAccount.kredit || ""}
                                onChange={(e) => handleKreditChange(index, e.target.value, true, subIndex)}
                              />
                            ) : (
                              subAccount.kredit
                            )}
                          </TableCell>

                          {subAccount.isNew && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveNewSubAccount(index, subIndex)}>
                                  Simpan
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => cancelAddSubAccount(index, subIndex)}>
                                  Batal
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
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
                  <p>:</p>
                  <p>{company.nama}</p>

                  <p className="font-semibold whitespace-nowrap">Kategori Perusahaan</p>
                  <p>:</p>
                  <p>{getCategoryNameById(company.kategori_id)}</p>

                  <p className="font-semibold whitespace-nowrap">Alamat</p>
                  <p>:</p>
                  <p>{company.alamat}</p>

                  <p className="font-semibold whitespace-nowrap">Tahun Berdiri</p>
                  <p>:</p>
                  <p>{company.tahun_berdiri}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
