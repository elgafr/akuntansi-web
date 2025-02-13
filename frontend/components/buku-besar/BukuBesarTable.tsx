"use client";
import { useState, useEffect } from "react";
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useAccounts } from "@/contexts/AccountContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { BukuBesarCard } from "./BukuBesarCard";
import { Card } from "@/components/ui/card";
import axios from "@/lib/axios";

interface Transaction {
  date: string;
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
  description?: string;
  documentType?: string;
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
  akun: {
    id: string;
    kode: number;
    nama: string;
  };
}

interface BukuBesarEntry {
  id: string;
  tanggal: string;
  bukti: string;
  keterangan: string;
  debit: number;
  kredit: number;
  saldo: number;
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
  const [akunList, setAkunList] = useState<Akun[]>([]);
  const [subAkunList, setSubAkunList] = useState<SubAkun[]>([]);
  const [selectedAkunId, setSelectedAkunId] = useState<string>("");
  const [bukuBesarData, setBukuBesarData] = useState<BukuBesarEntry[]>([]);

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

    bukuBesarData.forEach(entry => {
      totalDebit += entry.debit || 0;
      totalKredit += entry.kredit || 0;
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

  // Fetch akun dan sub akun
  useEffect(() => {
    const fetchAkunData = async () => {
      try {
        const [akunResponse, subAkunResponse] = await Promise.all([
          axios.get('/instruktur/akun'),
          axios.get('/mahasiswa/subakun')
        ]);

        if (akunResponse.data.success) {
          setAkunList(akunResponse.data.data);
          // Set default value ke akun pertama jika ada
          if (akunResponse.data.data.length > 0) {
            const defaultAkun = akunResponse.data.data.sort((a: Akun, b: Akun) => a.kode - b.kode)[0];
            setSelectedAkunId(defaultAkun.id);
          }
        }
        if (subAkunResponse.data.success) {
          setSubAkunList(subAkunResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching akun data:', error);
      }
    };

    fetchAkunData();
  }, []);

  // Fetch buku besar data when akun is selected
  useEffect(() => {
    const fetchBukuBesarData = async () => {
      if (!selectedAkunId) return;

      try {
        const response = await axios.get('/mahasiswa/bukubesar/sort', {
          params: { akun_id: selectedAkunId }
        });

        if (response.data.success) {
          // Transform dan kelompokkan data
          const transformedData = response.data.data.map((entry: any, index: number, array: any[]) => {
            let saldo = 0;
            // Hitung saldo berjalan
            for (let i = 0; i <= index; i++) {
              saldo += (array[i].debit || 0) - (array[i].kredit || 0);
            }

            // Cek apakah ini baris pertama atau berbeda dengan baris sebelumnya
            const isFirstInGroup = index === 0 || 
              entry.tanggal !== array[index - 1].tanggal ||
              entry.bukti !== array[index - 1].bukti ||
              entry.keterangan !== array[index - 1].keterangan;
            
            return {
              ...entry,
              debit: entry.debit || 0,
              kredit: entry.kredit || 0,
              saldo: Math.abs(saldo),
              // Jika bukan yang pertama dalam grup, kosongkan informasi kejadian
              tanggal: isFirstInGroup ? entry.tanggal : '',
              bukti: isFirstInGroup ? entry.bukti : '',
              keterangan: isFirstInGroup ? entry.keterangan : ''
            };
          });

          setBukuBesarData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching buku besar data:', error);
      }
    };

    fetchBukuBesarData();
  }, [selectedAkunId]);

  // Update bagian table untuk menampilkan format tanggal yang lebih baik
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
            value={selectedAkunId}
            onValueChange={setSelectedAkunId}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Pilih Akun">
                {selectedAkunId && (
                  <>
                    {(() => {
                      const selectedAkun = akunList.find(akun => akun.id === selectedAkunId);
                      if (selectedAkun) {
                        return `${selectedAkun.kode} - ${selectedAkun.nama}`;
                      }
                      const selectedSubAkun = subAkunList.find(sub => sub.akun.id === selectedAkunId);
                      if (selectedSubAkun) {
                        return `${selectedSubAkun.kode} - ${selectedSubAkun.nama}`;
                      }
                      return 'Pilih Akun';
                    })()}
                  </>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Akun</SelectLabel>
                {akunList
                  .sort((a, b) => a.kode - b.kode) // Sort berdasarkan kode akun
                  .map((akun) => (
                    <SelectItem key={akun.id} value={akun.id}>
                      {akun.kode} - {akun.nama}
                    </SelectItem>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Sub Akun</SelectLabel>
                {subAkunList
                  .sort((a, b) => a.kode - b.kode) // Sort berdasarkan kode sub akun
                  .map((subAkun) => (
                    <SelectItem key={subAkun.id} value={subAkun.akun.id}>
                      {subAkun.kode} - {subAkun.nama}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* <Input
            placeholder="Search by Account Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px] bg-gray-50 border-gray-200 rounded-lg"
          /> */}
          
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
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Bukti</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bukuBesarData.length > 0 ? (
              bukuBesarData.map((entry, index) => {
                const isFirstInGroup = index === 0 || 
                  entry.tanggal !== bukuBesarData[index - 1].tanggal ||
                  entry.bukti !== bukuBesarData[index - 1].bukti ||
                  entry.keterangan !== bukuBesarData[index - 1].keterangan;

                return (
                  <TableRow 
                    key={entry.id}
                    className={!isFirstInGroup ? 'bg-gray-50/50' : ''}
                  >
                    <TableCell>{entry.tanggal ? formatDate(entry.tanggal) : ''}</TableCell>
                    <TableCell>{entry.bukti}</TableCell>
                    <TableCell>{entry.keterangan}</TableCell>
                    <TableCell className="text-right">
                      {entry.debit ? `Rp ${entry.debit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.kredit ? `Rp ${entry.kredit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {entry.saldo.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {selectedAkunId ? 'Tidak ada data untuk akun ini' : 'Pilih akun untuk melihat data'}
                </TableCell>
              </TableRow>
            )}
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