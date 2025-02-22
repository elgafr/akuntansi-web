export interface Transaction {
  id: string;
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  akun_id: string;
  sub_akun_id: string | null | undefined;
  perusahaan_id: string;
  debit: number;
  kredit: number;
}

export interface TempTransaction {
  id?: string;
  date: string;
  documentType: string;
  description: string;
  namaAkun: string;
  kodeAkun: string;
  akun_id: string;
  sub_akun_id?: string | null;
  perusahaan_id?: string;
  debit: number;
  kredit: number;
}