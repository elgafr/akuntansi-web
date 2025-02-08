/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { X, Edit, } from "lucide-react";

interface SubAccount {
  id?: number;
  nama: string;
  kodeAkun: string;
  debit: string;
  kredit: string;
}

interface Account {
  id?: number;
  namaAkun: string;
  kodeAkun: string;
  debit: string;
  kredit: string;
  subAccounts: SubAccount[];
}

export const AddAccountForm = ({ onClose }: { onClose: () => void }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [namaAkun, setNamaAkun] = useState("");
  const [kodeAkun, setKodeAkun] = useState("");
  const [debit, setDebit] = useState("");
  const [kredit, setKredit] = useState("");
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editSubId, setEditSubId] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data))
      .catch((err) => console.error("Error fetching accounts:", err));
  }, []);

  const handleEditAccount = (id: number) => {
    setEditId(id);
  };

  const handleSaveEdit = async (id: number, updatedAccount: Account) => {
    await fetch(`http://localhost:5000/accounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAccount),
    });

    setAccounts(accounts.map(acc => acc.id === id ? updatedAccount : acc));
    setEditId(null);
  };
  const handleAddAccount = async () => {
    if (!namaAkun || !kodeAkun) return;

    const newAccount: Account = {
      namaAkun,
      kodeAkun,
      debit: debit || "0",
      kredit: kredit || "0",
      subAccounts: subAccounts.map(sub => ({
        nama: sub.nama,
        kodeAkun: sub.kodeAkun,
        debit: sub.debit || "0",
        kredit: sub.kredit || "0",
      }))
    };

    const response = await fetch("http://localhost:5000/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });

    if (response.ok) {
      const createdAccount = await response.json();
      setAccounts([...accounts, createdAccount]);
      setNamaAkun("");
      setKodeAkun("");
      setDebit("");
      setKredit("");
      setSubAccounts([]);
    }
  };

  const handleDeleteAccount = async (id?: number) => {
    if (!id) return;
    await fetch(`http://localhost:5000/accounts/${id}`, { method: "DELETE" });
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  const handleAddSubAccount = () => {
    setSubAccounts([...subAccounts, { nama: "", kodeAkun: `${kodeAkun},0`, debit: "", kredit: "" }]);
  };
  const handleEditSubAccount = (id: number) => {
    setEditSubId(id);
  };
  const handleSaveSubEdit = async (accountId: number, subId: number, updatedSub: SubAccount) => {
    await fetch(`http://localhost:5000/accounts/${accountId}/subAccounts/${subId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSub),
    });

    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          subAccounts: acc.subAccounts.map(sub => sub.id === subId ? updatedSub : sub)
        };
      }
      return acc;
    }));
    setEditSubId(null);
  };

  const handleDeleteSubAccount = async (accountId: number, subId: number) => {
    await fetch(`http://localhost:5000/accounts/${accountId}/subAccounts/${subId}`, { method: "DELETE" });
    setAccounts(accounts.map(account => {
      if (account.id === accountId) {
        return {
          ...account,
          subAccounts: account.subAccounts.filter(sub => sub.id !== subId)
        };
      }
      return account;
    }));
  };

  return (
    <div className="">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tambah Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Nama Akun</Label>
            <Input value={namaAkun} onChange={(e) => setNamaAkun(e.target.value)} />
            <Label>Kode Akun</Label>
            <Input value={kodeAkun} onChange={(e) => setKodeAkun(e.target.value)} />
            <Label>Debit</Label>
            <Input value={debit} onChange={(e) => setDebit(e.target.value)} disabled={!!kredit} />
            <Label>Kredit</Label>
            <Input value={kredit} onChange={(e) => setKredit(e.target.value)} disabled={!!debit} />

            <h3>Sub Akun</h3>
            {subAccounts.map((sub, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Input placeholder="Nama Sub Akun" value={sub.nama} onChange={(e) => {
                  const updatedSubs = [...subAccounts];
                  updatedSubs[index].nama = e.target.value;
                  setSubAccounts(updatedSubs);
                }} />
                <Input placeholder="Kode Akun" value={sub.kodeAkun} onChange={(e) => {
                  const updatedSubs = [...subAccounts];
                  updatedSubs[index].kodeAkun = e.target.value;
                  setSubAccounts(updatedSubs);
                }} />
                <Input placeholder="Debit" value={sub.debit} onChange={(e) => {
                  const updatedSubs = [...subAccounts];
                  updatedSubs[index].debit = e.target.value;
                  setSubAccounts(updatedSubs);
                }} disabled={!!sub.kredit} />
                <Input placeholder="Kredit" value={sub.kredit} onChange={(e) => {
                  const updatedSubs = [...subAccounts];
                  updatedSubs[index].kredit = e.target.value;
                  setSubAccounts(updatedSubs);
                }} disabled={!!sub.debit} />
              </div>
            ))}
            <Button onClick={handleAddSubAccount}>Tambah Sub Akun</Button>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddAccount}>Simpan Akun</Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Akun</CardTitle>
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
                  {accounts.map((account) => (
                    <>
                      <TableRow key={account.id}>
                        <TableCell>
                          {editId === account.id ? (
                            <Input value={account.namaAkun} onChange={(e) => account.namaAkun = e.target.value} />
                          ) : (
                            account.namaAkun
                          )}
                        </TableCell>
                        <TableCell>
                          {editId === account.id ? (
                            <Input value={account.kodeAkun} onChange={(e) => account.kodeAkun = e.target.value} />
                          ) : (
                            account.kodeAkun
                          )}
                        </TableCell>
                        <TableCell>
                          {editId === account.id ? (
                            <Input value={account.debit} onChange={(e) => account.debit = e.target.value} />
                          ) : (
                            account.debit
                          )}
                        </TableCell>
                        <TableCell>
                          {editId === account.id ? (
                            <Input value={account.kredit} onChange={(e) => account.kredit = e.target.value} />
                          ) : (
                            account.kredit
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {editId === account.id ? (
                            <Button onClick={() => handleSaveEdit(account.id!, account)}>Simpan</Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account.id!)}>
                                <Edit className="text-blue-500" />
                              </Button>
                              <Button onClick={() => handleDeleteAccount(account.id)} variant="ghost" size="icon">
                                <X className="text-red-500" />
                              </Button>

                            </>
                          )}
                        </TableCell>
                      </TableRow>
                      {account.subAccounts.map((sub) => (
                        <TableRow key={sub.id} className="pl-4">
                          <TableCell>
                            {editSubId === sub.id ? (
                              <Input value={sub.nama} onChange={(e) => sub.nama = e.target.value} />
                            ) : (
                              sub.nama
                            )}
                          </TableCell>
                          <TableCell>
                            {editSubId === sub.id ? (
                              <Input value={sub.kodeAkun} onChange={(e) => sub.kodeAkun = e.target.value} />
                            ) : (
                              sub.kodeAkun
                            )}
                          </TableCell>
                          <TableCell>
                            {editSubId === sub.id ? (
                              <Input value={sub.debit} onChange={(e) => sub.debit = e.target.value} />
                            ) : (
                              sub.debit
                            )}
                          </TableCell>
                          <TableCell>
                            {editSubId === sub.id ? (
                              <Input value={sub.kredit} onChange={(e) => sub.kredit = e.target.value} />
                            ) : (
                              sub.kredit
                            )}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            {editSubId === sub.id ? (
                              <Button onClick={() => handleSaveSubEdit(account.id!, sub.id!, sub)}>Simpan</Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleEditSubAccount(sub.id!)}>
                                  <Edit className="text-blue-500" />
                                </Button>
                                <Button onClick={() => handleDeleteSubAccount(account.id!, sub.id!)} variant="ghost" size="icon">
                                  <X className="text-red-500" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};