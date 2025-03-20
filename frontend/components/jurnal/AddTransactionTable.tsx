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
import { useJurnal, useDeleteJurnal } from "@/hooks/useJurnal";
import { useQueryClient } from "@tanstack/react-query";

// Extend Transaction interface untuk menampung properti optimistic
declare module '@/types/transaction' {
  interface Transaction {
    _optimistic?: boolean;
    _groupId?: string;
    _originalDescription?: string;
    _updatedAt?: number;
    sub_akun_id: string | null;
  }
}

interface SubAkun {
  id: string;
  kode: string;
  nama: string;
  akun_id: string;
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
  sub_akun: {
    id: string;
    kode: number;
    nama: string;
  } | null;
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
  isLoading?: boolean;
}

// Update formatJurnalResponse function
const formatJurnalResponse = (jurnalData: JurnalData): Transaction[] => {
  console.log("Formatting jurnal data:", jurnalData);
  
  // Jika jurnalData adalah array, berarti format responsnya berbeda
  if (Array.isArray(jurnalData)) {
    console.log("jurnalData is an array, using different format");
    return jurnalData.map(entry => ({
      id: entry.id,
      date: entry.tanggal,
      documentType: entry.bukti,
      description: entry.keterangan,
      namaAkun: entry.sub_akun ? entry.sub_akun.nama : entry.akun.nama,
      // Use sub-account code if available, otherwise use main account code
      kodeAkun: entry.sub_akun ? entry.sub_akun.kode.toString() : entry.akun.kode.toString(),
      akun_id: entry.akun_id,
      debit: entry.debit || 0,
      kredit: entry.kredit || 0,
      perusahaan_id: entry.perusahaan_id,
      sub_akun_id: entry.sub_akun_id
    }));
  }
  
  // Format standar (object dengan key keterangan)
  const formattedTransactions: Transaction[] = [];
  
  Object.entries(jurnalData).forEach(([keterangan, entries]) => {
    if (!Array.isArray(entries)) {
      console.warn(`Entries for ${keterangan} is not an array:`, entries);
      return;
    }
    
    entries.forEach(entry => {
      formattedTransactions.push({
        id: entry.id,
        date: entry.tanggal,
        documentType: entry.bukti,
        description: entry.keterangan,
        namaAkun: entry.sub_akun ? entry.sub_akun.nama : entry.akun.nama,
        // Use sub-account code if available, otherwise use main account code
        kodeAkun: entry.sub_akun ? entry.sub_akun.kode.toString() : entry.akun.kode.toString(),
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
  onTransactionsChange,
  isLoading = false 
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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: deleteJurnal } = useDeleteJurnal();
  const [refreshingRows, setRefreshingRows] = useState<string[]>([]);
  const [styleSheet, setStyleSheet] = useState<HTMLStyleElement | null>(null);
  const [loadingToast, setLoadingToast] = useState<any>(null);
  const [updatingTransaction, setUpdatingTransaction] = useState<string | null>(null);
  const [lastUpdatedDescription, setLastUpdatedDescription] = useState<string | null>(null);
  const [isAwaitingRefresh, setIsAwaitingRefresh] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [operationType, setOperationType] = useState<'update' | 'delete' | null>(null);
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<{
    description: string;
    timestamp: number;
    transactions: Transaction[];
  }[]>([]);
  const [awaitingServerConfirmation, setAwaitingServerConfirmation] = useState(false);
  const [prioritizedTransactions, setPrioritizedTransactions] = useState<Transaction[]>([]);
  const [disableServerFetch, setDisableServerFetch] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasAttemptedInitialLoad, setHasAttemptedInitialLoad] = useState(false);
  const { toast } = useToast();
  const [highlightedEvents, setHighlightedEvents] = useState<Set<string>>(new Set());

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

  // Helper function untuk menangani string field assignment
  const updateTransactionField = (transaction: Transaction, field: string, value: string) => {
    // Safe way to set string properties with TypeScript
    return {
      ...transaction,
      [field]: value
    };
  };

  // Update handleNewTransactionChange
  const handleNewTransactionChange = (index: number, field: keyof Transaction, value: string | number) => {
    const updatedTransactions = [...newTransactions];
    let transaction = { ...updatedTransactions[index] };

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
      // Handle string fields using the safe helper
      transaction = updateTransactionField(transaction, field, value as string);
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

  // Update handleEditChange with the same approach
  const handleEditChange = (index: number, field: keyof Transaction, value: string | number) => {
    const updatedTransactions = [...transactions];
    let transaction = { ...updatedTransactions[index] };

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
      // Handle string fields using the safe helper
      transaction = updateTransactionField(transaction, field, value as string);
    }

    updatedTransactions[index] = transaction;
    onTransactionsChange(updatedTransactions);
  };

  const filteredTransactions = (transactions || []).filter((t) =>
    t.namaAkun.toLowerCase().includes(search.toLowerCase())
  );

  // Update the handleExportCSV function to properly handle sub-accounts
  const handleExportCSV = () => {
    // Prepare data for CSV export with correct sub-account handling
    const csvData = transactions.map(t => {
      // Get the proper code and name for the account (considering sub-accounts)
      let displayKodeAkun = t.kodeAkun;
      let displayNamaAkun = t.namaAkun;
      
      // If transaction has a sub_akun_id, get the sub-account code and name
      if (t.sub_akun_id && subAkunList && subAkunList.length > 0) {
        const subAkun = subAkunList.find(sa => sa.id === t.sub_akun_id);
        if (subAkun) {
          displayKodeAkun = subAkun.kode; // Use sub-account code
          displayNamaAkun = subAkun.nama;  // Use sub-account name
        }
      }
      
      // Return the row with correct values
      return {
        Tanggal: formatDate(t.date),
        Bukti: t.documentType,
        Keterangan: t.description,
        'Kode Akun': displayKodeAkun,
        'Nama Akun': displayNamaAkun,
        Debit: t.debit ? t.debit : '',
        Kredit: t.kredit ? t.kredit : ''
      };
    });

    // Generate the CSV
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

  // Update fetchLatestData to prevent unwanted transitions
  const fetchLatestData = async () => {
    console.log("Fetching latest data...");
    try {
      // Tampilkan status awal
      console.log("Current state:", {
        transactions: transactions.length,
        optimisticUpdates: optimisticUpdates.length,
        disableServerFetch
      });
      
      // Jika disabled, log dan hentikan
      if (disableServerFetch) {
        console.log("Server fetch disabled, skipping fetch");
        return;
      }
      
      // If we have optimistic updates that are recent (less than 5 seconds old), skip fetching
      const hasRecentOptimisticUpdates = optimisticUpdates.some(
        update => Date.now() - update.timestamp < 5000
      );
      
      if (hasRecentOptimisticUpdates) {
        console.log("Recent optimistic updates exist, skipping fetch to avoid UI flicker");
        return;
      }
      
      // Fetch data dari server
      console.log("Calling API...");
      const jurnalResponse = await axios.get('/mahasiswa/jurnal');
      console.log("API Response:", jurnalResponse.data);
      
      if (jurnalResponse.data.success) {
        const jurnalData: JurnalData = jurnalResponse.data.data;
        // Periksa apakah data jurnal kosong
        if (Object.keys(jurnalData).length === 0) {
          console.log("API returned empty jurnal data");
        }
        
        const serverTransactions = formatJurnalResponse(jurnalData);
        console.log("Formatted transactions:", serverTransactions.length);
        
        // If we have optimistic updates, we need to merge them with server data
        if (optimisticUpdates.length > 0) {
          console.log("Merging optimistic updates with server data");
          
          // Create a map of server transactions for quick lookup
          const serverTransactionMap = new Map();
          serverTransactions.forEach(t => {
            if (!serverTransactionMap.has(t.description)) {
              serverTransactionMap.set(t.description, []);
            }
            serverTransactionMap.get(t.description).push(t);
          });
          
          // Make a copy of server transactions
          let mergedTransactions = [...serverTransactions];
          
          // Add any optimistic transactions that don't exist on server yet
          optimisticUpdates.forEach(update => {
            const hasServerVersion = serverTransactionMap.has(update.description);
            
            // If this is a very recent update (less than 2 seconds old), keep the optimistic version
            if (!hasServerVersion || Date.now() - update.timestamp < 2000) {
              // Find and remove any server transactions with this description
              mergedTransactions = mergedTransactions.filter(t => 
                t.description !== update.description
              );
              
              // Add our optimistic version
              mergedTransactions.push(...update.transactions);
            }
          });
          
          // Update UI with merged transactions
          onTransactionsChange(mergedTransactions);
        } else {
          // No optimistic updates, just update with server data
          onTransactionsChange(serverTransactions);
        }
      } else {
        console.error("API returned success: false");
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
      // Tambahkan toast untuk memberi tahu user
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data jurnal. Silakan refresh halaman."
      });
    }
  };

  // Perbaiki checkServerUpdates untuk lebih cerdas menangani optimistic update
  const checkServerUpdates = async () => {
    // Jika disabled, jangan fetch
    if (disableServerFetch) {
      console.log("Server fetch disabled, skipping check");
      return;
    }
    
    try {
      const jurnalResponse = await axios.get('/mahasiswa/jurnal');
      
      if (jurnalResponse.data.success) {
        const jurnalData: JurnalData = jurnalResponse.data.data;
        const serverTransactions = formatJurnalResponse(jurnalData);
        
        // Jika tidak ada optimistic updates, langsung update UI
        if (optimisticUpdates.length === 0) {
          onTransactionsChange(serverTransactions);
          return;
        }
        
        // Periksa apakah ada kecocokan antara server transactions dan optimistic updates
        const optimisticDescriptions = optimisticUpdates.map(u => u.description);
        const matchingServerTransactions = serverTransactions.filter(st => 
          optimisticDescriptions.includes(st.description)
        );
        
        if (matchingServerTransactions.length > 0) {
          console.log("Found matching transactions on server, confirming updates");
          
          // Hapus optimistic updates yang sudah terkonfirmasi server
          const confirmedDescriptions = matchingServerTransactions.map(t => t.description);
          setOptimisticUpdates(prev => 
            prev.filter(u => !confirmedDescriptions.includes(u.description))
          );
          
          // Reset flag menunggu konfirmasi
          setAwaitingServerConfirmation(false);
          
          // Buat map untuk lookup cepat transaksi server
          const serverTransactionMap = new Map();
          serverTransactions.forEach(t => {
            const key = t.description;
            if (!serverTransactionMap.has(key)) {
              serverTransactionMap.set(key, []);
            }
            serverTransactionMap.get(key).push(t);
          });
          
          // Pembersihan optimistic updates yang tersisa dari UI
          // Copy transaksi saat ini
          const currentTransactions = [...transactions];
          
          // Hapus semua transaksi optimistic yang sudah terkonfirmasi
          const cleanedTransactions = currentTransactions.filter(t => 
            !t._optimistic || !confirmedDescriptions.includes(t.description)
          );
          
          // Tambahkan transaksi server untuk yang sudah terkonfirmasi
          confirmedDescriptions.forEach(desc => {
            if (serverTransactionMap.has(desc)) {
              // Temukan indeks untuk menambahkan transaksi ini
              const index = currentTransactions.findIndex(t => t.description === desc);
              if (index !== -1) {
                // Hapus di posisi ini dan tambahkan transaksi server
                cleanedTransactions.splice(index, 0, ...serverTransactionMap.get(desc));
              } else {
                // Jika tidak ditemukan, tambahkan di akhir
                cleanedTransactions.push(...serverTransactionMap.get(desc));
              }
            }
          });
          
          // Update UI
          onTransactionsChange(cleanedTransactions);
        } else if (Date.now() - optimisticUpdates[0]?.timestamp > 8000) {
          // Jika sudah lebih dari 8 detik dan belum ada konfirmasi, 
          // mungkin update gagal. Clear flag dan update UI
          console.log("No confirmation after extended timeout, clearing optimistic updates");
          setAwaitingServerConfirmation(false);
          setOptimisticUpdates([]);
          onTransactionsChange(serverTransactions);
        } else {
          // Masih dalam window waktu, tetap pertahankan optimistic updates
          console.log("Still within time window, keeping optimistic updates");
          
          // Jadwalkan pemeriksaan lagi dengan interval yang meningkat
          const nextCheckDelay = Math.min(
            2000 * Math.log(1 + (Date.now() - optimisticUpdates[0]?.timestamp) / 1000),
            3000
          );
          setTimeout(() => {
            checkServerUpdates();
          }, nextCheckDelay);
        }
        }
      } catch (error) {
      console.error('Error checking server updates:', error);
      // Jika error, reset flag untuk memungkinkan update berikutnya
      setAwaitingServerConfirmation(false);
    }
  };

  // Update the performOptimisticUpdate function to be more stable
  const performOptimisticUpdate = (newTransactionOrTransactions: Transaction | Transaction[]) => {
    // Konversi ke array jika belum
    const newTransactions = Array.isArray(newTransactionOrTransactions) 
      ? newTransactionOrTransactions 
      : [newTransactionOrTransactions];
    
    if (newTransactions.length === 0) return false;
    
    // Timestamp untuk tracking
    const timestamp = Date.now();
    const operationId = `temp-${timestamp}`;
    
    // Tentukan deskripsi target yang sedang diedit
    const targetDescription = editingTransactions.length > 0
      ? editingTransactions[0].description
      : newTransactions[0].description; // Untuk kasus input baru dari JurnalForm
    
    // Buat salinan transaksi saat ini
    const currentTransactions = [...transactions];
    
    // Persiapkan optimistic transactions yang telah ditandai
    const optimisticTransactions = newTransactions.map((t, idx) => ({
      ...t,
      id: t.id && !t.id.startsWith('temp-') ? t.id : `${operationId}-${idx}`,
      _optimistic: true,
      _timestamp: timestamp
    }));

    let updatedTransactions = [];
    
    // Jika ini update untuk transaksi yang sudah ada
    if (targetDescription && editingTransactions.length > 0) {
      // Temukan indeks grup di array
      const firstIndex = currentTransactions.findIndex(
        t => t.description === targetDescription
      );
      
      if (firstIndex !== -1) {
        // Buat salinan array dan hapus transaksi lama
        const filteredTransactions = currentTransactions.filter(
          t => t.description !== targetDescription
        );
        
        // Sisipkan transaksi baru pada posisi yang sama
        filteredTransactions.splice(firstIndex, 0, ...optimisticTransactions);
        updatedTransactions = filteredTransactions;
        
        // Simpan optimistic update dalam state untuk referensi
        setOptimisticUpdates(prev => [
          ...prev.filter(u => u.description !== targetDescription),
          {
            description: optimisticTransactions[0].description,
            timestamp,
            transactions: optimisticTransactions
          }
        ]);
      } else {
        // Jika target tidak ditemukan, tambahkan di akhir
        updatedTransactions = [...currentTransactions, ...optimisticTransactions];
        
        // Simpan optimistic update dalam state
        setOptimisticUpdates(prev => [
          ...prev,
          {
            description: optimisticTransactions[0].description,
            timestamp,
            transactions: optimisticTransactions
          }
        ]);
      }
    } else {
      // Untuk kasus transaksi baru, periksa apakah ada transaksi dengan deskripsi yang sama
      const existingIndex = currentTransactions.findIndex(
        t => t.description === newTransactions[0].description
      );
      
      if (existingIndex !== -1) {
        // Jika deskripsi sudah ada, ini mungkin update dari transaksi yang sudah ada
        // Hapus transaksi lama
        const filteredTransactions = currentTransactions.filter(
          t => t.description !== newTransactions[0].description
        );
        
        // Sisipkan transaksi baru pada posisi yang sama
        filteredTransactions.splice(existingIndex, 0, ...optimisticTransactions);
        updatedTransactions = filteredTransactions;
      } else {
        // Benar-benar transaksi baru
        updatedTransactions = [...currentTransactions, ...optimisticTransactions];
      }
      
      // Simpan optimistic update dalam state
      setOptimisticUpdates(prev => [
        ...prev.filter(u => u.description !== newTransactions[0].description),
        {
          description: optimisticTransactions[0].description,
          timestamp,
          transactions: optimisticTransactions
        }
      ]);
    }
    
    // Temporarily disable server fetches to prevent the UI from flickering
    setDisableServerFetch(true);
    
    // Set flag untuk menunggu konfirmasi server
    setAwaitingServerConfirmation(true);
    
    // Update state
    onTransactionsChange(updatedTransactions);
    
    // For a smoother experience, don't fetch data automatically for a while
    // This gives time for the backend to process before we try to fetch latest data
    setTimeout(() => {
      setDisableServerFetch(false);
    }, 3000); // Keep disabled for 3 seconds
    
    return true;
  };

  // Also update the handleJurnalFormSubmit to better manage the state transitions
  const handleJurnalFormSubmit = async (newTransactionOrTransactions: Transaction | Transaction[]) => {
    // Tutup form dulu
    setIsJurnalFormOpen(false);
    
    // Track description for coloring
    const transactions = Array.isArray(newTransactionOrTransactions) 
      ? newTransactionOrTransactions 
      : [newTransactionOrTransactions];

    if (transactions.length > 0) {
      const eventDescription = transactions[0].description;
      
      // Clear all previous highlights and set only the current one
      setHighlightedEvents(new Set([eventDescription]));
      
      // Perform optimistic update for immediate UI feedback
      performOptimisticUpdate(newTransactionOrTransactions);
      
      // Instead of making immediate API call and causing flickering,
      // use a background invalidation without immediate refetch
      queryClient.invalidateQueries({ 
        queryKey: ['jurnal'],
        // Don't refetch immediately - we'll let the optimistic update show first
        refetchType: 'none'
      });
      
      // After a reasonable delay, allow the server to refresh data
      // but only if the user hasn't done any other actions
      setTimeout(() => {
        if (highlightedEvents.has(eventDescription)) {
          // Only re-enable server fetch if this is still the highlighted event
          setDisableServerFetch(false);
        }
      }, 2000);
    }
  };

  // Pastikan handleJurnalFormClosing tidak mereset refreshingRows terlalu cepat
  const handleJurnalFormClosing = () => {
    setIsJurnalFormOpen(false);
    setEditingTransactions([]);
    
    // Jangan reset refreshingRows di sini, biarkan fetchLatestData menanganinya
    // Jangan panggil fetchLatestData di sini jika form ditutup tanpa submit
  };

  // Tambahkan cleanup handler yang akan dijalankan saat component unmount
  useEffect(() => {
    return () => {
      // Cleanup saat component unmount
      setRefreshingRows([]);
      setUpdatingTransaction(null);
    };
  }, []);

  // Perbaiki useEffect untuk initial data load - tambahkan logging lebih detail
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Starting initial data load...");
      setIsInitialLoading(true);
      
      try {
        console.log("Loading initial jurnal data...");
        const response = await axios.get('/mahasiswa/jurnal');
        console.log("Initial jurnal response status:", response.status);
        console.log("Initial jurnal response data:", response.data);
        
        if (response.data.success) {
          const jurnalData = response.data.data;
          console.log("Jurnal data before formatting:", jurnalData);
          
          const formattedTransactions = formatJurnalResponse(jurnalData);
          console.log("Initial transactions formatted:", formattedTransactions);
          
          // Update state
          onTransactionsChange(formattedTransactions);
          console.log("Transactions state updated");
        } else {
          console.error("Initial load returned success: false");
        }
      } catch (error) {
        console.error("Error during initial data load:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data jurnal awal"
        });
      } finally {
        console.log("Setting isInitialLoading to false");
        setIsInitialLoading(false);
        setHasAttemptedInitialLoad(true);
      }
    };
    
    loadInitialData();
  }, []);

  // Fungsi helper untuk parsing tanggal dari berbagai format
  const parseDate = (dateString: string): Date => {
    console.log("Parsing date:", dateString);
    
    // Jika dateString kosong, kembalikan tanggal sekarang
    if (!dateString) return new Date();
    
    let parsedDate: Date;
    
    // Format ISO (YYYY-MM-DD)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      parsedDate = new Date(year, month - 1, day);
    } 
    // Format DD/MM/YYYY
    else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/').map(Number);
      parsedDate = new Date(year, month - 1, day);
    }
    // Format YYYY/MM/DD
    else if (dateString.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
      const [year, month, day] = dateString.split('/').map(Number);
      parsedDate = new Date(year, month - 1, day);
    }
    // Coba dengan Date constructor jika format lain
    else {
      parsedDate = new Date(dateString);
    }
    
    // Validasi hasil parsing
    if (isNaN(parsedDate.getTime())) {
      console.error("Invalid date parsed:", dateString);
      return new Date(); // Fallback ke tanggal sekarang
    }
    
    console.log("Date parsed as:", parsedDate.toISOString());
    return parsedDate;
  };

  // Perbaiki formatDate untuk menampilkan dengan konsisten di UI
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = parseDate(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString; // Kembalikan string asli jika gagal
    }
  };

  // Update confirmDelete to clear highlights for deleted events
  const confirmDelete = async () => {
    if (!transactionToDelete || transactionToDelete.length === 0) {
      setShowDeleteAlert(false);
      return;
    }
    
    // Ambil description dari transaksi yang akan dihapus
    const targetDescription = transactionToDelete[0].description;
    console.log(`Deleting transactions with description: ${targetDescription}`);
    
    // Tutup dialog konfirmasi
    setShowDeleteAlert(false);
    
    // Lakukan optimistic delete - hapus dari UI dulu
    const currentTransactions = [...transactions];
    const remainingTransactions = currentTransactions.filter(
      t => t.description !== targetDescription
    );
    
    // Update UI untuk menghapus transaksi secara optimistic
    onTransactionsChange(remainingTransactions);
    
    try {
      // Kumpulkan semua ID yang valid untuk dihapus
      const transactionIds = transactionToDelete
        .filter(t => t.id && !t.id.startsWith('temp-'))
        .map(t => t.id);
      
      console.log(`Deleting ${transactionIds.length} transactions from server`);
      
      // Panggil API delete untuk setiap ID
      if (transactionIds.length > 0) {
        await Promise.all(transactionIds.map(id => deleteJurnal(id)));
        console.log("Delete API calls completed successfully");
      }
      
      // Refresh data di background
      queryClient.invalidateQueries({ queryKey: ['jurnal'] });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus data"
      });
      
      // Kembalikan data asli jika gagal
      await fetchLatestData();
    }

    // Clean up highlight state when deleting an event
    setHighlightedEvents(prev => {
      const updated = new Set(prev);
      updated.delete(targetDescription);
      return updated;
    });
  };

  // Tambahkan useEffect untuk fetching data sub akun
  useEffect(() => {
    const fetchSubAkun = async () => {
      try {
        console.log("Fetching sub akun data...");
        const response = await axios.get('/mahasiswa/subakun');
        console.log("Sub akun response:", response.data);
        
        if (response.data.success) {
          setSubAkunList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching sub akun data:", error);
      }
    };
    
    fetchSubAkun();
  }, []); // Fetch sekali saat komponen dimount

  // Update renderTableRow to use yellow highlighting
  const renderTableRow = (transaction: Transaction, index: number, array: Transaction[]) => {
    const isFirstInGroup = index === 0 || transaction.description !== array[index - 1].description;
    const isPartOfGroup = index > 0 && transaction.description === array[index - 1].description;
    const groupTransactions = array.filter(t => t.description === transaction.description);
    
    // Get proper kode and nama based on sub_akun_id
    let displayKodeAkun = transaction.kodeAkun;
    let displayNamaAkun = transaction.namaAkun;

    console.log("Transaction sub_akun_id:", transaction.sub_akun_id);
    console.log("Available subAkuns:", subAkunList);

    // Jika transaction memiliki sub_akun_id, cari kode dan nama dari subAkunList
    if (transaction.sub_akun_id && subAkunList && subAkunList.length > 0) {
      const subAkun = subAkunList.find(sa => sa.id === transaction.sub_akun_id);
      if (subAkun) {
        console.log("Found matching subAkun:", subAkun);
        displayKodeAkun = subAkun.kode; // Gunakan kode sub akun, misal 2111.1
        displayNamaAkun = subAkun.nama;  // Gunakan nama sub akun
      } else {
        console.log("No matching subAkun found for id:", transaction.sub_akun_id);
      }
    } else {
      console.log("No sub_akun_id or subAkunList is empty");
    }

    // Check if this event is highlighted
    const isHighlighted = highlightedEvents.has(transaction.description);
    
    // Change color to yellow for highlighted rows
    const rowBgClass = isHighlighted 
      ? 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400' 
      : 'bg-white hover:bg-gray-50';

    return (
      <TableRow 
        key={`tr-${transaction.id || index}-${Date.now()}`}
        data-description={transaction.description}
        className={rowBgClass}
      >
        <TableCell>{isFirstInGroup ? formatDate(transaction.date) : ''}</TableCell>
        <TableCell>{isFirstInGroup ? transaction.documentType : ''}</TableCell>
        <TableCell>{isFirstInGroup ? transaction.description : ''}</TableCell>
        <TableCell>{displayKodeAkun}</TableCell>
        <TableCell>{displayNamaAkun}</TableCell>
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

  // Add a function to clear all highlights
  const clearAllHighlights = () => {
    setHighlightedEvents(new Set());
  };

  // Pastikan semua kode kondisional berada di bawah hooks
  if (isLoading || localLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

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

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading jurnal data...</p>
        </div>
      </div>
    );
  }

  if (hasAttemptedInitialLoad && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <p className="text-xl font-medium">Jurnal Kosong</p>
          <p className="text-gray-500 mt-2">Belum ada transaksi jurnal yang dibuat.</p>
        </div>
        <Button 
          onClick={() => setIsJurnalFormOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi Pertama
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 p-6 rounded-xl relative">
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
        <Table className="relative">
        <TableHeader>
          <TableRow>
              <TableHead>Tanggal</TableHead>
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

      {highlightedEvents.size > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 p-2 bg-white border rounded-lg">
          <div className="flex items-center gap-4">
            <span className="font-medium">Keterangan:</span>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-yellow-50 border-l-2 border-yellow-400 mr-1"></div>
              <span>Transaksi yang ditambah/diperbarui pada sesi ini</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllHighlights}
            className="text-xs"
          >
            Hapus penanda
          </Button>
        </div>
      )}

      <JurnalForm
        isOpen={isJurnalFormOpen}
        onClose={handleJurnalFormClosing}
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