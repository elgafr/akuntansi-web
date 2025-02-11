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

  const calculateSelectedAccountTotals = () => {
    if (selectedMainAccount === "all") {
      // Jika "all", tampilkan total semua transaksi
      return {
        totalDebit: transactions.reduce((sum, t) => sum + (Number(t.debit) || 0), 0),
        totalKredit: transactions.reduce((sum, t) => sum + (Number(t.kredit) || 0), 0),
      };
    }

    // Ambil kode akun utama dari selectedMainAccount
    const mainCode = selectedMainAccount.split(" ")[0];
    
    let totalDebit = 0;
    let totalKredit = 0;

    // Hitung total dari akun utama dan sub akun
    transactions.forEach(transaction => {
      const [transMainCode] = transaction.kodeAkun.split(',');
      if (transMainCode === mainCode) {
        totalDebit += Number(transaction.debit) || 0;
        totalKredit += Number(transaction.kredit) || 0;
      }
    });

    return { totalDebit, totalKredit };
  };

  const { totalDebit, totalKredit } = calculateSelectedAccountTotals();
  const difference = Math.abs(totalDebit - totalKredit);

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="bg-red-500 text-white p-4 rounded-xl">
        <p className="text-sm opacity-90">Debit</p>
        <p className="text-lg font-medium">
          Rp {totalDebit.toLocaleString()}
        </p>
      </Card>
      <Card className="bg-red-500 text-white p-4 rounded-xl">
        <p className="text-sm opacity-90">Kredit</p>
        <p className="text-lg font-medium">
          Rp {totalKredit.toLocaleString()}
        </p>
      </Card>
      <Card className="bg-red-400 text-white p-4 rounded-xl">
        <p className="text-sm opacity-90">Unbalanced</p>
        <p className="text-lg font-medium">
          Difference: Rp {difference.toLocaleString()}
        </p>
      </Card>
    </div>
  );
}
