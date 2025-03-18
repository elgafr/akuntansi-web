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
}

interface Account {
  nama: string;
  kode: string;
  debit: number;
  kredit: number;
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
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([
    "",
    "",
    "",
  ]);
  const [profileData, setProfileData] = useState<{
    user: { name: string; nim: string };
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch data awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, companiesRes, accountsRes] = await Promise.all([
          axios.get("/mahasiswa/profile"),
          axios.get("/mahasiswa/perusahaan"),
          axios.get("/instruktur/akun"),
        ]);

        // Handle perusahaan
        const companiesData = companiesRes.data?.data || [];
        setCompanyList(companiesData);

        const onlineCompany = companiesData.find(
          (c: Company) => c.status === "online"
        );
        if (onlineCompany) {
          setSelectedCompany(onlineCompany);
          form.setValue("companyName", onlineCompany.nama);
        }

        // Handle akun
        setAccounts(accountsRes.data?.data || []);

        // Handle profil
        setProfileData(profileRes.data?.data || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchData();
  }, []);

  // Handle pencarian perusahaan
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies([]);
      return;
    }

    const results = companyList.filter((company) =>
      company.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(results);
  }, [searchTerm, companyList]);

  // Handle submit form
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!selectedCompany) {
      const company = companyList.find(
        (c) => c.nama.toLowerCase() === data.companyName.toLowerCase()
      );
      if (company) await handleCompanySelect(company);
    }
  };

  // Handle pilih perusahaan
 // Di dalam fungsi handleCompanySelect
const handleCompanySelect = async (company: Company) => {
  try {
    // Matikan perusahaan sebelumnya jika ada
    if (selectedCompany) {
      await axios.put(`/mahasiswa/perusahaan/${selectedCompany.id}`, {
        status: "offline"
      });
    }

    // Nyalakan perusahaan baru
    const response = await axios.put(`/mahasiswa/perusahaan/${company.id}`, {
      status: "online"
    });

    // Update state
    setCompanyList(prev => 
      prev.map(c => ({
        ...c,
        status: c.id === company.id ? "online" : "offline"
      }))
    );

    setSelectedCompany(company);
    form.setValue("companyName", company.nama);
    setFilteredCompanies([]);
    
  } catch (error) {
    console.error("Gagal memilih perusahaan:", error);
    alert("Gagal memilih perusahaan");
  }
};


  // Generate data chart
  const chartData = Array.from({ length: 6 }, (_, i) => ({
    month: `Bulan ${i + 1}`,
    ...selectedAccounts.reduce(
      (acc, curr, idx) => ({
        ...acc,
        [`account${idx + 1}`]:
          accounts.find((a) => a.kode === curr)?.debit || 0 * (i + 1),
      }),
      {}
    ),
  }));

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
                <AvatarImage
                  src="https://github.com/shadcn.png"
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

        {/* Form Pencarian */}
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
                                setSearchTerm(e.target.value);
                              }}
                            />
                            <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-700" />

                            {searchTerm && filteredCompanies.length > 0 && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                {filteredCompanies.map((company) => (
                                  <div
                                    key={company.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleCompanySelect(company)}
                                  >
                                    {company.nama}
                                  </div>
                                ))}
                              </div>
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

        {/* Konten Utama */}
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
            {/* Card Profil */}
            <Card className="w-[485px] h-[230px] p-5 bg-gradient-to-r from-red-500 to-red-700 text-white flex">
              <CardContent className="flex items-center justify-center gap-4 h-full w-full">
                <Avatar className="w-20 h-20 ring-white flex-shrink-0 self-center">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/79.jpg" />
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

            {/* Dropdown Akun */}
            <div className="flex flex-col gap-3 text-gray-600 w-[450px]">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-destructive">
                    Pilih Akun {index + 1}
                  </label>
                  <Select
                    value={selectedAccounts[index]}
                    onValueChange={(value) => {
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
                        {accounts.map((account) => (
                          <SelectItem
                            key={account.kode}
                            value={account.kode}
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

          {/* Chart Section */}
          <Card className="mt-10 w-[174vh] p-4 shadow-md">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="mb-4 text-gray-500">Buku Besar</CardTitle>
                <CardDescription className="text-black text-2xl font-bold">
                  {formatNumber(9846)}
                </CardDescription>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {selectedAccounts.map(
                  (account, idx) =>
                    account && (
                      <div  key={`account-legend-${account}-${idx}`} className="flex items-center gap-2">
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
                          {accounts.find((a) => a.kode === account)?.nama ||
                            "-"}
                        </span>
                      </div>
                    )
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatNumber} />
                    <Tooltip
                      formatter={(value) => formatNumber(Number(value))}
                    />

                    {selectedAccounts.map(
                      (account, idx) =>
                        account && (
                          <Line
                          key={`chart-line-${account}-${idx}`}
                            type="monotone"
                            dataKey={`account${idx + 1}`}
                            stroke={["#8884d8", "#82ca9d", "#ffc658"][idx]}
                            strokeWidth={2}
                            dot={false}
                          />
                        )
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
