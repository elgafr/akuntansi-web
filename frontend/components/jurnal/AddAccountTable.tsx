"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, Pencil, X, Download, Upload, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AccountDetailModal } from "@/components/perusahaan/AccountDetailForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { SubAccountDetailModal } from "@/components/perusahaan/SubAccountDetailForm";

interface Account {
  kodeAkun: string;
  namaAkun: string;
  debit: number;
  kredit: number;
  parentId?: string;
  level: number;
  subAccounts?: SubAccount[];
}

interface SubAccount {
  namaSubAkun: string;
  kodeAkunInduk: string;
  kodeSubAkun: string;
  debit: string;
  kredit: string;
}

interface AddAccountTableProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
}

export function AddAccountTable({
  accounts,
  onAccountsChange,
}: AddAccountTableProps) {
  const [search, setSearch] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<any>(null);
  const [accountsState, setAccountsState] = useState<Account[]>(accounts);

  useEffect(() => {
    console.log("=== AddAccountTable Data ===");
    console.log("All accounts:", accountsState);
    
    accountsState.forEach(account => {
        console.log("Main Account:", {
            kodeAkun: account.kodeAkun,
            namaAkun: account.namaAkun,
            debit: account.debit,
            kredit: account.kredit,
            level: account.level,
            subAccountsCount: account.subAccounts?.length || 0
        });

        if (account.subAccounts?.length) {
            account.subAccounts.forEach(sub => {
                console.log(`Sub Account for ${account.kodeAkun}:`, {
                    kodeAkunInduk: sub.kodeAkunInduk,
                    kodeSubAkun: sub.kodeSubAkun,
                    namaSubAkun: sub.namaSubAkun,
                    debit: sub.debit,
                    kredit: sub.kredit
                });
            });
        }
    });
    
    console.log("=== End AddAccountTable Data ===");
  }, [accountsState]);

  const handleSaveAccount = (data: any) => {
    let updatedAccounts = [...accountsState];

    if (data.mainAccount && !data.mainAccounts) {
      // From SubAccountDetailModal - updating sub accounts for existing main account
      const mainAccountIndex = accountsState.findIndex(
        (acc) => acc.kodeAkun === data.mainAccount.kodeAkun,
      );

      if (mainAccountIndex !== -1) {
        // Update sub accounts for existing main account
        updatedAccounts[mainAccountIndex] = {
          ...updatedAccounts[mainAccountIndex],
          subAccounts: data.subAccounts.map((sub: SubAccount) => ({
            ...sub,
            debit: parseFloat(sub.debit) || 0,
            kredit: parseFloat(sub.kredit) || 0,
          })),
        };
      }
    } else if (data.mainAccounts) {
      // From AccountDetailModal - adding new main accounts with their sub accounts
      const newMainAccounts = data.mainAccounts.map((mainAccount: any) => ({
        kodeAkun: mainAccount.kodeAkun,
        namaAkun: mainAccount.namaAkun,
        debit: parseFloat(mainAccount.debit) || 0,
        kredit: parseFloat(mainAccount.kredit) || 0,
        level: 0,
        subAccounts: data.subAccounts
          .filter(
            (sub: SubAccount) => sub.kodeAkunInduk === mainAccount.kodeAkun,
          )
          .map((sub: SubAccount) => ({
            ...sub,
            debit: parseFloat(sub.debit) || 0,
            kredit: parseFloat(sub.kredit) || 0,
          })),
      }));

      // If editing, replace existing account
      if (editData) {
        updatedAccounts = updatedAccounts.map((acc) =>
          acc.kodeAkun === editData.mainAccount?.kodeAkun
            ? newMainAccounts[0]
            : acc,
        );
      } else {
        // Add new accounts
        updatedAccounts = [...updatedAccounts, ...newMainAccounts];
      }
    }

    // Update state and close modal
    setAccountsState(updatedAccounts);
    onAccountsChange(updatedAccounts);
    setIsFormModalOpen(false);
    setEditData(null);
  };

  const handleDelete = (kodeAkun: string, isSubAccount: boolean = false) => {
    if (isSubAccount) {
      // Hapus sub akun
      const updatedAccounts = accountsState.map((account) => ({
        ...account,
        subAccounts: account.subAccounts?.filter(
          (sub) => `${sub.kodeAkunInduk},${sub.kodeSubAkun}` !== kodeAkun,
        ),
      }));
      setAccountsState(updatedAccounts);
      onAccountsChange(updatedAccounts);
    } else {
      // Hapus akun utama beserta sub akunnya
      setAccountsState(accountsState.filter((acc) => acc.kodeAkun !== kodeAkun));
      onAccountsChange(accountsState.filter((acc) => acc.kodeAkun !== kodeAkun));
    }
  };

  const handlePageSizeChange = (value: string) => {
    if (value === "all") {
      setShowAll(true);
      setPageSize(accountsState.length);
    } else {
      setShowAll(false);
      setPageSize(Number(value));
    }
  };

  const handleEditMainAccount = (account: Account) => {
    setEditData({
      mainAccount: {
        namaAkun: account.namaAkun,
        kodeAkun: account.kodeAkun,
        debit: account.debit.toString(),
        kredit: account.kredit.toString(),
        isMainAccountSaved: false,
      },
    });
    setIsFormModalOpen(true);
  };

  const handleEditSubAccount = (
    mainAccount: Account,
    subAccount: SubAccount,
  ) => {
    setEditData({
      mainAccount: {
        namaAkun: mainAccount.namaAkun,
        kodeAkun: mainAccount.kodeAkun,
        debit: mainAccount.debit.toString(),
        kredit: mainAccount.kredit.toString(),
        isMainAccountSaved: true,
      },
      subAccount: {
        namaSubAkun: subAccount.namaSubAkun,
        kodeAkunInduk: subAccount.kodeAkunInduk,
        kodeSubAkun: subAccount.kodeSubAkun,
        debit: subAccount.debit,
        kredit: subAccount.kredit,
      },
    });
    setIsFormModalOpen(true);
  };

  const handleAddSubAccount = (account: Account) => {
    setEditData({
      mainAccount: {
        namaAkun: account.namaAkun,
        kodeAkun: account.kodeAkun,
        debit: account.debit.toString(),
        kredit: account.kredit.toString(),
      },
    });
    setIsFormModalOpen(true);
  };

  const handleInlineEdit = (account: Account) => {
    setInlineEditId(account.kodeAkun);
    setInlineEditData({
      ...account,
      debit: account.debit.toString(),
      kredit: account.kredit.toString(),
    });
  };

  const handleSaveInlineEdit = (oldKodeAkun: string) => {
    if (!inlineEditData) return;

    const updatedAccounts = accountsState.map((acc) => {
      if (acc.kodeAkun === oldKodeAkun) {
        // Update sub accounts kodeAkunInduk if main account code changes
        const updatedSubAccounts = acc.subAccounts?.map((sub) => ({
          ...sub,
          kodeAkunInduk: inlineEditData.kodeAkun,
        }));

        return {
          ...inlineEditData,
          debit: parseFloat(inlineEditData.debit) || 0,
          kredit: parseFloat(inlineEditData.kredit) || 0,
          subAccounts: updatedSubAccounts,
        };
      }
      return acc;
    });

    setAccountsState(updatedAccounts);
    onAccountsChange(updatedAccounts);
    setInlineEditId(null);
    setInlineEditData(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
          />
          <Select
            value={showAll ? "all" : pageSize.toString()}
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
        <Button
          onClick={() => setIsFormModalOpen(true)}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 !rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode Akun</TableHead>
            <TableHead>Nama Akun</TableHead>
            <TableHead>Kode Sub Akun</TableHead>
            <TableHead>Nama Sub Akun</TableHead>
            <TableHead className="text-right">Debit</TableHead>
            <TableHead className="text-right">Kredit</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accountsState.map((account) => (
            <React.Fragment key={account.kodeAkun}>
              {/* Main Account Row with gold background for kode akun */}
              <TableRow className="border-t-2 border-gray-200">
                <TableCell className="font-medium">
                  {inlineEditId === account.kodeAkun ? (
                    <Input
                      value={inlineEditData.kodeAkun}
                      onChange={(e) =>
                        setInlineEditData({
                          ...inlineEditData,
                          kodeAkun: e.target.value,
                        })
                      }
                      className="w-24"
                    />
                  ) : (
                    <span className="bg-amber-100 px-2 py-1 rounded-md">
                      {account.kodeAkun}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {inlineEditId === account.kodeAkun ? (
                    <Input
                      value={inlineEditData.namaAkun}
                      onChange={(e) =>
                        setInlineEditData({
                          ...inlineEditData,
                          namaAkun: e.target.value,
                        })
                      }
                    />
                  ) : (
                    account.namaAkun
                  )}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right">
                  {inlineEditId === account.kodeAkun ? (
                    <Input
                      value={inlineEditData.debit}
                      onChange={(e) =>
                        setInlineEditData({
                          ...inlineEditData,
                          debit: e.target.value,
                          kredit: "",
                        })
                      }
                      type="number"
                      className="w-32 text-right"
                    />
                  ) : (
                    account.debit.toLocaleString()
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {inlineEditId === account.kodeAkun ? (
                    <Input
                      value={inlineEditData.kredit}
                      onChange={(e) =>
                        setInlineEditData({
                          ...inlineEditData,
                          kredit: e.target.value,
                          debit: "",
                        })
                      }
                      type="number"
                      className="w-32 text-right"
                    />
                  ) : (
                    account.kredit.toLocaleString()
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {inlineEditId === account.kodeAkun ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveInlineEdit(account.kodeAkun)}
                        >
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setInlineEditId(null);
                            setInlineEditData(null);
                          }}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInlineEdit(account)}
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account.kodeAkun)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-emerald-600 px-2"
                          onClick={() => handleAddSubAccount(account)}
                        >
                          Tambah Sub Akun
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>

              {/* Sub Accounts indented and grouped */}
              {account.subAccounts?.map((subAccount) => (
                <TableRow
                  key={`${account.kodeAkun}-${subAccount.kodeSubAkun}`}
                  className="bg-muted/30"
                >
                  <TableCell className="pl-8">{"-"}</TableCell>
                  <TableCell>{"-"}</TableCell>
                  <TableCell>{`${subAccount.kodeAkunInduk},${subAccount.kodeSubAkun}`}</TableCell>
                  <TableCell>{subAccount.namaSubAkun}</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(subAccount.debit).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {parseFloat(subAccount.kredit).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleEditSubAccount(account, subAccount)
                        }
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete(
                            `${subAccount.kodeAkunInduk},${subAccount.kodeSubAkun}`,
                            true,
                          )
                        }
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[1080px] p-6 !rounded-2xl overflow-hidden border">
          {editData?.mainAccount && !editData?.subAccount ? (
            <SubAccountDetailModal
              isOpen={isFormModalOpen}
              onClose={() => {
                setIsFormModalOpen(false);
                setEditData(null);
              }}
              onSave={handleSaveAccount}
              mainAccount={editData.mainAccount}
            />
          ) : (
            <AccountDetailModal
              isOpen={isFormModalOpen}
              onClose={() => {
                setIsFormModalOpen(false);
                setEditData(null);
              }}
              onSave={handleSaveAccount}
              editData={editData}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}