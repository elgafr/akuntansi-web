import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { X, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAccounts } from "@/contexts/AccountContext";

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
        debit: string | number;
        kredit: string | number;
    }[];
}

interface AddTransactionFormProps {
    accounts: Account[];
    onSave: (data: Transaction) => void;
    onCancel: () => void;
}

const STORAGE_KEY = 'pending-transactions';

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ accounts, onSave, onCancel }) => {
    const { accounts: contextAccounts } = useAccounts();
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const savedTransactions = localStorage.getItem(STORAGE_KEY);
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    });
    const [date, setDate] = useState<string>("");
    const [documentType, setDocumentType] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [namaAkun, setNamaAkun] = useState<string>("");
    const [kodeAkun, setKodeAkun] = useState<string>("");
    const [debit, setDebit] = useState<string>("");
    const [kredit, setKredit] = useState<string>("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }, [transactions]);

    const resetForm = () => {
        setDate("");
        setDocumentType("");
        setDescription("");
        setNamaAkun("");
        setKodeAkun("");
        setDebit("");
        setKredit("");
        setEditingIndex(null);
    };

    const clearAllData = () => {
        setTransactions([]);
        localStorage.removeItem(STORAGE_KEY);
        resetForm();
    };

    const handleDebitChange = (value: string) => {
        const numValue = parseFloat(value) || 0;
        setDebit(value);
        if (numValue > 0) {
            setKredit("");
        }
    };

    const handleKreditChange = (value: string) => {
        const numValue = parseFloat(value) || 0;
        setKredit(value);
        if (numValue > 0) {
            setDebit("");
        }
    };

    const handleAddTransaction = () => {
        // Validasi data minimal yang diperlukan
        if (!date || !namaAkun || !kodeAkun || (!debit && !kredit)) return;

        const newTransaction: Transaction = {
            date,
            documentType,
            description,
            namaAkun,
            kodeAkun,
            debit: parseFloat(debit) || 0,
            kredit: parseFloat(kredit) || 0,
        };

        if (editingIndex !== null) {
            const updatedTransactions = [...transactions];
            updatedTransactions[editingIndex] = newTransaction;
            setTransactions(updatedTransactions);
        } else {
            setTransactions([...transactions, newTransaction]);
        }

        // Reset form setelah menambah transaksi
        resetForm();
    };

    const handleEdit = (index: number) => {
        const transaction = transactions[index];
        setDate(transaction.date);
        setDocumentType(transaction.documentType);
        setDescription(transaction.description);
        setNamaAkun(transaction.namaAkun);
        setKodeAkun(transaction.kodeAkun);
        setDebit(transaction.debit.toString());
        setKredit(transaction.kredit.toString());
        setEditingIndex(index);
    };

    const handleSubmit = () => {
        // Kirim semua transaksi yang ada di ringkasan
        transactions.forEach(transaction => {
            onSave(transaction);
        });
        
        // Clear ringkasan setelah submit
        clearAllData();
        onCancel();
    };

    const handleDeleteTransaction = (index: number) => {
        setTransactions(transactions.filter((_, i) => i !== index));
        if (editingIndex === index) {
            resetForm();
        }
    };

    const isDebitDisabled = parseFloat(kredit) > 0;
    const isKreditDisabled = parseFloat(debit) > 0;

    const getAllAccounts = () => {
        return contextAccounts.map(account => {
            if (!account.parentId) {
                return {
                    kodeAkun: account.kodeAkun,
                    namaAkun: account.namaAkun
                };
            }
            return {
                kodeAkun: account.subKodeAkun || '',
                namaAkun: account.subNamaAkun || ''
            };
        }).filter(acc => acc.kodeAkun && acc.namaAkun);
    };

    const handleAccountSelect = (field: 'namaAkun' | 'kodeAkun', value: string) => {
        const allAccounts = getAllAccounts();
        const selectedAccount = field === 'namaAkun'
            ? allAccounts.find(acc => acc.namaAkun === value)
            : allAccounts.find(acc => acc.kodeAkun === value);

        if (!selectedAccount) return;

        setNamaAkun(selectedAccount.namaAkun);
        setKodeAkun(selectedAccount.kodeAkun);
    };

    // Transform accounts into options
    const accountOptions = (accounts || []).flatMap(account => {
        // Add main account option
        const options = [{
            label: `${account.namaAkun} (${account.kodeAkun})`,
            value: account.kodeAkun,
            debit: account.debit,
            kredit: account.kredit
        }];
        
        // Add sub account options
        if (account.subAccounts?.length) {
            account.subAccounts.forEach(sub => {
                options.push({
                    label: `${sub.namaSubAkun} (${sub.kodeAkunInduk},${sub.kodeSubAkun})`,
                    value: `${sub.kodeAkunInduk},${sub.kodeSubAkun}`,
                    debit: typeof sub.debit === 'string' ? parseFloat(sub.debit) : sub.debit,
                    kredit: typeof sub.kredit === 'string' ? parseFloat(sub.kredit) : sub.kredit
                });
            });
        }
        return options;
    });

    return (
        <div className="rounded-xl flex flex-col md:flex-row gap-6 bg-background mx-auto">
            {/* Form Section - make narrower */}
            <Card className="flex-1 min-w-[400px] max-w-[400px]">
                <CardHeader className="sticky top-0 z-10 bg-background pt-4 pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-semibold text-primary">
                            {editingIndex !== null ? 'Edit Transaksi' : 'Tambah Transaksi'}
                        </CardTitle>
                    </div>
                </CardHeader>
                <ScrollArea className="h-[calc(80vh-180px)]">
                    <CardContent className="space-y-4 p-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="documentType">Jenis Bukti</Label>
                            <Input
                                id="documentType"
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                placeholder="Masukkan jenis bukti"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Keterangan</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Masukkan keterangan"
                            />
                        </div>

                        
                            
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="namaAkun">Nama Akun</Label>
                                    <Select
                                        value={namaAkun}
                                        onValueChange={(value) => handleAccountSelect('namaAkun', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Nama Akun" />
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kodeAkun">Kode Akun</Label>
                                    <Select
                                        value={kodeAkun}
                                        onValueChange={(value) => handleAccountSelect('kodeAkun', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Kode Akun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getAllAccounts().map((account) => (
                                                <SelectItem 
                                                    key={account.kodeAkun} 
                                                    value={account.kodeAkun}
                                                >
                                                    {account.kodeAkun}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="debit">Debit</Label>
                                    <Input
                                        id="debit"
                                        type="number"
                                        value={debit}
                                        onChange={(e) => handleDebitChange(e.target.value)}
                                        placeholder="Masukkan debit"
                                        disabled={isDebitDisabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kredit">Kredit</Label>
                                    <Input
                                        id="kredit"
                                        type="number"
                                        value={kredit}
                                        onChange={(e) => handleKreditChange(e.target.value)}
                                        placeholder="Masukkan kredit"
                                        disabled={isKreditDisabled}
                                    />
                                </div>
                            </div>
                        
                    </CardContent>
                </ScrollArea>
                <CardFooter className="border-t bg-background p-4">
                    <div className="flex justify-between w-full gap-2">
                        <Button variant="outline" onClick={resetForm}>Reset</Button>
                        <Button 
                            onClick={handleAddTransaction}
                            disabled={!date || !namaAkun || !kodeAkun || (!debit && !kredit)}
                        >
                            Tambah Transaksi
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Summary Section - will take remaining space */}
            <Card className="flex-[2]">
                <CardHeader className="sticky top-0 z-10 bg-background pt-4 pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-semibold text-primary">Ringkasan</CardTitle>
                        <Button variant="destructive" size="sm" onClick={clearAllData}>
                            Hapus Semua
                        </Button>
                    </div>
                </CardHeader>
                <ScrollArea className="h-[calc(80vh-180px)]">
                    <CardContent className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Tanggal</TableHead>
                                    <TableHead>Bukti</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Nama Akun</TableHead>
                                    <TableHead>Kode</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Kredit</TableHead>
                                    <TableHead className="w-[100px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{transaction.date}</TableCell>
                                        <TableCell>{transaction.documentType}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>{transaction.namaAkun}</TableCell>
                                        <TableCell>{transaction.kodeAkun}</TableCell>
                                        <TableCell className="text-right">
                                            {transaction.debit.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {transaction.kredit.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(index)}
                                                >
                                                    <Pencil className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteTransaction(index)}
                                                >
                                                    <X className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </ScrollArea>
                <CardFooter className="border-t bg-background p-4">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onCancel}>
                            Batal
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={transactions.length === 0}
                        >
                            Tambah ke Jurnal Umum
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};