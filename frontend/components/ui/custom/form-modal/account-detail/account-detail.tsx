import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Transactions,
  SubAccountFormData,
} from "@/components/ui/custom/form-modal/account.config";

export const AccountDetailModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Transactions & { subAccounts: SubAccountFormData[] },
  ) => void;
}) => {
  const [formData, setFormData] = useState<Transactions>({
    namaAkun: "Kas Kecil",
    kodeAkun: "11111",
    debit: "",
    kredit: "",
  });

  const [subAccounts, setSubAccounts] = useState<SubAccountFormData[]>([]);

  const handleAddSubAccount = () => {
    setSubAccounts([
      ...subAccounts,
      { namaSubAkun: "", debit: "", kredit: "", namaAkun: "", kodeAkun: "" },
    ]);
  };

  const handleSubAccountChange = (
    index: number,
    field: keyof SubAccountFormData,
    value: string,
  ) => {
    const newSubAccounts = [...subAccounts];
    newSubAccounts[index][field] = value;
    setSubAccounts(newSubAccounts);
  };

  const handleDeleteSubAccount = (index: number) => {
    setSubAccounts(subAccounts.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="p-8 pb-0 flex justify-between">
          <DialogTitle className="text-[2rem] font-normal text-primary">
            Detail Akun
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-primary text-lg">Nama Akun</label>
            <Input
              value={formData.namaAkun}
              onChange={(e) =>
                setFormData({ ...formData, namaAkun: e.target.value })
              }
              className="rounded-xl h-12 text-gray-500 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Kode Akun</label>
            <Input
              value={formData.kodeAkun}
              onChange={(e) =>
                setFormData({ ...formData, kodeAkun: e.target.value })
              }
              className="rounded-xl h-12 text-gray-500 text-base"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-primary text-lg">Debit</label>
              <Input
                value={formData.debit}
                onChange={(e) =>
                  setFormData({ ...formData, debit: e.target.value })
                }
                className="rounded-xl h-12 text-gray-500 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-primary text-lg">Kredit</label>
              <Input
                value={formData.kredit}
                onChange={(e) =>
                  setFormData({ ...formData, kredit: e.target.value })
                }
                className="rounded-xl h-12 text-gray-500 text-base"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium">Sub Akun</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {subAccounts.map((sub, index) => (
                <div key={index} className="bg-muted p-4 rounded-xl space-y-3">
                  <div className="space-y-2">
                    <label>Nama Sub Akun</label>
                    <Input
                      value={sub.namaSubAkun}
                      onChange={(e) =>
                        handleSubAccountChange(
                          index,
                          "namaSubAkun",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label>Debit</label>
                      <Input
                        value={sub.debit}
                        onChange={(e) =>
                          handleSubAccountChange(index, "debit", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Kredit</label>
                      <Input
                        value={sub.kredit}
                        onChange={(e) =>
                          handleSubAccountChange(
                            index,
                            "kredit",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl"
                    onClick={() => handleDeleteSubAccount(index)}
                  >
                    Hapus Sub Akun
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="destructive"
              className="w-full rounded-xl h-12 mt-4"
              onClick={handleAddSubAccount}
            >
              Tambah Sub Akun
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="h-12 rounded-xl bg-red-200 hover:bg-red-300 text-base font-normal"
              onClick={onClose}
            >
              Reset
            </Button>
            <Button
              className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-normal"
              onClick={() => onSave({ ...formData, subAccounts })}
            >
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
