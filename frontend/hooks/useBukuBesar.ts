import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface BukuBesarItem {
  id: string;
  tanggal: string;
  kodeAkun: string;
  namaAkun: string;
  keterangan: string;
  debit: number;
  kredit: number;
  saldo: number;
  is_saldo_awal: boolean;
  akun: {
    id: string;
    kode: string;
    nama: string;
    status: string;
    saldo_normal: 'debit' | 'kredit';
  };
}

interface BukuBesarResponse {
  success: boolean;
  data: {
    keuangan: {
      id: string;
      akun_id: string;
      perusahaan_id: string;
      debit: number;
      kredit: number;
      sub_akun_id: string | null;
      akun: {
        id: string;
        kode: number;
        nama: string;
        saldo_normal: 'debit' | 'kredit';
        status: string;
      };
    };
    jurnal: Array<{
      id: string;
      tanggal: string;
      bukti: string;
      keterangan: string;
      debit: number | null;
      kredit: number | null;
      sub_akun_id: string | null;
      akun: {
        id: string;
        kode: number;
        nama: string;
        saldo_normal: 'debit' | 'kredit';
        status: string;
      };
    }>;
    total: number;
    totalDebit: number;
    totalKredit: number;
  };
}

// Fungsi tambahan untuk mendapatkan data akun berdasarkan ID
async function fetchAkunById(akunId: string) {
  try {
    const response = await axios.get(`/instruktur/akun/${akunId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching akun data:', error);
    return null;
  }
}

export function useBukuBesar(akunId: string) {
  return useQuery({
    queryKey: ['buku-besar', akunId],
    queryFn: async () => {
      if (!akunId) return null;
      const response = await axios.get(`mahasiswa/bukubesar/sort`, {
        params: {
          akun_id: akunId
        }
      });
      console.log('Buku Besar Response:', response.data);
      return response.data;
    },
    enabled: !!akunId
  });
}

// Hook untuk mendapatkan daftar akun
export function useAkunList() {
  return useQuery({
    queryKey: ['akunList'],
    queryFn: async () => {
      try {
        const [akunResponse, subAkunResponse] = await Promise.all([
          axios.get('/instruktur/akun'),
          axios.get('/mahasiswa/subakun')
        ]);

        return {
          akun: akunResponse.data.success ? akunResponse.data.data : [],
          subAkun: subAkunResponse.data.success ? subAkunResponse.data.data : []
        };
      } catch (error) {
        console.error('Error fetching akun data:', error);
        return { akun: [], subAkun: [] };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache daftar akun selama 5 menit
  });
} 