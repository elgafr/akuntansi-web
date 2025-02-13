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
import { Card } from "@/components/ui/card";

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
  const ITEMS_PER_PAGE = 10;

  // Combine account opening balances with transactions
  const combinedData = [
    // Add opening balances from main accounts
    ...accounts
      .filter(account => account.namaAkun && account.kodeAkun)
      .map(account => ({
        date: "Saldo Awal",
        namaAkun: account.namaAkun,
        kodeAkun: account.kodeAkun,
        debit: account.debit || 0,
        kredit: account.kredit || 0,
        isOpeningBalance: true,
        description: "Saldo Awal"
      })),
    // Add opening balances from sub accounts
    ...accounts.flatMap(account => 
      (account.subAccounts || [])
        .filter(sub => sub.namaSubAkun && sub.kodeSubAkun)
        .map(sub => ({
          date: "Saldo Awal",
          namaAkun: sub.namaSubAkun,
          kodeAkun: `${sub.kodeAkunInduk},${sub.kodeSubAkun}`,
          debit: parseFloat(sub.debit) || 0,
          kredit: parseFloat(sub.kredit) || 0,
          isOpeningBalance: true,
          description: "Saldo Awal"
        }))
    ),
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
  const calculateRunningBalance = (data: any[]) => {
    let balance = 0;
    return data.map(item => {
      // Hitung saldo
      balance += (item.debit || 0) - (item.kredit || 0);
      return {
        ...item,
        balance
      };
    });
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
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

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

  const calculateTotals = () => {
    let totalDebit = 0;
    let totalKredit = 0;

    dataWithBalance.forEach(item => {
      if (item.debit) totalDebit += item.debit;
      if (item.kredit) totalKredit += item.kredit;
    });

    return {
      totalDebit,
      totalKredit,
    };
  };

  // Tambahkan fungsi untuk mengelompokkan data per kejadian
  const groupDataByEvent = (data: any[]) => {
    let currentEvent = {
      date: '',
      documentType: '',
      description: ''
    };

    return data.map((item, index, array) => {
      // Selalu tampilkan saldo awal
      if (item.isOpeningBalance) {
        return item;
      }

      // Cek apakah ini transaksi pertama atau ada perubahan event
      const isNewEvent = index === 0 || 
        item.date !== array[index - 1].date ||
        item.documentType !== array[index - 1].documentType ||
        item.description !== array[index - 1].description;

      if (isNewEvent) {
        currentEvent = {
          date: item.date,
          documentType: item.documentType,
          description: item.description
        };
        return item;
      }

      // Return item tanpa data event untuk transaksi dalam event yang sama
      return {
        ...item,
        date: '',
        documentType: '',
        description: ''
      };
    });
  };

  return (
    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
      <div className="flex gap-4 mb-6">
        {/* Debit & Kredit Container */}
        <div className="flex flex-1 flex-grow">
          {/* Debit Card */}
          <Card className="bg-red-400 p-4 rounded-r-none rounded-l-xl flex-1 border-r-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-l-xl rounded-r-none h-full">
              <p className="text-sm text-white/90">Debit</p>
              <p className="text-lg font-medium text-white">
                Rp {calculateTotals().totalDebit.toLocaleString()}
              </p>
            </div>
          </Card>

          {/* Kredit Card */}
          <Card className="bg-red-400 p-4 rounded-l-none rounded-r-xl flex-1 border-l-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-l-none rounded-r-xl h-full">
              <p className="text-sm text-white/90">Kredit</p>
              <p className="text-lg font-medium text-white">
                Rp {calculateTotals().totalKredit.toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Unbalanced Card */}
        <Card className="bg-red-400 p-4 rounded-xl w-1/3">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl h-full">
            <p className="text-sm text-white/90">Saldo</p>
            <p className="text-lg font-medium text-white">
              Rp {Math.abs(calculateTotals().totalDebit - calculateTotals().totalKredit).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* <BukuBesarCard 
        selectedMainAccount={selectedMainAccount} 
        className="bg-red-500 text-white p-6 rounded-xl"
      />
       */}
      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          <Select
            value={selectedMainAccount}
            onValueChange={setSelectedMainAccount}
          >
            <SelectTrigger className="w-[300px] bg-gray-50 border-gray-200 rounded-lg">
              <SelectValue placeholder="Pilih akun Perusahaan" />
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
            className="w-[300px] bg-gray-50 border-gray-200 rounded-lg"
          />
          
          <Select
            value={showAll ? 'all' : pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 rounded-lg">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-600">Tanggal</TableHead>
              <TableHead className="text-gray-600">Kode Akun</TableHead>
              <TableHead className="text-gray-600">Nama Akun</TableHead>
              <TableHead className="text-gray-600 text-right">Debit</TableHead>
              <TableHead className="text-gray-600 text-right">Kredit</TableHead>
              <TableHead className="text-gray-600 text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataWithBalance.map((item, index) => {
              const displayItem = groupDataByEvent(dataWithBalance)[index];
              return (
                <TableRow 
                  key={index}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${item.isOpeningBalance ? 'bg-gray-50/30' : ''}
                    ${!displayItem.date && 'text-gray-500'}
                  `}
                >
                  <TableCell>{displayItem.date}</TableCell>
                  <TableCell>{displayItem.kodeAkun}</TableCell>
                  <TableCell>{displayItem.namaAkun}</TableCell>
                  <TableCell className="text-right">
                    {item.debit ? `Rp ${item.debit.toLocaleString()}` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.kredit ? `Rp ${item.kredit.toLocaleString()}` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    {typeof item.balance === 'number' 
                      ? `Rp ${item.balance.toLocaleString()}` 
                      : ''}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination dengan nomor halaman merah */}
        {!showAll && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">
                Showing {startIndex + 1} - {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border-gray-200 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`rounded-lg ${
                    currentPage === page 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'border-gray-200'
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
                className="rounded-lg border-gray-200 px-2"
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