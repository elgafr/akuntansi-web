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
import { FaArrowLeft } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddAccountTable } from "@/components/jurnal/AddAccountTable";
import { useAccounts } from "@/contexts/AccountContext";

export default function Page() {
  const { accounts, setAccounts } = useAccounts();
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
                PT. Jaya Abadi
              </CardTitle>
              <CardTitle className="text-3xl text-primary">
                Akun Perusahaan
              </CardTitle>
              <CardDescription className="text-lg">
                Kelola Kredit dan debit akun perusahaan
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table className="w-full border border-gray-300 rounded-xl overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-gray-200">
                    <TableHead className="text-center py-2">
                      Nama Akun
                    </TableHead>
                    <TableHead className="text-center py-2">
                      Kode Akun
                    </TableHead>
                    <TableHead className="text-center py-2">Debit</TableHead>
                    <TableHead className="text-center py-2">Kredit</TableHead>
                    <TableHead className="text-center py-2">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center py-2">
                      Kas Kecil
                    </TableCell>
                    <TableCell className="text-center py-2">1111</TableCell>
                    <TableCell className="text-center py-2">
                      Rp.1.000.000.000.000.000
                    </TableCell>
                    <TableCell className="text-center py-2">Rp.0</TableCell>
                    <TableCell className="text-center py-2">
                      <button className="text-blue-500">
                        <FaEdit />
                      </button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex justify-end mt-24">
                <Button className="rounded-xl w-32 h-10 flex items-center">
                  Simpan
                </Button>
              </div>

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
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">PT. Jaya Abadi</p>

                  <p className="font-semibold whitespace-nowrap">
                    Kategori Perusahaan
                  </p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">Jasa</p>

                  <p className="font-semibold whitespace-nowrap">Alamat</p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left break-words">Jl. Jaya Abadi</p>

                  <p className="font-semibold whitespace-nowrap">
                    Tahun Berdiri
                  </p>
                  <p className="text-right w-[20px]">:</p>
                  <p className="text-left">2022</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
        <section className="p-6">
            <AddAccountTable
              accounts={accounts}
              onAccountsChange={setAccounts}
            />
          </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
