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
import { Plus, Pencil, X, Download, Upload, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px] bg-gray-50 border-gray-200 rounded-lg"
          />
          <Select
            value={showAll ? 'all' : pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 rounded-lg">
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
          className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 !rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-600">Kode Akun</TableHead>
              <TableHead className="text-gray-600">Nama Akun</TableHead>
              <TableHead className="text-gray-600">Kode Sub Akun</TableHead>
              <TableHead className="text-gray-600">Nama Sub Akun</TableHead>
              <TableHead className="text-gray-600 text-right">Debit</TableHead>
              <TableHead className="text-gray-600 text-right">Kredit</TableHead>
              <TableHead className="text-gray-600 w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountsState.map((account) => (
              <React.Fragment key={account.kodeAkun}>
                {/* Main Account Row */}
                <TableRow className="hover:bg-gray-50 transition-colors">
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

                {/* Sub Accounts */}
                {account.subAccounts?.map((subAccount) => (
                  <TableRow
                    key={`${account.kodeAkun}-${subAccount.kodeSubAkun}`}
                    className="hover:bg-gray-50 transition-colors"
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
      </div>

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
            {editData?.mainAccount && !editData?.subAccount 
              ? "Tambah Sub Akun" 
              : editData 
                ? "Edit Akun" 
                : "Tambah Akun Baru"
            }
          </DialogTitle>
          
          {editData ? (
            editData.mainAccount && !editData.subAccount ? (
              <SubAccountDetailModal
                onClose={() => {
                  setIsFormModalOpen(false);
                  setEditData(null);
                }}
                onSave={handleSaveAccount}
                mainAccount={editData.mainAccount}
              />
            ) : (
              <AccountDetailModal
                onClose={() => {
                  setIsFormModalOpen(false);
                  setEditData(null);
                }}
                onSave={handleSaveAccount}
                editData={editData}
              />
            )
          ) : (
            <AccountDetailModal
              onClose={() => {
                setIsFormModalOpen(false);
                setEditData(null);
              }}
              onSave={handleSaveAccount}
              editData={null}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}