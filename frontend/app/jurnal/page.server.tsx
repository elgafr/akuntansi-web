import { JurnalClient } from './JurnalClient';
import axios from "@/lib/axios";

interface JurnalResponse {
  [key: string]: JurnalEntry[];
}

interface JurnalEntry {
  id: string;
  tanggal: string;
  bukti: string;
  keterangan: string;
  akun_id: string;
  debit: number | null;
  kredit: number | null;
  perusahaan_id: string;
  sub_akun_id?: string | null;
  akun: {
    id: string;
    kode: number;
    nama: string;
    status: string;
  };
}

// Fungsi untuk mengambil data jurnal
async function getJurnalData() {
  try {
    const response = await axios.get('/mahasiswa/jurnal');
    if (response.data.success) {
      const jurnalData: JurnalResponse = response.data.data;
      const formattedTransactions = Object.entries(jurnalData).flatMap(([keterangan, entries]) =>
        entries.map(entry => ({
          id: entry.id,
          date: entry.tanggal,
          documentType: entry.bukti,
          description: entry.keterangan,
          namaAkun: entry.akun.nama,
          kodeAkun: entry.akun.kode.toString(),
          akun_id: entry.akun_id,
          debit: entry.debit || 0,
          kredit: entry.kredit || 0,
          perusahaan_id: entry.perusahaan_id,
          sub_akun_id: entry.sub_akun_id || null,
        }))
      );
      return formattedTransactions;
    }
    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch jurnal data');
  }
}

export default async function JurnalPage() {
  // Menggunakan Next.js fetch dengan caching
  const initialTransactions = await getJurnalData();

  return <JurnalClient initialTransactions={initialTransactions} />;
} 