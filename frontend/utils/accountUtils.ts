export const getAkunKode = (akunId: string, akunListData: any) => {
  const mainAkun = akunListData?.akun.find((a: any) => a.id === akunId);
  if (mainAkun) {
    return mainAkun.kode.toString();
  }
  
  const subAkun = akunListData?.subAkun.find((s: any) => s.akun.id === akunId);
  if (subAkun) {
    return subAkun.kode.toString();
  }
  
  return null;
}; 