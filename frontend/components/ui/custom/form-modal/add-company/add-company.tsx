/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormModalProps } from "./add-company.config";

export const FormModal = ({
  triggerText = "Open Form",
  title = "Input Data Perusahaan",
  formFields = [],
  buttons = [],
  defaultOpen = false,
  onOpenChange,
}: FormModalProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 bg-background rounded-3xl overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-[2rem] font-normal text-primary">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-primary text-lg">Nama Perusahaan</label>
            <Input
              placeholder="Input nama perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Kategori Perusahaan</label>
            <Select>
              <SelectTrigger className="rounded-xl h-12 text-gray-500 text-base">
                <SelectValue placeholder="Jasa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jasa">Jasa</SelectItem>
                <SelectItem value="manufaktur">Manufaktur</SelectItem>
                <SelectItem value="dagang">Dagang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Alamat</label>
            <Input
              placeholder="Input alamat perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Tahun Berdiri</label>
            <Input
              placeholder="Input tahun berdiri perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="secondary"
              className="h-12 rounded-xl bg-red-200 hover:bg-red-300 text-base font-normal"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-normal"
              onClick={() => {
                // Handle save
                handleOpenChange(false);
              }}
            >
              Simpan data
            </Button>
          </div>

          <p className="text-center text-gray-500 text-sm">
            Pastikan data yang Anda masukkan benar{" "}
            <span className="text-primary">sebelum menyimpan</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
