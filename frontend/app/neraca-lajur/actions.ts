'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateNeracaLajur() {
  revalidatePath('/neraca-lajur');
} 