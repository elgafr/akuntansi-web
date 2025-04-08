import { useQueryClient, useQuery } from "@tanstack/react-query";

export function useSelectedAkun() {
  const queryClient = useQueryClient();

  const { data: selectedAkunId = "" } = useQuery({
    queryKey: ['selectedAkun'],
    queryFn: () => {
      const cached = queryClient.getQueryData(['selectedAkun']);
      return cached || "";
    },
    initialData: "",
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const setSelectedAkunId = (newAkunId: string) => {
    queryClient.setQueryData(['selectedAkun'], newAkunId);
  };

  return { selectedAkunId, setSelectedAkunId };
} 