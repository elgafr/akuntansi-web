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

interface NeracaLajurTableProps {
  type: 'before' | 'after'; // before = sebelum penyesuaian, after = setelah penyesuaian
}

interface Akun {
  id: string;
  kode: number;
  nama: string;
  status: string;
}

interface SubAkun {
  id: string;
  kode: number;
  nama: string;
  akun_id: string;
}

interface NeracaLajurItem {
  akun: Akun;
  sub_akun: SubAkun | null;
  debit: number;
  kredit: number;
}

interface NeracaLajurData {
  [key: string]: NeracaLajurItem;
}

export function NeracaLajurTable({ type }: NeracaLajurTableProps) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState<NeracaLajurData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Transform data untuk table
  const transformDataToArray = (data: NeracaLajurData) => {
    return Object.entries(data).map(([namaAkun, item]) => ({
      id: item.akun.id,
      kode_akun: item.akun.kode.toString(),
      nama_akun: namaAkun,
      debit: item.debit,
      kredit: item.kredit,
      sub_akun: item.sub_akun
    }));
  };

  // Get current page data
  const getCurrentPageData = () => {
    const dataArray = transformDataToArray(filteredData);
    return dataArray;
  };

  // Hitung total
  const calculateTotals = () => {
    return Object.values(filteredData).reduce((acc, curr) => ({
      totalDebit: acc.totalDebit + (curr.debit || 0),
      totalKredit: acc.totalKredit + (curr.kredit || 0)
    }), { totalDebit: 0, totalKredit: 0 });
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const endpoint = type === 'before' 
          ? '/mahasiswa/neracalajur/sebelumpenyesuaian'
          : '/mahasiswa/neracalajur/setelahpenyesuaian';

        const response = await axios.get(endpoint);
        
        if (response.data.success) {
          setFilteredData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching neraca lajur data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type]);

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

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
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
            {Object.entries(filteredData).map(([namaAkun, item]) => (
              <TableRow key={item.akun.id}>
                <TableCell>{item.akun.kode}</TableCell>
                <TableCell>{namaAkun}</TableCell>
                <TableCell className="text-right">
                  {item.debit ? `Rp ${item.debit.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {item.kredit ? `Rp ${item.kredit.toLocaleString()}` : '-'}
                </TableCell>
              </TableRow>
            ))}
            {/* Total Row */}
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