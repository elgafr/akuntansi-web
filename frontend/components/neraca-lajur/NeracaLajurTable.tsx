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
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<NeracaLajurData>({});
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
    const dataArray = transformDataToArray(data);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return dataArray.slice(start, end);
  };

  // Hitung total pages
  const totalPages = Math.ceil(Object.keys(data).length / ITEMS_PER_PAGE);

  // Hitung total
  const calculateTotals = () => {
    return Object.values(data).reduce((acc, curr) => ({
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
          setData(response.data.data);
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
    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">


      {/* Table Section */}
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
            {getCurrentPageData().map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.kode_akun}</TableCell>
                <TableCell>
                  {item.nama_akun}
                  {item.sub_akun && (
                    <span className="text-gray-500 ml-2">
                      ({item.sub_akun.nama})
                    </span>
                  )}
                </TableCell>
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

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border-gray-200 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {/* Page Numbers */}
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`rounded-lg min-w-[40px] ${
                      currentPage === pageNumber 
                        ? "bg-red-500 text-white hover:bg-red-600" 
                        : "border-gray-200"
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              }
              if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return (
                  <span key={pageNumber} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border-gray-200 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 