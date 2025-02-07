"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { useForm } from "react-hook-form";
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
  FormMessage,
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
  // CardFooter,
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

// Schema for form validation
const FormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companyName: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    alert(`Form submitted with Company Name: ${data.companyName}`);
  }

  // Data untuk chart
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
        {/* Header Section */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
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
                <div className="text-left mr-12">
                  <div className="text-sm font-medium">Arthur</div>
                  <div className="text-xs text-gray-800">Student</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Form Section */}
        <div className="flex flex-col gap-4 p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center gap-4 w-full"
            >
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="w-full flex-1 ml-6">
                    <FormControl>
                      <div className="relative">
                        {/* Input dengan padding untuk ikon */}
                        <Input
                          placeholder="Cari Perusahaan"
                          {...field}
                          className="w-full pl-10 h-10 rounded-xl"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FaBuilding className="w-5 h-5 text-gray-700" />{" "}
                          {/* Ikon perusahaan */}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tombol di samping input */}
              <Button
                type="submit"
                className="flex items-center gap-2 flex-shrink-0 rounded-xl h-10 mr-10" // Sama dengan tinggi input dan padding
              >
                <span className="flex items-center justify-center">
                  <PlusCircle className="w-6 h-6 text-white" />
                </span>
                Pilih Perusahaan
              </Button>
            </form>
          </Form>
        </div>

        {/* Container utama */}
        <div className="flex flex-col ml-10 mt-6 gap-4">
          {/* Wrapper untuk memastikan header sejajar */}
          <div className="flex items-start gap-20">
            {/* Header Informasi Mahasiswa */}
            <h2 className="text-lg font-semibold mb-2 w-[420px]">
              Informasi Mahasiswa
            </h2>

            {/* Header Chart Pergerakan Akun */}
            <h2 className="text-lg font-semibold mb-2 w-[450px]">
              Chart Pergerakan Akun
            </h2>
          </div>

          {/* Wrapper untuk Card & Select agar tetap sejajar */}
          <div className="flex items-start gap-4">
            {/* Card Informasi Mahasiswa */}
            <Card className="w-[485px] h-[230px] p-5 bg-gradient-to-r from-red-500 to-red-700 text-white flex">
              <CardContent className="flex items-center justify-center gap-4 h-full w-full">
                {/* Avatar (Selalu di Tengah) */}
                <Avatar className="w-20 h-20 ring-white flex-shrink-0 self-center">
                  <AvatarImage
                    src="https://randomuser.me/api/portraits/women/79.jpg"
                    alt="Mahasiswa"
                  />
                </Avatar>

                {/* Informasi Mahasiswa */}
                <div className="text-md w-full">
                  <div className="grid grid-cols-[auto_20px_1fr] gap-x-4 gap-y-2 items-start">
                    {/* Nama Mahasiswa */}
                    <p className="font-semibold whitespace-nowrap">
                      Nama Mahasiswa
                    </p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">Cody Alexander</p>

                    {/* NIM */}
                    <p className="font-semibold whitespace-nowrap">NIM</p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">123456789101112</p>

                    {/* Program Studi */}
                    <p className="font-semibold whitespace-nowrap">
                      Program Studi
                    </p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left break-words">Computer Science</p>

                    {/* Semester */}
                    <p className="font-semibold whitespace-nowrap">Semester</p>
                    <p className="text-right w-[20px]">:</p>
                    <p className="text-left">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select di Samping Card */}
            <div className="flex flex-col gap-3 text-gray-600 w-[450px]">
              {/* Select 1 */}
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
                      <SelectItem value="kas bank">11113 - Kas Bank</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Select 2 */}
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
                      <SelectItem value="kas bank">11113 - Kas Bank</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Select 3 */}
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
                      <SelectItem value="kas bank">11113 - Kas Bank</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Chart Section - Wrapped in a Card */}
          <Card className="mt-10 w-[174vh] p-4 shadow-md">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="mb-4 text-gray-500">Buku Besar</CardTitle>
                <CardDescription className="text-black text-2xl font-bold">
                  9,846
                </CardDescription>
              </div>
              {/* Color legend moved to the top */}
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
