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
  data: BukuBesarItem[];
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

export function useBukuBesar(akunId?: string) {
  return useQuery({
    queryKey: ['bukuBesar', akunId],
    queryFn: async () => {
      if (!akunId) return [];
      
      try {
        // Fetch buku besar data
        const response = await axios.get('/mahasiswa/bukubesar/sort', {
          params: { akun_id: akunId }
        });
        
        if (!response.data.success) return [];
        
        // Fetch akun data
        const akun = await fetchAkunById(akunId);
        
        // Log untuk debugging
        console.log('BukuBesar API response:', response.data.data);
        console.log('Akun data:', akun);
        
        if (!akun) return response.data.data;
        
        // Enriched data with akun information
        return response.data.data.map((item: BukuBesarItem) => ({
          ...item,
          kodeAkun: akun.kode?.toString() || '',
          namaAkun: akun.nama || '',
        }));
      } catch (error) {
        console.error('Error in useBukuBesar:', error);
        return [];
      }
    },
    staleTime: 0,
    enabled: !!akunId,
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