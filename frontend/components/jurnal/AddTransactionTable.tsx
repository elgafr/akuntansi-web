"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Save, Trash2, Plus, Pencil, X, Download, Upload, Moon, Check, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { Account, SubAccount } from "@/types/account";
import { Transaction } from "@/types/transaction";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface JurnalData {
  [key: string]: JurnalEntry[];
}

interface JurnalEntry {
  id: string;
  tanggal: string;
  bukti: string;
  keterangan: string;
  akun_id: string;
  debit: number | null;
  kredit: number | null;
  perusahaan_id: string;
  sub_akun_id: string | null;
  akun: {
    id: string;
    kode: number;
    nama: string;
    status: string;
  };
  sub_akun: any | null;
  perusahaan: {
    id: string;
    nama: string;
    alamat: string;
    tahun_berdiri: number;
    status: string;
  };
}

interface AddTransactionTableProps {
  accounts: Account[];
  transactions: Transaction[];
  onTransactionsChange: (transactions: Transaction[]) => void;
}

// Add this function near the top of the file
const formatJurnalResponse = (jurnalData: JurnalData): Transaction[] => {
  const formattedTransactions: Transaction[] = [];
  
  Object.entries(jurnalData).forEach(([keterangan, entries]) => {
    entries.forEach(entry => {
      formattedTransactions.push({
        id: entry.id,
        date: entry.tanggal,
        documentType: entry.bukti,
        description: entry.keterangan,
        namaAkun: entry.akun.nama,
        kodeAkun: entry.akun.kode.toString(),
        akun_id: entry.akun_id,
        debit: entry.debit || 0,
        kredit: entry.kredit || 0,
        perusahaan_id: entry.perusahaan_id,
        sub_akun_id: entry.sub_akun_id
      });
    });
  });

  return formattedTransactions;
};

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
  const [akunList, setAkunList] = useState<Account[]>([]);
  const [subAkunList, setSubAkunList] = useState<SubAkun[]>([]);
  const [currentEvent, setCurrentEvent] = useState<{
    date: string;
    documentType: string;
    description: string;
  } | null>(null);
  const [isJurnalFormOpen, setIsJurnalFormOpen] = useState(false);
  const [editingTransactions, setEditingTransactions] = useState<Transaction[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction[]>([]);

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
    sub_akun_id: null,
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
    const allAccounts: { kodeAkun: string; namaAkun: string }[] = [];

    accountsData.forEach(account => {
      if (account.kodeAkun && account.namaAkun) {
      allAccounts.push({
        kodeAkun: account.kodeAkun,
          namaAkun: account.namaAkun
        });
      }

      // Check if account has subAccounts property
      if ('subAccounts' in account && Array.isArray(account.subAccounts)) {
        account.subAccounts.forEach((subAccount: SubAccount) => {
          if (subAccount.kodeAkunInduk && subAccount.kodeSubAkun && subAccount.namaSubAkun) {
            const fullKodeAkun = `${subAccount.kodeAkunInduk},${subAccount.kodeSubAkun}`;
            allAccounts.push({
              kodeAkun: fullKodeAkun,
              namaAkun: subAccount.namaSubAkun
            });
          }
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
        window.location.href = '/jurnal';
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

  // Tambahkan helper function untuk mengecek nilai
  const isEffectivelyZero = (value: string | number | undefined | null) => {
    if (typeof value === 'string') {
      return !value || parseFloat(value) === 0;
    }
    return !value || value === 0;
  };

  // Tambahkan fungsi untuk mengelompokkan transaksi berdasarkan kejadian
  const groupTransactionsByEvent = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const eventKey = `${transaction.date}_${transaction.documentType}_${transaction.description}`;
      if (!groups[eventKey]) {
        groups[eventKey] = [];
      }
      groups[eventKey].push(transaction);
    });

    return Object.values(groups);
  };

  // Update fungsi handleEditEvent
  const handleEditEvent = async (transactions: Transaction[]) => {
    if (!transactions || transactions.length === 0) return;

    // Ambil transaksi pertama untuk data kejadian
    const firstTransaction = transactions[0];
    
    // Filter semua transaksi dengan keterangan yang sama
    const eventTransactions = transactions.filter(
      t => t.description === firstTransaction.description
    );

    // Set editing transactions untuk dikirim ke JurnalForm
    setEditingTransactions(eventTransactions);
    
    // Buka modal JurnalForm
    setIsJurnalFormOpen(true);
  };

  // Update fungsi handleDeleteEvent
  const handleDeleteEvent = (transactions: Transaction[]) => {
    setTransactionToDelete(transactions);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      const transactionIds = transactionToDelete
        .filter(t => t.description === transactionToDelete[0].description)
        .map(t => t.id);

      await Promise.all(
        transactionIds.map(id => axios.delete(`/mahasiswa/jurnal/${id}`))
      );

      toast({
        title: "Berhasil",
        description: "Data berhasil dihapus"
      });
      
      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.href = '/jurnal';
      }, 2000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus data"
      });
    }
    setShowDeleteAlert(false);
  };

  // Update handleJurnalFormSubmit
  const handleJurnalFormSubmit = async (newTransaction: Transaction) => {
    // Refresh data without page reload
    try {
      const response = await axios.get('/mahasiswa/jurnal');
      if (response.data.success) {
        const formattedTransactions = formatJurnalResponse(response.data.data);
        onTransactionsChange(formattedTransactions);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Update useEffect untuk fetch jurnal data
  useEffect(() => {
    const fetchJurnal = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/mahasiswa/jurnal');
        if (response.data.success) {
          const jurnalData: JurnalData = response.data.data;
          const formattedTransactions: Transaction[] = [];

          Object.entries(jurnalData).forEach(([keterangan, entries]) => {
            entries.forEach(entry => {
              formattedTransactions.push({
                id: entry.id,
                date: entry.tanggal,
                documentType: entry.bukti,
                description: entry.keterangan,
                namaAkun: entry.akun.nama,
                kodeAkun: entry.akun.kode.toString(),
                akun_id: entry.akun_id,
                debit: entry.debit || 0,
                kredit: entry.kredit || 0,
                perusahaan_id: entry.perusahaan_id,
                sub_akun_id: entry.sub_akun_id
              });
            });
          });

          // Tidak perlu sorting di sini, langsung gunakan data dari API
          onTransactionsChange(formattedTransactions);
        }
      } catch (error) {
        console.error('Error fetching jurnal:', error);
        setError('Gagal memuat data jurnal');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJurnal();
  }, []);

  // Update groupedTransactions untuk menggunakan data tanpa sorting
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    // Langsung gunakan transactions tanpa sorting
    transactions.forEach(transaction => {
      const eventKey = `${transaction.date}_${transaction.documentType}_${transaction.description}`;
      if (!groups[eventKey]) {
        groups[eventKey] = [];
      }
      groups[eventKey].push(transaction);
    });

    return Object.values(groups);
  }, [transactions]);

  // Update handleSort untuk menangani sorting
  const handleSort = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return newDirection === 'asc' 
        ? dateA - dateB  // Ascending (terlama ke terbaru)
        : dateB - dateA; // Descending (terbaru ke terlama)
    });

    onTransactionsChange(sortedTransactions);
  };

  // Tambahkan fungsi format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/-/g, '/');
  };

  // Update renderTableRow untuk menggunakan format tanggal
  const renderTableRow = (transaction: Transaction, index: number, array: Transaction[]) => {
    const isFirstInGroup = index === 0 || transaction.description !== array[index - 1].description;
    const isPartOfGroup = index > 0 && transaction.description === array[index - 1].description;
    const groupTransactions = array.filter(t => t.description === transaction.description);

    return (
      <TableRow 
        key={transaction.id}
        className={isPartOfGroup ? 'bg-gray-50/50' : ''}
      >
        <TableCell>{isFirstInGroup ? formatDate(transaction.date) : ''}</TableCell>
        <TableCell>{isFirstInGroup ? transaction.documentType : ''}</TableCell>
        <TableCell>{isFirstInGroup ? transaction.description : ''}</TableCell>
        <TableCell>{transaction.kodeAkun}</TableCell>
        <TableCell>{transaction.namaAkun}</TableCell>
        <TableCell className="text-right">
          {transaction.debit ? `Rp ${transaction.debit.toLocaleString()}` : '-'}
        </TableCell>
        <TableCell className="text-right">
          {transaction.kredit ? `Rp ${transaction.kredit.toLocaleString()}` : '-'}
        </TableCell>
        <TableCell>
          {isFirstInGroup && (
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditEvent(groupTransactions)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Pencil className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteEvent(groupTransactions)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };

  // Add loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Update tampilan error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500">{error}</div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Coba Lagi
        </Button>
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:text-gray-700"
                  onClick={handleSort}
                >
                  Tanggal
                  {sortDirection === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Bukti</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead>Kode Akun</TableHead>
            <TableHead>Nama Akun</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {transactions.map((transaction, index, array) => 
              renderTableRow(transaction, index, array)
            )}
        </TableBody>
      </Table>
      </div>

      <JurnalForm
        isOpen={isJurnalFormOpen}
        onClose={() => {
          setIsJurnalFormOpen(false);
          setEditingTransactions([]);
        }}
        onSubmit={handleJurnalFormSubmit}
        editingTransactions={editingTransactions}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus transaksi ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 