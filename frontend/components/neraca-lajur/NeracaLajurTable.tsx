"use client";
import { useState, useEffect, useMemo } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAccounts } from "@/contexts/AccountContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { Card } from "@/components/ui/card";
import axios from "@/lib/axios";
import { useNeracaLajur } from "@/hooks/useNeracaLajur";
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Interface untuk data akun dari API
interface AkunData {
  id: string;
  kode: number;
  nama: string;
  status: string;
  kategori_id: string;
  created_at: string;
  updated_at: string;
}

// Interface untuk data sub-akun dari API
interface SubAkunData {
  id: string;
  kode: number;
  nama: string;
  akun_id: string;
}

// Interface untuk item neraca lajur dari API
interface NeracaLajurItem {
  akun: AkunData;
  sub_akun: SubAkunData | null;
  debit: number;
  kredit: number;
}

// Interface untuk response API neraca lajur
interface NeracaLajurResponse {
  success: boolean;
  data: {
    [key: string]: NeracaLajurItem;
  };
}

export function NeracaLajurTable({ type }: { type: 'before' | 'after' }) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [neracaLajurData, setNeracaLajurData] = useState<Record<string, NeracaLajurItem>>({});
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Updated useQuery to use placeholderData instead of keepPreviousData
  const { data, isLoading: queryLoading, isError, error } = useQuery({
    queryKey: ['neracaLajur', type],
    queryFn: async () => {
      const endpoint = type === 'before' 
        ? '/mahasiswa/neracalajur/sebelumpenyesuaian'
        : '/mahasiswa/neracalajur/setelahpenyesuaian';
      
      const response = await axios.get<NeracaLajurResponse>(endpoint);
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch data');
    },
    // Use placeholderData to show previous data while fetching
    placeholderData: (previousData) => previousData,
    // Add caching configuration to speed up loading
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes (formerly cacheTime)
    // Add retry configuration
    retry: 1,
    retryDelay: 1000,
    // Don't refetch on window focus to avoid unnecessary loading
    refetchOnWindowFocus: false,
  });

  // Prefetch the other tab's data
  useEffect(() => {
    const otherType = type === 'before' ? 'after' : 'before';
    const endpoint = otherType === 'before' 
      ? '/mahasiswa/neracalajur/sebelumpenyesuaian'
      : '/mahasiswa/neracalajur/setelahpenyesuaian';
    
    queryClient.prefetchQuery({
      queryKey: ['neracaLajur', otherType],
      queryFn: async () => {
        const response = await axios.get<NeracaLajurResponse>(endpoint);
        if (response.data.success) {
          return response.data.data;
        }
        throw new Error('Failed to fetch data');
      },
    });
  }, [type, queryClient]);

  // Fix the TypeScript error by handling empty data case
  useEffect(() => {
    if (data) {
      setNeracaLajurData(data);
    }
  }, [data]);

  // Memoize the totals calculation to improve performance
  const calculateTotals = useMemo(() => {
    return Object.values(neracaLajurData).reduce((acc, curr) => ({
      totalDebit: acc.totalDebit + (curr.debit || 0),
      totalKredit: acc.totalKredit + (Math.abs(curr.kredit) || 0) // Mengambil nilai absolut untuk kredit
    }), { totalDebit: 0, totalKredit: 0 });
  }, [neracaLajurData]);

  // Memoize the filtered accounts to improve performance
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter(account => 
        account.namaAkun.toLowerCase().includes(search.toLowerCase()) ||
        account.kodeAkun.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.kodeAkun.localeCompare(b.kodeAkun));
  }, [accounts, search]);

  return (
    <div className="space-y-4">
      {/* Title and type indicator */}
      <div className="mb-4">
        <h2 className="text-lg font-medium">
          {type === 'before' ? 'Neraca Lajur Sebelum Penyesuaian' : 'Neraca Lajur Setelah Penyesuaian'}
        </h2>
      </div>

      {/* Table Container - Always render the table structure */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Akun</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queryLoading ? (
              // Render skeleton rows while loading
              Array(6).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded ml-auto"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              // Show error message in the table
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-red-500">
                  Error: {error?.message || "Gagal memuat data"}
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['neracaLajur', type] })}
                    >
                      Coba Lagi
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data || Object.entries(neracaLajurData).length === 0 ? (
              // Show empty state
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  Tidak ada data neraca lajur
                </TableCell>
              </TableRow>
            ) : (
              // Render actual data
              Object.entries(neracaLajurData).map(([namaAkun, item]) => {
                // Handle nilai kredit negatif dari API
                const kreditValue = item.kredit < 0 ? Math.abs(item.kredit) : item.kredit;
                
                return (
                  <TableRow key={item.akun.id}>
                    <TableCell>{item.akun.kode}</TableCell>
                    <TableCell>{namaAkun}</TableCell>
                    <TableCell className="text-right">
                      {item.debit > 0 ? `Rp ${item.debit.toLocaleString()}` : '0'}
                    </TableCell>
                    <TableCell className="text-right">
                      {kreditValue > 0 ? `Rp ${kreditValue.toLocaleString()}` : '0'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            
            {/* Always show the totals row, with placeholder values when loading */}
            <TableRow className="font-semibold bg-gray-50/80">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                {queryLoading ? (
                  <div className="h-5 w-28 bg-gray-300 animate-pulse rounded ml-auto"></div>
                ) : (
                  `Rp ${calculateTotals.totalDebit.toLocaleString()}`
                )}
              </TableCell>
              <TableCell className="text-right">
                {queryLoading ? (
                  <div className="h-5 w-28 bg-gray-300 animate-pulse rounded ml-auto"></div>
                ) : (
                  `Rp ${calculateTotals.totalKredit.toLocaleString()}`
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 