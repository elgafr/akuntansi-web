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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { FaBuilding } from "react-icons/fa";
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

// Schema validasi form
const FormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

// Tipe data Company
interface Company {
  name: string;
  category: string;
  alamat: string;
  tahunBerdiri: number;
}

// Tipe data Account
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
// Fungsi untuk memformat angka ke dalam notasi singkat (misal: 10jt, 100jt, dll.)
const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    // Misalnya: 1.200.000.000 → "1,2M"
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  } else if (value >= 1_000_000) {
    // Misalnya: 2.500.000 → "2,5jt"
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  } else if (value >= 100_000) {
    // Misalnya: 100.000 → "100k"
    return `${(value / 1_000).toFixed(0)}k`;
  } else {
    return value.toLocaleString("id-ID");
  }
};

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { companyName: "" },
  });

  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // State untuk pilihan akun pada dropdown
  const [selectedAccount1, setSelectedAccount1] = useState<string | null>(null);
  const [selectedAccount2, setSelectedAccount2] = useState<string | null>(null);
  const [selectedAccount3, setSelectedAccount3] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "Guest",
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem("profileData");
    if (storedProfile) {
      setProfileData(JSON.parse(storedProfile));
    }
  }, []);

  // Load daftar perusahaan dari localStorage
  useEffect(() => {
    const savedCompanies = localStorage.getItem("companies");
    if (savedCompanies) {
      setCompanyList(JSON.parse(savedCompanies));
    }
  }, []);

  // Saat komponen mount, inisialisasi nilai perusahaan dan data akun (jika ada) dari localStorage
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      form.setValue("companyName", storedCompany);
      setSelectedCompany(storedCompany);
      setShowSuggestions(false);
      const accountKey = `accounts_${storedCompany}`;
      const savedAccounts = localStorage.getItem(accountKey);
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      } else {
        setAccounts([]);
      }
    }
  }, [form]);

  const searchTerm = form.watch("companyName");

  const filteredCompanies = companyList.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function onSubmit(data: z.infer<typeof FormSchema>) {
    localStorage.setItem("selectedCompany", data.companyName);
    setSelectedCompany(data.companyName);
    setShowSuggestions(false);
    const accountKey = `accounts_${data.companyName}`;
    const savedAccounts = localStorage.getItem(accountKey);
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      setAccounts([]);
    }
    alert(`Form submitted with Company Name: ${data.companyName}`);
  }

  // Fungsi helper untuk mendapatkan nilai debit dari sebuah akun
  const getAccountDebit = (kodeAkun: string): number => {
    const account = accounts.find((acc) => acc.kodeAkun === kodeAkun);
    return account ? account.debit : 0;
  };

  // Generate data grafik berdasarkan pilihan akun.
  // Misal: untuk masing-masing bulan, nilai akun dihasilkan dari nilai debit dasar + variasi
  const months = ["January", "February", "March", "April", "May", "June"];
  const mergedChartData = months.map((month, index) => ({
    month,
    account1: selectedAccount1
      ? getAccountDebit(selectedAccount1) + index * 5
      : undefined,
    account2: selectedAccount2
      ? getAccountDebit(selectedAccount2) + index * 3
      : undefined,
    account3: selectedAccount3
      ? getAccountDebit(selectedAccount3) + index * 4
      : undefined,
  }));

  // Misalnya nilai total buku besar (ini dapat diganti dengan nilai dinamis)
  const totalValue = 9846;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
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
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              </Avatar>
              <div className="text-left mr-8">
                <div className="text-sm font-medium">{profileData.fullName}</div>
                <div className="text-xs text-gray-800">Student</div>
              </div>
            </div>
          </div>
        </header>

        {/* Form Pencarian & Tombol */}
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
                            <Input
                              placeholder="Cari Perusahaan"
                              {...field}
                              className="w-full pl-10 h-10 rounded-xl"
                              onChange={(e) => {
                                field.onChange(e);
                                if (
                                  selectedCompany &&
                                  e.target.value !== selectedCompany
                                ) {
                                  setSelectedCompany(null);
                                  setAccounts([]);
                                }
                                setShowSuggestions(true);
                              }}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <FaBuilding className="w-5 h-5 text-gray-700" />
                            </div>
                            {searchTerm && showSuggestions && !selectedCompany && (
                              <>
                                {filteredCompanies.length > 0 ? (
                                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                    {filteredCompanies.map((company, index) => (
                                      <div
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                          form.setValue(
                                            "companyName",
                                            company.name
                                          );
                                          localStorage.setItem(
                                            "selectedCompany",
                                            company.name
                                          );
                                          setSelectedCompany(company.name);
                                          setShowSuggestions(false);
                                          const accountKey = `accounts_${company.name}`;
                                          const savedAccounts = localStorage.getItem(
                                            accountKey
                                          );
                                          if (savedAccounts) {
                                            setAccounts(JSON.parse(savedAccounts));
                                          } else {
                                            setAccounts([]);
                                          }
                                        }}
                                      >
                                        {company.name}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                    <div className="px-4 py-2 text-gray-500">
                                      Perusahaan tidak ditemukan
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    </div>
                  )}
                />
                <Button
                  type="submit"
                  className="flex items-center gap-2 flex-shrink-0 rounded-xl h-10 mr-8"
                >
                  <PlusCircle className="w-6 h-6 text-white" />
                  Pilih Perusahaan
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Bagian Pilih Akun */}
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
                <Avatar
                  className="w-20 h-20 ring-white flex-shrink-0 self-center"
                >
                  <AvatarImage
                    src="https://randomuser.me/api/portraits/women/79.jpg"
                    alt="Mahasiswa"
                  />
                </Avatar>
                <div className="text-md w-full">
                  <div className="grid grid-cols-[auto_20px_1fr] gap-x-4 gap-y-2 items-start">
                    <p className="font-semibold whitespace-nowrap">
                      Nama Mahasiswa
                    </p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">Cody Alexander</p>
                    <p className="font-semibold whitespace-nowrap">NIM</p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">
                      123456789101112
                    </p>
                    <p className="font-semibold whitespace-nowrap">
                      Program Studi
                    </p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">
                      Computer Science
                    </p>
                    <p className="font-semibold whitespace-nowrap">
                      Semester
                    </p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dropdown Pilih Akun */}
            <div className="flex flex-col gap-3 text-gray-600 w-[450px]">
              {/* Pilih Akun Pertama */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-destructive">
                  Pilih Akun Pertama
                </label>
                <Select onValueChange={(value) => setSelectedAccount1(value)}>
                  <SelectTrigger className="w-[450px] h-[40px] rounded-xl">
                    <SelectValue placeholder="Pilih Akun Pertama" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-500">
                    <SelectGroup>
                      {accounts.map((account, index) => (
                        <SelectItem key={index} value={account.kodeAkun}>
                          {account.kodeAkun} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Pilih Akun Kedua */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-destructive">
                  Pilih Akun Kedua
                </label>
                <Select onValueChange={(value) => setSelectedAccount2(value)}>
                  <SelectTrigger className="w-[450px] h-[40px] rounded-xl">
                    <SelectValue placeholder="Pilih Akun Kedua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {accounts.map((account, index) => (
                        <SelectItem key={index} value={account.kodeAkun}>
                          {account.kodeAkun} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Pilih Akun Ketiga */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-destructive">
                  Pilih Akun Ketiga
                </label>
                <Select onValueChange={(value) => setSelectedAccount3(value)}>
                  <SelectTrigger className="w-[450px] h-[40px] rounded-xl">
                    <SelectValue placeholder="Pilih Akun Ketiga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {accounts.map((account, index) => (
                        <SelectItem key={index} value={account.kodeAkun}>
                          {account.kodeAkun} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <Card className="mt-10 w-[174vh] p-4 shadow-md">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="mb-4 text-gray-500">
                  Buku Besar
                </CardTitle>
                <CardDescription className="text-black text-2xl font-bold">
                  {formatNumber(totalValue)}
                </CardDescription>
              </div>
              {/* Legend berdasarkan akun yang dipilih */}
              <div className="flex flex-col gap-2 mt-2">
                {selectedAccount1 && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#8884d8]"></div>
                    <span>
                      {
                        accounts.find(
                          (acc) => acc.kodeAkun === selectedAccount1
                        )?.name
                      }
                    </span>
                  </div>
                )}
                {selectedAccount2 && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#82ca9d]"></div>
                    <span>
                      {
                        accounts.find(
                          (acc) => acc.kodeAkun === selectedAccount2
                        )?.name
                      }
                    </span>
                  </div>
                )}
                {selectedAccount3 && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#ffc658]"></div>
                    <span>
                      {
                        accounts.find(
                          (acc) => acc.kodeAkun === selectedAccount3
                        )?.name
                      }
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mergedChartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatNumber} />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    {/* Render garis hanya jika akun sudah dipilih */}
                    {selectedAccount1 && (
                      <Line
                        type="monotone"
                        dataKey="account1"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {selectedAccount2 && (
                      <Line
                        type="monotone"
                        dataKey="account2"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {selectedAccount3 && (
                      <Line
                        type="monotone"
                        dataKey="account3"
                        stroke="#ffc658"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
