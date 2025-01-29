// components/ui/custom/form-modal/form.config.ts
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

export type FormField = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export type ModalButton = {
  label: string;
  variant: ComponentProps<typeof Button>["variant"];
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
  closeModal?: boolean;
};

export type FormModalProps = {
  triggerText?: string;
  title?: string;
  formFields?: FormField[];
  buttons?: ModalButton[];
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const companyFormConfig = {
  fields: [
    {
      name: "companyName",
      label: "Nama Perusahaan",
      placeholder: "Input nama perusahaan",
    },
    {
      name: "category",
      label: "Kategori Perusahaan",
      placeholder: "Jasa",
      value: "Jasa",
    },
    {
      name: "address",
      label: "Alamat",
      placeholder: "Input alamat perusahaan",
    },
    {
      name: "establishedYear",
      label: "Tahun Berdiri",
      placeholder: "Input tahun berdiri perusahaan",
      type: "number",
    },
  ] as FormField[],

  buttons: [
    {
      label: "Batal",
      variant: "outline",
      onClick: () => console.log("Cancelled"),
      closeModal: true,
    },
    {
      label: "Simpan data",
      variant: "default",
      type: "submit",
      className: "bg-blue-600 hover:bg-blue-700",
      onClick: () => console.log("Saved"),
      closeModal: true,
    },
  ] as ModalButton[],
};
