"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function JurnalPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Force refetch on navigation
  useEffect(() => {
    // Refetch data when navigating back to jurnal page
    queryClient.invalidateQueries({ queryKey: ["jurnal"] });
  }, [pathname, searchParams, queryClient]);

  // ... rest of the code ...
} 
