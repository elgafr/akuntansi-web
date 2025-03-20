export interface SubAccount {
  kodeAkunInduk: string;
  kodeSubAkun: string;
  namaSubAkun: string;
  debit?: number;
  kredit?: number;
}

export interface Account {
  id: string;
  kodeAkun: string;
  namaAkun: string;
  debit?: number;
  kredit?: number;
  subAccounts?: SubAccount[];
} 