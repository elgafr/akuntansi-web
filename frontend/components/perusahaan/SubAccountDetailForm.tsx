"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, X } from "lucide-react";

interface SubAccountFormData {
  namaSubAkun: string;
  kodeAkunInduk: string;
  kodeSubAkun: string;
  debit: string;
  kredit: string;
}

interface MainAccount {
  namaAkun: string;
  kodeAkun: string;
  debit: string;
  kredit: string;
}

export function SubAccountDetailModal({
  onClose,
  onSave,
  mainAccount,
}: {
  onClose: () => void;
  onSave: (data: {
    mainAccount: MainAccount;
    subAccounts: SubAccountFormData[];
  }) => void;
  mainAccount: MainAccount;
}) {
  const [subAccounts, setSubAccounts] = useState<SubAccountFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [subAccountForm, setSubAccountForm] = useState<SubAccountFormData>({
    namaSubAkun: "",
    kodeAkunInduk: mainAccount.kodeAkun,
    kodeSubAkun: "0",
    debit: "",
    kredit: "",
  });

  const handleAddOrUpdateSubAccount = () => {
    if (editingIndex !== null) {
      // Update existing sub account
      const updatedSubAccounts = [...subAccounts];
      updatedSubAccounts[editingIndex] = subAccountForm;
      setSubAccounts(updatedSubAccounts);
      resetSubAccountForm();
    } else {
      // Add new sub account
      setSubAccounts([...subAccounts, subAccountForm]);
      resetSubAccountForm();
    }
  };

  const resetSubAccountForm = () => {
    setSubAccountForm({
      namaSubAkun: "",
      kodeAkunInduk: mainAccount.kodeAkun,
      kodeSubAkun: "0",
      debit: "",
      kredit: "",
    });
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    const subAccount = subAccounts[index];
    setSubAccountForm(subAccount);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setSubAccounts(subAccounts.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetSubAccountForm();
    }
  };

  const getTotals = () => {
    return subAccounts.reduce(
      (acc, curr) => ({
        debit: acc.debit + (parseFloat(curr.debit) || 0),
        kredit: acc.kredit + (parseFloat(curr.kredit) || 0),
      }),
      { debit: 0, kredit: 0 },
    );
  };

  return (
    <div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="space-y-6 border-b pb-6">
            <div className="space-y-2">
              <label className="text-primary text-lg">Akun Utama</label>
              <Input
                value={mainAccount.namaAkun}
                disabled
                className="rounded-xl h-12 text-gray-500 text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-primary text-lg">Nama Sub Akun</label>
              <Input
                value={subAccountForm.namaSubAkun}
                onChange={(e) =>
                  setSubAccountForm({
                    ...subAccountForm,
                    namaSubAkun: e.target.value,
                  })
                }
                className="rounded-xl h-12 text-gray-500 text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-primary text-lg">Kode Sub Akun</label>
              <Input
                value={`${mainAccount.kodeAkun},${subAccountForm.kodeSubAkun}`}
                onChange={(e) => {
                  const value = e.target.value;
                  // Hanya ambil angka setelah koma
                  const parts = value.split(',');
                  if (parts.length > 1 && /^\d+$/.test(parts[1])) {
                    setSubAccountForm({
                      ...subAccountForm,
                      kodeSubAkun: parts[1],
                      kodeAkunInduk: mainAccount.kodeAkun
                    });
                  }
                }}
                className="rounded-xl h-12 text-gray-500 text-base"
                type="text"
                placeholder={`${mainAccount.kodeAkun},00`}
              />
              <p className="text-xs text-gray-500">
                *Format: kode akun induk,sub akun (contoh: {mainAccount.kodeAkun},001)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-primary text-lg">Debit</label>
                <Input
                  value={subAccountForm.debit}
                  onChange={(e) =>
                    setSubAccountForm({
                      ...subAccountForm,
                      debit: e.target.value,
                      kredit: "",
                    })
                  }
                  className="rounded-xl h-12 text-gray-500 text-base"
                  type="number"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-primary text-lg">Kredit</label>
                <Input
                  value={subAccountForm.kredit}
                  onChange={(e) =>
                    setSubAccountForm({
                      ...subAccountForm,
                      kredit: e.target.value,
                      debit: "",
                    })
                  }
                  className="rounded-xl h-12 text-gray-500 text-base"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <Button
              className="w-full rounded-xl h-12"
              onClick={handleAddOrUpdateSubAccount}
            >
              {editingIndex !== null ? "Update Sub Akun" : "Tambah Sub Akun"}
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="flex-[2]">
          <CardHeader className="sticky top-0 z-10 bg-background pt-4 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-primary">
                Ringkasan
              </CardTitle>
            </div>
          </CardHeader>
          <ScrollArea className="h-[calc(80vh-180px)]">
            <CardContent className="p-4 space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Sub Akun</TableHead>
                    <TableHead>Nama Sub Akun</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Kredit</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subAccounts.map((subAccount, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {`${subAccount.kodeAkunInduk},${subAccount.kodeSubAkun}`}
                      </TableCell>
                      <TableCell>{subAccount.namaSubAkun}</TableCell>
                      <TableCell className="text-right">
                        {parseFloat(subAccount.debit || "0").toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(
                          subAccount.kredit || "0",
                        ).toLocaleString()}
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
                            onClick={() => handleDelete(index)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals Section */}
              {subAccounts.length > 0 && (
                <div className="border-t pt-4">
                  <Table>
                    <TableBody>
                      <TableRow className="font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="text-right">
                          {getTotals().debit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {getTotals().kredit.toLocaleString()}
                        </TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </ScrollArea>
          <CardFooter className="border-t bg-background p-4">
            <Button
              className="w-full"
              onClick={() => {
                if (subAccounts.length === 0) {
                  alert("Harap tambahkan minimal satu sub akun");
                  return;
                }

                // Validate sub account codes are unique
                const codes = subAccounts.map((sa) => sa.kodeSubAkun);
                if (new Set(codes).size !== codes.length) {
                  alert("Kode sub akun harus unik");
                  return;
                }

                onSave({
                  mainAccount,
                  subAccounts,
                });
              }}
            >
              Simpan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}