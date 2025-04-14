"use client"

import * as React from "react"
import {
  BarChart2,
  BookAIcon,
  FileTextIcon,
  LayoutDashboard,
  SquareTerminal,
  User
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Perusahaan",
      url: "/perusahaan",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Jurnal",
      url: "/jurnal",
      icon: FileTextIcon,
    },
    {
      title: "Buku Besar",
      url: "/buku-besar",
      icon: BookAIcon,
    },
    {
      title: "Neraca Lajur",
      url: "/neraca-lajur",
      icon: BarChart2,
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: BarChart2,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-700">
        <img
          src="/assets/image/Logo.png"
          alt="Company Logo"
          className="w-full"
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
