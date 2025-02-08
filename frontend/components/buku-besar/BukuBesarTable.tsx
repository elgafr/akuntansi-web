"use client";
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/contexts/AccountContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { BukuBesarCard } from "./BukuBesarCard";

interface Transaction {
  date: string;
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
  description?: string;
  documentType?: string;
}

export function BukuBesarTable() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [search, setSearch] = useState("");
  const [selectedMainAccount, setSelectedMainAccount] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  // Combine account opening balances with transactions
  const combinedData = [
    // Add opening balances from accounts, filtering out empty parents
    ...accounts
      .filter(account => account.namaAkun && account.kodeAkun) // Only include accounts with non-empty values
      .map(account => ({
        date: "Saldo Awal",
        namaAkun: account.namaAkun,
        kodeAkun: account.kodeAkun,
        debit: account.debit || 0,
        kredit: account.kredit || 0,
        isOpeningBalance: true,
        description: "Saldo Awal"
      })),
    // Add sub-account opening balances
    ...accounts
      .filter(account => 
        account.subNamaAkun && 
        account.subKodeAkun && 
        account.subNamaAkun.trim() !== "" && 
        account.subKodeAkun.trim() !== ""
      )
      .map(account => ({
        date: "Saldo Awal",
        namaAkun: account.subNamaAkun || "",
        kodeAkun: account.subKodeAkun || "",
        debit: account.debit || 0,
        kredit: account.kredit || 0,
        isOpeningBalance: true,
        description: "Saldo Awal"
      })),
    // Add transactions
    ...transactions.map(transaction => ({
      date: transaction.date,
      namaAkun: transaction.namaAkun,
      kodeAkun: transaction.kodeAkun,
      debit: Number(transaction.debit) || 0,
      kredit: Number(transaction.kredit) || 0,
      isOpeningBalance: false,
      description: transaction.description || transaction.documentType || "-"
    }))
  ];

  // Get unique main accounts (without sub-accounts and empty accounts)
  const mainAccounts = accounts
    .filter(account => 
      !account.parentId && 
      account.namaAkun && 
      account.kodeAkun && 
      account.namaAkun.trim() !== "" && 
      account.kodeAkun.trim() !== ""
    )
    .map(account => ({
      kodeAkun: account.kodeAkun,
      namaAkun: account.namaAkun
    }))
    .reduce((unique: { kodeAkun: string; namaAkun: string }[], account) => {
      if (!unique.some(item => item.kodeAkun === account.kodeAkun)) {
        unique.push(account);
      }
      return unique;
    }, []);

  // Calculate running balance based on filter selection
  const calculateRunningBalance = (data: typeof sortedData) => {
    if (selectedMainAccount === "all") {
      // When showing all accounts, just return "-" for balance
      return data.map(item => ({
        ...item,
        balance: "-"
      }));
    } else {
      // When a main account is selected, calculate running balance
      const mainCode = selectedMainAccount.split(' ')[0];
      let balance = 0;
      
      return data.map(item => {
        const itemMainCode = item.kodeAkun.split(',')[0];
        
        if (itemMainCode === mainCode) {
          balance += (item.debit || 0) - (item.kredit || 0);
          return {
            ...item,
            balance
          };
        }
        
        return {
          ...item,
          balance: "-"
        };
      });
    }
  };

  // Filter and sort data
  const filterData = (data: any[]) => {
    let filtered = [...data];

    // Filter by main account if selected
    if (selectedMainAccount && selectedMainAccount !== "all") {
      const mainCode = selectedMainAccount.split(' ')[0];
      filtered = filtered.filter(item => {
        const itemCode = item.kodeAkun.split(',')[0];
        return itemCode === mainCode;
      });
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(item =>
        item.namaAkun.toLowerCase().includes(search.toLowerCase()) ||
        item.kodeAkun.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredData = filterData(combinedData);
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.isOpeningBalance && !b.isOpeningBalance) return -1;
    if (!a.isOpeningBalance && b.isOpeningBalance) return 1;
    if (a.date === "Saldo Awal") return -1;
    if (b.date === "Saldo Awal") return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = showAll ? 0 : (currentPage - 1) * pageSize;
  const endIndex = showAll ? sortedData.length : startIndex + pageSize;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    if (value === 'all') {
      setShowAll(true);
      setCurrentPage(1);
    } else {
      setShowAll(false);
      setPageSize(Number(value));
      setCurrentPage(1);
    }
  };

  const dataWithBalance = calculateRunningBalance(currentData);

  return (
    <div className="space-y-4">
      <BukuBesarCard selectedMainAccount={selectedMainAccount} />
      
      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          <Select
            value={selectedMainAccount}
            onValueChange={setSelectedMainAccount}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Filter by Main Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {mainAccounts.map((account) => (
                <SelectItem 
                  key={account.kodeAkun} 
                  value={`${account.kodeAkun} ${account.namaAkun}`}
                >
                  {account.kodeAkun} - {account.namaAkun}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search by Account Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
          />
          
          <Select
            value={showAll ? 'all' : pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kode Akun</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataWithBalance.map((item, index) => (
              <TableRow 
                key={index}
                className={`
                  hover:bg-gray-50 transition-colors
                  ${item.isOpeningBalance ? 'bg-gray-50/30' : ''}
                `}
              >
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.kodeAkun}</TableCell>
                <TableCell>{item.namaAkun}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">
                  {item.debit ? `Rp ${item.debit.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {item.kredit ? `Rp ${item.kredit.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {typeof item.balance === 'number' 
                    ? `Rp ${item.balance.toLocaleString()}` 
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {!showAll && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{startIndex + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(endIndex, sortedData.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{sortedData.length}</span>
                {' '}results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="!rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`!rounded-lg ${
                    currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                  }`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="!rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 