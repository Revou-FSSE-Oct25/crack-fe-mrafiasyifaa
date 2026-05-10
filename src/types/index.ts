export type Role = "DOCTOR" | "ADMIN_VPRS";
export type PatientGender = "LAKI_LAKI" | "PEREMPUAN";
export type PatientCondition = "STABIL" | "MEMBAIK" | "MEMBURUK" | "SELESAI";
export type AntibioticCategory = "KOMERSIAL" | "DIAWASI" | "RISET";
export type AntibioticForm = "TABLET" | "KAPSUL" | "SIRUP" | "INJEKSI" | "SALEP" | "INFUS";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type NotificationType = "REQUEST_BARU" | "REQUEST_DISETUJUI" | "REQUEST_DITOLAK";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Patient {
  id: string;
  medRecNo: string;
  name: string;
  birthDate: string;
  gender: PatientGender;
  address: string;
  diagnosis: string;
  condition: PatientCondition;
  doctor?: Pick<User, "id" | "name" | "email">;
  conditionLogs?: ConditionLog[];
}

export interface ConditionLog {
  id: string;
  condition: PatientCondition;
  notes: string;
  createdAt: string;
  doctor: Pick<User, "id" | "name">;
}

export interface Antibiotic {
  id: string;
  name: string;
  description: string;
  category: AntibioticCategory;
  form: AntibioticForm;
  stock: number;
}

export interface ClinicalData {
  diagnosis: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  generalCondition: string;
  physicalExamination: string;
  leukocytes: number;
  neutrophils: number;
  lymphocytes: number;
  urinalysis: string;
  ureum: number;
  creatinine: number;
  sgot: number;
  sgpt: number;
  albumin: number;
  imagingType?: string;
  imagingResult?: string;
  cultureResult?: string;
}

export interface AntibioticRequest {
  id: string;
  patientId: string;
  antibioticId: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes?: string;
  status: RequestStatus;
  reviewNotes?: string;
  clinicalData: ClinicalData;
  patient?: Patient;
  antibiotic?: Antibiotic;
  doctor?: Pick<User, "id" | "name" | "email">;
  assignedAdmin?: Pick<User, "id" | "name" | "email">;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  referenceId: string;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
