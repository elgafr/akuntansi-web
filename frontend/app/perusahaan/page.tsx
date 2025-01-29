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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Schema for form validation
const FormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

const companies = [
  { name: "PT. Jaya Abadi", category: "Jasa" },
  { name: "PT. Sukses Makmur", category: "Manufaktur" },
  { name: "CV. Berkah Sejahtera", category: "Perdagangan" },
  
];

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companyName: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    alert(`Form submitted with Compoany Name: ${data.companyName}`);
  }

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
                  <FormItem className="w-full flex-1 ml-10">
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
                Tambah Perusahaan
              </Button>
            </form>
          </Form>
        </div>
        {/* Container untuk Cards */}
        <div className="flex gap-4 ml-24 mt-4">
          {companies.map((company, index) => (
            <Card key={index} className="w-[350px]">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-destructive">
                  {company.name}
                </CardTitle>
                <CardDescription className="text-center">
                  Kategori - {company.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Button className="rounded-xl bg-transparent border border-destructive text-destructive hover:bg-destructive hover:text-white">
                      Hapus Perusahaan
                    </Button>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Button className="rounded-xl">Detail dan Akun</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
