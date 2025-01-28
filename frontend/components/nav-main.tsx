"use client"

import {  type LucideIcon } from "lucide-react"


import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSub,
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-4 mt-6">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              className={`${
                item.isActive ? "bg-blue-500 text-white" : "text-gray-700"
              } rounded-xl p-3 hover:bg-blue-100 transition-colors duration-200`}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span className="text-lg font-bold">{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
