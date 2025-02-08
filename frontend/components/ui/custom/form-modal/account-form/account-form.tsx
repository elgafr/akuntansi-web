import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transactions } from "@/components/ui/custom/form-modal/account.config";

export const AccountForm = ({
  onSubmit,
}: {
  onSubmit: (data: Transactions) => void;
}) => {
  const [formData, setFormData] = useState<Transactions>({
    namaAkun: "",
    kodeAkun: "",
    debit: "",
    kredit: "",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-red-500">Nama Akun</label>
        <Select
          value={formData.namaAkun}
          onValueChange={(value) =>
            setFormData({ ...formData, namaAkun: value })
          }
        >
          <SelectTrigger className="rounded-xl h-12">
            <SelectValue placeholder="Pilih akun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kas_kecil">Kas Kecil</SelectItem>
            <SelectItem value="kas_besar">Kas Besar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-red-500">Kode Akun</label>
        <Input
          value={formData.kodeAkun}
          onChange={(e) =>
            setFormData({ ...formData, kodeAkun: e.target.value })
          }
          className="rounded-xl h-12"
          placeholder="11111"
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

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() =>
            setFormData({
              namaAkun: "",
              kodeAkun: "",
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
          Tambah
        </Button>
      </div>
    </div>
  );
};
