import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { X } from "lucide-react";
import type { Transactions } from "@/components/ui/custom/form-modal/account.config";

export const AddAccountForm = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Transactions[]) => void;
}) => {
  const [accounts, setAccounts] = useState<Transactions[]>([]);
  const [date, setDate] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [namaAkun, setNamaAkun] = useState("");
  const [kodeAkun, setKodeAkun] = useState("");
  const [debit, setDebit] = useState("");
  const [kredit, setKredit] = useState("");

  const handleAddAccount = () => {
    if (!namaAkun || !kodeAkun || !debit || !kredit) return;
    const newAccount: Transactions = {
      namaAkun,
      kodeAkun,
      debit,
      kredit,
    };
    setAccounts([...accounts, newAccount]);
    setNamaAkun("");
    setKodeAkun("");
    setDebit("");
    setKredit("");
  };

  const handleDeleteAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-background rounded-lg mx-auto">
      {/* Form Section */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold text-primary">Tambah Akun</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Jenis Bukti</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis bukti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BKK">BKK</SelectItem>
                <SelectItem value="BKM">BKM</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold text-primary">Detail Akun</h3>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="namaAkun">Nama Akun</Label>
                <Input
                  id="namaAkun"
                  value={namaAkun}
                  onChange={(e) => setNamaAkun(e.target.value)}
                  placeholder="Masukkan nama akun"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kodeAkun">Kode Akun</Label>
                <Input
                  id="kodeAkun"
                  value={kodeAkun}
                  onChange={(e) => setKodeAkun(e.target.value)}
                  placeholder="Masukkan kode akun"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debit">Debit</Label>
                <Input
                  id="debit"
                  value={debit}
                  onChange={(e) => setDebit(e.target.value)}
                  placeholder="Masukkan debit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kredit">Kredit</Label>
                <Input
                  id="kredit"
                  value={kredit}
                  onChange={(e) => setKredit(e.target.value)}
                  placeholder="Masukkan kredit"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setAccounts([])}>
            Reset
          </Button>
          <Button onClick={handleAddAccount}>Tambah Akun</Button>
        </CardFooter>
      </Card>

      {/* Summary Section */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold text-primary">Ringkasan</CardTitle>
            <Button variant="destructive" size="sm" onClick={() => setAccounts([])}>
              Hapus Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Akun</TableHead>
                <TableHead>Kode Akun</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Kredit</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell>{account.namaAkun}</TableCell>
                  <TableCell>{account.kodeAkun}</TableCell>
                  <TableCell>{account.debit}</TableCell>
                  <TableCell>{account.kredit}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAccount(index)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => onSubmit(accounts)}>
            Tambah Ke Jurnal Umum
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};