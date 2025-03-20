"use client";
import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAccounts } from "@/contexts/AccountContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { Card } from "@/components/ui/card";
import axios from "@/lib/axios";
import { useNeracaLajur } from "@/hooks/useNeracaLajur";
import { useQuery } from '@tanstack/react-query';

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
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    }
  });

  useEffect(() => {
    if (data) {
      setNeracaLajurData(data);
      setIsLoading(false);
    }
  }, [data]);

  const calculateTotals = () => {
    return Object.values(neracaLajurData).reduce((acc, curr) => ({
      totalDebit: acc.totalDebit + (curr.debit || 0),
      totalKredit: acc.totalKredit + (Math.abs(curr.kredit) || 0) // Mengambil nilai absolut untuk kredit
    }), { totalDebit: 0, totalKredit: 0 });
  };

  // Fungsi untuk menghitung saldo sebelum penyesuaian
  const calculateBalanceBeforeAdjustment = (kodeAkun: string) => {
    let debit = 0;
    let kredit = 0;

    // Tambahkan saldo awal
    const account = accounts.find(acc => acc.kodeAkun === kodeAkun);
    if (account) {
      debit += account.debit || 0;
      kredit += account.kredit || 0;
    }

    // Tambahkan transaksi non-JP
    transactions
      .filter(t => t.kodeAkun === kodeAkun && t.documentType !== 'JP')
      .forEach(t => {
        debit += t.debit || 0;
        kredit += t.kredit || 0;
      });

    return { debit, kredit };
  };

  // Fungsi untuk menghitung saldo setelah penyesuaian
  const calculateBalanceAfterAdjustment = (kodeAkun: string) => {
    const beforeAdjustment = calculateBalanceBeforeAdjustment(kodeAkun);
    let debit = beforeAdjustment.debit;
    let kredit = beforeAdjustment.kredit;

    // Tambahkan transaksi JP
    transactions
      .filter(t => t.kodeAkun === kodeAkun && t.documentType === 'JP')
      .forEach(t => {
        debit += t.debit || 0;
        kredit += t.kredit || 0;
      });

    return { debit, kredit };
  };

  // Filter dan urutkan akun
  const filteredAccounts = accounts
    .filter(account => 
      account.namaAkun.toLowerCase().includes(search.toLowerCase()) ||
      account.kodeAkun.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.kodeAkun.localeCompare(b.kodeAkun));

  if (queryLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center py-4">Error: {error?.message}</div>;
  }

  return (
    <div className="space-y-4">
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
            {Object.entries(neracaLajurData).map(([namaAkun, item]) => {
              // Handle nilai kredit negatif dari API
              const kreditValue = item.kredit < 0 ? Math.abs(item.kredit) : item.kredit;
              
              return (
                <TableRow key={item.akun.id}>
                  <TableCell>{item.akun.kode}</TableCell>
                  <TableCell>{namaAkun}</TableCell>
                  <TableCell className="text-right">
                    {item.debit > 0 ? `Rp ${item.debit.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {kreditValue > 0 ? `Rp ${kreditValue.toLocaleString()}` : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-semibold bg-gray-50/80">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                Rp {calculateTotals().totalDebit.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                Rp {calculateTotals().totalKredit.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 