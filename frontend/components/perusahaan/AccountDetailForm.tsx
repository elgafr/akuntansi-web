"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type definitions
type Transactions = {
  namaAkun: string;
  kodeAkun: string;
  debit: string;
  kredit: string;
  hasSubAccounts: boolean;
  isMainAccountSaved?: boolean;
};

type SubAccountFormData = {
  namaSubAkun: string;
  kodeAkunInduk: string;
  kodeSubAkun: string;
  debit: string;
  kredit: string;
};

export function AccountDetailModal({
  onClose,
  onSave,
  editData,
  isOpen,
}: {
  onClose: () => void;
  onSave: (data: Transactions & { subAccounts: SubAccountFormData[] }) => void;
  editData?: any;
  isOpen: boolean;
}) {
  // Separate state for form input and saved main account data
  const [formData, setFormData] = useState<Transactions>({
    namaAkun: "",
    kodeAkun: "",
    debit: "",
    kredit: "",
    hasSubAccounts: false,
    isMainAccountSaved: false,
  });

  // Change savedMainAccount to an array to store multiple main accounts
  const [savedMainAccounts, setSavedMainAccounts] = useState<Transactions[]>(
    [],
  );

  // Add state to track if we're editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingMainAccountIndex, setEditingMainAccountIndex] = useState<
    number | null
  >(null);

  const resetMainForm = () => {
    // Reset main account form
    setFormData({
      namaAkun: "",
      kodeAkun: "",
      debit: "",
      kredit: "",
      hasSubAccounts: false,
      isMainAccountSaved: false,
    });

    // Reset sub account form completely
    setShowSubAccountForm(false);
    setSubAccountForm({
      namaSubAkun: "",
      kodeAkunInduk: "", // Reset to empty string
      kodeSubAkun: "0",
      debit: "",
      kredit: "",
    });
    setEditingIndex(null);

    // Reset editing states
    setIsEditing(false);
    setEditingMainAccountIndex(null);
  };

  const [showSubAccountForm, setShowSubAccountForm] = useState(false);
  const [subAccounts, setSubAccounts] = useState<SubAccountFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [subAccountForm, setSubAccountForm] = useState<SubAccountFormData>({
    namaSubAkun: "",
    kodeAkunInduk: "",
    kodeSubAkun: "0",
    debit: "",
    kredit: "",
  });

  // Add this function to fill main form with selected account
  const fillMainFormWithAccount = (account: Transactions) => {
    setFormData({
      ...account,
      isMainAccountSaved: true,
    });
  };

  // Update handleSaveMainAccount
  const handleSaveMainAccount = () => {
    if (!formData.namaAkun || !formData.kodeAkun) {
      alert("Nama Akun dan Kode Akun harus diisi");
      return;
    }

    if (isEditing && editingMainAccountIndex !== null) {
      // Get the old account code before updating
      const oldKodeAkun = savedMainAccounts[editingMainAccountIndex].kodeAkun;
      const newKodeAkun = formData.kodeAkun;

      // Update existing account
      const updatedAccounts = [...savedMainAccounts];
      updatedAccounts[editingMainAccountIndex] = { ...formData };
      setSavedMainAccounts(updatedAccounts);

      // Update all sub accounts that belong to this main account
      if (oldKodeAkun !== newKodeAkun) {
        const updatedSubAccounts = subAccounts.map((subAccount) => {
          if (subAccount.kodeAkunInduk === oldKodeAkun) {
            return {
              ...subAccount,
              kodeAkunInduk: newKodeAkun,
            };
          }
          return subAccount;
        });
        setSubAccounts(updatedSubAccounts);
      }

      setIsEditing(false);
      setEditingMainAccountIndex(null);
    } else {
      // Add new account
      setSavedMainAccounts([...savedMainAccounts, { ...formData }]);
      // Reset sub account form with new kodeAkunInduk
      setSubAccountForm((prev) => ({
        ...prev,
        kodeAkunInduk: formData.kodeAkun,
      }));
    }

    setFormData({
      ...formData,
      isMainAccountSaved: true,
    });
  };

  // Update resetSubAccountForm
  const resetSubAccountForm = () => {
    setSubAccountForm({
      namaSubAkun: "",
      // Use the current active main account's code
      kodeAkunInduk: formData.isMainAccountSaved ? formData.kodeAkun : "",
      kodeSubAkun: "0",
      debit: "",
      kredit: "",
    });
    setEditingIndex(null);
  };

  const handleAddOrUpdateSubAccount = () => {
    if (editingIndex !== null) {
      // Update existing sub account
      const updatedSubAccounts = [...subAccounts];
      updatedSubAccounts[editingIndex] = {
        ...subAccountForm,
        kodeAkunInduk: formData.kodeAkun,
      };
      setSubAccounts(updatedSubAccounts);
      resetSubAccountForm();
    } else {
      // Add new sub account
      setSubAccounts([
        ...subAccounts,
        {
          ...subAccountForm,
          kodeAkunInduk: formData.kodeAkun,
        },
      ]);
      resetSubAccountForm();
    }
  };

  const handleEdit = (index: number) => {
    const subAccount = subAccounts[index];
    // Find the parent main account
    const mainAccount = savedMainAccounts.find(
      (acc) => acc.kodeAkun === subAccount.kodeAkunInduk,
    );

    if (mainAccount) {
      // Populate and disable main account form
      setFormData({
        ...mainAccount,
        isMainAccountSaved: true, // Set to true to disable the form
      });
    }

    // Populate sub account form with the selected sub account data
    setSubAccountForm({
      namaSubAkun: subAccount.namaSubAkun,
      kodeAkunInduk: subAccount.kodeAkunInduk,
      kodeSubAkun: subAccount.kodeSubAkun,
      debit: subAccount.debit,
      kredit: subAccount.kredit,
    });

    setEditingIndex(index);
    setShowSubAccountForm(true);
    setIsEditing(false); // Ensure we're not in main account editing mode
  };

  const handleDelete = (index: number) => {
    const newSubAccounts = subAccounts.filter((_, i) => i !== index);
    setSubAccounts(newSubAccounts);
    if (editingIndex === index) {
      resetSubAccountForm();
    }
  };

  // Update handleEditMainAccount
  const handleEditMainAccount = (index: number) => {
    const mainAccount = savedMainAccounts[index];
    setFormData({
      ...mainAccount,
      isMainAccountSaved: false, // Set to false so we can edit main account
    });
    setIsEditing(true);
    setEditingMainAccountIndex(index);

    // Reset sub account form
    setSubAccountForm({
      namaSubAkun: "",
      kodeAkunInduk: mainAccount.kodeAkun,
      kodeSubAkun: "0",
      debit: "",
      kredit: "",
    });
    setEditingIndex(null);
    setShowSubAccountForm(false);
  };

  const handleDeleteMainAccount = (index: number) => {
    const newMainAccounts = savedMainAccounts.filter((_, i) => i !== index);
    setSavedMainAccounts(newMainAccounts);
  };

  // Update getTotals to handle multiple main accounts
  const getTotals = () => {
    const mainAccountsTotals = savedMainAccounts.reduce(
      (acc, curr) => ({
        debit: acc.debit + (parseFloat(curr.debit) || 0),
        kredit: acc.kredit + (parseFloat(curr.kredit) || 0),
      }),
      { debit: 0, kredit: 0 },
    );

    const subTotals = subAccounts.reduce(
      (acc, curr) => ({
        debit: acc.debit + (parseFloat(curr.debit) || 0),
        kredit: acc.kredit + (parseFloat(curr.kredit) || 0),
      }),
      { debit: 0, kredit: 0 },
    );

    return {
      debit: mainAccountsTotals.debit + subTotals.debit,
      kredit: mainAccountsTotals.kredit + subTotals.kredit,
    };
  };

  // Format account code for display
  const getFormattedAccountCode = (mainCode: string, subCode: string = "") => {
    return subCode ? `${mainCode},${subCode}` : mainCode;
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('accountDetailFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSavedMainAccounts(parsedData.mainAccounts || []);
        setSubAccounts(parsedData.subAccounts || []);
        setFormData(parsedData.formData || {
          namaAkun: "",
          kodeAkun: "",
          debit: "",
          kredit: "",
          hasSubAccounts: false,
          isMainAccountSaved: false,
        });
      }
    }
  }, [isOpen]);

  // Save data when modal closes
  useEffect(() => {
    if (!isOpen) {
      const dataToSave = {
        mainAccounts: savedMainAccounts,
        subAccounts: subAccounts,
        formData: formData
      };
      localStorage.setItem('accountDetailFormData', JSON.stringify(dataToSave));
    }
  }, [isOpen, savedMainAccounts, subAccounts, formData]);

  // Update clearAllData to also clear localStorage
  const clearAllData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data?')) {
      setSubAccounts([]);
      setSavedMainAccounts([]);
      resetSubAccountForm();
      setShowSubAccountForm(false);
      resetMainForm();
      localStorage.removeItem('accountDetailFormData');
    }
  };

  // Update handleFinalSave to clear localStorage only after successful save
  const handleFinalSave = () => {
    if (savedMainAccounts.length === 0 && !formData.namaAkun) {
      alert("Harap isi setidaknya satu akun utama");
      return;
    }
    onSave({
      mainAccounts: savedMainAccounts.length > 0 ? savedMainAccounts : [formData],
      subAccounts,
    });
    localStorage.removeItem('accountDetailFormData'); // Hapus draft setelah berhasil disimpan
  };

  // Add helper function to check if a value is effectively zero
  const isEffectivelyZero = (value: string) => {
    return !value || parseFloat(value) === 0;
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Main Account Form */}
          <div className="space-y-6 border-b pb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Form Detail Akun</h3>
              <Button variant="outline" size="sm" onClick={resetMainForm}>
                Reset
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-primary text-lg">Nama Akun</label>
              <Input
                value={formData.namaAkun}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    namaAkun: e.target.value,
                    isMainAccountSaved: false,
                  })
                }
                disabled={formData.isMainAccountSaved}
                className="rounded-xl h-12 text-gray-500 text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-primary text-lg">Kode Akun</label>
              <Input
                value={formData.kodeAkun}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kodeAkun: e.target.value,
                    isMainAccountSaved: false,
                  })
                }
                disabled={formData.isMainAccountSaved}
                className="rounded-xl h-12 text-gray-500 text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-primary text-lg">Debit</label>
                <Input
                  value={formData.debit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      debit: e.target.value,
                      kredit: "", // Reset kredit when debit is entered
                      isMainAccountSaved: false,
                    })
                  }
                  disabled={
                    formData.isMainAccountSaved ||
                    !isEffectivelyZero(formData.kredit)
                  }
                  className="rounded-xl h-12 text-gray-500 text-base"
                  type="number"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-primary text-lg">Kredit</label>
                <Input
                  value={formData.kredit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kredit: e.target.value,
                      debit: "", // Reset debit when kredit is entered
                      isMainAccountSaved: false,
                    })
                  }
                  disabled={
                    formData.isMainAccountSaved ||
                    !isEffectivelyZero(formData.debit)
                  }
                  className="rounded-xl h-12 text-gray-500 text-base"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!formData.isMainAccountSaved ? (
                // Show "Simpan/Update Akun Utama" when form not saved
                <Button
                  className="w-full rounded-xl h-12"
                  onClick={handleSaveMainAccount}
                >
                  {isEditing ? "Update Akun Utama" : "Simpan Akun Utama"}
                </Button>
              ) : (
                // Show "Tambah/Tutup Sub Akun" after main account is saved
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-12"
                  onClick={() => {
                    setShowSubAccountForm(!showSubAccountForm);
                    if (!showSubAccountForm) {
                      setSubAccountForm({
                        namaSubAkun: "",
                        kodeAkunInduk: formData.kodeAkun,
                        kodeSubAkun: "0",
                        debit: "",
                        kredit: "",
                      });
                      setEditingIndex(null);
                    }
                  }}
                >
                  {showSubAccountForm
                    ? "Tutup Form Sub Akun"
                    : "Tambah Sub Akun"}
                </Button>
              )}
            </div>
          </div>

          {/* Sub Account Form */}
          {showSubAccountForm && savedMainAccounts.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Form Sub Akun</h3>
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
                  value={`${formData.kodeAkun},${subAccountForm.kodeSubAkun}`}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Hanya ambil angka setelah koma
                    const parts = value.split(',');
                    if (parts.length > 1) {
                      setSubAccountForm({
                        ...subAccountForm,
                        kodeSubAkun: parts[1]
                      });
                    }
                  }}
                  className="rounded-xl h-12 text-gray-500 text-base"
                  type="text"
                  placeholder={`${formData.kodeAkun},0`}
                />
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
                        kredit: "", // Reset kredit when debit is entered
                      })
                    }
                    className="rounded-xl h-12 text-gray-500 text-base"
                    type="number"
                    min="0"
                    disabled={!isEffectivelyZero(subAccountForm.kredit)}
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
                        debit: "", // Reset debit when kredit is entered
                      })
                    }
                    className="rounded-xl h-12 text-gray-500 text-base"
                    type="number"
                    min="0"
                    disabled={!isEffectivelyZero(subAccountForm.debit)}
                  />
                </div>
              </div>

              <Button
                className="w-full rounded-xl h-12"
                onClick={handleAddOrUpdateSubAccount}
              >
                {editingIndex !== null
                  ? "Update Sub Akun"
                  : "Tambah Sub Akun"}
              </Button>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <Card className="flex-[2]">
          <CardHeader className="sticky top-0 z-10 bg-background pt-4 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-primary">
                Ringkasan
              </CardTitle>
              <Button variant="destructive" size="sm" onClick={clearAllData}>
                Hapus Semua
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="h-[calc(80vh-180px)]">
            <CardContent className="p-4 space-y-6">
              {/* Main Accounts Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Akun Utama</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Akun</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedMainAccounts.map((account, index) => (
                      <TableRow key={index}>
                        <TableCell>{account.kodeAkun}</TableCell>
                        <TableCell>{account.namaAkun}</TableCell>
                        <TableCell className="text-right">
                          {parseFloat(account.debit || "0").toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(account.kredit || "0").toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMainAccount(index)}
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMainAccount(index)}
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

              {/* Sub Accounts Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Sub Akun</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Sub Akun</TableHead>
                      <TableHead>Nama Sub Akun</TableHead>
                      <TableHead>Akun Utama</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subAccounts.map((subAccount, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {getFormattedAccountCode(
                            subAccount.kodeAkunInduk,
                            subAccount.kodeSubAkun,
                          )}
                        </TableCell>
                        <TableCell>{subAccount.namaSubAkun}</TableCell>
                        <TableCell>
                          {
                            savedMainAccounts.find(
                              (acc) =>
                                acc.kodeAkun === subAccount.kodeAkunInduk,
                            )?.namaAkun
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          {parseFloat(
                            subAccount.debit || "0",
                          ).toLocaleString()}
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
              </div>

              {/* Totals Section */}
              {(savedMainAccounts.length > 0 || subAccounts.length > 0) && (
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
          <CardFooter className="sticky bottom-0 border-t bg-background p-4">
            <Button
              className="w-full"
              onClick={handleFinalSave}
            >
              Simpan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
