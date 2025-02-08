"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Save, Trash2, Plus, Pencil, X, Download, Upload, Moon } from "lucide-react";
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
  const { setTransactions } = useTransactions();
  const [search, setSearch] = useState("");
  const [newTransactions, setNewTransactions] = useState<Transaction[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

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

  // Update fungsi getAllAccounts untuk menampilkan akun utama dan sub akun
  const getAllAccounts = () => {
    const allAccounts: { kodeAkun: string; namaAkun: string }[] = [];

    if (!accounts) return allAccounts;

    accounts.forEach(account => {
      // Tambahkan akun utama
      allAccounts.push({
        kodeAkun: account.kodeAkun,
        namaAkun: `${account.namaAkun} (${account.kodeAkun})`
      });

      // Tambahkan sub akun jika ada
      if (account.subAccounts && account.subAccounts.length > 0) {
        account.subAccounts.forEach((sub: { 
          namaSubAkun: string;
          kodeAkunInduk: string;
          kodeSubAkun: string;
          debit: number;
          kredit: number;
        }) => {
          const fullKodeAkun = `${sub.kodeAkunInduk},${sub.kodeSubAkun}`;
          allAccounts.push({
            kodeAkun: fullKodeAkun,
            namaAkun: `${sub.namaSubAkun} (${fullKodeAkun})`
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

  // Handle CSV export
  const handleExportCSV = () => {
    const dataToExport = transactions.map(transaction => ({
      Date: transaction.date,
      'Account Code': transaction.kodeAkun,
      'Account Name': transaction.namaAkun,
      Description: transaction.description || '',
      Debit: transaction.debit || 0,
      Credit: transaction.kredit || 0
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV import
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const importedTransactions = results.data
            .filter((row: any) => row.Date)
            .map((row: any) => ({
              date: row.Date,
              documentType: "",
              kodeAkun: row['Account Code'],
              namaAkun: row['Account Name'],
              description: row.Description,
              debit: Number(row.Debit) || 0,
              kredit: Number(row.Credit) || 0
            }));
          onTransactionsChange([...transactions, ...importedTransactions]);
        },
        header: true,
        skipEmptyLines: true
      });
    }
    // Reset file input
    event.target.value = '';
  };

  // Add page size change handler
  const handlePageSizeChange = (value: string) => {
    if (value === 'all') {
      setShowAll(true);
      setPageSize(transactions.length);
    } else {
      setShowAll(false);
      setPageSize(Number(value));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search transactions..."
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
            className="flex items-center gap-2 !rounded-lg"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2 !rounded-lg"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setIsFormModalOpen(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 !rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Bukti</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Nama Akun</TableHead>
            <TableHead>Kode Akun</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Kredit</TableHead>
            <TableHead>Aksi</TableHead>
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
                  value={transaction.namaAkun || undefined}
                  onValueChange={(value) => handleAccountSelect(index, 'namaAkun', value, true)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Akun" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllAccounts().map((account) => (
                      <SelectItem 
                        key={account.kodeAkun} 
                        value={account.namaAkun}
                      >
                        {account.namaAkun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Button variant="default" size="icon" onClick={() => handleSave(index)}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(index, true)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Existing Transactions */}
          {filteredTransactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.documentType}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.namaAkun}</TableCell>
              <TableCell>{transaction.kodeAkun}</TableCell>
              <TableCell>{transaction.debit.toLocaleString()}</TableCell>
              <TableCell>{transaction.kredit.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {editingIndex === index ? (
                    <Button 
                      variant="default" 
                      size="icon"
                      className="bg-emerald-600 hover:bg-emerald-700 !rounded-lg shadow-sm transition-colors"
                      onClick={() => handleUpdate(index)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="hover:border-blue-500 hover:text-blue-500 !rounded-lg shadow-sm transition-colors"
                      onClick={() => handleEdit(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="hover:bg-red-600 !rounded-lg shadow-sm transition-colors"
                    onClick={() => handleDelete(index, false)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[1080px] p-6 !rounded-2xl overflow-hidden border">
          <DialogTitle className="text-xl font-semibold mb-4">
            Tambah Transaksi Baru
          </DialogTitle>
          <AddTransactionForm
            accounts={accounts}
            onSave={(data) => {
              onTransactionsChange([...transactions, data]);
              setIsFormModalOpen(false);
            }}
            onCancel={() => setIsFormModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 