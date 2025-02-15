"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Save, Trash2, Plus, Pencil, X, Download, Upload, Moon, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useAccounts } from "@/contexts/AccountContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useTransactions } from "@/contexts/TransactionContext";
import Papa from 'papaparse';
import { AddTransactionForm } from "./AddTransactionForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import axios from "@/lib/axios";
import { JurnalForm } from "./JurnalForm";

interface Transaction {
  id: string;
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  akun_id: string;
  debit: number;
  kredit: number;
  perusahaan_id: string;
}

interface Account {
  kodeAkun: string;
  namaAkun: string;
  debit: number;
  kredit: number;
  subAccounts?: {
    namaSubAkun: string;
    kodeAkunInduk: string;
    kodeSubAkun: string;
    debit: number;
    kredit: number;
  }[];
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

interface AddTransactionTableProps {
  accounts: Account[];
  transactions: Transaction[];
  onTransactionsChange: (transactions: Transaction[]) => void;
}

export function AddTransactionTable({ 
  accounts = [], 
  transactions = [], 
  onTransactionsChange 
}: AddTransactionTableProps) {
  const { accounts: contextAccounts } = useAccounts();
  const { setTransactions } = useTransactions();
  const [search, setSearch] = useState("");
  const [newTransactions, setNewTransactions] = useState<Transaction[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [inlineEditIndex, setInlineEditIndex] = useState<number | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Transaction | null>(null);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [akunList, setAkunList] = useState<Akun[]>([]);
  const [subAkunList, setSubAkunList] = useState<SubAkun[]>([]);
  const [currentEvent, setCurrentEvent] = useState<{
    date: string;
    documentType: string;
    description: string;
  } | null>(null);
  const [isJurnalFormOpen, setIsJurnalFormOpen] = useState(false);

  // Template for new empty transaction
  const emptyTransaction: Transaction = {
    id: "",
    date: "",
    documentType: "",
    description: "",
    namaAkun: "",
    kodeAkun: "",
    akun_id: "",
    debit: 0,
    kredit: 0,
    perusahaan_id: "",
  };

  const handleAddNewRow = () => {
    setNewTransactions([...newTransactions, { ...emptyTransaction }]);
  };

  const handleNewTransactionChange = (index: number, field: keyof Transaction, value: string | number) => {
    const updatedTransactions = [...newTransactions];
    const transaction = { ...updatedTransactions[index] };

    // Handle numeric fields
    if (field === 'debit' || field === 'kredit') {
      const numValue = Number(value) || 0;
      transaction[field] = numValue;
      
      // Reset the opposite field when one is filled
      if (field === 'debit' && numValue > 0) {
        transaction.kredit = 0;
      } else if (field === 'kredit' && numValue > 0) {
        transaction.debit = 0;
      }
    } else {
      // Handle string fields with type assertion
      transaction[field as keyof Omit<Transaction, 'debit' | 'kredit'>] = value as string;
    }

    updatedTransactions[index] = transaction;
    setNewTransactions(updatedTransactions);
  };

  // Update fungsi getAllAccounts untuk menggunakan contextAccounts
  const getAllAccounts = () => {
    const accountsData = contextAccounts || accounts;
    console.log("Using accounts data:", accountsData);

    if (!accountsData || accountsData.length === 0) {
        console.warn("No accounts data available");
        return [];
    }

    const allAccounts: { kodeAkun: string; namaAkun: string }[] = [];

    accountsData.forEach(account => {
      allAccounts.push({
        kodeAkun: account.kodeAkun,
            namaAkun: account.namaAkun
        });

        if (account.subAccounts?.length) {
            account.subAccounts.forEach(subAccount => {
                const fullKodeAkun = `${subAccount.kodeAkunInduk},${subAccount.kodeSubAkun}`;
          allAccounts.push({
            kodeAkun: fullKodeAkun,
                    namaAkun: subAccount.namaSubAkun
          });
        });
      }
    });

    return allAccounts;
  };

  // Update handleAccountSelect untuk menangani kedua jenis akun
  const handleAccountSelect = (index: number, field: 'namaAkun' | 'kodeAkun', value: string, isNewTransaction: boolean) => {
    const allAccounts = getAllAccounts();
    const selectedAccount = allAccounts.find(acc => 
      field === 'namaAkun' ? acc.namaAkun === value : acc.kodeAkun === value
    );

    if (!selectedAccount) return;

    // Extract nama akun without the code
    const namaAkun = selectedAccount.namaAkun.split(' (')[0];
    const kodeAkun = selectedAccount.kodeAkun;

    if (isNewTransaction) {
      const updatedTransactions = [...newTransactions];
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        kodeAkun,
        namaAkun
      };
      setNewTransactions(updatedTransactions);
    } else {
      const updatedTransactions = [...transactions];
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        kodeAkun,
        namaAkun
      };
      onTransactionsChange(updatedTransactions);
    }
  };

  const handleSave = (index: number) => {
    const newTransaction = newTransactions[index];
    onTransactionsChange([...transactions, newTransaction]);
    setNewTransactions(newTransactions.filter((_, i) => i !== index));
  };

  const handleDelete = async (transaction: Transaction) => {
    try {
      const response = await axios.delete(`/mahasiswa/jurnal/${transaction.id}`);
      if (response.data.success) {
        // Hapus transaksi dari state
        const updatedTransactions = transactions.filter(t => t.id !== transaction.id);
        
        // Kelompokkan ulang transaksi berdasarkan kejadian
        const groupedTransactions = [];
        let currentGroup = null;
        
        updatedTransactions.forEach((t, idx) => {
          if (idx === 0 || 
              t.date !== updatedTransactions[idx - 1].date ||
              t.documentType !== updatedTransactions[idx - 1].documentType ||
              t.description !== updatedTransactions[idx - 1].description) {
            // Ini adalah transaksi pertama dalam grup baru
            currentGroup = {
              date: t.date,
              documentType: t.documentType,
              description: t.description
            };
            // Simpan data lengkap untuk baris pertama
            groupedTransactions.push(t);
    } else {
            // Ini adalah transaksi lanjutan dalam grup yang sama
            groupedTransactions.push({
              ...t,
              date: "",
              documentType: "",
              description: ""
            });
          }
        });

        // Update state dengan data yang sudah dikelompokkan
        onTransactionsChange(groupedTransactions);
        alert('Data berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Gagal menghapus data');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdate = (index: number) => {
    setEditingIndex(null);
  };

  const handleEditChange = (index: number, field: keyof Transaction, value: string | number) => {
    const updatedTransactions = [...transactions];
    const transaction = { ...updatedTransactions[index] };

    // Handle numeric fields
    if (field === 'debit' || field === 'kredit') {
      const numValue = Number(value) || 0;
      transaction[field] = numValue;
      
      // Reset the opposite field when one is filled
      if (field === 'debit' && numValue > 0) {
        transaction.kredit = 0;
      } else if (field === 'kredit' && numValue > 0) {
        transaction.debit = 0;
      }
    } else {
      // Handle string fields with type assertion
      transaction[field as keyof Omit<Transaction, 'debit' | 'kredit'>] = value as string;
    }

    updatedTransactions[index] = transaction;
    onTransactionsChange(updatedTransactions);
  };

  const filteredTransactions = (transactions || []).filter((t) =>
    t.namaAkun.toLowerCase().includes(search.toLowerCase())
  );

  // Tambahkan fungsi handleExportCSV
  const handleExportCSV = () => {
    const csvData = transactions.map(t => ({
      Tanggal: t.date,
      Bukti: t.documentType,
      Keterangan: t.description,
      'Kode Akun': t.kodeAkun,
      'Nama Akun': t.namaAkun,
      Debit: t.debit,
      Kredit: t.kredit
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update fungsi handleImportCSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const importedTransactions = results.data
            .filter((row: any) => row.Tanggal || row.Date) // Filter baris kosong
            .map((row: any) => ({
              id: "",
              date: row.Tanggal || row.Date || "",
              documentType: row.Bukti || row['Document Type'] || "",
              description: row.Keterangan || row.Description || "",
              kodeAkun: row['Kode Akun'] || row['Account Code'] || "",
              namaAkun: row['Nama Akun'] || row['Account Name'] || "",
              debit: parseFloat(row.Debit) || 0,
              kredit: parseFloat(row.Kredit || row.Credit) || 0
            }));

          if (importedTransactions.length > 0) {
            // Tambahkan transaksi baru ke state
            const updatedTransactions = [...transactions, ...importedTransactions];
            onTransactionsChange(updatedTransactions);
            
            // Reset file input
            if (event.target) {
              event.target.value = '';
            }
            
            // Tampilkan notifikasi sukses
            alert(`Berhasil mengimpor ${importedTransactions.length} transaksi`);
          } else {
            alert("Tidak ada data valid yang dapat diimpor");
          }
        },
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert("Gagal mengimpor file. Pastikan format file sesuai.");
        }
      });
    }
  };

  // Tambahkan fungsi untuk menangani inline edit
  const handleInlineEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleInlineSave = (index: number) => {
    if (!inlineEditData) return;
    
    const updatedTransactions = [...transactions];
    updatedTransactions[index] = inlineEditData;
    setTransactions(updatedTransactions);
    setInlineEditIndex(null);
    setInlineEditData(null);
  };

  const getTotalDebit = () => {
    return transactions.reduce((total, transaction) => total + transaction.debit, 0);
  };

  const getTotalKredit = () => {
    return transactions.reduce((total, transaction) => total + transaction.kredit, 0);
  };

  // Update data yang ditampilkan
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Update total pages berdasarkan data yang difilter
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  // Reset currentPage saat ada perubahan data
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length, search]);

  // Tambahkan helper function untuk mengecek nilai
  const isEffectivelyZero = (value: string | number | undefined | null) => {
    if (typeof value === 'string') {
      return !value || parseFloat(value) === 0;
    }
    return !value || value === 0;
  };

  // Tambahkan fungsi untuk mengelompokkan transaksi per kejadian
  const groupTransactionsByEvent = (transactions: Transaction[]) => {
    let currentEvent = {
      date: '',
      documentType: '',
      description: ''
    };

    return transactions.map((transaction, index, array) => {
      // Cek apakah ini transaksi pertama atau ada perubahan event
      const isNewEvent = index === 0 || 
        transaction.date !== array[index - 1].date ||
        transaction.documentType !== array[index - 1].documentType ||
        transaction.description !== array[index - 1].description;

      if (isNewEvent) {
        currentEvent = {
          date: transaction.date,
          documentType: transaction.documentType,
          description: transaction.description
        };
        return transaction;
      }

      // Return transaksi tanpa data event untuk transaksi dalam event yang sama
      return {
        ...transaction,
        date: '',
        documentType: '',
        description: ''
      };
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/mahasiswa/jurnal');
        
        if (response.data.success) {
          const transformedTransactions: Transaction[] = Object.entries(response.data.data)
            .flatMap(([description, entries]: [string, unknown]) => {
              const entriesArray = entries as any[];
              return entriesArray.map(entry => ({
                id: entry.id,
                date: entry.tanggal,
                documentType: entry.bukti,
                description,
                namaAkun: entry.akun?.nama || '',
                kodeAkun: entry.akun?.kode?.toString() || '',
                akun_id: entry.akun?.id || '',
                debit: entry.debit || 0,
                kredit: entry.kredit || 0,
                perusahaan_id: entry.perusahaan_id
              }));
            });

          onTransactionsChange(transformedTransactions);
    } else {
          setError('Failed to fetch transactions');
        }
      } catch (err) {
        setError('Error fetching transactions');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [onTransactionsChange]);

  // Update fungsi handleSaveNewTransaction
  const handleSaveNewTransaction = async (transaction: Transaction) => {
    try {
      // Validasi sebelum menyimpan
      if (!transaction.akun_id) {
        alert('Pilih akun terlebih dahulu');
        return;
      }
      if (transaction.debit === 0 && transaction.kredit === 0) {
        alert('Masukkan nilai debit atau kredit');
        return;
      }

      const payload = {
        tanggal: transaction.date,
        bukti: transaction.documentType,
        keterangan: transaction.description,
        akun_id: transaction.akun_id,
        debit: transaction.debit || null,
        kredit: transaction.kredit || null,
        perusahaan_id: transaction.perusahaan_id,
        sub_akun_id: null
      };

      const response = await axios.post('/mahasiswa/jurnal', payload);
      
      // Hapus transaksi yang sedang diedit dari daftar
      const filteredTransactions = transactions.filter(t => t !== transaction);
      
      // Tambahkan transaksi baru dari response
      const newTransaction = {
        id: response.data.data.id,
        date: response.data.data.tanggal,
        documentType: response.data.data.bukti,
        description: response.data.data.keterangan,
        kodeAkun: response.data.data.akun?.kode?.toString() || '',
        akun_id: response.data.data.akun?.id || '',
        namaAkun: response.data.data.akun?.nama || '',
        debit: response.data.data.debit || 0,
        kredit: response.data.data.kredit || 0,
        perusahaan_id: response.data.data.perusahaan_id
      };

      // Update state dengan transaksi yang baru
      onTransactionsChange([...filteredTransactions, newTransaction]);
      
      // Reset editing state
      setEditingTransaction(null);
      
      alert('Data berhasil disimpan');
      
      // Refresh data dari server
      const refreshResponse = await axios.get('/mahasiswa/jurnal');
      if (refreshResponse.data.success) {
        const transformedTransactions = Object.entries(refreshResponse.data.data)
          .flatMap(([description, entries]: [string, unknown]) => {
            const entriesArray = entries as any[];
            return entriesArray.map(entry => ({
              id: entry.id,
              date: entry.tanggal,
              documentType: entry.bukti,
              description,
              namaAkun: entry.akun?.nama || '',
              kodeAkun: entry.akun?.kode?.toString() || '',
              akun_id: entry.akun?.id || '',
              debit: entry.debit || 0,
              kredit: entry.kredit || 0,
              perusahaan_id: entry.perusahaan_id
            }));
          });
        onTransactionsChange(transformedTransactions);
      }

    } catch (error: any) {
      console.error('Error saving transaction:', error.response || error);
      // Tetap refresh data meskipun ada error
      try {
        const refreshResponse = await axios.get('/mahasiswa/jurnal');
        if (refreshResponse.data.success) {
          const transformedTransactions = Object.entries(refreshResponse.data.data)
            .flatMap(([description, entries]: [string, unknown]) => {
              const entriesArray = entries as any[];
              return entriesArray.map(entry => ({
                id: entry.id,
                date: entry.tanggal,
                documentType: entry.bukti,
                description,
                namaAkun: entry.akun?.nama || '',
                kodeAkun: entry.akun?.kode?.toString() || '',
                akun_id: entry.akun?.id || '',
                debit: entry.debit || 0,
                kredit: entry.kredit || 0,
                perusahaan_id: entry.perusahaan_id
              }));
            });
          onTransactionsChange(transformedTransactions);
        }
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
      }
      alert('Data berhasil disimpan, menyegarkan data...');
    }
  };

  // Update fungsi handleAddRowSameEvent
  const handleAddRowSameEvent = (transaction: Transaction) => {
    if (!transaction.perusahaan_id) {
      alert('Error: perusahaan_id tidak ditemukan');
      return;
    }

    const newTransaction: Transaction = {
      id: "",
      date: transaction.date,
      documentType: transaction.documentType,
      description: transaction.description,
      namaAkun: "",
      kodeAkun: "",
      akun_id: "",
      debit: 0,
      kredit: 0,
      perusahaan_id: transaction.perusahaan_id
    };

    // Tambahkan transaksi baru ke array yang sudah ada
    const updatedTransactions = [...transactions];
    
    // Cari indeks terakhir dari grup transaksi yang sama
    const lastIndexOfGroup = updatedTransactions.reduce((lastIndex, curr, index) => {
      if (
        curr.date === transaction.date && 
        curr.documentType === transaction.documentType && 
        curr.description === transaction.description
      ) {
        return index;
      }
      return lastIndex;
    }, -1);

    // Sisipkan transaksi baru setelah indeks terakhir
    updatedTransactions.splice(lastIndexOfGroup + 1, 0, newTransaction);
    
    // Update state transactions
    onTransactionsChange(updatedTransactions);

    // Langsung masuk ke mode edit untuk transaksi baru
    setEditingTransaction(newTransaction);
  };

  // Tambahkan useEffect untuk fetch data akun dan sub akun
  useEffect(() => {
    const fetchAkunData = async () => {
      try {
        const [akunResponse, subAkunResponse] = await Promise.all([
          axios.get('/instruktur/akun'),
          axios.get('/mahasiswa/subakun')
        ]);

        if (akunResponse.data.success) {
          setAkunList(akunResponse.data.data);
        }
        if (subAkunResponse.data.success) {
          setSubAkunList(subAkunResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching akun data:', error);
      }
    };

    fetchAkunData();
  }, []); // Fetch saat komponen mount

  // Update fungsi handleSaveEdit
  const handleSaveEdit = async (transaction: Transaction) => {
    try {
      // Validasi data sebelum update
      if (!transaction?.id) {
        console.error('No transaction ID found');
        return;
      }

      if (!transaction.akun_id) {
        alert('Pilih akun terlebih dahulu');
        return;
      }

      // Dapatkan semua transaksi dalam grup yang sama
      const sameGroupTransactions = transactions.filter(t => 
        t.documentType === transaction.documentType &&
        t.description === transaction.description &&
        (t.date === transaction.date || t.date === "")
      );

      // Update semua transaksi dalam grup yang sama
      try {
        for (const t of sameGroupTransactions) {
          const payload = {
            tanggal: transaction.date, // Gunakan tanggal baru untuk semua transaksi dalam grup
            bukti: transaction.documentType,
            keterangan: transaction.description,
            akun_id: t.akun_id,
            debit: t.debit || null,
            kredit: t.kredit || null,
            perusahaan_id: t.perusahaan_id
          };

          await axios.put(`/mahasiswa/jurnal/${t.id}`, payload);
        }

        // Update state lokal
        const updatedTransactions = transactions.map(t => {
          if (sameGroupTransactions.some(gt => gt.id === t.id)) {
            return {
              ...t,
              date: transaction.date,
              documentType: transaction.documentType,
              description: transaction.description
            };
          }
          return t;
        });

        onTransactionsChange(updatedTransactions);
        setEditingTransaction(null);
        alert('Data berhasil diupdate');

      } catch (error) {
        console.error('Error updating transactions:', error);
        alert('Gagal mengupdate beberapa transaksi. Silakan coba lagi.');
      }

    } catch (error: any) {
      console.error('Error updating transaction:', error.response || error);
      alert(error.response?.data?.message || 'Gagal mengupdate transaksi. Silakan coba lagi.');
    }
  };

  // Update renderTableRow untuk menangani tampilan dan penyimpanan dengan benar
  const renderTableRow = (transaction: Transaction, index: number, array: Transaction[]) => {
    const isEditing = editingTransaction?.id === transaction.id || editingTransaction === transaction;
    const isFirstInGroup = index === 0 || 
      (array[index - 1]?.date !== transaction.date ||
       array[index - 1]?.documentType !== transaction.documentType ||
       array[index - 1]?.description !== transaction.description);

    if (isEditing) {
  return (
        <TableRow key={transaction.id || index}>
          {isFirstInGroup ? (
            <>
              <TableCell>
          <Input
                  type="date"
                  value={editingTransaction.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setEditingTransaction({
                      ...editingTransaction,
                      date: newDate
                    });

                    // Update semua transaksi dalam grup yang sama
                    const updatedTransactions = transactions.map((t) => {
                      if (
                        t.documentType === transaction.documentType &&
                        t.description === transaction.description &&
                        (t.date === transaction.date || t.date === "")
                      ) {
                        return {
                          ...t,
                          date: newDate
                        };
                      }
                      return t;
                    });
                    onTransactionsChange(updatedTransactions);
                  }}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={editingTransaction.documentType}
                  onChange={(e) => {
                    const newDocType = e.target.value;
                    setEditingTransaction({
                      ...editingTransaction,
                      documentType: newDocType
                    });

                    // Update semua transaksi dalam grup yang sama
                    const updatedTransactions = transactions.map((t) => {
                      if (
                        t.date === transaction.date &&
                        t.description === transaction.description &&
                        (t.documentType === transaction.documentType || t.documentType === "")
                      ) {
                        return {
                          ...t,
                          documentType: newDocType
                        };
                      }
                      return t;
                    });
                    onTransactionsChange(updatedTransactions);
                  }}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={editingTransaction.description}
                  onChange={(e) => {
                    const newDesc = e.target.value;
                    setEditingTransaction({
                      ...editingTransaction,
                      description: newDesc
                    });

                    // Update semua transaksi dalam grup yang sama
                    const updatedTransactions = transactions.map((t) => {
                      if (
                        t.date === transaction.date &&
                        t.documentType === transaction.documentType &&
                        (t.description === transaction.description || t.description === "")
                      ) {
                        return {
                          ...t,
                          description: newDesc
                        };
                      }
                      return t;
                    });
                    onTransactionsChange(updatedTransactions);
                  }}
                />
              </TableCell>
            </>
          ) : (
            <>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </>
          )}
          <TableCell>
          <Select
              value={editingTransaction.kodeAkun}
              onValueChange={(value) => {
                const selectedAkun = akunList.find(a => a.kode.toString() === value);
                const selectedSubAkun = subAkunList.find(s => s.kode.toString() === value);
                
                if (selectedAkun) {
                  setEditingTransaction({
                    ...editingTransaction,
                    kodeAkun: selectedAkun.kode.toString(),
                    namaAkun: selectedAkun.nama,
                    akun_id: selectedAkun.id
                  });
                } else if (selectedSubAkun) {
                  setEditingTransaction({
                    ...editingTransaction,
                    kodeAkun: selectedSubAkun.kode.toString(),
                    namaAkun: selectedSubAkun.nama,
                    akun_id: selectedSubAkun.akun.id
                  });
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Kode" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kode Akun</SelectLabel>
                  {akunList.map((akun) => (
                    <SelectItem key={akun.id} value={akun.kode.toString()}>
                      {akun.kode}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Kode Sub Akun</SelectLabel>
                  {subAkunList.map((subAkun) => (
                    <SelectItem key={subAkun.id} value={subAkun.kode.toString()}>
                      {subAkun.kode}
                    </SelectItem>
                  ))}
                </SelectGroup>
            </SelectContent>
          </Select>
          </TableCell>
          <TableCell>
            <Select
              value={editingTransaction.namaAkun}
              onValueChange={(value) => {
                const selectedAkun = akunList.find(a => a.nama === value);
                const selectedSubAkun = subAkunList.find(s => s.nama === value);
                
                if (selectedAkun) {
                  setEditingTransaction({
                    ...editingTransaction,
                    kodeAkun: selectedAkun.kode.toString(),
                    namaAkun: selectedAkun.nama,
                    akun_id: selectedAkun.id
                  });
                } else if (selectedSubAkun) {
                  setEditingTransaction({
                    ...editingTransaction,
                    kodeAkun: selectedSubAkun.kode.toString(),
                    namaAkun: selectedSubAkun.nama,
                    akun_id: selectedSubAkun.akun.id
                  });
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Nama" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Nama Akun</SelectLabel>
                  {akunList.map((akun) => (
                    <SelectItem key={akun.id} value={akun.nama}>
                      {akun.nama}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Nama Sub Akun</SelectLabel>
                  {subAkunList.map((subAkun) => (
                    <SelectItem key={subAkun.id} value={subAkun.nama}>
                      {subAkun.nama}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={editingTransaction.debit}
              onChange={(e) => {
                const value = Number(e.target.value);
                setEditingTransaction({
                  ...editingTransaction,
                  debit: value,
                  kredit: 0 // Reset kredit saat debit diisi
                });
              }}
              className="w-[150px]"
              disabled={editingTransaction.kredit > 0} // Disable jika kredit sudah diisi
              min="0"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={editingTransaction.kredit}
              onChange={(e) => {
                const value = Number(e.target.value);
                setEditingTransaction({
                  ...editingTransaction,
                  kredit: value,
                  debit: 0 // Reset debit saat kredit diisi
                });
              }}
              className="w-[150px]"
              disabled={editingTransaction.debit > 0} // Disable jika debit sudah diisi
              min="0"
            />
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (!editingTransaction) return;
                  
                  // Untuk transaksi baru, gunakan handleSaveNewTransaction
                  if (!transaction.id) {
                    handleSaveNewTransaction(editingTransaction);
                  } else {
                    handleSaveEdit(editingTransaction);
                  }
                }}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingTransaction(null);
                  if (!transaction.id) {
                    const updatedTransactions = transactions.filter(t => t !== transaction);
                    onTransactionsChange(updatedTransactions);
                  }
                }}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    // Tampilan normal (tidak dalam mode edit)
    return (
      <TableRow key={transaction.id}>
        {isFirstInGroup ? (
          <>
            <TableCell>{transaction.date}</TableCell>
            <TableCell>{transaction.documentType}</TableCell>
            <TableCell className="relative">
              {transaction.description}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => handleAddRowSameEvent(transaction)}
              >
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </TableCell>
          </>
        ) : (
          <>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </>
        )}
        <TableCell>{transaction.kodeAkun}</TableCell>
        <TableCell>{transaction.namaAkun}</TableCell>
        <TableCell className="text-right">
          {transaction.debit > 0 ? transaction.debit.toLocaleString() : '0'}
        </TableCell>
        <TableCell className="text-right">
          {transaction.kredit > 0 ? transaction.kredit.toLocaleString() : '0'}
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingTransaction(transaction)}
            >
              <Pencil className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(transaction)}
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Tambahkan handler untuk form submission
  const handleJurnalFormSubmit = (newTransaction: Transaction) => {
    onTransactionsChange([...transactions, newTransaction]);
  };

  // Add loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Add error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
      {/* Header Section with Totals */}
      <div className="flex gap-4 mb-6">
        {/* Debit & Kredit Container */}
        <div className="flex flex-1 flex-grow">
          {/* Debit Card */}
          <Card className="bg-red-400 p-4 rounded-r-none rounded-l-xl flex-1 border-r-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-l-xl rounded-r-none h-full">
              <p className="text-sm text-white/90">Debit</p>
              <p className="text-lg font-medium text-white">
                Rp {getTotalDebit().toLocaleString()}
              </p>
            </div>
          </Card>

          {/* Kredit Card */}
          <Card className="bg-red-400 p-4 rounded-l-none rounded-r-xl flex-1 border-l-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-l-none rounded-r-xl h-full">
              <p className="text-sm text-white/90">Kredit</p>
              <p className="text-lg font-medium text-white">
                Rp {getTotalKredit().toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Unbalanced Card */}
        <Card className="bg-red-400 p-4 rounded-xl w-1/3">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl h-full">
            <p className="text-sm text-white/90">Unbalanced</p>
            <p className="text-lg font-medium text-white">
              Difference: Rp {Math.abs(getTotalDebit() - getTotalKredit()).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* Controls Section */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px] rounded-lg border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
            id="csvInput"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('csvInput')?.click()}
            className="flex items-center gap-2 rounded-lg border-gray-200"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border-gray-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setIsJurnalFormOpen(true)}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
      <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
          <TableRow>
              <TableHead className="text-gray-600">Tanggal</TableHead>
              <TableHead className="text-gray-600">Bukti</TableHead>
              <TableHead className="text-gray-600">Keterangan</TableHead>
              <TableHead className="text-gray-600">Kode akun</TableHead>
              <TableHead className="text-gray-600">Nama Akun</TableHead>
              <TableHead className="text-gray-600 text-right">Debit</TableHead>
              <TableHead className="text-gray-600 text-right">Kredit</TableHead>
              <TableHead className="text-gray-600 w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* New Transactions */}
          {newTransactions.map((transaction, index) => (
            <TableRow key={`new-${index}`}>
              <TableCell>
                <Input
                  type="date"
                  value={transaction.date}
                  onChange={(e) => handleNewTransactionChange(index, "date", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={transaction.documentType}
                  onChange={(e) => handleNewTransactionChange(index, "documentType", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={transaction.description}
                  onChange={(e) => handleNewTransactionChange(index, "description", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                    value={transaction.kodeAkun}
                    onValueChange={(value) => {
                      const selectedAkun = akunList.find(a => a.kode.toString() === value);
                      const selectedSubAkun = subAkunList.find(s => s.kode.toString() === value);
                      
                      const updatedTransactions = [...transactions];
                      if (selectedAkun) {
                        updatedTransactions[index] = {
                          ...transaction,
                          kodeAkun: selectedAkun.kode.toString(),
                          namaAkun: selectedAkun.nama,
                          akun_id: selectedAkun.id
                        };
                      } else if (selectedSubAkun) {
                        updatedTransactions[index] = {
                          ...transaction,
                          kodeAkun: selectedSubAkun.kode.toString(),
                          namaAkun: selectedSubAkun.nama,
                          akun_id: selectedSubAkun.akun.id
                        };
                      }
                      onTransactionsChange(updatedTransactions);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Pilih Kode" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Kode Akun</SelectLabel>
                        {akunList.map((akun) => (
                          <SelectItem key={akun.id} value={akun.kode.toString()}>
                            {akun.kode}
                      </SelectItem>
                    ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Kode Sub Akun</SelectLabel>
                        {subAkunList.map((subAkun) => (
                          <SelectItem key={subAkun.id} value={subAkun.kode.toString()}>
                            {subAkun.kode}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                    value={transaction.namaAkun}
                    onValueChange={(value) => {
                      const selectedAkun = akunList.find(a => a.nama === value);
                      const selectedSubAkun = subAkunList.find(s => s.nama === value);
                      
                      const updatedTransactions = [...transactions];
                      if (selectedAkun) {
                        updatedTransactions[index] = {
                          ...transaction,
                          kodeAkun: selectedAkun.kode.toString(),
                          namaAkun: selectedAkun.nama,
                          akun_id: selectedAkun.id
                        };
                      } else if (selectedSubAkun) {
                        updatedTransactions[index] = {
                          ...transaction,
                          kodeAkun: selectedSubAkun.kode.toString(),
                          namaAkun: selectedSubAkun.nama,
                          akun_id: selectedSubAkun.akun.id
                        };
                      }
                      onTransactionsChange(updatedTransactions);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Pilih Nama" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Nama Akun</SelectLabel>
                        {akunList.map((akun) => (
                          <SelectItem key={akun.id} value={akun.nama}>
                            {akun.nama}
                      </SelectItem>
                    ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Nama Sub Akun</SelectLabel>
                        {subAkunList.map((subAkun) => (
                          <SelectItem key={subAkun.id} value={subAkun.nama}>
                            {subAkun.nama}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={transaction.debit}
                  onChange={(e) => handleNewTransactionChange(index, "debit", Number(e.target.value))}
                  disabled={transaction.kredit > 0}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={transaction.kredit}
                  onChange={(e) => handleNewTransactionChange(index, "kredit", Number(e.target.value))}
                  disabled={transaction.debit > 0}
                />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleSave(index)}
                      className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                    >
                      <Save className="h-4 w-4 text-primary" />
                  </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(transaction)}
                      className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Existing Transactions */}
            {currentTransactions.map((transaction, index, array) => renderTableRow(transaction, index, array))}
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
              // Show first page, current page, last page, and pages around current
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
              // Show ellipsis for gaps
              if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
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

      <JurnalForm
        isOpen={isJurnalFormOpen}
        onClose={() => setIsJurnalFormOpen(false)}
        onSubmit={handleJurnalFormSubmit}
        akunList={akunList}
        subAkunList={subAkunList}
      />
    </div>
  );
} 