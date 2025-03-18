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
  debit: number;
  kredit: number;
  akun_id: string;
  isEditing: boolean;
}

interface Transaction {
  id?: string;
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
  // const [errors, setErrors] = useState<Record<string, string>>({});
  const { id } = useParams();
  const fetchAccounts = async (kategoriId: string) => {
    try {
      const response = await axios.get("/instruktur/akun");
      const filteredAccounts = response.data.data.filter(
        (account: any) => account.kategori_id === kategoriId // Tampilkan semua status
      );
  

      const accountsData = filteredAccounts.map((account: any) => ({
        id: account.id,
        nama: account.nama,
        kode: account.kode,
        status: account.status,
        debit: 0,
        kredit: 0,
        isEditing: false,
        perusahaan_id: company?.id || "",
        subakun:
          account.subakun?.map((sub: any) => ({
            id: sub.id,
            nama: sub.nama,
            kodeAkun: sub.kode,
            debit: 0,
            kredit: 0,
            isEditing: false,
            perusahaan_id: company?.id || "",
          })) || [],
      }));

      // Handle setting accounts
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

  // 2. Perbaikan handleEditAllAccounts untuk hanya mengaktifkan edit pada status open
  const handleEditAllAccounts = () => {
    const updatedAccounts = accounts.map((account) => ({
      ...account,
      isEditing: account.status === "open", // Hanya aktifkan jika status open
      subakun:
        account.subakun?.map((sub) => ({
          ...sub,
          isEditing: account.status === "open", // Wariskan status ke subakun
        })) || [],
    }));
    setAccounts(updatedAccounts);
  };

  // 2. Handler untuk menambah sub akun baru
  const handleAddSubAccount = (index: number) => {
    const updatedAccounts = [...accounts];
    const parentAccount = updatedAccounts[index];

    // Membuat sub-akun baru dengan kode yang dimasukkan oleh pengguna
    const newSubAccount: Account = {
      id: `temp-${Date.now()}`, // ID sementara
      nama: "",
      kode: "", // Kode yang dimasukkan oleh user untuk sub-akun
      debit: 0,
      kredit: 0,
      isEditing: true,
      perusahaan_id: company?.id || "",
    };

    if (!parentAccount.subakun) {
      parentAccount.subakun = [];
    }

    parentAccount.subakun.push(newSubAccount);
    setAccounts(updatedAccounts);
  };

  const handleSubAccountKodeChange = (
    accountIndex: number,
    subIndex: number,
    newKode: string
  ) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun![subIndex].kode = newKode; // Perbarui kode sub-akun
    setAccounts(updatedAccounts);
  };

  const handleSaveAccount = async () => {
    try {
      let hasError = false;

      // Validasi sub akun name dan kode
      accounts.forEach((account) => {
        account.subakun?.forEach((sub) => {
          if (!sub) return; // Cek apakah sub ada
          if (sub.id.startsWith("temp-")) {
            if (!sub.nama.trim() || !sub.kode.trim()) {
              toast.error("Nama dan kode sub akun harus diisi");
              hasError = true;
            }
          }
        });
      });

      // Jika ada error atau perusahaan belum ada, hentikan
      if (hasError || !company) {
        toast.error("Perusahaan tidak ditemukan atau ada error");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token tidak ditemukan");
        return;
      }

      const localAccounts = JSON.parse(JSON.stringify(accounts));
      const transactions: Transaction[] = [];

      // Pastikan data perusahaan dan akun valid
      if (!company.id) {
        toast.error("Perusahaan ID tidak ditemukan");
        return;
      }

      // Mengambil data debit dan kredit dari akun utama
      localAccounts.forEach((account) => {
        // Ambil debit dan kredit dari akun utama, bukan sub akun
        console.log("Akun ID:", account.id);
        console.log("Perusahaan ID:", company.id);
        console.log("Debit:", account.debit);
        console.log("Kredit:", account.kredit);

        // Sub akun ID hanya diisi jika ada sub akun yang terkait
        const subAccountId =
          account.subakun?.length > 0 ? account.subakun[0].id : null;

        if ((account.debit || account.kredit) && account.id && company.id) {
          // Mengirim transaksi dengan sub_akun_id atau null jika tidak ada
          transactions.push({
            akun_id: account.id, // Mengambil akun_id dari akun yang ada
            perusahaan_id: company.id, // Mengambil perusahaan_id dari company
            debit: account.debit || 0, // Kirim debit dari akun utama, jika tidak ada, kirim 0
            kredit: account.kredit || 0, // Kirim kredit dari akun utama, jika tidak ada, kirim 0
            sub_akun_id: subAccountId, // Kirim sub_akun_id, jika tidak ada maka null
          });
        }
      });

      // Verifikasi bahwa transactions berisi data yang benar
      console.log("Data transaksi yang akan dikirim:", transactions);

      // Cek apakah transaksi kosong
      if (transactions.length === 0) {
        toast.error("Tidak ada transaksi untuk dikirim.");
        return;
      }

      // Kirim transaksi ke backend
      await axios.post(
        "/mahasiswa/keuangan", // Endpoint utama untuk menyimpan data
        { transactions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state dan local storage setelah transaksi berhasil
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
      console.error("Gagal menyimpan:", error);
      toast.error("Gagal menyimpan data");
    }
  };

  // const handleSubAccountKodeChange = (
  //   accountIndex: number,
  //   subIndex: number,
  //   newKode: string
  // ) => {
  //   const updatedAccounts = [...accounts];
  //   updatedAccounts[accountIndex].subakun![subIndex].kode = newKode;
  //   setAccounts(updatedAccounts);
  // };

  // Handles debit changes for both main account and subaccounts
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

  // Handles kredit changes for both main account and subaccounts
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
                    Let's check your Company today
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
                      {/* Row for main account */}
                      <TableRow>
                        <TableCell>{account.nama}</TableCell>
                        <TableCell></TableCell>
                        <TableCell>{account.kode}</TableCell>

                        {/* Debit Field for Main Account */}
                        <TableCell>
                          {account.isEditing ? (
                            <Input
                              type="number"
                              value={account.debit || ""}
                              onChange={(e) =>
                                handleDebitChange(index, e.target.value, false)
                              }
                            />
                          ) : (
                            account.debit
                          )}
                        </TableCell>

                        {/* Kredit Field for Main Account */}
                        <TableCell>
                          {account.isEditing ? (
                            <Input
                              type="number"
                              value={account.kredit || ""}
                              onChange={(e) =>
                                handleKreditChange(index, e.target.value, false)
                              }
                            />
                          ) : (
                            account.kredit
                          )}
                        </TableCell>

                        {/* Button to add subaccount */}
                        <TableCell>
                          <Button
                            onClick={() => handleAddSubAccount(index)}
                            disabled={account.status !== "open"} // Tambahkan disabled condition
                          >
                            <FaPlus /> Tambah Sub
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Row for subaccounts */}
                      {account.subakun?.map((subAccount, subIndex) => (
                        <TableRow key={subAccount.id}>
                          <TableCell></TableCell>

                          {/* Subaccount Name Field */}
                          <TableCell>
                            <Input
                              value={subAccount.nama}
                              onChange={(e) =>
                                handleSubAccountNameChange(
                                  index,
                                  subIndex,
                                  e.target.value
                                )
                              }
                              placeholder="Nama sub akun"
                              disabled={!subAccount.isEditing}
                            />
                          </TableCell>

                          {/* Subaccount Code Field */}
                          <TableCell>
                            {subAccount.isEditing ? (
                              <Input
                                value={subAccount.kode}
                                onChange={(e) =>
                                  handleSubAccountKodeChange(
                                    index,
                                    subIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="Kode sub akun"
                                disabled={!subAccount.isEditing}
                              />
                            ) : (
                              subAccount.kode
                            )}
                          </TableCell>

                          {/* Debit Field for Sub Account */}
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

                          {/* Kredit Field for Sub Account */}
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
