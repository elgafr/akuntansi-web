"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-4 mt-6">
        {items.map((item) => {
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url} passHref>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`flex items-center gap-2 rounded-xl transition-colors duration-200 p-7 ${
                    isActive
                      ? "bg-red-400 text-white"
                      : "text-gray-700 hover:bg-destructive hover:text-white"
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span className="text-lg font-bold">{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
