"use client";

import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface KrsItem {
  id: string;
  kelas_id: string;
  nama: string;
  kategori: string;
  angkatan: string;
}

interface ClassItem {
  id: string;
  nama: string;
  kategori: string;
  angkatan: string;
}

export default function Krs() {
  const [selectedClasses, setSelectedClasses] = useState<KrsItem[]>([]);
  const [classCategories, setClassCategories] = useState<
    Record<string, ClassItem[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>(""); // userId state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [action, setAction] = useState<"add" | "delete">("add");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // Fetch profile data and set userId
    useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get("/mahasiswa/profile");
        if (profileRes.data.success) {
          setUserId(profileRes.data.data.user_id);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // Fetch data kelas
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classesRes = await axios.get("/instruktur/kelas");
        if (classesRes.data.success) {
          const categories = classesRes.data.data.reduce(
            (acc: Record<string, ClassItem[]>, item: ClassItem) => {
              if (!acc[item.kategori]) acc[item.kategori] = [];
              acc[item.kategori].push(item);
              return acc;
            },
            {}
          );
          setClassCategories(categories);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  // Fetch data KRS ketika userId tersedia
  useEffect(() => {
    const fetchKrs = async () => {
      if (!userId) return;
      
      try {
        // Perbaikan 2: Gunakan endpoint yang benar dan tambahkan headers
        const krsRes = await axios.get(`/mahasiswa/krs`, {
          params: {  // Gunakan query parameter
            user_id: userId
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (krsRes.data.success) {
          // Perbaikan 3: Handle mapping data lebih aman
          const mergedKrs = krsRes.data.data.map((krs: any) => ({
            ...krs,
            nama: classCategories[krs.kategori]?.find((c: ClassItem) => c.id === krs.kelas_id)?.nama || "Kelas Tidak Ditemukan",
            kategori: krs.kategori,
            angkatan: classCategories[krs.kategori]?.find((c: ClassItem) => c.id === krs.kelas_id)?.angkatan || "Unknown"
          }));
          
          setSelectedClasses(mergedKrs);
        }
      } catch (error) {
        console.error("Error fetching KRS:", error);
        // Tambahkan handling error lebih spesifik
        if ((error as any).response?.status === 404) {
          console.log("Data KRS kosong untuk user ini");
          setSelectedClasses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchKrs();
  }, [userId]);

  const handleClassSelection = (classItem: ClassItem) => {
    if (selectedClasses.some((item) => item.kelas_id === classItem.id)) {
      alert("Kelas ini sudah dipilih.");
      return;
    }

    setSelectedClass(classItem);
    setAction("add");
    setShowConfirmDialog(true);
  };

  const handleDeleteClass = (krsId: string) => {
    setSelectedClass(selectedClasses.find((c) => c.id === krsId) || null);
    setAction("delete");
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userId || !selectedClass) return;

    try {
      if (action === "add") {
        const response = await axios.post(
          "/mahasiswa/krs",
          {
            user_id: userId,
            kelas_id: selectedClass.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setSelectedClasses((prev) => [
            ...prev,
            {
              id: response.data.data.id,
              kelas_id: selectedClass.id,
              nama: selectedClass.nama,
              kategori: selectedClass.kategori,
              angkatan: selectedClass.angkatan,
            },
          ]);
        }
      } else if (action === "delete" && selectedClass) {
        await axios.delete(`/mahasiswa/krs/${selectedClass.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSelectedClasses((prev) => prev.filter((item) => item.id !== selectedClass.id));
      }
    } catch (error) {
      console.error("Error processing request:", error);
      const errorMessage = (error as any).response?.data?.message || "Terjadi kesalahan";
      alert(`Gagal ${action === "add" ? "menambah" : "menghapus"} kelas: ${errorMessage}`);
    } finally {
      setShowConfirmDialog(false);
      setSelectedClass(null);
    }
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pilih Kelas</h1>
        <h2 className="text-2xl font-bold">KRS Anda</h2>
      </div>

      <div className="flex gap-6">
        {/* Daftar Kelas */}
        <Card className="w-1/2">
          <CardContent className="p-4">
            <Accordion type="single" collapsible>
              {Object.entries(classCategories).map(([category, classes]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="font-semibold">
                    {category}
                  </AccordionTrigger>
                  {classes.map((classItem) => (
                    <AccordionContent
                      key={classItem.id}
                      className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                      onClick={() => handleClassSelection(classItem)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{classItem.nama}</p>
                          <p className="text-sm text-gray-500">
                            Angkatan {classItem.angkatan}
                          </p>
                        </div>
                        {selectedClasses.some(
                          (c) => c.kelas_id === classItem.id
                        ) && (
                          <span className="text-green-500 text-sm">
                            ✓ Terpilih
                          </span>
                        )}
                      </div>
                    </AccordionContent>
                  ))}
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* KRS Terpilih */}
        <Card className="w-1/2">
          <CardContent className="p-4 space-y-4">
            {selectedClasses.length > 0 ? (
              selectedClasses.map((krsItem) => {
                const classItem = Object.values(classCategories)
                  .flat()
                  .find((item) => item.id === krsItem.kelas_id);

                return classItem ? (
                  <Card key={krsItem.id} className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {classItem.nama}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Angkatan: {classItem.angkatan}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClass(krsItem.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })
            ) : (
              <div className="text-center py-6 text-gray-500">
                Belum ada kelas yang dipilih
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Konfirmasi Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "add"
                ? "Tambah Kelas ke KRS?"
                : "Hapus Kelas dari KRS?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "add"
                ? "Anda akan menambahkan kelas ini ke Kartu Rencana Studi"
                : "Anda akan menghapus kelas ini dari Kartu Rencana Studi"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmAction()}>
              {action === "add" ? "Tambahkan" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
