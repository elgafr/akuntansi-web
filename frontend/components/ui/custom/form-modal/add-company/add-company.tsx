/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormModalProps {
  title?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: { name: string; category: string }) => void;
}

export const FormModal = ({
  title = "Input Data Perusahaan",
  isOpen,
  onOpenChange,
  onSave,
}: FormModalProps) => {
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = () => {
    if (companyName && category && onSave) {
      onSave({
        name: companyName,
        category: category,
      });
    }
    setCompanyName(""); // Reset company name
    setCategory(""); // Reset category
    onOpenChange(false); // Close the modal after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-background rounded-3xl overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-[2rem] text-primary text-center">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-primary text-lg">Nama Perusahaan</label>
            <Input
              placeholder="Input nama perusahaan"
              className="rounded-xl h-12 text-gray-500 text-base"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-primary text-lg">Kategori Perusahaan</label>
            <Select onValueChange={(value) => setCategory(value)}>
              <SelectTrigger className="rounded-xl h-12 text-gray-500 text-base">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jasa">Jasa</SelectItem>
                <SelectItem value="Manufaktur">Manufaktur</SelectItem>
                <SelectItem value="Dagang">Dagang</SelectItem>
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
              onClick={() => onOpenChange(false)} // Close the modal on Cancel
            >
              Batal
            </Button>
            <Button
              className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-normal"
              onClick={handleSubmit} // Save data and close modal
            >
              Simpan data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
