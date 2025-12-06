import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAreas, useCreateArea } from "@/hooks/useAreas";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AreaSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AreaSelect({
  value,
  onValueChange,
  placeholder = "Chọn khu vực...",
  disabled = false,
}: AreaSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: areasResult, isLoading: isLoadingAreas } = useAreas({ isActive: true });
  const createArea = useCreateArea();
  const areas = areasResult?.data ?? [];

  const selectedArea = areas.find((area) => area.id === value);

  // Normalize search value (remove diacritics and lowercase)
  const normalizedSearch = slugify(searchValue);

  // Filter areas based on search (using slugify for diacritic-insensitive search)
  const filteredAreas = areas.filter((area) => {
    const normalizedAreaName = slugify(area.name);
    return normalizedAreaName.includes(normalizedSearch);
  });

  // Check if search value matches any existing area (using slugify)
  const exactMatch = areas.some(
    (area) => slugify(area.name) === normalizedSearch.trim()
  );

  // Check if we should show "Create new" option
  const shouldShowCreateOption =
    searchValue.trim().length >= 2 &&
    !exactMatch &&
    !filteredAreas.some(
      (area) => slugify(area.name) === normalizedSearch.trim()
    );

  const handleCreateNewArea = async () => {
    const newAreaName = searchValue.trim();
    if (newAreaName.length < 2) {
      toast.error("Tên khu vực phải có ít nhất 2 ký tự");
      return;
    }

    try {
      const newArea = await createArea.mutateAsync({
        area: {
          name: newAreaName,
          description: null,
          is_active: true,
        },
      });
      onValueChange(newArea.id);
      setSearchValue("");
      setOpen(false);
      toast.success(`Đã tạo khu vực "${newAreaName}"`);
    } catch (error) {
      console.error("Error creating area:", error);
      // Error toast is already handled by useCreateArea
    }
  };

  const handleSelectArea = (areaId: string) => {
    onValueChange(areaId);
    setSearchValue("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedArea ? selectedArea.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm kiếm hoặc nhập tên khu vực mới..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoadingAreas ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
              </div>
            ) : (
              <>
                {filteredAreas.length === 0 && !shouldShowCreateOption && searchValue.trim() === "" && (
                  <CommandEmpty>Không có khu vực nào</CommandEmpty>
                )}
                {filteredAreas.length > 0 && (
                  <CommandGroup heading="Khu vực có sẵn">
                    {filteredAreas.map((area) => (
                      <CommandItem
                        key={area.id}
                        value={area.name}
                        onSelect={() => handleSelectArea(area.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === area.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {area.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {shouldShowCreateOption && (
                  <CommandGroup>
                    <CommandItem
                      value={`create-${searchValue.trim()}`}
                      onSelect={handleCreateNewArea}
                      className="text-primary"
                      disabled={createArea.isPending}
                    >
                      {createArea.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Tạo mới: &quot;{searchValue.trim()}&quot;
                        </>
                      )}
                    </CommandItem>
                  </CommandGroup>
                )}
                {filteredAreas.length === 0 && searchValue.trim() !== "" && !shouldShowCreateOption && (
                  <CommandEmpty>
                    Không tìm thấy khu vực. Nhập tên mới để tạo.
                  </CommandEmpty>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

