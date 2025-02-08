"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccounts } from "@/contexts/AccountContext";
import { useTransactions } from "@/contexts/TransactionContext";

interface BukuBesarCardProps {
  selectedMainAccount: string;
}

export function BukuBesarCard({ selectedMainAccount }: BukuBesarCardProps) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  // Calculate totals based on selected account
  const calculateTotals = () => {
    if (selectedMainAccount === "all") {
      return {
        totalDebit: 0,
        totalKredit: 0,
        accountName: "All Accounts",
        accountCode: "",
      };
    }

    const [mainCode, mainName] = selectedMainAccount.split(" ");
    let totalDebit = 0;
    let totalKredit = 0;

    // Add up opening balances from accounts
    accounts.forEach(account => {
      const accountMainCode = account.kodeAkun.split(",")[0];
      if (accountMainCode === mainCode) {
        totalDebit += account.debit || 0;
        totalKredit += account.kredit || 0;
      }
      if (account.subKodeAkun) {
        const subMainCode = account.subKodeAkun.split(",")[0];
        if (subMainCode === mainCode) {
          totalDebit += account.debit || 0;
          totalKredit += account.kredit || 0;
        }
      }
    });

    // Add up transactions
    transactions.forEach(transaction => {
      const transactionMainCode = transaction.kodeAkun.split(",")[0];
      if (transactionMainCode === mainCode) {
        totalDebit += Number(transaction.debit) || 0;
        totalKredit += Number(transaction.kredit) || 0;
      }
    });

    return {
      totalDebit,
      totalKredit,
      accountName: mainName,
      accountCode: mainCode,
    };
  };

  const { totalDebit, totalKredit, accountName, accountCode } = calculateTotals();
  const balance = totalDebit - totalKredit;

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            Rp {totalDebit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {accountCode ? `${accountCode} - ${accountName}` : accountName}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kredit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            Rp {totalKredit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {accountCode ? `${accountCode} - ${accountName}` : accountName}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Rp {Math.abs(balance).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? 'Debit' : 'Kredit'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">
            {accountName}
          </div>
          <p className="text-xs text-muted-foreground">
            {accountCode || 'Showing all accounts'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
