export function BukuBesarTable({ transactions }: BukuBesarTableProps) {
  // ... existing state and other code ...

  const handlePageSizeChange = (value: string) => {
    if (!value) return; // Guard against empty values
    
    if (value === 'all') {
      setShowAll(true);
      setCurrentPage(1);
    } else {
      setShowAll(false);
      setPageSize(Number(value));
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by Account Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
          />
          <Select
            value={showAll ? 'all' : pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ... rest of the component ... */}
    </div>
  );
} 