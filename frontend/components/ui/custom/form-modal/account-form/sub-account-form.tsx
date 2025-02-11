import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  Transactions,
  SubAccountFormData,
} from "@/components/ui/custom/form-modal/account.config";

export const SubAccountForm = ({
  parentAccount,
  onSubmit,
  onDelete,
}: {
  parentAccount: Transactions;
  onSubmit: (data: SubAccountFormData) => void;
  onDelete: () => void;
}) => {
  const [formData, setFormData] = useState<SubAccountFormData>({
    ...parentAccount,
    namaSubAkun: "",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-red-500">Nama Sub Akun</label>
        <Input
          value={formData.namaSubAkun}
          onChange={(e) =>
            setFormData({ ...formData, namaSubAkun: e.target.value })
          }
          className="rounded-xl h-12"
          placeholder="Kas Kecil"
        />
      </div>

      <div className="space-y-2">
        <label className="text-red-500">Debit</label>
        <Input
          value={formData.debit}
          onChange={(e) => setFormData({ ...formData, debit: e.target.value })}
          className="rounded-xl h-12"
          placeholder="Rp."
        />
      </div>

      <div className="space-y-2">
        <label className="text-red-500">Kredit</label>
        <Input
          value={formData.kredit}
          onChange={(e) => setFormData({ ...formData, kredit: e.target.value })}
          className="rounded-xl h-12"
          placeholder="Rp."
        />
      </div>

      <Button
        variant="outline"
        className="w-full h-12 rounded-xl border-red-500 text-red-500 hover:bg-red-50"
        onClick={onDelete}
      >
        Hapus sub akun
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() =>
            setFormData({
              ...parentAccount,
              namaSubAkun: "",
              debit: "",
              kredit: "",
            })
          }
        >
          Reset
        </Button>
        <Button
          className="h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white"
          onClick={() => onSubmit(formData)}
        >
          Simpan
        </Button>
      </div>
    </div>
  );
};
