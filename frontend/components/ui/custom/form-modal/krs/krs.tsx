"use client";

import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function Krs() {
  const [selectedClasses, setSelectedClasses] = useState<any>({

  });

  const [classCategories, setClassCategories] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  // Handle class selection
  const handleClassSelection = (category: string, className: string): void => {
    setSelectedClasses((prevState) => ({
      ...prevState,
      [category]: className,
    }));
  };

  useEffect(() => {
    // Fetch class data from the backend API
    const fetchClassData = async () => {
      try {
        const response = await axios.get("/instruktur/kelas"); // Fetching data from backend
        if (response.data.success) {
          // Organize classes into categories
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
    return <div>Loading...</div>; // Display loading state while fetching data
  }

  return (
    <div>
      <div className="flex justify-between items-center mt-6 px-10">
        <div className="text-xl font-medium text-gray-700">Pilih Kelas</div>
        <div className="text-xl font-medium text-gray-700 mr-[400px]">Kelas yang Dipilih</div>
      </div>

      <div className="flex gap-6">
        {/* Accordion for selecting classes */}
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
                      onClick={() => handleClassSelection(category, classItem.nama)}
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

        {/* Display selected classes */}
        <Card className="w-1/2 mt-4 mr-10">
          <CardContent className="p-6 space-y-4">
            {selectedClasses.akuntansiSyariah && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-3">
                  <p className="text-lg font-medium">Akuntansi Syariah</p>
                  <p className="text-gray-600">{selectedClasses.akuntansiSyariah}</p>
                </CardContent>
              </Card>
            )}

            {selectedClasses.pemeriksaanAkuntansi && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-3">
                  <p className="text-lg font-medium">Pemeriksaan Akuntansi</p>
                  <p className="text-gray-600">{selectedClasses.pemeriksaanAkuntansi}</p>
                </CardContent>
              </Card>
            )}

            {selectedClasses.akuntansiSektorPublik && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-3">
                  <p className="text-lg font-medium">Akuntansi Sektor Publik</p>
                  <p className="text-gray-600">{selectedClasses.akuntansiSektorPublik}</p>
                </CardContent>
              </Card>
            )}

            {!selectedClasses.akuntansiSyariah &&
              !selectedClasses.pemeriksaanAkuntansi &&
              !selectedClasses.akuntansiSektorPublik && (
                <p className="text-gray-500 text-center py-4">Belum ada kelas yang dipilih</p>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
