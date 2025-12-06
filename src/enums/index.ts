/**
 * Application Enums
 * 
 * Central location for all application enums to avoid hard-coding values.
 */

// Academic Year enum for students
export enum AcademicYear {
  YEAR_1 = "1",
  YEAR_2 = "2",
  YEAR_3 = "3",
  YEAR_4 = "4",
  YEAR_5_PLUS = "5+",
}

// Support Types enum (consolidated from supportType and needOptions)
export enum SupportType {
  LAPTOP = "laptop",
  MOTORBIKE = "motorbike",
  COMPONENTS = "components",
  TUITION = "tuition",
}

// Support Frequency enum for donors
export enum SupportFrequency {
  ONE_TIME = "one_time",
  RECURRING = "recurring",
}

// Application Status enum
export enum ApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Label mappings for Vietnamese translations

export const academicYearLabels: Record<AcademicYear, string> = {
  [AcademicYear.YEAR_1]: "Năm 1",
  [AcademicYear.YEAR_2]: "Năm 2",
  [AcademicYear.YEAR_3]: "Năm 3",
  [AcademicYear.YEAR_4]: "Năm 4",
  [AcademicYear.YEAR_5_PLUS]: "Năm 5 trở lên",
};

export const supportTypeLabels: Record<SupportType, string> = {
  [SupportType.LAPTOP]: "Laptop",
  [SupportType.MOTORBIKE]: "Xe máy",
  [SupportType.COMPONENTS]: "Linh kiện",
  [SupportType.TUITION]: "Học phí",
};

export const supportTypeDescriptions: Record<SupportType, string> = {
  [SupportType.LAPTOP]: "Cần laptop để học tập",
  [SupportType.MOTORBIKE]: "Cần xe máy để đi làm thêm hoặc đi học",
  [SupportType.TUITION]: "Cần hỗ trợ học phí",
  [SupportType.COMPONENTS]: "Có laptop nhưng cần sửa chữa/thay linh kiện",
};

export const supportFrequencyLabels: Record<SupportFrequency, string> = {
  [SupportFrequency.ONE_TIME]: "Một lần",
  [SupportFrequency.RECURRING]: "Định kỳ",
};

export const supportFrequencyDescriptions: Record<SupportFrequency, string> = {
  [SupportFrequency.ONE_TIME]: "Hỗ trợ một lần duy nhất",
  [SupportFrequency.RECURRING]: "Hỗ trợ nhiều lần trong một khoảng thời gian",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: "Đang chờ",
  [ApplicationStatus.APPROVED]: "Đã duyệt",
  [ApplicationStatus.REJECTED]: "Đã từ chối",
};

// Helper functions to get all enum values as arrays

export const getAllAcademicYears = (): AcademicYear[] => 
  Object.values(AcademicYear);

export const getAllSupportTypes = (): SupportType[] => 
  Object.values(SupportType);

export const getAllSupportFrequencies = (): SupportFrequency[] => 
  Object.values(SupportFrequency);

export const getAllApplicationStatuses = (): ApplicationStatus[] => 
  Object.values(ApplicationStatus);
