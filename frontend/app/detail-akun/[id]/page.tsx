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
import { FaPlus } from "react-icons/fa";
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
  name: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
  isEditing: boolean;
  perusahaan_id: string;
  subakun?: Account[];
}

interface Transaction {
  akun_id: string;
  perusahaan_id: string;
  debit: number;
  kredit: number;
  tanggal: string;
  sub_akun_id?: string;
}

export default function Page() {
  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { id } = useParams();

  const fetchAccounts = async (kategoriId: string) => {
    try {
      const response = await axios.get("/instruktur/akun");
      const filteredAccounts = response.data.data.filter(
        (account: any) =>
          account.kategori_id === kategoriId && account.status === "open"
      );

      const accountsData = filteredAccounts.map((account: any) => ({
        id: account.id,
        name: account.nama,
        kodeAkun: account.kode,
        debit: 0,
        kredit: 0,
        isEditing: false,
        perusahaan_id: company?.id || "",
        subakun:
          account.subakun?.map((sub: any) => ({
            id: sub.id,
            name: sub.nama,
            kodeAkun: sub.kode,
            debit: 0,
            kredit: 0,
            isEditing: false,
            perusahaan_id: company?.id || "",
          })) || [],
      }));

      if (company) {
        const localData = localStorage.getItem(`accounts_${company.id}`);
        if (localData) {
          const merged = mergeAccounts(JSON.parse(localData), accountsData);
          setAccounts(merged);
        } else {
          setAccounts(accountsData);
        }
      } else {
        setAccounts(accountsData);
      }
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

  // 1. Handler untuk mengaktifkan mode edit semua
  const handleEditAllAccounts = () => {
    const updatedAccounts = accounts.map((account) => ({
      ...account,
      isEditing: true, // Aktifkan edit untuk akun utama
      subakun:
        account.subakun?.map((sub) => ({
          ...sub,
          isEditing: true, // Aktifkan edit untuk sub akun
        })) || [],
    }));
    setAccounts(updatedAccounts);
  };
  // 2. Handler untuk menambah sub akun baru
  const handleAddSubAccount = (index: number) => {
    const updatedAccounts = [...accounts];
    const parentAccount = updatedAccounts[index];

    // Generate kode sub akun unik
    const subCount = parentAccount.subakun?.length || 0;
    const newKode = `${parentAccount.kodeAkun}.${subCount + 1}`;

    // Buat sub akun temporary
    const newSubAccount: Account = {
      id: `temp-${Date.now()}`, // ID temporary unik
      name: "",
      kodeAkun: newKode,
      debit: 0,
      kredit: 0,
      isEditing: true, // Langsung aktifkan edit mode
      perusahaan_id: company?.id || "",
    };

    // Tambahkan ke array subakun
    if (!updatedAccounts[index].subakun) {
      updatedAccounts[index].subakun = [];
    }
    updatedAccounts[index].subakun!.push(newSubAccount);

    setAccounts(updatedAccounts);
  };

  // 3. Handler utama untuk menyimpan data
  const handleSaveAccount = async () => {
    try {
      if (!company) {
        toast.error("Perusahaan tidak ditemukan");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login terlebih dahulu");
        return;
      }

      // Salin data lokal untuk manipulasi
      let localAccounts = JSON.parse(JSON.stringify(accounts));
      const transactions: Transaction[] = [];
      const subAkunUpdates: Promise<void>[] = [];

      // Proses pembuatan sub akun baru
      localAccounts.forEach((account: Account) => {
        account.subakun?.forEach(async (sub, subIndex) => {
          if (sub.id.startsWith("temp-")) {
            // Validasi data sub akun
            if (!sub.name.trim()) {
              toast.error("Nama sub akun harus diisi");
              return;
            }

            const kodeParts = sub.kodeAkun.split(".");
            if (kodeParts.length < 2) {
              toast.error("Format kode sub akun tidak valid");
              return;
            }

            // Buat sub akun ke database
            subAkunUpdates.push(
              axios
                .post(
                  "/mahasiswa/subakun",
                  {
                    kode: kodeParts[1],
                    nama: sub.name,
                    akun_id: account.id,
                    perusahaan_id: company.id,
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                )
                .then((response) => {
                  // Update ID temporary dengan ID dari database
                  localAccounts = localAccounts.map((acc) => {
                    if (acc.id === account.id) {
                      return {
                        ...acc,
                        subakun: acc.subakun?.map((s) =>
                          s.id === sub.id ? { ...s, id: response.data.id } : s
                        ),
                      };
                    }
                    return acc;
                  });
                })
                .catch((error) => {
                  console.error("Gagal membuat sub akun:", error);
                  toast.error(`Gagal membuat sub akun ${sub.kodeAkun}`);
                })
            );
          }
        });
      });

      // Tunggu semua sub akun selesai dibuat
      await Promise.all(subAkunUpdates);

      // Bangun transaksi setelah semua ID diupdate
      localAccounts.forEach((account: Account) => {
        // Transaksi untuk akun utama
        transactions.push({
          akun_id: account.id,
          sub_akun_id: null,
          perusahaan_id: company.id,
          debit: account.debit,
          kredit: account.kredit,
          tanggal: new Date().toISOString(),
        });

        // Transaksi untuk sub akun
        account.subakun?.forEach((sub) => {
          transactions.push({
            akun_id: account.id,
            sub_akun_id: sub.id,
            perusahaan_id: company.id,
            debit: sub.debit,
            kredit: sub.kredit,
            tanggal: new Date().toISOString(),
          });
        });
      });

      // Kirim semua transaksi ke backend
      await axios.post(
        "/mahasiswa/keuangan",
        { transactions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state akhir
      const finalAccounts = localAccounts.map((account) => ({
        ...account,
        isEditing: false,
        subakun:
          account.subakun?.map((sub) => ({
            ...sub,
            isEditing: false,
          })) || [],
      }));

      setAccounts(finalAccounts);
      localStorage.setItem(
        `accounts_${company.id}`,
        JSON.stringify(finalAccounts)
      );

      toast.success("Data berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      toast.error(
        "Gagal menyimpan data: " +
          (error.response?.data?.message || error.message)
      );
    }
  };


  const handleDebitChange = (
    index: number,
    value: string,
    isSubAccount: boolean,
    subIndex: number = 0
  ) => {
    const updatedAccounts = [...accounts];
    if (isSubAccount) {
      updatedAccounts[index].subakun![subIndex].debit = Number(value) || 0;
    } else {
      updatedAccounts[index].debit = Number(value) || 0;
    }
    setAccounts(updatedAccounts);
  };

  const handleKreditChange = (
    index: number,
    value: string,
    isSubAccount: boolean,
    subIndex: number = 0
  ) => {
    const updatedAccounts = [...accounts];
    if (isSubAccount) {
      updatedAccounts[index].subakun![subIndex].kredit = Number(value) || 0;
    } else {
      updatedAccounts[index].kredit = Number(value) || 0;
    }
    setAccounts(updatedAccounts);
  };

  const handleSubAccountNameChange = (
    accountIndex: number,
    subIndex: number,
    newName: string
  ) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun![subIndex].name = newName;
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
              <CardTitle className="text-5xl text-primary py-2 mb-4">
                {company.nama}
              </CardTitle>
              <CardTitle className="text-3xl text-primary">
                {getCategoryNameById(company.kategori_id)}
              </CardTitle>
              <CardDescription className="text-lg">
                Kelola Kredit dan debit akun perusahaan
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex justify-end mb-4 gap-2">
                <Button
                  variant="outline"
                  className="w-32 rounded-xl h-10"
                  onClick={handleEditAllAccounts}
                >
                  Edit Semua
                </Button>
                <Button
                  className="rounded-xl w-32 h-10"
                  onClick={handleSaveAccount}
                >
                  Simpan
                </Button>
              </div>

              <Table className="w-full border border-gray-300 rounded-xl overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-gray-200">
                    <TableHead className="text-center py-2">
                      Nama Akun
                    </TableHead>
                    <TableHead className="text-center py-2">Sub Akun</TableHead>
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
                    <React.Fragment key={account.id}>
                      {/* Baris untuk akun utama */}
                      <TableRow>
                        <TableCell>{account.name}</TableCell>
                        <TableCell></TableCell>
                        <TableCell>{account.kodeAkun}</TableCell>

                        {/* Input Debit untuk akun utama */}
                        <TableCell>
                          <Input
                            type="number"
                            value={account.debit || ""}
                            onChange={(e) =>
                              handleDebitChange(index, e.target.value, false)
                            }
                            disabled={account.kredit > 0}
                          />
                        </TableCell>

                        {/* Input Kredit untuk akun utama */}
                        <TableCell>
                          <Input
                            type="number"
                            value={account.kredit || ""}
                            onChange={(e) =>
                              handleKreditChange(index, e.target.value, false)
                            }
                            disabled={account.debit > 0}
                          />
                        </TableCell>

                        {/* Tombol Tambah Sub Akun */}
                        <TableCell>
                          <Button onClick={() => handleAddSubAccount(index)}>
                            <FaPlus /> Tambah Sub
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Baris untuk sub-akun */}
                      {account.subakun?.map((subAccount, subIndex) => (
                        <TableRow key={subAccount.id}>
                          <TableCell></TableCell>

                          {/* Input Nama Sub Akun */}
                          <TableCell>
                            <Input
                              value={subAccount.name}
                              onChange={(e) =>
                                handleSubAccountNameChange(
                                  index,
                                  subIndex,
                                  e.target.value
                                )
                              }
                              placeholder="Nama sub akun"
                            />
                          </TableCell>

                          <TableCell>{subAccount.kodeAkun}</TableCell>

                          {/* Input Debit Sub Akun */}
                          <TableCell>
                            <Input
                              type="number"
                              value={subAccount.debit || ""}
                              onChange={(e) =>
                                handleDebitChange(
                                  index,
                                  e.target.value,
                                  true,
                                  subIndex
                                )
                              }
                              disabled={subAccount.kredit > 0}
                            />
                          </TableCell>

                          {/* Input Kredit Sub Akun */}
                          <TableCell>
                            <Input
                              type="number"
                              value={subAccount.kredit || ""}
                              onChange={(e) =>
                                handleKreditChange(
                                  index,
                                  e.target.value,
                                  true,
                                  subIndex
                                )
                              }
                              disabled={subAccount.debit > 0}
                            />
                          </TableCell>

                          <TableCell></TableCell>
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
                  <p>:</p>
                  <p>{company.nama}</p>

                  <p className="font-semibold whitespace-nowrap">
                    Kategori Perusahaan
                  </p>
                  <p>:</p>
                  <p>{getCategoryNameById(company.kategori_id)}</p>

                  <p className="font-semibold whitespace-nowrap">Alamat</p>
                  <p>:</p>
                  <p>{company.alamat}</p>

                  <p className="font-semibold whitespace-nowrap">
                    Tahun Berdiri
                  </p>
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

function mergeAccounts(localAccounts: Account[], apiAccounts: Account[]) {
  return apiAccounts.map((apiAcc) => {
    const localAcc = localAccounts.find((la) => la.id === apiAcc.id);
    return localAcc ? { ...apiAcc, ...localAcc } : apiAcc;
  });
}
