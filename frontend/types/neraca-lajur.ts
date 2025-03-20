export interface NeracaLajurItem {
  akun: {
    id: string;
    kode: number;
    nama: string;
    status: string;
  };
  sub_akun: {
    id: string;
    kode: number;
    nama: string;
    akun_id: string;
  } | null;
  debit: number;
  kredit: number;
}

export interface NeracaLajurData {
  [key: string]: NeracaLajurItem;
}

export interface NeracaLajurResponse {
  success: boolean;
  data: NeracaLajurData;
} 