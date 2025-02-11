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

export default function Page() {
  // Inisialisasi react-hook-form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companyName: "",
    },
  });

  // State untuk daftar perusahaan
  const [companyList, setCompanyList] = useState<Company[]>([]);
  // State untuk mengontrol tampilan saran (autocomplete)
  const [showSuggestions, setShowSuggestions] = useState(true);
  // State untuk menandai perusahaan yang sudah dipilih
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Load daftar perusahaan dari localStorage (misalnya sudah tersimpan sebelumnya)
  useEffect(() => {
    const savedCompanies = localStorage.getItem("companies");
    if (savedCompanies) {
      setCompanyList(JSON.parse(savedCompanies));
    }
  }, []);

  // Saat komponen mount, inisialisasi nilai form dari localStorage (jika ada)
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      form.setValue("companyName", storedCompany);
      setSelectedCompany(storedCompany);
      setShowSuggestions(false);
    }
  }, [form]);

  // Ambil nilai input secara real-time
  const searchTerm = form.watch("companyName");

  // Filter daftar perusahaan berdasarkan input (case-insensitive)
  const filteredCompanies = companyList.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi submit form
  function onSubmit(data: z.infer<typeof FormSchema>) {
    // Simpan nilai perusahaan yang dipilih ke localStorage
    localStorage.setItem("selectedCompany", data.companyName);
    setSelectedCompany(data.companyName);
    setShowSuggestions(false);
    alert(`Form submitted with Company Name: ${data.companyName}`);
  }

  // Data dummy untuk chart
  const chartData = [
    { month: "January", Kas_Kecil: 186, Kas_Besar: 120, Kas_Bank: 90 },
    { month: "February", Kas_Kecil: 305, Kas_Besar: 230, Kas_Bank: 180 },
    { month: "March", Kas_Kecil: 237, Kas_Besar: 180, Kas_Bank: 160 },
    { month: "April", Kas_Kecil: 73, Kas_Besar: 90, Kas_Bank: 60 },
    { month: "May", Kas_Kecil: 209, Kas_Besar: 150, Kas_Bank: 130 },
    { month: "June", Kas_Kecil: 214, Kas_Besar: 175, Kas_Bank: 140 },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
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
                <div className="text-sm font-medium">Arthur</div>
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
                                // Jika input berubah dari nilai yang sudah dipilih, anggap perusahaan belum dipilih lagi
                                if (selectedCompany && e.target.value !== selectedCompany) {
                                  setSelectedCompany(null);
                                }
                                setShowSuggestions(true);
                              }}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <FaBuilding className="w-5 h-5 text-gray-700" />
                            </div>
                            {/* Tampilkan saran hanya jika ada searchTerm, showSuggestions true, dan belum ada perusahaan yang dipilih */}
                            {searchTerm && showSuggestions && !selectedCompany && (
                              <>
                                {filteredCompanies.length > 0 ? (
                                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                    {filteredCompanies.map((company, index) => (
                                      <div
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                          form.setValue("companyName", company.name);
                                          localStorage.setItem("selectedCompany", company.name);
                                          setSelectedCompany(company.name);
                                          setShowSuggestions(false);
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

        {/* Container Utama */}
        <div className="flex flex-col ml-10 mt-6 gap-4">
          <div className="flex items-start gap-20">
            <h2 className="text-lg font-semibold mb-2 w-[420px]">Informasi Mahasiswa</h2>
            <h2 className="text-lg font-semibold mb-2 w-[450px]">Chart Pergerakan Akun</h2>
          </div>

          <div className="flex items-start gap-4">
            <Card className="w-[485px] h-[230px] p-5 bg-gradient-to-r from-red-500 to-red-700 text-white flex">
              <CardContent className="flex items-center justify-center gap-4 h-full w-full">
                <Avatar className="w-20 h-20 ring-white flex-shrink-0 self-center">
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
                    <p className="text-left break-words">123456789101112</p>
                    <p className="font-semibold whitespace-nowrap">
                      Program Studi
                    </p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">Computer Science</p>
                    <p className="font-semibold whitespace-nowrap">Semester</p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 text-gray-600 w-[450px]">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-destructive">
                  Pilih Akun Pertama
                </label>
                <Select>
                  <SelectTrigger className="w-[450px] h-[40px] rounded-xl">
                    <SelectValue placeholder="Pilih Akun Pertama" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-500">
                    <SelectGroup>
                      <SelectItem value="kas kecil">
                        11111 - Kas Kecil
                      </SelectItem>
                      <SelectItem value="kas besar">
                        11112 - Kas Besar
                      </SelectItem>
                      <SelectItem value="kas bank">
                        11113 - Kas Bank
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-destructive">
                  Pilih Akun Kedua
                </label>
                <Select>
                  <SelectTrigger className="w-[450px] h-[40px] rounded-xl">
                    <SelectValue placeholder="Pilih Akun Kedua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="kas kecil">
                        11111 - Kas Kecil
                      </SelectItem>
                      <SelectItem value="kas besar">
                        11112 - Kas Besar
                      </SelectItem>
                      <SelectItem value="kas bank">
                        11113 - Kas Bank
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-destructive">
                  Pilih Akun Ketiga
                </label>
                <Select>
                  <SelectTrigger className="w-[450px] h-[40px] rounded-xl">
                    <SelectValue placeholder="Pilih Akun Ketiga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="kas kecil">
                        11111 - Kas Kecil
                      </SelectItem>
                      <SelectItem value="kas besar">
                        11112 - Kas Besar
                      </SelectItem>
                      <SelectItem value="kas bank">
                        11113 - Kas Bank
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Card className="mt-10 w-[174vh] p-4 shadow-md">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="mb-4 text-gray-500">Buku Besar</CardTitle>
                <CardDescription className="text-black text-2xl font-bold">
                  9,846
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#8884d8]"></div>
                  <span>Kas Kecil</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#82ca9d]"></div>
                  <span>Kas Besar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ffc658]"></div>
                  <span>Kas Bank</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="Kas_Kecil"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="Kas_Besar"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="Kas_Bank"
                      stroke="#ffc658"
                      strokeWidth={2}
                      dot={false}
                    />
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
