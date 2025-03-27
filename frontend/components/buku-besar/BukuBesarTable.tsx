"use client";
import { useState, useEffect, useMemo } from "react";
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
}

interface SubAkun {
  id: string;
  kode: number;
  nama: string;
  akun: {
    id: string;
    kode: number;
    nama: string;
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

export function BukuBesarTable() {
  // 1. State hooks
  const [selectedAkunId, setSelectedAkunId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [perusahaan, setPerusahaan] = useState<Perusahaan | null>(null);
  const [subAkunDetails, setSubAkunDetails] = useState<SubAkunDetail[]>([]);
  const [akunKeuanganInfo, setAkunKeuanganInfo] = useState<Record<string, KeuanganInfo>>({});
  // Tambahkan state untuk menyimpan saldo awal yang sudah diproses
  const [processedSaldoAwal, setProcessedSaldoAwal] = useState<BukuBesarItem[]>([]);

  // 2. Query hooks dengan tipe data yang benar
  const { data: akunListData, isLoading: isLoadingAkun } = useAkunList();
  const { data: bukuBesarData, isLoading: isLoadingBukuBesar } = useBukuBesar(selectedAkunId);
  const queryClient = useQueryClient();

  // 3. Effect hooks
  useEffect(() => {
    const fetchPerusahaan = async () => {
      try {
        const response = await axios.get('/mahasiswa/perusahaan');
        if (response.data.success && response.data.data.length > 0) {
          setPerusahaan(response.data.data[0]);
          console.log("Perusahaan loaded:", response.data.data[0]);
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
    // Tambahkan pengecekan akunId untuk menghindari error
    if (!akunId) {
      return 'debit'; // Default jika akunId tidak ada
    }

    // Ubah pendekatan menjadi lebih langsung dan jelas
    // Pertama, cek jika ada data transaksi untuk akun ini
    const akunTransactions = bukuBesarData && Array.isArray(bukuBesarData) 
      ? bukuBesarData.filter(entry => 
          entry && entry.akun && entry.akun.id === akunId && !entry.is_saldo_awal
        )
      : [];
    
    // Cek saldo awal untuk akun ini
    const saldoAwal = processedSaldoAwal && processedSaldoAwal.length > 0
      ? processedSaldoAwal.find(entry => 
          entry && entry.akun && entry.akun.id === akunId && entry.is_saldo_awal
        )
      : null;
    
    console.log("Saldo Awal untuk akun:", saldoAwal);
    console.log("Transaksi untuk akun:", akunTransactions);
    
    // 1. KASUS 1: Jika saldo awal memiliki nilai debit atau kredit yang signifikan
    if (saldoAwal && (saldoAwal.debit > 0 || saldoAwal.kredit > 0)) {
      if (saldoAwal.debit > saldoAwal.kredit) {
        console.log("Menggunakan saldo awal: DEBIT");
        return 'debit';
      } else if (saldoAwal.kredit > saldoAwal.debit) {
        console.log("Menggunakan saldo awal: KREDIT");
        return 'kredit';
      }
    }
    
    // 2. KASUS 2: Jika saldo awal sama-sama 0 atau null, cek transaksi pertama
    if (akunTransactions.length > 0) {
      // Urutkan berdasarkan tanggal
      const sortedTransactions = [...akunTransactions].sort((a, b) => {
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        return dateA - dateB;
      });
      
      const firstTransaction = sortedTransactions[0];
      console.log("Transaksi pertama untuk menentukan saldo normal:", firstTransaction);
      
      // Cek transaksi pertama
      if (firstTransaction.debit > 0 && firstTransaction.kredit === 0) {
        console.log("Transaksi pertama: DEBIT");
        return 'debit';
      } else if (firstTransaction.kredit > 0 && firstTransaction.debit === 0) {
        console.log("Transaksi pertama: KREDIT");
        return 'kredit';
      } else if (firstTransaction.debit > firstTransaction.kredit) {
        console.log("Transaksi pertama nilai debit lebih besar: DEBIT");
        return 'debit';
      } else if (firstTransaction.kredit > firstTransaction.debit) {
        console.log("Transaksi pertama nilai kredit lebih besar: KREDIT");
        return 'kredit';
      }
    }
    
    // 3. KASUS 3: Jika tidak ada transaksi, periksa berdasarkan kode akun
    if (akunListData && akunListData.akun) {
      const mainAkun = akunListData.akun.find((a: AkunItem) => a.id === akunId);
      if (mainAkun) {
        const kodeAkun = mainAkun.kode.toString();
        // Cek digit pertama kode akun
        if (kodeAkun.startsWith('1') || kodeAkun.startsWith('5')) {
          console.log("Berdasarkan kode akun: DEBIT");
          return 'debit'; // Aset dan Beban: saldo normal debit
        } else if (kodeAkun.startsWith('2') || kodeAkun.startsWith('3') || kodeAkun.startsWith('4')) {
          console.log("Berdasarkan kode akun: KREDIT");
          return 'kredit'; // Kewajiban, Ekuitas, Pendapatan: saldo normal kredit
        }
      }
    }
    
    // Default ke debit jika tidak ada informasi
    console.log("Default: DEBIT");
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
    return getSaldoNormal(selectedAkunId) === 'debit';
  }, [selectedAkunId, akunKeuanganInfo]);

  // Modifikasi fungsi calculateRunningSaldo untuk konsistensi display saldo
  const calculateRunningSaldo = (entries: BukuBesarItem[], akunId: string): BukuBesarItem[] => {
    if (!entries || entries.length === 0) return [];
    
    const saldoNormal = getSaldoNormal(akunId);
    console.log(`Saldo normal untuk akun ${akunId} adalah ${saldoNormal}`);
    
    let runningSaldo = 0;
    
    // Cari saldo awal jika ada
    const saldoAwalEntry = entries.find(entry => entry.is_saldo_awal);
    if (saldoAwalEntry) {
      // Menentukan saldo awal berdasarkan saldo normal
      if (saldoNormal === 'debit') {
        runningSaldo = saldoAwalEntry.debit - saldoAwalEntry.kredit;
      } else { // saldo normal kredit
        runningSaldo = saldoAwalEntry.kredit - saldoAwalEntry.debit;
      }
    }
    
    // Hitung saldo berjalan
    return entries.map(entry => {
      // Skip penghitungan ulang untuk entri saldo awal karena sudah dihitung
      if (!entry.is_saldo_awal) {
        // Update saldo berdasarkan saldo normal
        if (saldoNormal === 'debit') {
          runningSaldo += (entry.debit - entry.kredit);
        } else {
          runningSaldo += (entry.kredit - entry.debit);
        }
      }
      
      return {
        ...entry,
        saldo: runningSaldo,
        isDebitNormal: saldoNormal === 'debit' // Simpan informasi saldo normal
      };
    });
  };

  // Modifikasi getBukuBesarEntries untuk filter saldo awal yang lebih tepat
  const getBukuBesarEntries = useMemo(() => {
    if (!selectedAkunId || !akunListData) {
      return [];
    }

    console.log("Selected Akun ID:", selectedAkunId);
    console.log("Processing bukuBesarData for entries:", bukuBesarData);
    console.log("Processed saldo awal:", processedSaldoAwal);

    // Gabungkan data buku besar dari API dengan saldo awal yang sudah diproses
    const combinedData: BukuBesarItem[] = [
      ...(processedSaldoAwal || []),
      ...(bukuBesarData && Array.isArray(bukuBesarData) ? bukuBesarData : [])
    ];

    // Cek apakah yang dipilih adalah akun induk
    const mainAkun = akunListData.akun.find((a: AkunItem) => a.id === selectedAkunId);
    if (mainAkun) {
      const mainKode = mainAkun.kode.toString();
      
      // Filter semua transaksi berdasarkan kode akun yang dimulai dengan kode akun induk
      const filteredEntries = combinedData.filter((entry: BukuBesarItem) => {
        // Filter saldo awal - saldo awal hanya ditampilkan untuk akun yang dipilih
        if (entry.is_saldo_awal) {
          // Jika exact match dengan akun yang dipilih
          if (entry.akun.id === selectedAkunId) {
            return true;
          }
          
          // Jika ini saldo awal sub akun, cek apakah parent akun-nya adalah akun yang dipilih
          if (entry.sub_akun_id) {
            const subAkun = getSubAkunDetail(entry.sub_akun_id);
            if (subAkun && subAkun.akun_id === selectedAkunId) {
              return true;
            }
          }
          
          return false;
        }
        
        // Filter transaksi normal - tetap tampilkan semua transaksi yang terkait
        if (entry.sub_akun_id) {
          const subAkun = getSubAkunDetail(entry.sub_akun_id);
          if (subAkun) {
            // Cek apakah kode sub akun dimulai dengan kode akun induk
            return subAkun.kode.startsWith(mainKode);
          }
        }
        
        // Jika tidak ada sub_akun_id, gunakan kode akun biasa
        const entryKode = entry.kodeAkun || entry.akun?.kode || '';
        return entryKode.toString().startsWith(mainKode);
      });
      
      // Debug entries yang difilter
      console.log("Filtered entries:", filteredEntries);
      
      // Urutkan berdasarkan tanggal dan flag is_saldo_awal (saldo awal selalu tampil pertama)
      const sortedEntries = filteredEntries.sort((a, b) => {
        // Saldo awal selalu tampil pertama
        if (a.is_saldo_awal && !b.is_saldo_awal) return -1;
        if (!a.is_saldo_awal && b.is_saldo_awal) return 1;
        
        // Kemudian sort berdasarkan tanggal
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        
        if (dateA !== dateB) {
          return dateA - dateB; // Ascending by date
        }
        
        // Kemudian sort berdasarkan kode akun jika tanggal sama
        let kodeA = a.kodeAkun || a.akun?.kode || '';
        if (a.sub_akun_id) {
          const subAkunA = getSubAkunDetail(a.sub_akun_id);
          if (subAkunA) {
            kodeA = subAkunA.kode;
          }
        }
        
        let kodeB = b.kodeAkun || b.akun?.kode || '';
        if (b.sub_akun_id) {
          const subAkunB = getSubAkunDetail(b.sub_akun_id);
          if (subAkunB) {
            kodeB = subAkunB.kode;
          }
        }
        
        return kodeA.toString().localeCompare(kodeB.toString());
      });
      
      // Hitung saldo berjalan berdasarkan saldo normal akun
      return calculateRunningSaldo(sortedEntries, selectedAkunId);
    }
    
    // Jika yang dipilih adalah sub akun
    const subAkun = akunListData.subAkun.find((s: SubAkunItem) => s.akun.id === selectedAkunId);
    if (subAkun) {
      const filteredEntries = combinedData.filter((entry: BukuBesarItem) => {
        // Filter saldo awal - hanya tampilkan saldo awal yang terkait langsung
        if (entry.is_saldo_awal) {
          // Untuk saldo awal, hanya tampilkan jika akun ID sama dengan yang dipilih
          if (entry.akun.id === selectedAkunId) {
            return true;
          }
          
          // Jika entry memiliki sub_akun_id, cek kesesuaian dengan subAkun
          if (entry.sub_akun_id && entry.sub_akun_id === subAkun.id) {
            return true;
          }
          
          return false;
        }
        
        // Filter transaksi normal
        if (entry.sub_akun_id) {
          const detail = getSubAkunDetail(entry.sub_akun_id);
          return detail && detail.kode === subAkun.kode.toString();
        }
        
        // Jika tidak ada sub_akun_id, gunakan cara biasa
        const entryKode = entry.kodeAkun || entry.akun?.kode || '';
        return entryKode.toString() === subAkun.kode.toString();
      });
      
      // Urutkan berdasarkan tanggal dan flag is_saldo_awal
      const sortedEntries = filteredEntries.sort((a, b) => {
        // Saldo awal selalu tampil pertama
        if (a.is_saldo_awal && !b.is_saldo_awal) return -1;
        if (!a.is_saldo_awal && b.is_saldo_awal) return 1;
        
        // Kemudian sort berdasarkan tanggal
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        return dateA - dateB; // Ascending by date
      });
      
      // Hitung saldo berjalan
      return calculateRunningSaldo(sortedEntries, selectedAkunId);
    }
    
    // Default case: Filter untuk semua akun
    // Untuk saldo awal, tambahkan filter untuk hanya menampilkan yang relevan dengan akun yang dipilih
    const filteredByAkun = combinedData.filter((entry: BukuBesarItem) => {
      if (entry.is_saldo_awal) {
        return entry.akun.id === selectedAkunId;
      }
      return true; // Tampilkan semua transaksi normal (non-saldo awal)
    });
    
    // Urutkan berdasarkan tanggal dan saldo awal
    const sortedByDate = filteredByAkun.sort((a, b) => {
      // Saldo awal selalu tampil pertama
      if (a.is_saldo_awal && !b.is_saldo_awal) return -1;
      if (!a.is_saldo_awal && b.is_saldo_awal) return 1;
      
      // Kemudian sort berdasarkan tanggal
      const dateA = new Date(a.tanggal).getTime();
      const dateB = new Date(b.tanggal).getTime();
      return dateA - dateB;
    });
    
    return calculateRunningSaldo(sortedByDate, selectedAkunId);
  }, [bukuBesarData, selectedAkunId, akunListData, subAkunDetails, akunKeuanganInfo, processedSaldoAwal]);

  // Update totals untuk menggunakan saldo normal yang benar
  const totals = useMemo(() => {
    if (!getBukuBesarEntries || getBukuBesarEntries.length === 0) {
      return {
        debit: 0,
        kredit: 0,
        saldo: 0
      };
    }

    const totalDebit = getBukuBesarEntries.reduce((acc, item) => acc + (item.debit || 0), 0);
    const totalKredit = getBukuBesarEntries.reduce((acc, item) => acc + (item.kredit || 0), 0);
    
    // Ambil saldo dari entry terakhir, karena sudah dihitung dengan benar
    const lastSaldo = getBukuBesarEntries[getBukuBesarEntries.length - 1].saldo;

    return {
      debit: totalDebit,
      kredit: totalKredit,
      saldo: lastSaldo
    };
  }, [getBukuBesarEntries]);

  // 6. Effect untuk set akun pertama dengan tipe data yang benar
  useEffect(() => {
    if (akunListData?.akun && akunListData.akun.length > 0 && !selectedAkunId) {
      const sortedAkun = [...akunListData.akun].sort((a: AkunItem, b: AkunItem) => a.kode - b.kode);
      setSelectedAkunId(sortedAkun[0].id);
    }
  }, [akunListData, selectedAkunId]);

  // 7. Memo hooks
  // const totals = useMemo(() => {
  //   if (!bukuBesarData || !Array.isArray(bukuBesarData)) {
  //     return {
  //       debit: 0,
  //       kredit: 0,
  //       saldo: 0
  //     };
  //   }

  //   return bukuBesarData.reduce((acc, item) => ({
  //     debit: acc.debit + (item.debit || 0),
  //     kredit: acc.kredit + (item.kredit || 0),
  //     saldo: bukuBesarData.length > 0 ? bukuBesarData[bukuBesarData.length - 1].saldo : 0
  //   }), { debit: 0, kredit: 0, saldo: 0 });
  // }, [bukuBesarData]);

  // 8. Main render
  if (isLoadingAkun) {
    return <div className="text-center py-4">Loading akun...</div>;
  }

  console.log("Selected Akun ID:", selectedAkunId);
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
            value={selectedAkunId}
            onValueChange={setSelectedAkunId}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Pilih Akun">
                {selectedAkunId && akunListData && (
                  <>
                    {(() => {
                      const selectedAkun = akunListData.akun.find((akun: AkunItem) => akun.id === selectedAkunId);
                      if (selectedAkun) {
                        return `${selectedAkun.kode} - ${selectedAkun.nama}`;
                      }
                      const selectedSubAkun = akunListData.subAkun.find((sub: SubAkunItem) => sub.akun.id === selectedAkunId);
                      if (selectedSubAkun) {
                        return `${selectedSubAkun.kode} - ${selectedSubAkun.nama}`;
                      }
                      return 'Pilih Akun';
                    })()}
                  </>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Akun</SelectLabel>
                {akunListData?.akun
                  .sort((a: AkunItem, b: AkunItem) => a.kode - b.kode)
                  .map((akun: AkunItem) => (
                    <SelectItem key={akun.id} value={akun.id}>
                      {akun.kode} - {akun.nama}
                    </SelectItem>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Sub Akun</SelectLabel>
                {akunListData?.subAkun
                  .sort((a: SubAkunItem, b: SubAkunItem) => a.kode - b.kode)
                  .map((subAkun: SubAkunItem) => (
                    <SelectItem key={subAkun.id} value={subAkun.akun.id}>
                      {subAkun.kode} - {subAkun.nama}
                </SelectItem>
              ))}
              </SelectGroup>
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
                const akunDetails = getAkunDetails(selectedAkunId);
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
                    {entry.debit ? `Rp ${entry.debit.toLocaleString()}` : '-'}
                  </TableCell>
                <TableCell className="text-right">
                    {entry.kredit ? `Rp ${entry.kredit.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          entry.saldo === 0 
                            ? 'bg-gray-100 text-gray-600' 
                            : entry.isDebitNormal
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-purple-100 text-purple-600'
                        }`}>
                          {entry.saldo === 0 
                            ? 'Balance' 
                            : entry.isDebitNormal ? 'D' : 'K'}
                        </span>
                        <span className={entry.saldo < 0 ? 'text-red-600' : ''}>
                          {entry.saldo < 0 ? '-' : ''}Rp {Math.abs(entry.saldo).toLocaleString()}
                        </span>
                      </div>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  {selectedAkunId ? 'Tidak ada data untuk akun ini' : 'Pilih akun untuk melihat data'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <tfoot className="bg-gray-50 font-medium">
            <tr>
              <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
              <td className="px-4 py-2 text-right">
                Rp {totals.debit.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                Rp {totals.kredit.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    totals.saldo === 0 
                      ? 'bg-gray-100 text-gray-600' 
                      : isDebitNormal
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-purple-100 text-purple-600'
                  }`}>
                    {totals.saldo === 0 
                      ? 'Balance' 
                      : isDebitNormal ? 'D' : 'K'}
                  </span>
                  <span className={totals.saldo < 0 ? 'text-red-600' : ''}>
                    {totals.saldo < 0 ? '-' : ''}Rp {Math.abs(totals.saldo).toLocaleString()}
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
    </div>
  );
} 