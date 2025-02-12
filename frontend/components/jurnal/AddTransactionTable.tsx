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
} from "@/components/ui/select";
import { useTransactions } from "@/contexts/TransactionContext";
import Papa from 'papaparse';
import { AddTransactionForm } from "./AddTransactionForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface Transaction {
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
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

  // Template for new empty transaction
  const emptyTransaction: Transaction = {
    date: "",
    documentType: "",
    description: "",
    namaAkun: "",
    kodeAkun: "",
    debit: 0,
    kredit: 0,
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

  const handleDelete = (index: number, isNewRow: boolean) => {
    if (isNewRow) {
      setNewTransactions(newTransactions.filter((_, i) => i !== index));
    } else {
      onTransactionsChange(transactions.filter((_, i) => i !== index));
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
  const handleInlineEdit = (index: number) => {
    const transaction = transactions[index];
    setInlineEditIndex(index);
    setInlineEditData(transaction);
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
            onClick={() => setIsFormModalOpen(true)}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Add Acc
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
                    value={transaction.kodeAkun || undefined}
                    onValueChange={(value) => handleAccountSelect(index, 'kodeAkun', value, true)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Kode" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllAccounts().map((account) => (
                        <SelectItem 
                          key={account.kodeAkun} 
                          value={account.kodeAkun}
                          className={!account.kodeAkun.includes(',') ? 'font-semibold' : 'pl-4'}
                        >
                          {account.kodeAkun}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={transaction.namaAkun || undefined}
                    onValueChange={(value) => handleAccountSelect(index, 'namaAkun', value, true)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Nama Akun" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllAccounts().map((account) => (
                        <SelectItem 
                          key={account.kodeAkun} 
                          value={account.namaAkun}
                          className="hover:bg-gray-100 cursor-pointer font-normal"
                        >
                          {account.namaAkun}
                        </SelectItem>
                      ))}
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
                      onClick={() => handleDelete(index, true)}
                      className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Existing Transactions */}
            {currentTransactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>
                  {inlineEditIndex === index ? (
                    <Input
                      type="date"
                      value={inlineEditData?.date}
                      onChange={(e) => setInlineEditData({
                        ...inlineEditData!,
                        date: e.target.value
                      })}
                    />
                  ) : transaction.date}
                </TableCell>
                <TableCell>
                  {inlineEditIndex === index ? (
                    <Input
                      value={inlineEditData?.documentType}
                      onChange={(e) => setInlineEditData({
                        ...inlineEditData!,
                        documentType: e.target.value
                      })}
                    />
                  ) : transaction.documentType}
                </TableCell>
                <TableCell>
                  {inlineEditIndex === index ? (
                    <Input
                      value={inlineEditData?.description}
                      onChange={(e) => setInlineEditData({
                        ...inlineEditData!,
                        description: e.target.value
                      })}
                    />
                  ) : transaction.description}
                </TableCell>
                <TableCell>
                  {inlineEditIndex === index ? (
                    <Select
                      value={inlineEditData?.kodeAkun || transaction.kodeAkun}
                      onValueChange={(value) => {
                          const account = getAllAccounts().find(acc => acc.kodeAkun === value);
                          if (account) {
                              setInlineEditData({
                                  ...inlineEditData!,
                                  kodeAkun: value,
                                  namaAkun: account.namaAkun
                              });
                          }
                      }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Kode Akun">
                                {inlineEditData?.kodeAkun || transaction.kodeAkun}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {getAllAccounts().map((account) => (
                                <SelectItem 
                                    key={account.kodeAkun} 
                                    value={account.kodeAkun}
                                    className="hover:bg-gray-100 cursor-pointer font-normal"
                                >
                                    {account.kodeAkun}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  ) : transaction.kodeAkun}
                </TableCell>
                <TableCell>
                  {inlineEditIndex === index ? (
                    <Select
                      value={inlineEditData?.namaAkun || transaction.namaAkun}
                      onValueChange={(value) => {
                          const account = getAllAccounts().find(acc => acc.namaAkun === value);
                          if (account) {
                              setInlineEditData({
                                  ...inlineEditData!,
                                  namaAkun: value,
                                  kodeAkun: account.kodeAkun
                              });
                          }
                      }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Nama Akun">
                                {inlineEditData?.namaAkun || transaction.namaAkun}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {getAllAccounts().map((account) => (
                                <SelectItem 
                                    key={account.kodeAkun} 
                                    value={account.namaAkun}
                                    className="hover:bg-gray-100 cursor-pointer font-normal"
                                >
                                    {account.namaAkun}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  ) : transaction.namaAkun}
                </TableCell>
                <TableCell>
                  {inlineEditIndex === index ? (
                    <Input
                      type="number"
                      value={inlineEditData?.debit}
                      onChange={(e) => setInlineEditData({
                        ...inlineEditData!,
                        debit: parseFloat(e.target.value) || 0,
                        kredit: 0 // Reset kredit saat debit diisi
                      })}
                      className="w-32 text-right"
                      disabled={!isEffectivelyZero(inlineEditData?.kredit)}
                    />
                  ) : transaction.debit.toLocaleString()}
                </TableCell>
                <TableCell>
                  {inlineEditIndex === index ? (
                    <Input
                      type="number"
                      value={inlineEditData?.kredit}
                      onChange={(e) => setInlineEditData({
                        ...inlineEditData!,
                        kredit: parseFloat(e.target.value) || 0,
                        debit: 0 // Reset debit saat kredit diisi
                      })}
                      className="w-32 text-right"
                      disabled={!isEffectivelyZero(inlineEditData?.debit)}
                    />
                  ) : transaction.kredit.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {inlineEditIndex === index ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleInlineSave(index)}
                        className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleInlineEdit(index)}
                        className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(index, false)}
                      className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[1080px] p-6 !rounded-2xl overflow-hidden border">
          <DialogTitle className="text-xl font-semibold mb-4">
            Tambah Transaksi Baru
          </DialogTitle>
          <AddTransactionForm
            accounts={accounts}
            onSave={(formTransactions) => {
              // Validasi total debit dan kredit
              const totalDebit = formTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
              const totalKredit = formTransactions.reduce((sum, t) => sum + (t.kredit || 0), 0);

              if (totalDebit !== totalKredit) {
                alert("Total debit dan kredit harus sama sebelum ditambahkan ke jurnal umum");
                return;
              }

              // Jika valid, tambahkan ke jurnal umum
              onTransactionsChange([...transactions, ...formTransactions]);
              setIsFormModalOpen(false);
            }}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 