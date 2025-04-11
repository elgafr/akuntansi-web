"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { FaBuilding } from "react-icons/fa";
import axios from "@/lib/axios";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

interface Company {
  id: string;
  nama: string;
  status: "online" | "offline";
  start_priode?: string;
}

interface Account {
  id: string;
  nama: string;
  kode: string;
  debit: number;
  kredit: number;
  saldo_normal: "debit" | "kredit";
}

interface Jurnal {
  id: string;
  tanggal: string;
  akun_kode: string;
  debit: number;
  kredit: number;
}

interface BukuBesarItem {
  tanggal: string;
  saldo: number;
  akun_kode: string;
  is_saldo_awal?: boolean;
  debit: number;
  kredit: number;
  akun?: { saldo_normal: "debit" | "kredit" };
}

interface Keuangan {
  debit: number | null;
  kredit: number | null;
}

interface ChartDataItem {
  tanggal: string;
  [key: string]: number | string;
}

interface ProfileData {
  user: { name: string; nim: string };
  foto?: string;
}

const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 100_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toLocaleString("id-ID");
};

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { companyName: "" },
  });

  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  // const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  // const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(["", "", ""]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("selectedAccounts");
    try {
      if (saved) {
        setSelectedAccounts(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error parsing selectedAccounts:", e);
    }
  }
}, []);

useEffect(() => {
  localStorage.setItem("selectedAccounts", JSON.stringify(selectedAccounts));
}, [selectedAccounts]);

  // Perubahan pada fungsi calculateRunningSaldo
  const calculateRunningSaldo = (
    journals: Jurnal[],
    account: Account,
    initialSaldo: number,
    saldoAwalTanggal: string
  ): { tanggal: string; saldo: number }[] => {
    // Tambahkan entri saldo awal sebagai titik pertama
    const result: { tanggal: string; saldo: number }[] = [
      {
        tanggal: saldoAwalTanggal,
        saldo: initialSaldo,
      },
    ];

    // Kelompokkan transaksi per tanggal
    const groupedByDate = journals.reduce((acc, journal) => {
      const tanggal = new Date(journal.tanggal).toISOString().split("T")[0];
      if (!acc[tanggal]) acc[tanggal] = [];
      acc[tanggal].push(journal);
      return acc;
    }, {} as Record<string, Jurnal[]>);

    // Urutkan tanggal secara kronologis
    const sortedDates = Object.keys(groupedByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Hitung saldo akhir per tanggal
    let saldo = initialSaldo;

    for (const tanggal of sortedDates) {
      const dailyTransactions = groupedByDate[tanggal];

      dailyTransactions.forEach((transaction) => {
        saldo +=
          account.saldo_normal === "debit"
            ? transaction.debit - transaction.kredit
            : transaction.kredit - transaction.debit;
      });

      result.push({ tanggal, saldo });
    }

    return result;
  };

  const processChartData = (
    saldoData: Record<string, { tanggal: string; saldo: number }[]>
  ) => {
    const allDates = Array.from(
      new Set(
        Object.values(saldoData)
          .flat()
          .map((d) => d.tanggal)
      )
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return allDates.map((date) => {
      const entry: ChartDataItem = { tanggal: date };

      Object.keys(saldoData).forEach((accountId) => {
        const saldoEntries = saldoData[accountId];
        const latestEntry = saldoEntries
          .filter((e) => e.tanggal <= date)
          .sort(
            (a, b) =>
              new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
          )[0];

        entry[accountId] = latestEntry?.saldo || 0;
      });

      return entry;
    });
  };

  useEffect(() => {
    const fetchChartData = async () => {
      if (selectedCompany && selectedAccounts.some((acc) => acc !== "")) {
        setLoadingChart(true);
        setError(null);

        try {
          const activeAccounts = selectedAccounts
            .filter((acc) => acc !== "")
            .map((acc) => accounts.find((a) => a.kode === acc))
            .filter(Boolean) as Account[];

          const responses = await Promise.all(
            activeAccounts.map((account) =>
              axios.get<{
                success: boolean;
                data: {
                  keuangan: Keuangan;
                  jurnal: Jurnal[];
                  total: number;
                  totalDebit: number;
                  totalKredit: number;
                };
              }>("/mahasiswa/bukubesar/sort", {
                params: {
                  akun_id: account.id,
                  company_id: selectedCompany.id,
                },
              })
            )
          );

          const saldoData: Record<
            string,
            { tanggal: string; saldo: number }[]
          > = {};

          responses.forEach((response, index) => {
            const account = activeAccounts[index];
            if (response.data?.success) {
              const backendData = response.data.data;

              let initialSaldo = 0;
              if (account.saldo_normal === "debit") {
                initialSaldo =
                  (backendData.keuangan.debit ?? 0) -
                  (backendData.keuangan.kredit ?? 0);
              } else {
                initialSaldo =
                  (backendData.keuangan.kredit ?? 0) -
                  (backendData.keuangan.debit ?? 0);
              }

              // Ambil tanggal saldo awal dari perusahaan
              const saldoAwalTanggal = selectedCompany.start_priode;

              saldoData[account.kode] = calculateRunningSaldo(
                backendData.jurnal || [],
                account,
                initialSaldo,
                saldoAwalTanggal || ""
              );
            }
          });

          setChartData(processChartData(saldoData));
        } catch (err) {
          console.error("Gagal mengambil data:", err);
          setError("Gagal memuat data. Silakan coba lagi.");
        } finally {
          setLoadingChart(false);
        }
      }
    };

    fetchChartData();
  }, [selectedCompany, selectedAccounts, accounts]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profileRes, companiesRes, accountsRes] = await Promise.all([
          axios.get("/mahasiswa/profile"),
          axios.get("/mahasiswa/perusahaan"),
          axios.get("/instruktur/akun"),
        ]);

        // Handle profile data dengan konstruksi URL foto
        const profileData = profileRes.data?.data || null;
        if (profileData) {
          setProfileData({
            ...profileData,
            foto: profileData.foto
              ? `http://127.0.0.1:8000/storage/${profileData.foto}`
              : undefined,
          });
        }

        const companiesData = companiesRes.data?.data || [];
        setCompanyList(companiesData);

        const onlineCompany = companiesData.find(
          (c: Company) => c.status === "online"
        );
        if (onlineCompany) {
          setSelectedCompany(onlineCompany);
          form.setValue("companyName", onlineCompany.nama);
        }

        setAccounts(accountsRes.data?.data || []);
        // setProfileData(profileRes.data?.data || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchInitialData();
  }, []);

  // useEffect(() => {
  //   if (!searchTerm.trim()) {
  //     setFilteredCompanies([]);
  //     return;
  //   }

  //   const results = companyList.filter((company) =>
  //     company.nama.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   setFilteredCompanies(results);
  // }, [searchTerm, companyList]);

  const handleCompanySelect = async (company: Company) => {
    try {
      if (selectedCompany) {
        await axios.put(`/mahasiswa/perusahaan/${selectedCompany.id}`, {
          status: "offline",
        });
      }

      const response = await axios.put(`/mahasiswa/perusahaan/${company.id}`, {
        status: "online",
      });

      setCompanyList((prev) =>
        prev.map((c) => ({
          ...c,
          status: c.id === company.id ? "online" : "offline",
        }))
      );

      setSelectedCompany(company);
      form.setValue("companyName", company.nama);
      // setFilteredCompanies([]);
    } catch (error) {
      console.error("Gagal memilih perusahaan:", error);
      alert("Gagal memilih perusahaan");
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!selectedCompany) {
      const company = companyList.find(
        (c) => c.nama.toLowerCase() === data.companyName.toLowerCase()
      );
      if (company) await handleCompanySelect(company);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <h1 className="text-2xl font-bold ml-6 text-black">
                  Dashboard
                </h1>
                <h2 className="text-sm ml-6">
                  Let&apos;s check your Dashboard today
                </h2>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={profileData?.foto || "/default-avatar.png"}
                  alt="@shadcn"
                />
              </Avatar>
              <div className="text-left mr-8">
                <div className="text-sm font-medium">
                  {loadingProfile
                    ? "Loading..."
                    : profileData?.user?.name || "Nama tidak tersedia"}
                </div>
                <div className="text-xs text-gray-800">Student</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full"
              autoComplete="off"
            >
              <div className="flex items-center gap-4 w-full h-10">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <div className="flex-1 ml-6">
                      <FormItem className="mb-0">
                        <FormControl>
                          <div className="relative">
                            <Select
                              value={selectedCompany?.id || ""}
                              onValueChange={(value) => {
                                const company = companyList.find(
                                  (c) => c.id === value
                                );
                                if (company) handleCompanySelect(company);
                              }}
                            >
                              <SelectTrigger className="w-full pl-10 h-10 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <FaBuilding className="text-gray-700" />
                                  <SelectValue
                                    placeholder="Pilih Perusahaan"
                                    className="ml-2"
                                  />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {companyList.map((company) => (
                                    <SelectItem
                                      key={company.id}
                                      value={company.id}
                                      className="py-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`w-2 h-2 rounded-full ${
                                            company.status === "online"
                                              ? "bg-green-500"
                                              : "bg-gray-400"
                                          }`}
                                        ></span>
                                        {company.nama}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                      </FormItem>
                    </div>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <div className="flex flex-col ml-10 mt-6 gap-4">
          <div className="flex items-start gap-20">
            <h2 className="text-lg font-semibold mb-2 w-[420px]">
              Informasi Mahasiswa
            </h2>
            <h2 className="text-lg font-semibold mb-2 w-[450px]">
              Chart Pergerakan Akun
            </h2>
          </div>

          <div className="flex items-start gap-4">
            <Card className="w-[485px] h-[230px] p-5 bg-gradient-to-r from-red-500 to-red-700 text-white flex">
              <CardContent className="flex items-center justify-center gap-4 h-full w-full">
                <Avatar className="w-20 h-20 ring-white flex-shrink-0 self-center">
                  <AvatarImage
                    src={profileData?.foto || "/default-avatar.png"}
                  />
                </Avatar>
                <div className="text-md w-full">
                  <div className="grid grid-cols-[auto_20px_1fr] gap-x-4 gap-y-2 items-start">
                    <p className="font-semibold whitespace-nowrap">
                      Nama Mahasiswa
                    </p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">
                      {loadingProfile
                        ? "Loading..."
                        : profileData?.user?.name || "Nama tidak tersedia"}
                    </p>

                    <p className="font-semibold whitespace-nowrap">NIM</p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">
                      {loadingProfile
                        ? "Loading..."
                        : profileData?.user?.nim || "NIM tidak tersedia"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 text-gray-600 w-[450px]">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-destructive">
                    Pilih Akun {index + 1}
                  </label>
                  <Select
                    value={selectedAccounts[index]}
                    onValueChange={(value: string) => {
                      const newAccounts = [...selectedAccounts];
                      newAccounts[index] = value;
                      setSelectedAccounts(newAccounts);
                    }}
                  >
                    <SelectTrigger className="w-[450px] h-[40px] rounded-xl">
                      <SelectValue placeholder={`Pilih Akun ${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">-- Pilih Akun --</SelectItem>
                        {accounts
                          .filter(
                            (account) =>
                              !selectedAccounts.some(
                                (acc, i) =>
                                  i !== index &&
                                  acc === account.kode &&
                                  acc !== "none"
                              )
                          )
                          .map((account: Account) => (
                            <SelectItem
                              key={account.kode}
                              value={account.kode}
                              disabled={selectedAccounts.includes(account.kode)}
                            >
                              {account.kode} - {account.nama}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <Card className="mt-10 w-full p-4 shadow-md">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="mb-4 text-gray-500">
                  Grafik Buku Besar
                </CardTitle>
                <CardDescription className="text-black text-2xl font-bold">
                  {selectedCompany?.nama || "Perusahaan Belum Dipilih"}
                </CardDescription>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {selectedAccounts.map(
                  (accountCode, idx) =>
                    accountCode && (
                      <div
                        key={`account-legend-${accountCode}-${idx}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${
                            idx === 0
                              ? "bg-[#8884d8]"
                              : idx === 1
                              ? "bg-[#82ca9d]"
                              : "bg-[#ffc658]"
                          }`}
                        />
                        <span>
                          {accounts.find((a) => a.kode === accountCode)?.nama ||
                            "-"}
                        </span>
                      </div>
                    )
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="w-full h-[300px]">
                {loadingChart ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="h-full flex items-center justify-center text-red-500">
                    {error}
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="tanggal"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("id-ID")
                        }
                      />
                      <YAxis tickFormatter={formatNumber} />
                      <Tooltip
                        formatter={(value: number) => [
                          `Rp${formatNumber(Number(value))}`,
                          "Saldo",
                        ]}
                        labelFormatter={(label) =>
                          new Date(label).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        }
                      />

                      {selectedAccounts
                        .filter((acc) => acc !== "")
                        .map((accountCode, idx) => {
                          const account = accounts.find(
                            (a) => a.kode === accountCode
                          );
                          return account ? (
                            <Line
                              key={account.id}
                              type="monotone"
                              dataKey={account.kode}
                              name={account.nama}
                              stroke={
                                ["#8884d8", "#82ca9d", "#ffc658"][idx % 3]
                              }
                              strokeWidth={2}
                              dot={false}
                            />
                          ) : null;
                        })}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Tidak ada data untuk ditampilkan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
