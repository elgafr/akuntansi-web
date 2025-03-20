import { BukuBesarClient } from './BukuBesarClient';
import axios from "@/lib/axios";
import { Suspense } from 'react';
import { Loading } from '@/components/ui/loading';

interface BukuBesarEntry {
  // Sesuaikan dengan tipe data dari API Anda
  id: string;
  akun: {
    id: string;
    kode: string;
    nama: string;
  };
  saldo: number;
  // tambahkan field lain sesuai kebutuhan
}

async function getBukuBesarData() {
  try {
    const response = await axios.get('/mahasiswa/buku-besar');
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching buku besar:', error);
    throw new Error('Failed to fetch buku besar data');
  }
}

export default async function BukuBesarPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BukuBesarContent />
    </Suspense>
  );
}

async function BukuBesarContent() {
  let initialData;
  try {
    initialData = await getBukuBesarData();
  } catch (error) {
    console.error('Error fetching initial data:', error);
    initialData = []; // Berikan array kosong jika terjadi error
  }
  
  return <BukuBesarClient initialData={initialData} />;
} 