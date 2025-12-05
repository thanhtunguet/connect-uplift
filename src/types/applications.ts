// Import enums from central location
export { 
  ApplicationStatus, 
  SupportType, 
  SupportFrequency, 
  AcademicYear 
} from '@/enums';

// Donor Application
export interface DonorApplication {
  id: string;
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link?: string;
  support_types: SupportType[];
  support_frequency: SupportFrequency;
  support_details?: string;
  status: ApplicationStatus;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface DonorApplicationInsert {
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link?: string;
  support_types: SupportType[];
  support_frequency: SupportFrequency;
  support_details?: string;
}

// Student Application
export interface StudentApplication {
  id: string;
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link?: string;
  academic_year: AcademicYear;
  difficult_situation: string;
  need_laptop: boolean;
  need_motorbike: boolean;
  need_tuition: boolean;
  need_components: boolean;
  components_details?: string;
  status: ApplicationStatus;
  rejection_reason?: string;
  verification_notes?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface StudentApplicationInsert {
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link?: string;
  academic_year: AcademicYear;
  difficult_situation: string;
  need_laptop: boolean;
  need_motorbike: boolean;
  need_tuition: boolean;
  need_components: boolean;
  components_details?: string;
}

// Donor (Approved)
export interface Donor {
  id: string;
  application_id?: string;
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link?: string;
  support_types: SupportType[];
  support_frequency: SupportFrequency;
  support_details?: string;
  support_end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Student (Approved)
export interface Student {
  id: string;
  application_id?: string;
  full_name: string;
  birth_year: number;
  phone: string;
  address: string;
  facebook_link?: string;
  academic_year: AcademicYear;
  difficult_situation: string;
  need_laptop: boolean;
  laptop_received: boolean;
  laptop_received_date?: string;
  need_motorbike: boolean;
  motorbike_received: boolean;
  motorbike_received_date?: string;
  need_tuition: boolean;
  tuition_supported: boolean;
  tuition_support_start_date?: string;
  need_components: boolean;
  components_details?: string;
  components_received: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}
