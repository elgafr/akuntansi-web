"use client";
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useAccounts } from "@/contexts/AccountContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { BukuBesarCard } from "./BukuBesarCard";
import { Card } from "@/components/ui/card";
import axios from "@/lib/axios";
import { Account, SubAccount } from "@/types/account";

import { useBukuBesar, useAkunList } from "@/hooks/useBukuBesar";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelectedAkun } from "@/hooks/useSelectedAkun";


interface Transaction {
  date: string;
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
  description?: string;
  documentType?: string;
}

interface Akun {
  id: string;
  kode: number;
  nama: string;
  status: string;
  saldo_normal: 'debit' | 'kredit';
}

interface SubAkun {
  id: string;
  kode: number;
  nama: string;
  akun: {
    id: string;
    kode: number;
    nama: string;
    saldo_normal: 'debit' | 'kredit';
  };
}

interface BukuBesarEntry {
  id: string;
  tanggal: string;
  namaAkun: string;
  kodeAkun: string;
  debit: number;
  kredit: number;
  saldo: number;
  keterangan: string;
  is_saldo_awal: boolean;
  isDebitNormal: boolean;
}

interface Totals {
  debit: number;
  kredit: number;
  saldo: number;
}

// Tambahkan interface untuk data perusahaan
interface Perusahaan {
  id: string;
  nama: string;
  start_priode: string;
  end_priode: string;
  status: string;
}

interface APIAccount {
  id: string;
  kode: number;
  nama: string;
  parentId?: string;
  namaAkun: string;
  kodeAkun: string;
  debit?: number;
  kredit?: number;
  subAccounts?: SubAccount[];
}

// Update type guard to handle APIAccount
function hasSubAccounts(account: APIAccount | Account): account is APIAccount & { subAccounts: SubAccount[] } {
  return 'subAccounts' in account && Array.isArray(account.subAccounts);
}

interface BukuBesarTableProps {
  initialData: BukuBesarEntry[] | undefined;
}

// Tambahkan interface untuk tipe data akun dan sub akun
interface AkunItem {
  id: string;
  kode: number;
  nama: string;
  status: string;
}

interface SubAkunItem {
  id: string;
  kode: number;
  nama: string;
  akun: {
    id: string;
    kode: number;
    nama: string;
    saldo_normal: 'debit' | 'kredit';
  };
  akun_id: string;
}

interface AkunListResponse {
  akun: AkunItem[];
  subAkun: SubAkunItem[];
}

// Tambahkan interface untuk respons dari endpoint subakun
interface SubAkunDetail {
  id: string;
  kode: string;
  nama: string;
  akun_id: string;
}

// Pastikan interface BukuBesarItem memiliki semua field yang diperlukan
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
  sub_akun_id?: string | null;
  isDebitNormal?: boolean;
  akun: {
    id: string;
    kode: string;
    nama: string;
    status: string;
    saldo_normal: 'debit' | 'kredit';
  };
}

// Tambahkan interface untuk hasil API /mahasiswa/keuangan
interface KeuanganInfo {
  id: string;
  akun_id: string;
  perusahaan_id: string;
  debit: number;
  kredit: number;
  sub_akun_id: string | null;
}

// Tambahkan tipe untuk hasil dari useSelectedAkun
interface SelectedAkunState {
  selectedAkunId: string | null;
  setSelectedAkunId: (id: string) => void;
}

// Update interface untuk respons API baru
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
      created_at: string;
      updated_at: string;
      akun: {
        id: string;
        kode: number;
        nama: string;
        saldo_normal: 'debit' | 'kredit';
        status: string;
        kategori_id: string;
        created_at: string;
        updated_at: string;
      };
    };
    jurnal: Array<{
      id: string;
      tanggal: string;
      bukti: string;
      keterangan: string;
      akun_id: string;
      debit: number | null;
      kredit: number | null;
      perusahaan_id: string;
      sub_akun_id: string | null;
      created_at: string;
      updated_at: string;
      akun: {
        id: string;
        kode: number;
        nama: string;
        saldo_normal: 'debit' | 'kredit';
        status: string;
        kategori_id: string;
        created_at: string;
        updated_at: string;
      };
    }>;
    total: number;
    totalDebit: number;
    totalKredit: number;
  };
}

export function BukuBesarTable() {
  // Gunakan destructuring dengan tipe yang benar
  const { selectedAkunId, setSelectedAkunId } = useSelectedAkun() as SelectedAkunState;
  
  // Gunakan nullish coalescing untuk memberikan default value
  const currentAkunId = selectedAkunId ?? '';

  // Gunakan currentAkunId untuk useBukuBesar
  const { data: bukuBesarData, isLoading: isLoadingBukuBesar } = useBukuBesar(currentAkunId);

  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Ambil kode akun dari URL
  const kodeAkunFromUrl = searchParams.get('kode');
  
  // 1. State hooks
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [perusahaan, setPerusahaan] = useState<Perusahaan | null>(null);
  const [subAkunDetails, setSubAkunDetails] = useState<SubAkunDetail[]>([]);
  const [akunKeuanganInfo, setAkunKeuanganInfo] = useState<Record<string, KeuanganInfo>>({});
  // Tambahkan state untuk menyimpan saldo awal yang sudah diproses
  const [processedSaldoAwal, setProcessedSaldoAwal] = useState<BukuBesarItem[]>([]);

  // Add this state for search
  const [searchAkun, setSearchAkun] = useState("");

  // 2. Query hooks dengan tipe data yang benar
  const { data: akunListData, isLoading: isLoadingAkun } = useAkunList();
  const queryClient = useQueryClient();

  // 3. Effect hooks
  useEffect(() => {
    const fetchPerusahaan = async () => {
      try {
        const response = await axios.get('/mahasiswa/perusahaan');
        if (response.data.success && response.data.data.length > 0) {
          // Cari perusahaan dengan status online
          const onlinePerusahaan = response.data.data.find((p: Perusahaan) => p.status === 'online');
          if (onlinePerusahaan) {
            setPerusahaan(onlinePerusahaan);
            console.log("Online perusahaan loaded:", onlinePerusahaan);
          }
        }
      } catch (error) {
        console.error('Error fetching perusahaan:', error);
      }
    };

    fetchPerusahaan();
  }, []);

  // Fetch data sub akun dari endpoint /mahasiswa/subakun
  useEffect(() => {
    const fetchSubAkunDetails = async () => {
      try {
        const response = await axios.get('/mahasiswa/subakun');
        if (response.data.success) {
          console.log("SubAkun data loaded:", response.data.data);
          setSubAkunDetails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching subakun details:', error);
      }
    };

    fetchSubAkunDetails();
  }, []);

  // Tambahkan useEffect untuk mengambil data keuangan dan memproses saldo awal
  useEffect(() => {
    const fetchKeuanganInfo = async () => {
      try {
        const response = await axios.get('/mahasiswa/keuangan');
        if (response.data.success) {
          console.log("Keuangan data loaded:", response.data.data);
          
          // Ubah array menjadi object dengan akun_id sebagai key untuk pencarian cepat
          const keuanganMap: Record<string, KeuanganInfo> = {};
          response.data.data.forEach((item: KeuanganInfo) => {
            keuanganMap[item.akun_id] = item;
          });
          
          setAkunKeuanganInfo(keuanganMap);
          
          // Proses data keuangan sebagai saldo awal jika perusahaan sudah tersedia
          if (perusahaan && perusahaan.start_priode) {
            processInitialBalances(response.data.data, perusahaan.start_priode);
          }
        }
      } catch (error) {
        console.error('Error fetching keuangan info:', error);
      }
    };

    fetchKeuanganInfo();
  }, [perusahaan]); // Jalankan ulang ketika data perusahaan berubah

  // Modifikasi fungsi processInitialBalances untuk membuat ID yang lebih unik
  const processInitialBalances = (keuanganData: KeuanganInfo[], startDate: string) => {
    if (!akunListData) return;
    
    const saldoAwalEntries: BukuBesarItem[] = [];
    
    // Buat map untuk mengelompokkan saldo awal berdasarkan akun_id dan sub_akun_id
    const saldoAwalMap: Record<string, KeuanganInfo[]> = {};
    
    // Kelompokkan saldo awal
    keuanganData.forEach(item => {
      const key = `${item.akun_id}-${item.sub_akun_id || 'no-sub'}`;
      if (!saldoAwalMap[key]) {
        saldoAwalMap[key] = [];
      }
      saldoAwalMap[key].push(item);
    });
    
    // Iterasi melalui kelompok saldo awal
    Object.entries(saldoAwalMap).forEach(([key, items], groupIndex) => {
      if (items.length > 0) {
        // Ambil item pertama dari setiap kelompok (yang dianggap saldo awal paling awal)
        const item = items[0];
        
        // Cari detail akun
        const mainAkun = akunListData.akun.find((a: AkunItem) => a.id === item.akun_id);
        let namaAkun = '';
        let kodeAkun = '';
        let subAkunDetail = null;
        
        if (item.sub_akun_id) {
          subAkunDetail = getSubAkunDetail(item.sub_akun_id);
          if (subAkunDetail) {
            kodeAkun = subAkunDetail.kode;
            namaAkun = subAkunDetail.nama;
          }
        } else if (mainAkun) {
          kodeAkun = mainAkun.kode.toString();
          namaAkun = mainAkun.nama;
        }
        
        // Hanya tambahkan entry saldo awal jika kode dan nama akun berhasil ditemukan
        if (kodeAkun && namaAkun) {
          // Buat ID yang lebih unik dengan timestamp dan index
          const uniqueId = `saldo-awal-${item.akun_id}-${item.sub_akun_id || 'no-sub'}-${Date.now()}-${groupIndex}`;
          
          // Tentukan saldo normal berdasarkan nilai debit dan kredit saldo awal
          const saldoNormal = item.debit > 0 && item.kredit === 0 ? 'debit' : 'kredit';
          
          saldoAwalEntries.push({
            id: uniqueId,
            tanggal: startDate,
            kodeAkun: kodeAkun,
            namaAkun: namaAkun,
            keterangan: "Saldo Awal", // Set keterangan ke "Saldo Awal"
            debit: item.debit || 0,
            kredit: item.kredit || 0,
            saldo: 0, // Saldo akan dihitung dalam calculateRunningSaldo
            is_saldo_awal: true, // Tandai sebagai saldo awal
            sub_akun_id: item.sub_akun_id,
            isDebitNormal: saldoNormal === 'debit', // Simpan informasi saldo normal
            akun: {
              id: item.akun_id,
              kode: kodeAkun,
              nama: namaAkun,
              status: mainAkun?.status || 'active',
              saldo_normal: saldoNormal
            }
          });
        }
      }
    });
    
    console.log("Processed saldo awal entries:", saldoAwalEntries);
    setProcessedSaldoAwal(saldoAwalEntries);
  };

  // 4. Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString; // Return the original string if there's an error
    }
  };

  // Fungsi untuk menentukan saldo normal dari akun
  const getSaldoNormal = (akunId: string): 'debit' | 'kredit' => {
    if (!akunId || !akunListData) {
      return 'debit'; // Default value if no data
    }

    // First check in main accounts
    const mainAkun = akunListData.akun.find((a: AkunItem) => a.id === akunId);
    if (mainAkun && mainAkun.saldo_normal) {
      console.log(`Found saldo normal for akun ${akunId}: ${mainAkun.saldo_normal}`);
      return mainAkun.saldo_normal as 'debit' | 'kredit';
    }

    // If not found in main accounts, check in sub accounts
    const subAkun = akunListData.subAkun.find((s: SubAkunItem) => s.akun.id === akunId);
    if (subAkun && subAkun.akun.saldo_normal) {
      console.log(`Found saldo normal for sub akun ${akunId}: ${subAkun.akun.saldo_normal}`);
      return subAkun.akun.saldo_normal as 'debit' | 'kredit';
    }

    // Default to debit if no saldo_normal is found
    console.log(`No saldo normal found for akun ${akunId}, defaulting to debit`);
    return 'debit';
  };

  // Helper function untuk mendapatkan detail sub akun berdasarkan ID
  const getSubAkunDetail = (subAkunId: string | null) => {
    if (!subAkunId || !subAkunDetails || subAkunDetails.length === 0) {
      return null;
    }
    
    return subAkunDetails.find(sa => sa.id === subAkunId) || null;
  };

  // Tambahkan improved getAkunDetails yang mendukung sub akun
  const getAkunDetails = (akunId: string, subAkunId: string | null = null) => {
    if (!akunListData) return { kode: '', nama: '' };
    
    // Jika ada sub_akun_id, prioritaskan detail dari sub akun
    if (subAkunId) {
      const subAkun = getSubAkunDetail(subAkunId);
      if (subAkun) {
        return { kode: subAkun.kode, nama: subAkun.nama };
      }
    }
    
    // Try to find in main accounts
    const mainAkun = akunListData.akun.find((a: AkunItem) => a.id === akunId);
    if (mainAkun) {
      return { kode: mainAkun.kode.toString(), nama: mainAkun.nama };
    }
    
    // Try to find in sub accounts
    const subAkun = akunListData.subAkun.find((s: SubAkunItem) => s.akun.id === akunId);
    if (subAkun) {
      return { kode: subAkun.kode.toString(), nama: subAkun.nama };
    }
    
    return { kode: '', nama: '' };
  };

  // 5. Derived state
  const isDebitNormal = useMemo(() => {
    if (!bukuBesarData?.data?.keuangan?.akun) return true; // default to debit
    return bukuBesarData.data.keuangan.akun.saldo_normal === 'debit';
  }, [bukuBesarData]);

  // Modifikasi fungsi calculateRunningSaldo untuk konsistensi display saldo
  const calculateRunningSaldo = (entries: BukuBesarItem[], akunId: string): BukuBesarItem[] => {
    if (!entries || entries.length === 0) return [];
    
    // Get saldo_normal from the first entry's akun (they all should have the same saldo_normal)
    const saldoNormal = entries[0]?.akun?.saldo_normal || 'debit';
    
    let runningSaldo = 0;
    
    // Calculate initial balance if there's a saldo awal entry
    const saldoAwalEntry = entries.find(entry => entry.is_saldo_awal);
    if (saldoAwalEntry) {
      runningSaldo = saldoNormal === 'debit' 
        ? (saldoAwalEntry.debit - saldoAwalEntry.kredit)
        : (saldoAwalEntry.kredit - saldoAwalEntry.debit);
    }
    
    // Calculate running balance for all entries
    return entries.map(entry => {
      if (!entry.is_saldo_awal) {
        runningSaldo += saldoNormal === 'debit'
          ? (entry.debit - entry.kredit)
          : (entry.kredit - entry.debit);
      }
      
      return {
        ...entry,
        saldo: runningSaldo,
        isDebitNormal: saldoNormal === 'debit'
      };
    });
  };

  // Update getBukuBesarEntries
  const getBukuBesarEntries = useMemo(() => {
    if (!bukuBesarData?.data) return [];

    const entries: BukuBesarItem[] = [];
    const { keuangan, jurnal } = bukuBesarData.data;

    // Get saldo_normal from the current account
    const saldoNormal = keuangan?.akun?.saldo_normal || 'debit';

    // Add saldo awal if exists
    if (keuangan) {
      entries.push({
        id: keuangan.id,
        // Gunakan tanggal dari perusahaan yang online
        tanggal: perusahaan?.status === 'online' ? perusahaan.start_priode : '',
        kodeAkun: keuangan.akun.kode.toString(),
        namaAkun: keuangan.akun.nama,
        keterangan: "Saldo Awal",
        debit: keuangan.debit || 0,
        kredit: keuangan.kredit || 0,
        saldo: 0, // Will be calculated
        is_saldo_awal: true,
        sub_akun_id: keuangan.sub_akun_id,
        isDebitNormal: saldoNormal === 'debit',
        akun: {
          id: keuangan.akun.id,
          kode: keuangan.akun.kode.toString(),
          nama: keuangan.akun.nama,
          status: keuangan.akun.status,
          saldo_normal: saldoNormal
        }
      });
    }

    // Add journal entries for the selected account
    if (jurnal && Array.isArray(jurnal)) {
      jurnal.forEach(j => {
        entries.push({
          id: j.id,
          tanggal: j.tanggal,
          kodeAkun: j.akun.kode.toString(),
          namaAkun: j.akun.nama,
          keterangan: `${j.bukti} - ${j.keterangan}`,
          debit: j.debit || 0,
          kredit: j.kredit || 0,
          saldo: 0, // Will be calculated
          is_saldo_awal: false,
          sub_akun_id: j.sub_akun_id,
          isDebitNormal: saldoNormal === 'debit',
          akun: {
            id: j.akun.id,
            kode: j.akun.kode.toString(),
            nama: j.akun.nama,
            status: j.akun.status,
            saldo_normal: saldoNormal
          }
        });
      });
    }

    // Sort entries
    const sortedEntries = entries.sort((a, b) => {
      if (a.is_saldo_awal) return -1;
      if (b.is_saldo_awal) return 1;
      return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
    });

    return calculateRunningSaldo(sortedEntries, currentAkunId);
  }, [bukuBesarData, currentAkunId, perusahaan]);

  // Update totals calculation
  const totals = useMemo(() => {
    if (!bukuBesarData?.data) {
      return { debit: 0, kredit: 0, saldo: 0 };
    }

    const { keuangan, jurnal, totalDebit, totalKredit, total } = bukuBesarData.data;

    // Gunakan total yang sudah dihitung dari backend
    return {
      debit: totalDebit || 0,
      kredit: totalKredit || 0,
      saldo: total || 0
    };
  }, [bukuBesarData]);

  // Modifikasi useEffect untuk mengatur akun berdasarkan kode dari URL
  useEffect(() => {
    if (akunListData?.akun && akunListData.akun.length > 0) {
      if (kodeAkunFromUrl) {
        // Cari akun berdasarkan kode
        const akun = akunListData.akun.find(
          (a: AkunItem) => a.kode.toString() === kodeAkunFromUrl
        );
        if (akun) {
          setSelectedAkunId(akun.id);
          return;
        }
        
        // Jika tidak ditemukan di akun utama, cari di sub akun
        const subAkun = akunListData.subAkun.find(
          (s: SubAkunItem) => s.kode.toString() === kodeAkunFromUrl
        );
        if (subAkun) {
          setSelectedAkunId(subAkun.akun.id);
          return;
        }
      }
      
      // Jika tidak ada kode di URL atau kode tidak ditemukan, gunakan akun pertama
      if (!currentAkunId) {
        const sortedAkun = [...akunListData.akun].sort((a: AkunItem, b: AkunItem) => a.kode - b.kode);
        setSelectedAkunId(sortedAkun[0].id);
        // Update URL dengan kode akun pertama
        router.push(`/buku-besar?kode=${sortedAkun[0].kode}`);
      }
    }
  }, [akunListData, kodeAkunFromUrl, currentAkunId]);

  // Modifikasi handler untuk select akun
  const handleAkunChange = (newAkunId: string) => {
    setSelectedAkunId(newAkunId);
    // Cari kode akun yang sesuai
    const akun = akunListData?.akun.find((a: AkunItem) => a.id === newAkunId);
    if (akun) {
      router.push(`/buku-besar?kode=${akun.kode}`);
    } else {
      const subAkun = akunListData?.subAkun.find((s: SubAkunItem) => s.akun.id === newAkunId);
      if (subAkun) {
        router.push(`/buku-besar?kode=${subAkun.kode}`);
      }
    }
  };

  // Update this helper function to make search more flexible
  const filteredAkun = useMemo(() => {
    const searchLower = searchAkun.toLowerCase().trim();
    
    if (!searchLower) {
      return {
        akun: akunListData?.akun || [],
        subAkun: akunListData?.subAkun || []
      };
    }

    // Normalize search terms by replacing multiple spaces and dashes with single space
    const normalizedSearch = searchLower.replace(/[-\s]+/g, ' ').trim();
    const searchTerms = normalizedSearch.split(' ').filter(term => term.length > 0);

    return {
      akun: akunListData?.akun.filter((akun: AkunItem) => {
        const akunText = `${akun.kode} - ${akun.nama}`.toLowerCase();
        // Normalize akun text the same way as search terms
        const normalizedAkunText = akunText.replace(/[-\s]+/g, ' ').trim();
        return searchTerms.every(term => normalizedAkunText.includes(term));
      }) || [],
      subAkun: akunListData?.subAkun.filter((subAkun: SubAkunItem) => {
        const subAkunText = `${subAkun.kode} - ${subAkun.nama}`.toLowerCase();
        // Normalize sub akun text the same way as search terms
        const normalizedSubAkunText = subAkunText.replace(/[-\s]+/g, ' ').trim();
        return searchTerms.every(term => normalizedSubAkunText.includes(term));
      }) || []
    };
  }, [akunListData, searchAkun]);

  // 8. Main render
  if (isLoadingAkun) {
    return <div className="text-center py-4">Loading akun...</div>;
  }

  console.log("Selected Akun ID:", currentAkunId);
  console.log("Akun List Data:", akunListData);
  console.log("Buku Besar Data:", bukuBesarData);

  // Jika bukuBesarData tersedia, tampilkan sampel data pertama
  if (bukuBesarData && bukuBesarData.length > 0) {
    console.log("Sample Entry:", bukuBesarData[0]);
    console.log("Has kodeAkun?", 'kodeAkun' in bukuBesarData[0]);
    console.log("Has namaAkun?", 'namaAkun' in bukuBesarData[0]);
  }

  return (
    <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
      <div className="flex gap-4 mb-6">
        {/* Debit & Kredit Container */}
        <div className="flex flex-1 flex-grow">
          {/* Debit Card */}
          <Card className="bg-red-400 p-4 rounded-r-none rounded-l-xl flex-1 border-r-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-l-xl rounded-r-none h-full">
              <p className="text-sm text-white/90">Debit</p>
              <p className="text-lg font-medium text-white">
                Rp {totals.debit.toLocaleString()}
              </p>
            </div>
          </Card>

          {/* Kredit Card */}
          <Card className="bg-red-400 p-4 rounded-l-none rounded-r-xl flex-1 border-l-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-l-none rounded-r-xl h-full">
              <p className="text-sm text-white/90">Kredit</p>
              <p className="text-lg font-medium text-white">
                Rp {totals.kredit.toLocaleString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Saldo Card */}
        <Card className="bg-red-400 p-4 rounded-xl w-1/3">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl h-full">
            <p className="text-sm text-white/90">Saldo</p>
            <p className="text-lg font-medium text-white">
              {totals.saldo < 0 ? '-' : ''}Rp {Math.abs(totals.saldo).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* <BukuBesarCard 
        selectedMainAccount={selectedMainAccount} 
        className="bg-red-500 text-white p-6 rounded-xl"
      />
       */}
      <div className="flex justify-between items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <Select
            value={currentAkunId || ""}
            onValueChange={handleAkunChange}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Pilih Akun">
                {currentAkunId && akunListData && (
                  <>
                    {(() => {
                      const selectedAkun = akunListData.akun.find((akun: AkunItem) => akun.id === currentAkunId);
                      if (selectedAkun) {
                        return `${selectedAkun.kode} - ${selectedAkun.nama}`;
                      }
                      const selectedSubAkun = akunListData.subAkun.find((sub: SubAkunItem) => sub.akun.id === currentAkunId);
                      if (selectedSubAkun) {
                        return `${selectedSubAkun.kode} - ${selectedSubAkun.nama}`;
                      }
                      return 'Pilih Akun';
                    })()}
                  </>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent 
              onCloseAutoFocus={(e) => e.preventDefault()}
              className="min-w-[300px]"
            >
              <div className="p-2 sticky top-0 bg-white z-10 border-b">
                <Input
                  placeholder="Cari akun..."
                  value={searchAkun}
                  onChange={(e) => setSearchAkun(e.target.value)}
                  className="h-8"
                  onKeyDown={(e) => {
                    // Prevent default behavior for up/down/enter keys
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                      e.stopPropagation();
                      return;
                    }
                    // Allow typing to continue
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    // Prevent closing dropdown when clicking input
                    e.stopPropagation();
                  }}
                  autoComplete="off"
                  // Keep focus on input
                  onBlur={(e) => {
                    e.target.focus();
                  }}
                />
              </div>
              
              <div 
                className="overflow-y-auto max-h-[300px]"
                onClick={(e) => {
                  // Prevent losing focus when clicking scroll area
                  e.stopPropagation();
                }}
              >
                {filteredAkun.akun.length === 0 && filteredAkun.subAkun.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    Tidak ada akun yang cocok
                  </div>
                ) : (
                  <>
                    {filteredAkun.akun.length > 0 && (
              <SelectGroup>
                <SelectLabel>Akun</SelectLabel>
                        {filteredAkun.akun
                  .sort((a: AkunItem, b: AkunItem) => a.kode - b.kode)
                  .map((akun: AkunItem) => (
                            <SelectItem 
                              key={akun.id} 
                              value={akun.id}
                              onMouseDown={(e) => {
                                // Allow selection without losing focus
                                e.preventDefault();
                                handleAkunChange(akun.id);
                              }}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {`${akun.kode} - ${akun.nama}`}
                    </SelectItem>
                  ))}
              </SelectGroup>
                    )}
                    
                    {filteredAkun.subAkun.length > 0 && (
              <SelectGroup>
                <SelectLabel>Sub Akun</SelectLabel>
                        {filteredAkun.subAkun
                  .sort((a: SubAkunItem, b: SubAkunItem) => a.kode - b.kode)
                  .map((subAkun: SubAkunItem) => (
                            <SelectItem 
                              key={subAkun.id} 
                              value={subAkun.akun.id}
                              onMouseDown={(e) => {
                                // Allow selection without losing focus
                                e.preventDefault();
                                handleAkunChange(subAkun.akun.id);
                              }}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {`${subAkun.kode} - ${subAkun.nama}`}
                </SelectItem>
              ))}
              </SelectGroup>
                    )}
                  </>
                )}
              </div>
            </SelectContent>
          </Select>

          {/* <Input
            placeholder="Search by Account Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px] bg-gray-50 border-gray-200 rounded-lg"
          /> */}
          
          <Select
            value={showAll ? 'all' : '10'}
            onValueChange={(value) => {
              if (value === 'all') {
                setShowAll(true);
              } else {
                setShowAll(false);
              }
            }}
          >
            <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 rounded-lg">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kode Akun</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Kredit</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBukuBesar ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading data buku besar...
                </TableCell>
              </TableRow>
            ) : getBukuBesarEntries.length > 0 ? (
              getBukuBesarEntries.map((entry: BukuBesarItem, index: number) => {
                // Dapatkan detail akun/sub akun yang sesuai
                let displayKode = '';
                let displayNama = '';
                
                // Jika entry memiliki sub_akun_id, prioritaskan menggunakan data sub akun
                if (entry.sub_akun_id) {
                  const subAkun = getSubAkunDetail(entry.sub_akun_id);
                  if (subAkun) {
                    displayKode = subAkun.kode;
                    displayNama = subAkun.nama;
                  }
                }
                
                // Jika tidak ada sub akun, gunakan data akun biasa
                if (!displayKode) {
                const akunDetails = getAkunDetails(currentAkunId);
                  displayKode = entry.kodeAkun || entry.akun?.kode || akunDetails.kode || '';
                  displayNama = entry.namaAkun || entry.akun?.nama || akunDetails.nama || '';
                }
                
                // Buat key yang lebih unik
                const uniqueKey = `${entry.id}-${entry.tanggal}-${entry.sub_akun_id || "no-sub"}-${index}-${Date.now()}`;
                
                return (
              <TableRow 
                    key={uniqueKey}
                  className={entry.is_saldo_awal ? 'bg-gray-50' : ''}
                >
                  <TableCell>{formatDate(entry.tanggal)}</TableCell>
                    <TableCell>{displayKode}</TableCell>
                    <TableCell>{displayNama}</TableCell>
                  <TableCell>{entry.keterangan}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit ? `Rp ${entry.debit.toLocaleString()}` : '0'}
                  </TableCell>
                <TableCell className="text-right">
                    {entry.kredit ? `Rp ${entry.kredit.toLocaleString()}` : '0'}
                </TableCell>
                <TableCell className="text-right">
                      <span className={entry.saldo < 0 ? 'text-red-600' : ''}>
                        {entry.saldo < 0 ? '-' : ''}
                        Rp {Math.abs(entry.saldo).toLocaleString() || '0'}
                      </span>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  {currentAkunId ? 'Tidak ada data untuk akun ini' : 'Pilih akun untuk melihat data'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <tfoot className="bg-gray-50 font-medium">
            <tr>
              <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
              <td className="px-2 py-2 text-right">
                {totals.debit ? `Rp ${totals.debit.toLocaleString()}` : '0'}
              </td>
              <td className="px-2 py-2 text-right">
                {totals.kredit ? `Rp ${totals.kredit.toLocaleString()}` : '0'}
              </td>
              <td className="px-2 py-2 text-right">
                <span className={totals.saldo < 0 ? 'text-red-600' : ''}>
                  {totals.saldo < 0 ? '-' : ''}
                  Rp {Math.abs(totals.saldo).toLocaleString() || '0'}
                </span>
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
    </div>
  );
} 