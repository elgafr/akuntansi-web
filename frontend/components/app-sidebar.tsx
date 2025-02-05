"use client"

import * as React from "react"
import {
  // AudioWaveform,
  BarChart2,
  BookAIcon,
  

  // BookCopyIcon,
  // BookOpen,
  // Bot,
  // Command,
  FileTextIcon,
  // Frame,
  // GalleryVerticalEnd,
  LayoutDashboard,
  // Map,
  // PieChart,
  // Settings2,
  SquareTerminal,
  User
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  // SidebarFooter,
  SidebarHeader,
  // SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },
  // teams: [
  //   {
  //     name: "Acme Inc",
  //     logo: GalleryVerticalEnd,
  //     plan: "Enterprise",
  //   },
  //   {
  //     name: "Acme Corp.",
  //     logo: AudioWaveform,
  //     plan: "Startup",
  //   },
  //   {
  //     name: "Evil Corp.",
  //     logo: Command,
  //     plan: "Free",
  //   },
  // ],
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
      url: "#",
      icon: FileTextIcon,
    },
    {
      title: "Buku Besar",
      url: "#",
      icon: BookAIcon,
    },
    {
      title: "Neraca Lanjut",
      url: "#",
      icon: BarChart2,
    },
    {
      title: "Laporan",
      url: "#",
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
      <SidebarHeader className="text-2xl font-bold text-center">
        LoremLpsum
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
