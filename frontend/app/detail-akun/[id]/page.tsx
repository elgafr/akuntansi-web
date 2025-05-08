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
import { FaArrowLeft, FaPlus } from "react-icons/fa";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  keuanganId: string;
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
  keuanganId: string;
}

interface ProfileData {
  user: {
    name: string;
  };
  foto?: string;
}

export default function Page() {
  const [company, setCompany] = useState<Company | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingSubAccountIndex, setAddingSubAccountIndex] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const { id } = useParams();

  const fetchAccounts = async (perusahaanId: string) => {
    try {
      const [akunResponse, keuanganResponse, subakunResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/instruktur/akun`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/keuangan`, {
          params: {
            perusahaan_id: perusahaanId,
            with: ["akun"],
          },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/subakun`, {
          params: {
            perusahaan_id: perusahaanId,
            with: ["keuangan"],
          },
        }),
      ]);

      const allAccounts = akunResponse.data.data.map((akun: any) => {
        const keuangan = keuanganResponse.data.data.find(
          (k: any) => k.akun_id === akun.id && k.perusahaan_id === perusahaanId
        );

        const subakun = subakunResponse.data.data
          .filter(
            (sub: any) =>
              sub.akun_id === akun.id && sub.perusahaan_id === perusahaanId
          )
          .map((sub: any) => ({
            ...sub,
            debit: sub.keuangan?.debit || 0,
            kredit: sub.keuangan?.kredit || 0,
            keuanganId: sub.keuangan?.id || null,
          }));

        return {
          ...akun,
          debit: keuangan?.debit || 0,
          kredit: keuangan?.kredit || 0,
          keuanganId: keuangan?.id || null,
          subakun,
          isEditing: false,
        };
      });

      setAccounts(allAccounts);
    } catch (error) {
      toast.error("Gagal memuat data terbaru");
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/profile`);
        if (response.data.success) {
          const data = response.data.data;
          const fotoUrl = data.foto
            ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${data.foto}`
            : undefined;
          setProfileData({
            user: {
              name: data.user.name,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, categoriesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/perusahaan/${id}`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/instruktur/kategori`),
        ]);

        if (companyRes.data.success) {
          setCompany(companyRes.data.data);
          await fetchAccounts(companyRes.data.data.id);
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
    const newSub = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      kode: "",
      nama: "",
      akun_id: accounts[accountIndex].id,
      perusahaan_id: company?.id || "",
      isEditing: true,
      isNew: true,
      debit: 0,
      kredit: 0,
      keuanganId: "",
    };

    updatedAccounts[accountIndex].subakun = [
      ...updatedAccounts[accountIndex].subakun,
      newSub,
    ];

    setAccounts(updatedAccounts);
  };

  const saveNewSubAccount = async (accountIndex: number, subIndex: number) => {
    try {
      const account = accounts[accountIndex];
      const subAccount = account.subakun[subIndex];

      if (!subAccount.nama || !subAccount.kode) {
        toast.error("Nama dan kode sub akun harus diisi");
        return;
      }

      const subResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mahasiswa/subakun`, {
        nama: subAccount.nama,
        kode: subAccount.kode,
        akun_id: account.id,
        perusahaan_id: company?.id,
      });

      const updatedAccounts = [...accounts];
      const newSub = {
        ...subResponse.data,
        isEditing: false,
        isNew: false,
        debit: 0,
        kredit: 0,
        keuanganId: "",
      };

      updatedAccounts[accountIndex].subakun[subIndex] = newSub;
      setAccounts(updatedAccounts);

      await fetchAccounts(company?.id!);
      toast.success("Sub akun berhasil ditambahkan!");
    } catch (error) {
      console.error("Gagal menyimpan sub akun:", error);
      toast.error("Gagal menyimpan sub akun");
    }
  };

  const cancelAddSubAccount = (accountIndex: number, subIndex: number) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun = updatedAccounts[
      accountIndex
    ].subakun.filter((_, idx) => idx !== subIndex);
    setAccounts(updatedAccounts);
    setAddingSubAccountIndex(null);
  };

  const handleSubAccountNameChange = (
    accountIndex: number,
    subIndex: number,
    value: string
  ) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex].subakun[subIndex].nama = value;
    setAccounts(updatedAccounts);
  };

  const handleSubAccountKodeChange = (
    accountIndex: number,
    subIndex: number,
    value: string
  ) => {
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

      const updatePromises = [];

      for (const account of accounts) {
        if (
          account.keuanganId &&
          (account.debit !== 0 || account.kredit !== 0)
        ) {
          updatePromises.push(
            axios.put(`/mahasiswa/keuangan/${account.keuanganId}`, {
              debit: Number(account.debit),
              kredit: Number(account.kredit),
            })
          );
        }

        for (const sub of account.subakun) {
          if (sub.keuanganId && (sub.debit !== 0 || sub.kredit !== 0)) {
            updatePromises.push(
              axios.put(`/mahasiswa/keuangan/${sub.keuanganId}`, {
                debit: Number(sub.debit),
                kredit: Number(sub.kredit),
              })
            );
          }
        }
      }

      await Promise.all(updatePromises);
      await fetchAccounts(company.id);

      toast.success("Data berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Gagal menyimpan data");
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
      updatedAccounts[index].subakun[subIndex].debit = Number(value) || 0;
      updatedAccounts[index].subakun[subIndex].kredit = 0;
    } else {
      updatedAccounts[index].debit = Number(value) || 0;
      updatedAccounts[index].kredit = 0;
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
      updatedAccounts[index].subakun[subIndex].kredit = Number(value) || 0;
      updatedAccounts[index].subakun[subIndex].debit = 0;
    } else {
      updatedAccounts[index].kredit = Number(value) || 0;
      updatedAccounts[index].debit = 0;
    }
    setAccounts(updatedAccounts);
  };

  if (!company && !isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-500">Perusahaan tidak ditemukan</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
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
                  <h1 className="text-2xl font-bold ml-8">Perusahaan</h1>
                  {/* <h2 className="text-sm ml-8">
                    Let's check your Company today
                  </h2> */}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {loadingProfile ? (
                  <Skeleton className="h-10 w-10 rounded-full" />
                ) : (
                  <Avatar>
                    <AvatarImage
                      src={profileData?.foto || "https://github.com/shadcn.png"}
                      alt="Profile Picture"
                    />
                  </Avatar>
                )}
                <div className="text-left mr-12">
                  {loadingProfile ? (
                    <>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium">
                        {profileData?.user?.name || "Nama tidak tersedia"}
                      </div>
                      <div className="text-xs text-gray-800">Student</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-10 ml-10">
          <Link href="/perusahaan">
            <Button className="rounded-xl w-32 h-10 flex items-center">
              <FaArrowLeft className="mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 ml-10 flex gap-x-6 animate-pulse">
            <Card className="w-full">
              <CardHeader>
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-5 w-80" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2 mb-4">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mr-10 w-96">
              <CardHeader>
                <Skeleton className="h-9 w-48 mb-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-10 ml-10 flex gap-x-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-5xl text-primary py-2 mb-4">
                  {company?.nama}
                </CardTitle>
                <CardTitle className="text-3xl text-primary">
                  {company && getCategoryNameById(company.kategori_id)}
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

                          <TableCell className="w-40">
                            {account.isEditing ? (
                              <Input
                                type="number"
                                className="w-full"
                                value={account.debit || ""}
                                onChange={(e) =>
                                  handleDebitChange(index, e.target.value, false)
                                }
                              />
                            ) : (
                              account.debit
                            )}
                          </TableCell>

                          <TableCell className="w-40">
                            {account.isEditing ? (
                              <Input
                                type="number"
                                className="w-full"
                                value={account.kredit || ""}
                                onChange={(e) =>
                                  handleKreditChange(index, e.target.value, false)
                                }
                              />
                            ) : (
                              account.kredit
                            )}
                          </TableCell>

                          <TableCell>
                            <Button
                              onClick={() => startAddSubAccount(index)}
                              disabled={account.status !== "open"}
                            >
                              <FaPlus /> Add Sub
                            </Button>
                          </TableCell>
                        </TableRow>

                        {account.subakun?.map((subAccount, subIndex) => (
                          <TableRow key={`${account.id}-${subAccount.id}`}>
                            <TableCell></TableCell>

                            <TableCell className="w-40">
                              {subAccount.isNew ? (
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
                                />
                              ) : (
                                subAccount.nama
                              )}
                            </TableCell>

                            <TableCell className="w-40">
                              {subAccount.isNew ? (
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
                                  onChange={(e) =>
                                    handleDebitChange(
                                      index,
                                      e.target.value,
                                      true,
                                      subIndex
                                    )
                                  }
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
                                  onChange={(e) =>
                                    handleKreditChange(
                                      index,
                                      e.target.value,
                                      true,
                                      subIndex
                                    )
                                  }
                                />
                              ) : (
                                subAccount.kredit
                              )}
                            </TableCell>

                            {subAccount.isNew && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      saveNewSubAccount(index, subIndex)
                                    }
                                  >
                                    Simpan
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      cancelAddSubAccount(index, subIndex)
                                    }
                                  >
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

            <Card className="mr-10">
              <CardHeader>
                <CardTitle className="text-primary text-3xl">
                  Detail Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-md w-full">
                  <div className="grid grid-cols-[auto_20px_1fr] gap-x-4 gap-y-2 items-start">
                    <p className="font-semibold whitespace-nowrap">Nama Perusahaan</p>
                    <p>:</p>
                    <p>{company?.nama}</p>

                    <p className="font-semibold whitespace-nowrap">Kategori Perusahaan</p>
                    <p>:</p>
                    <p>{company && getCategoryNameById(company.kategori_id)}</p>

                    <p className="font-semibold whitespace-nowrap">Alamat</p>
                    <p>:</p>
                    <p>{company?.alamat}</p>

                    <p className="font-semibold whitespace-nowrap">Tahun Berdiri</p>
                    <p>:</p>
                    <p>{company?.tahun_berdiri}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}