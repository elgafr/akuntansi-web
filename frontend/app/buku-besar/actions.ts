'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateBukuBesar() {
  revalidatePath('/buku-besar');
} 