import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resizeAndConvertToWebP } from "@/lib/image-utils";

interface ImageUploadMultipleProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUploadMultiple({
  value = [],
  onChange,
  bucket = "laptop-images",
  folder = "donor-applications",
  maxSizeMB = 0.75,
  maxImages = 5,
  className,
  disabled = false,
}: ImageUploadMultipleProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check max images limit
    if (value.length + files.length > maxImages) {
      toast.error(`Chỉ có thể upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate file types
    const invalidFiles = files.filter((file) => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Initial file size check
    const oversizedFiles = files.filter((file) => file.size / (1024 * 1024) > 10);
    if (oversizedFiles.length > 0) {
      toast.error("Một số file ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB");
      return;
    }

    setUploading(true);
    const newUrls: string[] = [...value];

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadingIndex(i);
        const file = files[i];

        // Resize and convert to WebP
        toast.info(`Đang xử lý ảnh ${i + 1}/${files.length}...`, { duration: 1000 });
        const processedFile = await resizeAndConvertToWebP(file, {
          maxWidth: 1280,
          maxHeight: 720,
          quality: 0.85,
          maxSizeKB: 768,
        });

        // Upload processed image
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${i}.webp`;
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, processedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        if (data?.publicUrl) {
          newUrls.push(data.publicUrl);
        } else {
          throw new Error("Không thể lấy URL công khai của ảnh");
        }
      }

      onChange(newUrls);
      const finalSize = newUrls.length;
      toast.success(`Upload thành công ${finalSize} ảnh`);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "Có lỗi xảy ra khi upload ảnh");
    } finally {
      setUploading(false);
      setUploadingIndex(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const remainingSlots = maxImages - value.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Laptop ${index + 1}`}
                className="h-24 w-full object-cover rounded-lg border-2 border-border"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {remainingSlots > 0 && (
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang upload ảnh {uploadingIndex !== null ? `${uploadingIndex + 1}` : ""}...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {value.length > 0 ? "Thêm ảnh" : "Chọn ảnh laptop"}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {value.length > 0 && `${value.length}/${maxImages} ảnh đã upload. `}
            Còn {remainingSlots} slot. JPG, PNG (tự động resize 720p, WebP, tối đa 768KB/ảnh)
          </p>
        </div>
      )}

      {remainingSlots === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Đã upload đủ {maxImages} ảnh. Xóa ảnh để thêm ảnh mới.
        </p>
      )}
    </div>
  );
}
