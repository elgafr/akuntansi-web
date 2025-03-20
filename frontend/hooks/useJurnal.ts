import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

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

interface JurnalResponse {
  success: boolean;
  data: {
    [key: string]: JurnalEntry[];
  };
}

export function useJurnal() {
  return useQuery<JurnalEntry[]>({
    queryKey: ['jurnal'],
    queryFn: async () => {
      const response = await axios.get<JurnalResponse>('/mahasiswa/jurnal');
      
      if (response.data.success) {
        const jurnalData = response.data.data;
        const formattedTransactions: JurnalEntry[] = [];

        Object.entries(jurnalData).forEach(([keterangan, entries]) => {
          entries.forEach(entry => {
            if (entry && entry.akun) {
              formattedTransactions.push(entry);
            }
          });
        });

        return formattedTransactions;
      }
      return [];
    },
    staleTime: 0, // Selalu periksa data terbaru saat komponen di-mount
    gcTime: 24 * 60 * 60 * 1000,
  });
}

// Tambahkan mutation hook untuk post jurnal
export function usePostJurnal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newData: any) => {
      const response = await axios.post('/mahasiswa/jurnal', newData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cache untuk jurnal, neraca lajur, dan buku besar
      queryClient.invalidateQueries({ queryKey: ['jurnal'] });
      queryClient.invalidateQueries({ queryKey: ['neracaLajur'] });
      queryClient.invalidateQueries({ queryKey: ['bukuBesar'] });
      queryClient.invalidateQueries({ queryKey: ['akunList'] });
    },
  });
}

// Tambahkan mutation hook untuk update jurnal
export function useUpdateJurnal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.put(`/mahasiswa/jurnal/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cache untuk jurnal, neraca lajur, dan buku besar
      queryClient.invalidateQueries({ queryKey: ['jurnal'] });
      queryClient.invalidateQueries({ queryKey: ['neracaLajur'] });
      queryClient.invalidateQueries({ queryKey: ['bukuBesar'] });
      queryClient.invalidateQueries({ queryKey: ['akunList'] });
    },
  });
}

// Tambahkan mutation hook untuk delete jurnal
export function useDeleteJurnal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/mahasiswa/jurnal/${id}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cache untuk jurnal, neraca lajur, dan buku besar
      queryClient.invalidateQueries({ queryKey: ['jurnal'] });
      queryClient.invalidateQueries({ queryKey: ['neracaLajur'] });
      queryClient.invalidateQueries({ queryKey: ['bukuBesar'] });
      queryClient.invalidateQueries({ queryKey: ['akunList'] });
    },
  });
} 