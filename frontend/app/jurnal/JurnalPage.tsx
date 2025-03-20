import { usePathname, useSearchParams } from 'next/navigation';

export default function JurnalPage() {
  // ... existing code ...
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Force refetch on navigation
  useEffect(() => {
    // Refetch data when navigating back to jurnal page
    queryClient.invalidateQueries({ queryKey: ['jurnal'] });
  }, [pathname, searchParams, queryClient]);

  // ... rest of the code ...
} 