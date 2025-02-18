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

export default function Krs() {
  const [selectedClasses, setSelectedClasses] = useState<any>({});
  const [classCategories, setClassCategories] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [action, setAction] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // Untuk menyimpan kategori kelas yang dipilih

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("/mahasiswa/profile");
        if (response.data.success && response.data.data.length > 0) {
          setUserId(response.data.data[0].user_id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  const handleClassSelection = async (
    category: string,
    className: string,
    kelasId: string
  ): Promise<void> => {
    setSelectedClasses((prevState) => ({
      ...prevState,
      [category]: { nama: className, id: kelasId },
    }));
    setSelectedClassId(kelasId);
    setSelectedCategory(category); // Simpan kategori yang dipilih
    setAction("add");
    setShowConfirmDialog(true);
  };

  const handleDeleteClass = (category: string) => {
    setSelectedClassId(selectedClasses[category].id); // Set ID kelas yang akan dihapus
    setSelectedCategory(category); // Simpan kategori yang dipilih
    setAction("delete");
    setShowConfirmDialog(true);
  };

  const getTokenFromLocalStorage = () => {
    return localStorage.getItem("token");
  };

  const handleConfirmAction = async () => {
    if (!userId || !selectedClassId) {
      alert("Missing required data: user_id or kelas_id");
      return;
    }

    try {
      const token = getTokenFromLocalStorage();
      if (!token) {
        alert("Token not found. Please log in again.");
        return;
      }

      if (action === "add") {
        const response = await axios.post(
          "/mahasiswa/krs",
          {
            user_id: userId,
            kelas_id: selectedClassId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.data.success) {
          alert("KRS successfully added.");
        } else {
          alert("Failed to add KRS.");
        }
      } else if (action === "delete") {
        const response = await axios.delete(`/mahasiswa/krs/${selectedClassId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const updatedClasses = { ...selectedClasses };
          delete updatedClasses[selectedCategory]; // Hapus kelas dari state
          setSelectedClasses(updatedClasses);
          alert("KRS successfully deleted.");
        } else {
          alert("Failed to delete KRS.");
        }
      }
    } catch (error) {
      console.error("Error in handling action:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await axios.get("/instruktur/kelas");
        if (response.data.success) {
          const categories = response.data.data.reduce((acc: any, classItem: any) => {
            const { kategori, nama, angkatan, id } = classItem;
            if (!acc[kategori]) {
              acc[kategori] = [];
            }
            acc[kategori].push({ id, nama, angkatan });
            return acc;
          }, {});
          setClassCategories(categories);
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mt-6 px-10">
        <div className="text-xl font-medium text-gray-700">Pilih Kelas</div>
        <div className="text-xl font-medium text-gray-700 mr-[400px]">
          Kelas yang Dipilih
        </div>
      </div>

      <div className="flex gap-6">
        <Card className="w-1/2 mt-4 ml-10">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(classCategories).map(([category, classes]) => (
                <AccordionItem key={category} value={`item-${category}`}>
                  <AccordionTrigger>{category}</AccordionTrigger>
                  {classes.map((classItem: any) => (
                    <AccordionContent
                      key={classItem.id}
                      className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                      onClick={() =>
                        handleClassSelection(category, classItem.nama, classItem.id)
                      }
                    >
                      {classItem.nama}
                      <p className="text-gray-500 text-sm">Angkatan {classItem.angkatan}</p>
                    </AccordionContent>
                  ))}
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="w-1/2 mt-4 mr-10">
          <CardContent className="p-6 space-y-4">
            {Object.entries(selectedClasses).map(([category, classItem]) => (
              <Card key={category} className="bg-purple-50 border-purple-200">
                <CardContent className="p-3">
                  <p className="text-lg font-medium">{category}</p>
                  <p className="text-gray-600">{classItem.nama}</p>
                  <Button
                    className="mt-2"
                    variant="destructive"
                    onClick={() => handleDeleteClass(category)}
                  >
                    Hapus Kelas
                  </Button>
                </CardContent>
              </Card>
            ))}

            {Object.keys(selectedClasses).length === 0 && (
              <p className="text-gray-500 text-center py-4">Belum ada kelas yang dipilih</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "add" ? "Apakah Anda yakin ingin menambah kelas ini?" : "Apakah Anda yakin ingin menghapus kelas ini?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "add"
                ? "Klik Ya untuk menambah kelas ini ke KRS Anda."
                : "Klik Ya untuk menghapus kelas ini dari KRS Anda."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAction}>Tidak</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Ya</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}