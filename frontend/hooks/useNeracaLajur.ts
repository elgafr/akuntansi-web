import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface NeracaLajurItem {
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

interface NeracaLajurData {
  [key: string]: NeracaLajurItem;
}

interface NeracaLajurResponse {
  success: boolean;
  data: NeracaLajurData;
}

export function useNeracaLajur(type: 'before' | 'after') {
  const endpoint = type === 'before' 
    ? '/mahasiswa/neracalajur/sebelumpenyesuaian'
    : '/mahasiswa/neracalajur/setelahpenyesuaian';

  return useQuery<NeracaLajurData>({
    queryKey: ['neracaLajur', type],
    queryFn: async () => {
      const response = await axios.get<NeracaLajurResponse>(endpoint);
      if (response.data.success) {
        return response.data.data;
      }
      return {};
    },
    staleTime: 0, // Selalu periksa data terbaru saat komponen di-mount
    refetchOnWindowFocus: true, // Refresh data saat window mendapat focus
  });
} 