"use client";
import { useState, useEffect, useMemo } from "react";
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
import { Account, SubAccount } from "@/types/account";

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
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
  saldo: number;
  balance: number;
  keterangan: string;
  is_saldo_awal: boolean;
  isDebitNormal: boolean;
}

interface Totals {
  debit: number;
  kredit: number;
  saldo: number;
  balance: number;
}

// Tambahkan interface untuk data perusahaan
interface Perusahaan {
  id: string;
  nama: string;
  start_priode: string;
  end_priode: string;
}

interface APIAccount {
  id: string;
  kode: number;
  nama: string;
  parentId?: string;
  namaAkun: string;
  kodeAkun: string;
  debit?: number;
  kredit?: number;
  subAccounts?: SubAccount[];
}

// Update type guard to handle APIAccount
function hasSubAccounts(account: APIAccount | Account): account is APIAccount & { subAccounts: SubAccount[] } {
  return 'subAccounts' in account && Array.isArray(account.subAccounts);
}

export function BukuBesarTable() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [search, setSearch] = useState("");
  const [selectedMainAccount, setSelectedMainAccount] = useState<string>("all");
  const [showAll, setShowAll] = useState(true);
  const [bukuBesarData, setBukuBesarData] = useState<BukuBesarEntry[]>([]);
  const [akunList, setAkunList] = useState<Akun[]>([]);
  const [subAkunList, setSubAkunList] = useState<SubAkun[]>([]);
  const [selectedAkunId, setSelectedAkunId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [perusahaan, setPerusahaan] = useState<Perusahaan | null>(null);

  // Update where accounts are used
  const combinedData = [
    // Add opening balances from main accounts
    ...((accounts as unknown) as APIAccount[])
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
    ...((accounts as unknown) as APIAccount[]).flatMap(account => {
      if (!hasSubAccounts(account)) return [];
      
      return account.subAccounts
        .filter((sub: SubAccount) => sub.namaSubAkun && sub.kodeSubAkun)
        .map((sub: SubAccount) => ({
          date: "Saldo Awal",
          namaAkun: sub.namaSubAkun,
          kodeAkun: `${sub.kodeAkunInduk},${sub.kodeSubAkun}`,
          debit: parseFloat(String(sub.debit)) || 0,
          kredit: parseFloat(String(sub.kredit)) || 0,
          isOpeningBalance: true,
          description: "Saldo Awal"
        }));
    }),
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
  // const mainAccounts = (accounts as APIAccount[])
  //   .filter(account => 
  //     account.id &&
  //     !account.parentId && 
  //     account.namaAkun && 
  //     account.kodeAkun && 
  //     account.namaAkun.trim() !== "" && 
  //     account.kodeAkun.trim() !== ""
  //   )
  //   .map(account => ({
  //     id: account.id,
  //     kodeAkun: account.kodeAkun,
  //     namaAkun: account.namaAkun
  //   }))
  //   .reduce((unique: { id: string; kodeAkun: string; namaAkun: string }[], account) => {
  //     if (!unique.some(item => item.kodeAkun === account.kodeAkun)) {
  //       unique.push(account);
  //     }
  //     return unique;
  //   }, []);

  // // Calculate running balance based on filter selection
  // const calculateRunningBalance = (data: any[]) => {
  //   let balance = 0;
  //   return data.map(item => {
  //     // Hitung saldo
  //     balance += (item.debit || 0) - (item.kredit || 0);
  //     return {
  //       ...item,
  //       balance
  //     };
  //   });
  // };

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

  const filteredAndSortedData = useMemo(() => {
    const filtered = filterData(combinedData);
    return [...filtered].sort((a, b) => {
      if (a.isOpeningBalance && !b.isOpeningBalance) return -1;
      if (!a.isOpeningBalance && b.isOpeningBalance) return 1;
      if (a.date === "Saldo Awal") return -1;
      if (b.date === "Saldo Awal") return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [combinedData, search, selectedMainAccount]);

  // Pagination calculations
  // const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  // const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const endIndex = startIndex + ITEMS_PER_PAGE;
  // const currentData = filteredData.slice(startIndex, endIndex);

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

  // Tambahkan useEffect untuk fetch data perusahaan
  useEffect(() => {
    const fetchPerusahaan = async () => {
      try {
        const response = await axios.get('/mahasiswa/perusahaan');
        if (response.data.success && response.data.data.length > 0) {
          setPerusahaan(response.data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching perusahaan:', error);
      }
    };

    fetchPerusahaan();
  }, []);

  // Fetch buku besar data when akun is selected
  useEffect(() => {
    const fetchBukuBesarData = async () => {
      if (!selectedAkunId || !perusahaan) return;
      setIsLoading(true);

      try {
        // Get selected akun details
        const selectedAkun = akunList.find(akun => akun.id === selectedAkunId);
        if (!selectedAkun) return;

        // Fetch data dari kedua endpoint
        const [jurnalResponse, keuanganResponse] = await Promise.all([
          axios.get('/mahasiswa/bukubesar/sort', {
            params: { akun_id: selectedAkunId }
          }),
          axios.get('/mahasiswa/keuangan', {
            params: { akun_id: selectedAkunId }
          })
        ]);

        if (jurnalResponse.data.success) {
          // Transform data jurnal (data sudah difilter di backend)
          const jurnalData = jurnalResponse.data.data
            .filter((entry: any) => {
              // Jika entry memiliki sub_akun
              if (entry.sub_akun) {
                // Cek apakah akun induk dari sub_akun ini adalah akun yang dipilih
                return entry.sub_akun.akun_id === selectedAkunId;
              }
              
              // Jika tidak ada sub_akun, cek apakah ini adalah akun yang dipilih
              return entry.akun_id === selectedAkunId;
            })
            .map((entry: any) => {
              // Dapatkan informasi akun yang benar untuk setiap transaksi
              const selectedAkun = akunList.find(akun => akun.id === selectedAkunId);
              
              return {
                id: entry.id,
                tanggal: entry.tanggal,
                kodeAkun: entry.sub_akun?.kode?.toString() || selectedAkun?.kode?.toString() || '',
                namaAkun: entry.sub_akun?.nama || selectedAkun?.nama || '',
                debit: entry.debit || 0,
                kredit: entry.kredit || 0,
                keterangan: entry.keterangan || '-',
                is_saldo_awal: false
              };
            });

          // Filter dan transform data keuangan
          let saldoAwalEntries: BukuBesarEntry[] = [];
          if (keuanganResponse.data.success && keuanganResponse.data.data) {
            saldoAwalEntries = keuanganResponse.data.data
              .filter((entry: any) => {
                if (entry.sub_akun) {
                  return entry.sub_akun.akun_id === selectedAkunId;
                }
                return entry.akun_id === selectedAkunId;
              })
              .map((entry: any) => {
                return {
                  id: `saldo-${entry.id}`,
                  tanggal: perusahaan.start_priode,
                  kodeAkun: entry.sub_akun?.kode?.toString() || entry.akun?.kode?.toString(),
                  namaAkun: entry.sub_akun?.nama || entry.akun?.nama,
                  debit: entry.debit || 0,
                  kredit: entry.kredit || 0,
                  keterangan: 'Saldo Awal',
                  is_saldo_awal: true
                };
              });
          }

          // Gabungkan data dan urutkan
          const combinedData = [...saldoAwalEntries, ...jurnalData].sort((a, b) => {
            if (a.is_saldo_awal && !b.is_saldo_awal) return -1;
            if (!a.is_saldo_awal && b.is_saldo_awal) return 1;
            return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
          });

          // Tentukan saldo normal berdasarkan saldo awal
          const firstEntry = combinedData[0];
          const isDebitNormal = firstEntry?.debit > 0;

          // Hitung saldo berjalan dengan konsep saldo normal
          let runningSaldo = 0;
          const transformedData = combinedData.map((entry) => {
            if (isDebitNormal) {
              // Jika saldo normal di debit
              runningSaldo += (entry.debit || 0) - (entry.kredit || 0);
            } else {
              // Jika saldo normal di kredit
              runningSaldo += (entry.kredit || 0) - (entry.debit || 0);
            }

            return {
              ...entry,
              saldo: Math.abs(runningSaldo),
              balance: runningSaldo,
              isDebitNormal
            };
          });

          setBukuBesarData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching buku besar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBukuBesarData();
  }, [selectedAkunId, akunList, perusahaan]);

  // Calculate totals
  const totals = useMemo(() => {
    return bukuBesarData.reduce((acc, item) => ({
      debit: acc.debit + (item.debit || 0),
      kredit: acc.kredit + (item.kredit || 0),
      saldo: bukuBesarData.length > 0 ? bukuBesarData[bukuBesarData.length - 1].saldo : 0,
      balance: bukuBesarData.length > 0 ? bukuBesarData[bukuBesarData.length - 1].balance : 0
    }), { debit: 0, kredit: 0, saldo: 0, balance: 0 });
  }, [bukuBesarData]);

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
                Rp {totals.debit.toLocaleString()}
              </p>
            </div>
          </Card>

          {/* Kredit Card */}
          <Card className="bg-red-400 p-4 rounded-l-none rounded-r-xl flex-1 border-l-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-l-none rounded-r-xl h-full">
              <p className="text-sm text-white/90">Kredit</p>
              <p className="text-lg font-medium text-white">
                Rp {totals.kredit.toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Saldo Card */}
        <Card className="bg-red-400 p-4 rounded-xl w-1/3">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl h-full">
            <p className="text-sm text-white/90">Saldo</p>
            <p className="text-lg font-medium text-white">
              Rp {Math.abs(totals.saldo).toLocaleString()}
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
            value={showAll ? 'all' : '10'}
            onValueChange={(value) => {
              if (value === 'all') {
                setShowAll(true);
              } else {
                setShowAll(false);
              }
            }}
          >
            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 rounded-lg">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 rows</SelectItem>
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
              <TableHead>Kode</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bukuBesarData.length > 0 ? (
              bukuBesarData.map((entry) => (
                <TableRow 
                  key={entry.id}
                  className={entry.is_saldo_awal ? 'bg-gray-50' : ''}
                >
                  <TableCell>{formatDate(entry.tanggal)}</TableCell>
                  <TableCell>{entry.kodeAkun}</TableCell>
                  <TableCell>{entry.namaAkun}</TableCell>
                  <TableCell>{entry.keterangan}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit ? `Rp ${entry.debit.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.kredit ? `Rp ${entry.kredit.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {Math.abs(entry.saldo).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {Math.abs(entry.balance).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                  {selectedAkunId ? 'Tidak ada data untuk akun ini' : 'Pilih akun untuk melihat data'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <tfoot className="bg-gray-50 font-medium">
            <tr>
              <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
              <td className="px-4 py-2 text-right">
                Rp {totals.debit.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                Rp {totals.kredit.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    totals.saldo === 0 
                      ? 'bg-gray-100 text-gray-600' 
                      : bukuBesarData[0]?.isDebitNormal 
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-purple-100 text-purple-600'
                  }`}>
                    {totals.saldo === 0 
                      ? 'Balance' 
                      : bukuBesarData[0]?.isDebitNormal ? 'D' : 'K'}
                  </span>
                  <span>Rp {Math.abs(totals.saldo).toLocaleString()}</span>
                </div>
              </td>
              <td className="px-4 py-2 text-right">
                Rp {Math.abs(totals.balance).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
    </div>
  );
} 