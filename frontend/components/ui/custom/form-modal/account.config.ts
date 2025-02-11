export type Transactions = {
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
};

export type AccountFormData = {
  namaAkun: string;
  debit: string;
  kredit: string;
};

export type SubAccountFormData = AccountFormData & {
  namaSubAkun: string;
  debit: string;
  kredit: string;
};

export interface InputFieldProps {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface AccountSummaryItemProps {
  accountName: string;
  accountCode: string;
  debit: string;
  credit?: string;
  onDelete?: () => void;
}

export interface ActionButtonProps {
  variant: "primary" | "secondary";
  icon?: string;
  children: React.ReactNode;
  onClick?: () => void;
}
