export type RiasecCode = "R" | "I" | "A" | "S" | "E" | "C";

export interface HighSchool {
  MaTruongTHPT: string;
  TenTruong: string;
  TinhThanh: string;
  LoaiHinh: string;
  Website: string;
  GoogleMaps: string;
  DiaChi: string;
  AnhTruong: string;
  LogoTruong: string;
  TrangThaiDuLieu: string;
  Nguon: string;
}

export interface SchoolCombo {
  MaToHopTHPT: string;
  MaTruongTHPT: string;
  TenTruongTHPT: string;
  NamHoc: string;
  MonLuaChon1: string;
  MonLuaChon2: string;
  MonLuaChon3: string;
  MonLuaChon4: string;
  ChuyenDe1: string;
  ChuyenDe2: string;
  ChuyenDe3: string;
  MonKhacNeuCo: string;
  NguonXacNhan: string;
  NgayCapNhat: string;
  TrangThai: string;
}

export interface Province {
  MaTinh: string;
  TenTinh: string;
  KhuVuc: string;
}

export interface University {
  MaTruongTuyenSinh: string;
  TenTruong: string;
  MaTinh: string;
  TinhThanh: string;
  LoaiHinh: string;
  Website: string;
  GhiChuKiemChung: string;
}

export interface Program {
  MaCTDT: string;
  MaTruongTuyenSinh: string;
  MaNganh: string;
  TenNganh: string;
  NamTuyenSinh: string;
  TenTruong: string;
  SoDongXetTuyen: string;
  TrangThaiXacMinh: string;
  /** Cho biết nguồn gốc dòng ngành (bảng CTDT chính thức hay tổng hợp từ bảng xét tuyển) */
  derivedFromAdmissions?: boolean;
}

export interface AdmissionRule {
  ID: string;
  MaTruongTuyenSinh: string;
  TenTruong: string;
  MaNganh: string;
  TenNganh: string;
  NamTuyenSinh: string;
  PhuongThucXetTuyen: string;
  MaToHop: string;
  Mon1: string;
  Mon2: string;
  Mon3: string;
  Mon4NeuCo: string;
  DieuKienGhiChu: string;
}

export interface HollandQuestion {
  id: string;
  stt: number;
  group: RiasecCode;
  groupName: string;
  category: "Tôi là người" | "Tôi có thể" | "Tôi thích" | string;
  text: string;
  scoreValue: number;
  source?: string;
}

export interface HollandGroup {
  code: RiasecCode;
  nameVi: string;
  nameEn: string;
  description: string;
  characteristics: string[];
  suggestedFields: string[];
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T[];
  rawCount: number;
  error?: string;
  latencyMs: number;
  filteredClientSide?: boolean;
  backendNotice?: string;
  endpointUrl: string;
}

export interface EndpointHealthStatus {
  key: string;
  label: string;
  action: string;
  status: "ok" | "empty" | "error";
  httpStatus?: number;
  count?: number;
  latencyMs: number;
  error?: string;
  note?: string;
  sampleKeys?: string[];
}

export interface ApiHealthReport {
  checkedAt: string;
  appStatus: string;
  endpoints: EndpointHealthStatus[];
}

export interface RiasecScore {
  code: RiasecCode;
  nameVi: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface StudentAspiration {
  id: string;
  priority: 1 | 2 | 3;
  provinceId: string;
  provinceName: string;
  universityId: string;
  universityName: string;
  universityVerifyNote: string;
  programId: string;
  majorCode: string;
  majorName: string;
  programYear: string;
  programVerifyStatus: string;
  derivedFromAdmissions?: boolean;
  admissions: AdmissionRule[];
  admissionsError?: string;
}

export interface StudentPreferences {
  favoriteSubjects: string[];
  strongSubjects: string[];
  supportNeededSubjects: string[];
}

export type VerificationLabel =
  | "Phù hợp với điều kiện môn học đã xác minh"
  | "Phù hợp tham khảo – Cần xác minh"
  | "Cần xác minh";

export interface ProgramMatchDetail {
  aspirationPriority: 1 | 2 | 3;
  universityName: string;
  majorName: string;
  majorCode: string;
  matchedCombos: {
    maToHop: string;
    phuongThuc: string;
    requiredSubjects: string[];
    matchedSubjects: string[];
    specialSubjects: string[];
    isVerifiedData: boolean;
    note: string;
  }[];
  unmatchedCombos: {
    maToHop: string;
    phuongThuc: string;
    requiredSubjects: string[];
    missingSubjects: string[];
    specialSubjects: string[];
    note: string;
  }[];
  unmatchedOrUnverifiedCount: number;
  dataYear: string;
  verificationNotes: string[];
}

export interface ComboRecommendation {
  rank: 1 | 2 | 3;
  combo: SchoolCombo;
  compulsorySubjects: string[];
  electiveSubjects: string[];
  studyTopics: string[];
  recommendedGradExamElectives: {
    subject: string;
    reason: string;
  }[];
  verificationStatus: VerificationLabel;
  reasons: string[];
  matchedAspirations: ProgramMatchDetail[];
  relatedSubjects: {
    subject: string;
    role: "Bắt buộc" | "Lựa chọn" | "Chuyên đề";
    studentTag?: "Sở trường" | "Yêu thích" | "Cần hỗ trợ";
  }[];
  conditionsToVerify: string[];
  alternativeNote: string;
  score: number;
}

export interface AdvisoryReport {
  generatedAt: string;
  studentName: string;
  school: HighSchool;
  riasecRanking: RiasecScore[];
  topThreeRiasec: RiasecScore[];
  hollandAvailable: boolean;
  hollandAnsweredCount: number;
  hollandTotalQuestions: number;
  aspirations: StudentAspiration[];
  preferences: StudentPreferences;
  recommendations: ComboRecommendation[];
  allSchoolCombosCount: number;
  globalWarnings: string[];
  disclaimer: string;
}

export type WizardStep =
  | "welcome"
  | "school"
  | "holland"
  | "favorites"
  | "aspirations"
  | "results"
  | "api-status";
