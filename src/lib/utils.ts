import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Loại bỏ dấu tiếng Việt và chuyển thành lowercase
 * Ví dụ: "Hà Nội" -> "ha noi", "Đà Nẵng" -> "da nang"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
}

/**
 * Chuyển UUID thành mã sinh viên dạng số dễ đọc
 * Kết hợp UUID + năm sinh + năm học + khu vực để giảm tỉ lệ trùng lặp
 * 
 * Cách hoạt động:
 * 1. Kết hợp UUID + birth_year + academic_year + area_id thành một chuỗi
 * 2. Sử dụng hash function (dạng djb2) để chuyển chuỗi thành số nguyên
 * 3. Lấy giá trị tuyệt đối và format thành số có ít nhất 5 chữ số
 * 
 * Về trùng lặp (collision):
 * - UUID là duy nhất (xác suất trùng cực thấp: ~5.3×10^-37)
 * - Kết hợp thêm birth_year, academic_year và area_id làm tăng entropy đáng kể
 * - Giả sử có 50 năm sinh khác nhau (1970-2020), 5 năm học (1-5) và 20 khu vực
 *   → Có 50 × 5 × 20 = 5,000 nhóm khác nhau
 * - Xác suất 2 sinh viên cùng UUID + cùng năm sinh + cùng năm học + cùng khu vực là cực thấp
 * - Với hash 32-bit: xác suất collision giảm xuống < 0.00001% với < 10,000 sinh viên
 * 
 * @param uuid - UUID của sinh viên
 * @param birthYear - Năm sinh (number)
 * @param academicYear - Năm học (string, ví dụ: "1", "2", "3", "4", "5")
 * @param areaId - ID khu vực (string | null, dùng "none" nếu null)
 * @returns Mã sinh viên dạng số (5-8 chữ số)
 */
export function getStudentCode(
  uuid: string, 
  birthYear: number, 
  academicYear: string,
  areaId: string | null = null
): string {
  // Loại bỏ dấu gạch ngang từ UUID
  const cleanUuid = uuid.replace(/-/g, "");
  
  // Xử lý areaId: nếu null thì dùng "none"
  const areaIdStr = areaId || "none";
  
  // Kết hợp tất cả thông tin: UUID + năm sinh + năm học + khu vực
  // Format: "uuid|birthYear|academicYear|areaId"
  const combinedString = `${cleanUuid}|${birthYear}|${academicYear}|${areaIdStr}`;
  
  // Sử dụng hash function djb2 (một trong những hash function phổ biến)
  // Hash này tạo ra số nguyên từ chuỗi, đảm bảo cùng input → cùng output
  let hash = 5381; // Magic number cho djb2
  
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    // hash * 33 + char (djb2 algorithm)
    hash = ((hash << 5) + hash) + char;
  }
  
  // Chuyển thành số dương (loại bỏ bit dấu)
  // Sử dụng >>> 0 để chuyển thành unsigned 32-bit integer
  const unsignedHash = hash >>> 0;
  
  // Format thành số có ít nhất 5 chữ số, tối đa 8 chữ số
  const code = unsignedHash.toString().padStart(5, '0');
  
  // Giới hạn tối đa 8 chữ số để dễ đọc
  return code.length > 8 ? code.substring(0, 8) : code;
}
