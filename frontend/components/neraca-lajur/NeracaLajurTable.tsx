"use client";
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAccounts } from "@/contexts/AccountContext";
import { useTransactions } from "@/contexts/TransactionContext";

interface NeracaLajurTableProps {
  type: 'before' | 'after'; // before = sebelum penyesuaian, after = setelah penyesuaian
}

export function NeracaLajurTable({ type }: NeracaLajurTableProps) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [search, setSearch] = useState("");
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAccounts = filteredAccounts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Hitung total
  const calculateTotals = () => {
    let totalDebit = 0;
    let totalKredit = 0;

    filteredAccounts.forEach(account => {
      const balance = type === 'before' 
        ? calculateBalanceBeforeAdjustment(account.kodeAkun)
        : calculateBalanceAfterAdjustment(account.kodeAkun);
      
      totalDebit += balance.debit;
      totalKredit += balance.kredit;
    });

    return { totalDebit, totalKredit };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[300px]"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No Rek</TableHead>
              <TableHead>Neraca Rekening</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAccounts.map((account) => {
              const balance = type === 'before'
                ? calculateBalanceBeforeAdjustment(account.kodeAkun)
                : calculateBalanceAfterAdjustment(account.kodeAkun);

              return (
                <TableRow key={account.kodeAkun}>
                  <TableCell>{account.kodeAkun}</TableCell>
                  <TableCell>{account.namaAkun}</TableCell>
                  <TableCell className="text-right">
                    {balance.debit > 0 ? `Rp ${balance.debit.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {balance.kredit > 0 ? `Rp ${balance.kredit.toLocaleString()}` : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Total Row */}
            <TableRow className="font-bold bg-gray-50">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                Rp {totals.totalDebit.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                Rp {totals.totalKredit.toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAccounts.length)} of {filteredAccounts.length} accounts
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 