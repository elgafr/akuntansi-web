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
  const [editData, setEditData] = useState<any>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<any>(null);
  const [accountsState, setAccountsState] = useState<Account[]>(accounts);
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [inlineEditSubAccount, setInlineEditSubAccount] = useState<{
    mainAccountId: string;
    subAccountId: string;
    data: SubAccount;
  } | null>(null);

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

  const handleInlineEditSubAccount = (mainAccount: Account, subAccount: SubAccount) => {
    setInlineEditSubAccount({
      mainAccountId: mainAccount.kodeAkun,
      subAccountId: subAccount.kodeSubAkun,
      data: { ...subAccount }
    });
  };

  const handleSaveInlineEditSubAccount = () => {
    if (!inlineEditSubAccount) return;

    const updatedAccounts = accountsState.map(account => {
      if (account.kodeAkun === inlineEditSubAccount.mainAccountId) {
        return {
          ...account,
          subAccounts: account.subAccounts?.map(sub => 
            sub.kodeSubAkun === inlineEditSubAccount.subAccountId
              ? inlineEditSubAccount.data
              : sub
          )
        };
      }
      return account;
    });

    setAccountsState(updatedAccounts);
    onAccountsChange(updatedAccounts);
    setInlineEditSubAccount(null);
  };

  // Tambahkan helper function untuk mengecek apakah nilai efektif 0
  const isEffectivelyZero = (value: string | number) => {
    if (typeof value === 'string') {
      return !value || parseFloat(value) === 0;
    }
    return !value || value === 0;
  };

  // Tambahkan fungsi untuk menghitung total baris (main + sub accounts)
  const getTotalRows = () => {
    return accountsState.reduce((total, account) => {
      // Tambahkan 1 untuk akun utama
      let count = 1;
      // Tambahkan jumlah sub akun jika ada
      if (account.subAccounts?.length) {
        count += account.subAccounts.length;
      }
      return total + count;
    }, 0);
  };

  // Fungsi untuk mengambil data yang akan ditampilkan di halaman saat ini
  const getCurrentPageData = () => {
    let currentRow = 0;
    let result = [];
    
    for (const account of accountsState) {
      // Jika baris saat ini masih di bawah startIndex, skip
      if (currentRow < startIndex) {
        currentRow += 1 + (account.subAccounts?.length || 0);
        continue;
      }
      
      // Jika sudah mencapai batas endIndex, berhenti
      if (currentRow >= endIndex) {
        break;
      }
      
      // Tambahkan akun utama
      result.push(account);
      currentRow++;
      
      // Tambahkan sub akun jika masih dalam range
      if (account.subAccounts?.length) {
        const remainingSlots = endIndex - currentRow;
        const subAccountsToAdd = account.subAccounts.slice(0, remainingSlots);
        currentRow += subAccountsToAdd.length;
      }
    }
    
    return result;
  };

  // Update pagination calculations
  const totalRows = getTotalRows();
  const totalPages = Math.ceil(totalRows / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Gunakan getCurrentPageData untuk render
  const currentAccounts = getCurrentPageData();

  return (
    <div className="space-y-4 p-6 rounded-xl">
      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          {/* <Input
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
          </Select> */}
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
            {currentAccounts.map((account) => (
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
                      <span className="bg-amber-0 px-2 py-1 rounded-md">
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
                            kredit: "", // Reset kredit saat debit diisi
                          })
                        }
                        type="number"
                        className="w-32 text-right"
                        disabled={!isEffectivelyZero(inlineEditData.kredit)}
                      />
                    ) : (
                      (parseFloat(account.debit) || 0).toLocaleString()
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
                            debit: "", // Reset debit saat kredit diisi
                          })
                        }
                        type="number"
                        className="w-32 text-right"
                        disabled={!isEffectivelyZero(inlineEditData.debit)}
                      />
                    ) : (
                      (parseFloat(account.kredit) || 0).toLocaleString()
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
                            className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
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
                            className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
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
                            className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(account.kodeAkun)}
                            className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 px-3 py-1.5 border border-gray-200 rounded-3xl text-sm bg-white hover:bg-gray-50"
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
                    <TableCell>
                      {inlineEditSubAccount?.mainAccountId === account.kodeAkun && 
                       inlineEditSubAccount?.subAccountId === subAccount.kodeSubAkun ? (
                        <Input
                          value={inlineEditSubAccount.data.kodeSubAkun}
                          onChange={(e) => setInlineEditSubAccount({
                            ...inlineEditSubAccount,
                            data: {
                              ...inlineEditSubAccount.data,
                              kodeSubAkun: e.target.value
                            }
                          })}
                          className="w-32"
                        />
                      ) : (
                        `${subAccount.kodeAkunInduk},${subAccount.kodeSubAkun}`
                      )}
                    </TableCell>
                    <TableCell>
                      {inlineEditSubAccount?.mainAccountId === account.kodeAkun && 
                       inlineEditSubAccount?.subAccountId === subAccount.kodeSubAkun ? (
                        <Input
                          value={inlineEditSubAccount.data.namaSubAkun}
                          onChange={(e) => setInlineEditSubAccount({
                            ...inlineEditSubAccount,
                            data: {
                              ...inlineEditSubAccount.data,
                              namaSubAkun: e.target.value
                            }
                          })}
                        />
                      ) : (
                        subAccount.namaSubAkun
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {inlineEditSubAccount?.mainAccountId === account.kodeAkun && 
                       inlineEditSubAccount?.subAccountId === subAccount.kodeSubAkun ? (
                        <Input
                          type="number"
                          value={inlineEditSubAccount.data.debit}
                          onChange={(e) => setInlineEditSubAccount({
                            ...inlineEditSubAccount,
                            data: {
                              ...inlineEditSubAccount.data,
                              debit: e.target.value,
                              kredit: "", // Reset kredit saat debit diisi
                            }
                          })}
                          className="w-32 text-right"
                          disabled={!isEffectivelyZero(inlineEditSubAccount.data.kredit)}
                        />
                      ) : (
                        (parseFloat(subAccount.debit) || 0).toLocaleString()
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {inlineEditSubAccount?.mainAccountId === account.kodeAkun && 
                       inlineEditSubAccount?.subAccountId === subAccount.kodeSubAkun ? (
                        <Input
                          type="number"
                          value={inlineEditSubAccount.data.kredit}
                          onChange={(e) => setInlineEditSubAccount({
                            ...inlineEditSubAccount,
                            data: {
                              ...inlineEditSubAccount.data,
                              kredit: e.target.value,
                              debit: "", // Reset debit saat kredit diisi
                            }
                          })}
                          className="w-32 text-right"
                          disabled={!isEffectivelyZero(inlineEditSubAccount.data.debit)}
                        />
                      ) : (
                        (parseFloat(subAccount.kredit) || 0).toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {inlineEditSubAccount?.mainAccountId === account.kodeAkun && 
                         inlineEditSubAccount?.subAccountId === subAccount.kodeSubAkun ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveInlineEditSubAccount}
                              className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                            >
                              <Check className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setInlineEditSubAccount(null)}
                              className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleInlineEditSubAccount(account, subAccount)}
                              className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(`${subAccount.kodeAkunInduk},${subAccount.kodeSubAkun}`, true)}
                              className="h-8 w-8 border border-gray-200 rounded-full hover:bg-gray-100"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
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
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} - {Math.min(endIndex, totalRows)} of {totalRows} results
          </p>
        </div>
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg ${
                  currentPage === page 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'border-gray-200'
                }`}
              >
                {page}
              </Button>
            ))}
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

      <Dialog 
        open={isFormModalOpen} 
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) {
            // Reset editData saat modal ditutup
            setEditData(null);
          }
        }}
      >
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
                isOpen={isFormModalOpen}
                onClose={() => {
                  setIsFormModalOpen(false);
                  setEditData(null); // Reset editData saat modal ditutup
                }}
                onSave={(data) => {
                  handleSaveAccount(data);
                  setEditData(null); // Reset editData setelah save
                }}
                mainAccount={editData.mainAccount}
              />
            ) : (
              <AccountDetailModal
                isOpen={isFormModalOpen}
                onClose={() => {
                  setIsFormModalOpen(false);
                  setEditData(null); // Reset editData saat modal ditutup
                }}
                onSave={(data) => {
                  handleSaveAccount(data);
                  setEditData(null); // Reset editData setelah save
                }}
                editData={editData}
              />
            )
          ) : (
            <AccountDetailModal
              isOpen={isFormModalOpen}
              onClose={() => {
                setIsFormModalOpen(false);
                setEditData(null); // Reset editData saat modal ditutup
              }}
              onSave={(data) => {
                handleSaveAccount(data);
                setEditData(null); // Reset editData setelah save
              }}
              editData={null}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}