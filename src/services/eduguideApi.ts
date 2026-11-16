import { API_ACTIONS, API_TIMEOUT_MS, APPS_SCRIPT_URL } from "../config/api";
import type {
  AdmissionRule,
  ApiHealthReport,
  ApiResponse,
  EndpointHealthStatus,
  HighSchool,
  HollandGroup,
  HollandQuestion,
  Program,
  Province,
  RiasecCode,
  SchoolCombo,
  University,
} from "../types/eduguide";

interface RawAppsScriptPayload<T = Record<string, unknown>> {
  success?: boolean;
  count?: number;
  data?: T[];
  error?: string;
  app?: string;
  status?: string;
}

// Bộ nhớ đệm trong phiên để tránh tải lại 6.600 dòng nhiều lần khi chuyển bước
const sessionCache = new Map<string, { timestamp: number; payload: unknown }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function clearApiCache(): void {
  sessionCache.clear();
}

function buildUrl(action: string, params?: Record<string, string>): string {
  const url = new URL(APPS_SCRIPT_URL);
  if (action) {
    url.searchParams.set("action", action);
  }
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

async function fetchAppsScriptRaw<T>(
  action: string,
  params?: Record<string, string>,
  useCache = true
): Promise<{
  ok: boolean;
  payload?: RawAppsScriptPayload<T>;
  error?: string;
  httpStatus?: number;
  latencyMs: number;
  endpointUrl: string;
}> {
  const endpointUrl = buildUrl(action, params);
  const cacheKey = endpointUrl;

  if (useCache) {
    const cached = sessionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        ok: true,
        payload: cached.payload as RawAppsScriptPayload<T>,
        httpStatus: 200,
        latencyMs: 0,
        endpointUrl,
      };
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const start = performance.now();

  try {
    const response = await fetch(endpointUrl, {
      method: "GET",
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - start);

    if (!response.ok) {
      return {
        ok: false,
        httpStatus: response.status,
        latencyMs,
        endpointUrl,
        error: `Máy chủ trả về mã lỗi HTTP ${response.status}.`,
      };
    }

    const text = await response.text();
    let parsed: RawAppsScriptPayload<T>;
    try {
      parsed = JSON.parse(text) as RawAppsScriptPayload<T>;
    } catch {
      return {
        ok: false,
        httpStatus: response.status,
        latencyMs,
        endpointUrl,
        error: "Phản hồi từ Google Apps Script không phải JSON hợp lệ.",
      };
    }

    if (typeof parsed !== "object" || parsed === null) {
      return {
        ok: false,
        httpStatus: response.status,
        latencyMs,
        endpointUrl,
        error: "Cấu trúc phản hồi API không đúng định dạng đối tượng JSON.",
      };
    }

    if (parsed.success === false) {
      return {
        ok: false,
        httpStatus: response.status,
        latencyMs,
        endpointUrl,
        payload: parsed,
        error: parsed.error || "API Google Apps Script trả về trạng thái thất bại.",
      };
    }

    if (useCache) {
      sessionCache.set(cacheKey, { timestamp: Date.now(), payload: parsed });
    }

    return {
      ok: true,
      httpStatus: response.status,
      latencyMs,
      endpointUrl,
      payload: parsed,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        latencyMs,
        endpointUrl,
        error: `Quá thời gian chờ phản hồi (${Math.round(API_TIMEOUT_MS / 1000)} giây). Vui lòng kiểm tra kết nối mạng.`,
      };
    }
    return {
      ok: false,
      latencyMs,
      endpointUrl,
      error:
        err instanceof Error
          ? `Lỗi kết nối mạng: ${err.message}`
          : "Không thể kết nối đến máy chủ Google Apps Script.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function cleanText(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

/**
 * Loại bỏ các dòng tiêu đề bị lặp lại trong trang tính Google Sheets
 */
function isHeaderEchoRow(row: Record<string, unknown>, keyField: string): boolean {
  return cleanText(row[keyField]) === keyField;
}

const UNIVERSITY_CODE_ALIASES: Record<string, string[]> = {
  YDN: ["DDY"],
  DDY: ["YDN"],
  LPS: ["DLS"],
  DLS: ["LPS"],
  UTH: ["GTS"],
  GTS: ["UTH"],
};

/**
 * Chuẩn hóa tên trường đại học để đối chiếu linh hoạt giữa các sheet
 * (không phân biệt hoa thường, "ĐH" vs "Đại học", "TP.HCM" vs "TP. Hồ Chí Minh", dấu gạch nối...).
 */
export function normalizeUniversityName(rawName: string): string {
  return cleanText(rawName)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[–—-]/g, " ")
    .replace(/&/g, " và ")
    .replace(/\btrường\s+đh\b/g, "trường đại học")
    .replace(/\bđh\b/g, "đại học")
    .replace(/\bđhqg\b/g, "đại học quốc gia")
    .replace(/\btp\.?\s*hcm\b/g, "thành phố hồ chí minh")
    .replace(/\btp\.?\s*hồ\s*chí\s*minh\b/g, "thành phố hồ chí minh")
    .replace(/\bcntt\b/g, "công nghệ thông tin")
    .replace(/\bkhxh\s*(?:và|&)?\s*nv\b/g, "khoa học xã hội và nhân văn")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function universityMatchesRow(
  selectedUniId: string | undefined,
  selectedUniName: string | undefined,
  rowUniId: string,
  rowUniName: string
): boolean {
  const selId = cleanText(selectedUniId).toUpperCase();
  const rId = cleanText(rowUniId).toUpperCase();

  if (selId && rId) {
    if (selId === rId) return true;
    const aliases = UNIVERSITY_CODE_ALIASES[selId] || [];
    if (aliases.includes(rId)) return true;
  }

  const normSel = normalizeUniversityName(selectedUniName || "");
  const normRow = normalizeUniversityName(rowUniName || "");
  if (normSel && normRow) {
    if (normSel === normRow) return true;
    // Khớp dạng rút gọn có/không có tiền tố "trường"
    const stripSchoolWord = (s: string) => s.replace(/^trường\s+/, "").trim();
    if (stripSchoolWord(normSel) === stripSchoolWord(normRow)) return true;
  }

  return false;
}

export async function getSchools(): Promise<ApiResponse<HighSchool>> {
  const res = await fetchAppsScriptRaw<Record<string, unknown>>(API_ACTIONS.SCHOOLS);
  if (!res.ok || !res.payload) {
    return {
      ok: false,
      data: [],
      rawCount: 0,
      error: res.error,
      latencyMs: res.latencyMs,
      endpointUrl: res.endpointUrl,
    };
  }

  const rawRows = Array.isArray(res.payload.data) ? res.payload.data : [];
  const data: HighSchool[] = rawRows
    .filter((r) => !isHeaderEchoRow(r, "MaTruongTHPT") && cleanText(r.MaTruongTHPT) !== "")
    .map((r) => ({
      MaTruongTHPT: cleanText(r.MaTruongTHPT),
      TenTruong: cleanText(r.TenTruong),
      TinhThanh: cleanText(r.TinhThanh),
      LoaiHinh: cleanText(r.LoaiHinh),
      Website: cleanText(r.Website),
      GoogleMaps: cleanText(r.GoogleMaps),
      DiaChi: cleanText(r.DiaChi),
      AnhTruong: cleanText(r.AnhTruong),
      LogoTruong: cleanText(r.LogoTruong),
      TrangThaiDuLieu: cleanText(r.TrangThaiDuLieu),
      Nguon: cleanText(r.Nguon),
    }));

  return {
    ok: true,
    data,
    rawCount: rawRows.length,
    latencyMs: res.latencyMs,
    endpointUrl: res.endpointUrl,
  };
}

export async function getSchoolCombos(schoolId: string): Promise<ApiResponse<SchoolCombo>> {
  const res = await fetchAppsScriptRaw<Record<string, unknown>>(API_ACTIONS.SCHOOL_COMBOS, {
    schoolId,
  });
  if (!res.ok || !res.payload) {
    return {
      ok: false,
      data: [],
      rawCount: 0,
      error: res.error,
      latencyMs: res.latencyMs,
      endpointUrl: res.endpointUrl,
    };
  }

  const rawRows = Array.isArray(res.payload.data) ? res.payload.data : [];
  const cleaned: SchoolCombo[] = rawRows
    .filter((r) => !isHeaderEchoRow(r, "MaToHopTHPT") && cleanText(r.MaToHopTHPT) !== "")
    .map((r) => ({
      MaToHopTHPT: cleanText(r.MaToHopTHPT),
      MaTruongTHPT: cleanText(r.MaTruongTHPT),
      TenTruongTHPT: cleanText(r.TenTruongTHPT),
      NamHoc: cleanText(r.NamHoc),
      MonLuaChon1: cleanText(r.MonLuaChon1),
      MonLuaChon2: cleanText(r.MonLuaChon2),
      MonLuaChon3: cleanText(r.MonLuaChon3),
      MonLuaChon4: cleanText(r.MonLuaChon4),
      ChuyenDe1: cleanText(r.ChuyenDe1),
      ChuyenDe2: cleanText(r.ChuyenDe2),
      ChuyenDe3: cleanText(r.ChuyenDe3),
      MonKhacNeuCo: cleanText(r.MonKhacNeuCo),
      NguonXacNhan: cleanText(r.NguonXacNhan),
      NgayCapNhat: cleanText(r.NgayCapNhat),
      TrangThai: cleanText(r.TrangThai),
    }));

  const hasOtherSchools = cleaned.some((c) => c.MaTruongTHPT !== schoolId);
  const filtered = schoolId ? cleaned.filter((c) => c.MaTruongTHPT === schoolId) : cleaned;

  return {
    ok: true,
    data: filtered,
    rawCount: rawRows.length,
    filteredClientSide: Boolean(schoolId && hasOtherSchools),
    backendNotice:
      schoolId && hasOtherSchools
        ? "API Apps Script chưa lọc theo tham số schoolId; ứng dụng đã lọc cục bộ theo MaTruongTHPT."
        : undefined,
    latencyMs: res.latencyMs,
    endpointUrl: res.endpointUrl,
  };
}

export async function getProvinces(): Promise<ApiResponse<Province>> {
  const res = await fetchAppsScriptRaw<Record<string, unknown>>(API_ACTIONS.PROVINCES);
  if (!res.ok || !res.payload) {
    return {
      ok: false,
      data: [],
      rawCount: 0,
      error: res.error,
      latencyMs: res.latencyMs,
      endpointUrl: res.endpointUrl,
    };
  }

  const rawRows = Array.isArray(res.payload.data) ? res.payload.data : [];
  const data: Province[] = rawRows
    .filter((r) => !isHeaderEchoRow(r, "MaTinh") && cleanText(r.MaTinh) !== "")
    .map((r) => ({
      MaTinh: cleanText(r.MaTinh),
      TenTinh: cleanText(r.TenTinh),
      KhuVuc: cleanText(r.KhuVuc),
    }));

  return {
    ok: true,
    data,
    rawCount: rawRows.length,
    latencyMs: res.latencyMs,
    endpointUrl: res.endpointUrl,
  };
}

export async function getUniversities(provinceId?: string): Promise<ApiResponse<University>> {
  const res = await fetchAppsScriptRaw<Record<string, unknown>>(
    API_ACTIONS.UNIVERSITIES,
    provinceId ? { provinceId } : undefined
  );
  if (!res.ok || !res.payload) {
    return {
      ok: false,
      data: [],
      rawCount: 0,
      error: res.error,
      latencyMs: res.latencyMs,
      endpointUrl: res.endpointUrl,
    };
  }

  const rawRows = Array.isArray(res.payload.data) ? res.payload.data : [];
  const cleaned: University[] = rawRows
    .filter((r) => !isHeaderEchoRow(r, "MaTruongTuyenSinh") && cleanText(r.MaTruongTuyenSinh) !== "")
    .map((r) => ({
      MaTruongTuyenSinh: cleanText(r.MaTruongTuyenSinh),
      TenTruong: cleanText(r.TenTruong),
      MaTinh: cleanText(r.MaTinh),
      TinhThanh: cleanText(r.TinhThanh),
      LoaiHinh: cleanText(r.LoaiHinh),
      Website: cleanText(r.Website),
      GhiChuKiemChung: cleanText(r.GhiChuKiemChung),
    }));

  const hasOtherProvinces = Boolean(provinceId && cleaned.some((u) => u.MaTinh !== provinceId));
  const filtered = provinceId ? cleaned.filter((u) => u.MaTinh === provinceId) : cleaned;

  return {
    ok: true,
    data: filtered,
    rawCount: rawRows.length,
    filteredClientSide: hasOtherProvinces,
    backendNotice: hasOtherProvinces
      ? "API Apps Script chưa lọc theo tham số provinceId; ứng dụng đã lọc cục bộ theo MaTinh."
      : undefined,
    latencyMs: res.latencyMs,
    endpointUrl: res.endpointUrl,
  };
}

function normalizeMajorKey(name: string): string {
  return cleanText(name)
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export async function getPrograms(
  universityId?: string,
  universityName?: string
): Promise<ApiResponse<Program>> {
  // 1. Ưu tiên thử đọc trang tính TRA_CUU_NGANH_NGHE nếu backend có hỗ trợ
  const lookupRes = await fetchAppsScriptRaw<Record<string, unknown>>(
    API_ACTIONS.CAREER_LOOKUP,
    universityId ? { universityId } : undefined
  );

  let sourceLabel = "";
  const combinedPrograms: Program[] = [];
  let totalRawCount = 0;
  let totalLatency = lookupRes.latencyMs;
  let endpointUsed = lookupRes.endpointUrl;

  if (lookupRes.ok && lookupRes.payload && Array.isArray(lookupRes.payload.data)) {
    const lookupRows = lookupRes.payload.data;
    totalRawCount += lookupRows.length;
    sourceLabel = "TRA_CUU_NGANH_NGHE";
    lookupRows
      .filter(
        (r) =>
          !isHeaderEchoRow(r, "MaCTDT") &&
          !isHeaderEchoRow(r, "MaNganh") &&
          cleanText(r.TenNganh || r.NganhDaoTao) !== ""
      )
      .forEach((r, idx) => {
        const rowUniId = cleanText(r.MaTruongTuyenSinh ?? r.MaTruong);
        const rowUniName = cleanText(r.TenTruong ?? r.TruongDaiHoc);
        if (
          !universityId ||
          universityMatchesRow(universityId, universityName, rowUniId, rowUniName)
        ) {
          combinedPrograms.push({
            MaCTDT: cleanText(r.MaCTDT ?? r.ID) || `TC_${idx + 1}`,
            MaTruongTuyenSinh: rowUniId || universityId || "",
            MaNganh: cleanText(r.MaNganh ?? r.MaNganhThamKhao),
            TenNganh: cleanText(r.TenNganh ?? r.NganhDaoTao),
            NamTuyenSinh: cleanText(r.NamTuyenSinh ?? r.Nam),
            TenTruong: rowUniName || universityName || "",
            SoDongXetTuyen: cleanText(r.SoDongXetTuyen),
            TrangThaiXacMinh: cleanText(r.TrangThaiXacMinh ?? r.TrangThaiKiemChung),
          });
        }
      });
  }

  // 2. Nếu TRA_CUU_NGANH_NGHE chưa có trên API hoặc chưa có dòng cho trường này, tự động kiểm tra sang DM_CTDT (programs) và TO_HOP_XET_TUYEN (admissions)
  if (combinedPrograms.length === 0) {
    const [progRes, admRes] = await Promise.all([
      fetchAppsScriptRaw<Record<string, unknown>>(
        API_ACTIONS.PROGRAMS,
        universityId ? { universityId } : undefined
      ),
      fetchAppsScriptRaw<Record<string, unknown>>(
        API_ACTIONS.ADMISSIONS,
        universityId ? { universityId } : undefined
      ),
    ]);

    totalLatency += progRes.latencyMs + admRes.latencyMs;
    endpointUsed = progRes.endpointUrl;

    if (!progRes.ok && !admRes.ok) {
      return {
        ok: false,
        data: [],
        rawCount: 0,
        error: progRes.error || admRes.error || "Không thể tải danh sách ngành đào tạo.",
        latencyMs: totalLatency,
        endpointUrl: endpointUsed,
      };
    }

    if (progRes.ok && progRes.payload && Array.isArray(progRes.payload.data)) {
      const progRows = progRes.payload.data;
      totalRawCount += progRows.length;
      progRows
        .filter((r) => !isHeaderEchoRow(r, "MaCTDT") && cleanText(r.TenNganh) !== "")
        .forEach((r) => {
          const rowUniId = cleanText(r.MaTruongTuyenSinh);
          const rowUniName = cleanText(r.TenTruong);
          if (
            !universityId ||
            universityMatchesRow(universityId, universityName, rowUniId, rowUniName)
          ) {
            combinedPrograms.push({
              MaCTDT: cleanText(r.MaCTDT),
              MaTruongTuyenSinh: rowUniId,
              MaNganh: cleanText(r.MaNganh),
              TenNganh: cleanText(r.TenNganh),
              NamTuyenSinh: cleanText(r.NamTuyenSinh),
              TenTruong: rowUniName,
              SoDongXetTuyen: cleanText(r.SoDongXetTuyen),
              TrangThaiXacMinh: cleanText(r.TrangThaiXacMinh),
            });
          }
        });
      if (combinedPrograms.length > 0) {
        sourceLabel = "DM_CTDT";
      }
    }

    // Bổ sung / fallback từ TO_HOP_XET_TUYEN (admissions) để không bỏ sót ngành của các trường như LPS/DLS, UTH/GTS, YDS, SPS, SPK, NHS, NLS...
    if (admRes.ok && admRes.payload && Array.isArray(admRes.payload.data)) {
      const admRows = admRes.payload.data;
      totalRawCount += admRows.length;
      admRows
        .filter(
          (r) =>
            !isHeaderEchoRow(r, "ID") &&
            !isHeaderEchoRow(r, "Mon1") &&
            cleanText(r.TenNganh) !== ""
        )
        .forEach((r) => {
          const rowUniId = cleanText(r.MaTruongTuyenSinh);
          const rowUniName = cleanText(r.TenTruong);
          if (
            !universityId ||
            universityMatchesRow(universityId, universityName, rowUniId, rowUniName)
          ) {
            combinedPrograms.push({
              MaCTDT: cleanText(r.ID),
              MaTruongTuyenSinh: rowUniId,
              MaNganh: cleanText(r.MaNganh),
              TenNganh: cleanText(r.TenNganh),
              NamTuyenSinh: cleanText(r.NamTuyenSinh),
              TenTruong: rowUniName,
              SoDongXetTuyen: "",
              TrangThaiXacMinh:
                sourceLabel === "DM_CTDT"
                  ? ""
                  : "Trích xuất từ bảng Tổ hợp xét tuyển (TO_HOP_XET_TUYEN)",
              derivedFromAdmissions: sourceLabel !== "DM_CTDT",
            });
          }
        });
      if (!sourceLabel && combinedPrograms.length > 0) {
        sourceLabel = "TO_HOP_XET_TUYEN";
      }
    }
  }

  // Gộp các dòng trùng tên ngành để hiển thị gọn trong ô chọn "Ngành đào tạo"
  const dedupMap = new Map<string, Program>();
  for (const prog of combinedPrograms) {
    const key = normalizeMajorKey(prog.TenNganh);
    if (!key) continue;
    const existing = dedupMap.get(key);
    if (!existing) {
      dedupMap.set(key, prog);
    } else if (!existing.MaNganh && prog.MaNganh) {
      dedupMap.set(key, { ...existing, MaNganh: prog.MaNganh });
    }
  }

  const resultPrograms = Array.from(dedupMap.values()).sort((a, b) =>
    a.TenNganh.localeCompare(b.TenNganh, "vi")
  );

  let notice: string | undefined;
  if (!lookupRes.ok && resultPrograms.length > 0) {
    notice = `Sheet TRA_CUU_NGANH_NGHE chưa có trên API; hệ thống đã tự động truy xuất từ ${sourceLabel} và đối chiếu linh hoạt theo mã/tên trường.`;
  } else if (universityId) {
    notice = "Đã lọc ngành đào tạo linh hoạt theo mã trường tuyển sinh và tên trường chuẩn hóa.";
  }

  return {
    ok: true,
    data: resultPrograms,
    rawCount: totalRawCount,
    filteredClientSide: Boolean(universityId),
    backendNotice: notice,
    latencyMs: totalLatency,
    endpointUrl: endpointUsed,
  };
}

export async function getAdmissions(
  programId?: string,
  universityId?: string,
  majorName?: string,
  majorCode?: string,
  universityName?: string
): Promise<ApiResponse<AdmissionRule>> {
  const res = await fetchAppsScriptRaw<Record<string, unknown>>(
    API_ACTIONS.ADMISSIONS,
    programId ? { programId } : undefined
  );
  if (!res.ok || !res.payload) {
    return {
      ok: false,
      data: [],
      rawCount: 0,
      error: res.error,
      latencyMs: res.latencyMs,
      endpointUrl: res.endpointUrl,
    };
  }

  const rawRows = Array.isArray(res.payload.data) ? res.payload.data : [];
  const cleaned: AdmissionRule[] = rawRows
    .filter((r) => !isHeaderEchoRow(r, "ID") && !isHeaderEchoRow(r, "Mon1") && cleanText(r.ID) !== "")
    .map((r) => ({
      ID: cleanText(r.ID),
      MaTruongTuyenSinh: cleanText(r.MaTruongTuyenSinh),
      TenTruong: cleanText(r.TenTruong),
      MaNganh: cleanText(r.MaNganh),
      TenNganh: cleanText(r.TenNganh),
      NamTuyenSinh: cleanText(r.NamTuyenSinh),
      PhuongThucXetTuyen: cleanText(r.PhuongThucXetTuyen),
      MaToHop: cleanText(r.MaToHop),
      Mon1: cleanText(r.Mon1),
      Mon2: cleanText(r.Mon2),
      Mon3: cleanText(r.Mon3),
      Mon4NeuCo: cleanText(r.Mon4NeuCo),
      DieuKienGhiChu: cleanText(r.DieuKienGhiChu),
    }));

  let filtered = cleaned;
  let filteredClientSide = false;

  if (universityId || universityName) {
    filteredClientSide = true;
    filtered = filtered.filter((a) =>
      universityMatchesRow(universityId, universityName, a.MaTruongTuyenSinh, a.TenTruong)
    );
  }

  if (majorName || majorCode) {
    const targetName = normalizeMajorKey(majorName || "");
    const targetCode = cleanText(majorCode).toLowerCase();
    filtered = filtered.filter((a) => {
      const nameMatch = targetName && normalizeMajorKey(a.TenNganh) === targetName;
      const codeMatch = targetCode && a.MaNganh.toLowerCase() === targetCode;
      return Boolean(nameMatch || codeMatch);
    });
    filteredClientSide = true;
  } else if (programId) {
    const exactId = filtered.filter((a) => a.ID === programId);
    if (exactId.length > 0 && exactId.length < filtered.length) {
      filtered = exactId;
      filteredClientSide = true;
    }
  }

  // Khử trùng lặp các tổ hợp xét tuyển giống hệt nhau
  const seen = new Set<string>();
  const uniqueAdmissions = filtered.filter((a) => {
    const sig = [
      a.MaToHop,
      a.PhuongThucXetTuyen,
      a.Mon1,
      a.Mon2,
      a.Mon3,
      a.Mon4NeuCo,
      a.NamTuyenSinh,
    ]
      .join("|")
      .toLowerCase();
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });

  return {
    ok: true,
    data: uniqueAdmissions,
    rawCount: rawRows.length,
    filteredClientSide,
    backendNotice: filteredClientSide
      ? "Đã đối chiếu linh hoạt theo mã trường, tên trường chuẩn hóa và tên ngành."
      : undefined,
    latencyMs: res.latencyMs,
    endpointUrl: res.endpointUrl,
  };
}

function normalizeRiasecCode(raw: unknown): RiasecCode | null {
  const s = cleanText(raw).toUpperCase();
  if (s === "R" || s === "I" || s === "A" || s === "S" || s === "E" || s === "C") {
    return s;
  }
  const prefix = s.charAt(0);
  if (["R", "I", "A", "S", "E", "C"].includes(prefix)) {
    return prefix as RiasecCode;
  }
  return null;
}

export async function getHollandQuestions(): Promise<ApiResponse<HollandQuestion>> {
  const res = await fetchAppsScriptRaw<Record<string, unknown>>(
    API_ACTIONS.HOLLAND_QUESTIONS,
    undefined,
    false
  );
  if (!res.ok || !res.payload) {
    return {
      ok: false,
      data: [],
      rawCount: 0,
      error: res.error,
      latencyMs: res.latencyMs,
      endpointUrl: res.endpointUrl,
    };
  }

  const rawRows = Array.isArray(res.payload.data) ? res.payload.data : [];
  const data: HollandQuestion[] = [];
  rawRows.forEach((r, idx) => {
    if (isHeaderEchoRow(r, "MaCauHoi")) return;
    const group = normalizeRiasecCode(
      r.MaRIASEC ?? r.Nhom ?? r.MaNhom ?? r.RIASEC ?? r.Group ?? r.NhomRIASEC ?? r.MaHolland
    );
    const text = cleanText(
      r.NoiDungCauHoi ?? r.CauHoi ?? r.NoiDung ?? r.PhatBieu ?? r.TenCauHoi ?? r.Question ?? r.MoTa
    );
    const category = cleanText(r.PhanLoai ?? r.NhomPhatBieu ?? r.Cot ?? "") || "Tôi thích";
    const groupName = cleanText(r.TenNhomHolland ?? r.TenNhom ?? "");
    const scoreValue = Number(r.DiemNeuChon ?? 1) || 1;
    const source = cleanText(r.Nguon ?? "");

    if (group && text) {
      data.push({
        id: cleanText(r.MaCauHoi ?? r.ID ?? r.id) || `HQ_${idx + 1}`,
        stt: Number(r.STT ?? r.ThuTu ?? idx + 1) || idx + 1,
        group,
        groupName,
        category,
        text,
        scoreValue,
        source: source || undefined,
      });
    }
  });

  return {
    ok: true,
    data,
    rawCount: rawRows.length,
    latencyMs: res.latencyMs,
    endpointUrl: res.endpointUrl,
  };
}

export async function getHollandGroups(): Promise<ApiResponse<HollandGroup>> {
  const res = await fetchAppsScriptRaw<Record<string, unknown>>(
    API_ACTIONS.HOLLAND_GROUPS,
    undefined,
    false
  );
  if (!res.ok || !res.payload) {
    return {
      ok: false,
      data: [],
      rawCount: 0,
      error: res.error,
      latencyMs: res.latencyMs,
      endpointUrl: res.endpointUrl,
    };
  }

  const rawRows = Array.isArray(res.payload.data) ? res.payload.data : [];
  const data: HollandGroup[] = [];
  rawRows.forEach((r) => {
    const code = normalizeRiasecCode(r.MaNhom ?? r.Nhom ?? r.Code ?? r.RIASEC);
    if (!code) return;
    const fieldsRaw = cleanText(r.NganhNgheGoiY ?? r.NganhPhuHop ?? r.NgheNghiep ?? "");
    const charsRaw = cleanText(r.DacDiem ?? r.DacTrung ?? "");
    data.push({
      code,
      nameVi: cleanText(r.TenNhom ?? r.TenTiengViet ?? code),
      nameEn: cleanText(r.TenTiengAnh ?? ""),
      description: cleanText(r.MoTa ?? r.GiaiThich ?? ""),
      characteristics: charsRaw ? charsRaw.split(/[;,|]/).map((s) => s.trim()).filter(Boolean) : [],
      suggestedFields: fieldsRaw
        ? fieldsRaw.split(/[;,|]/).map((s) => s.trim()).filter(Boolean)
        : [],
    });
  });

  return {
    ok: true,
    data,
    rawCount: rawRows.length,
    latencyMs: res.latencyMs,
    endpointUrl: res.endpointUrl,
  };
}

export async function checkAllApiHealth(): Promise<ApiHealthReport> {
  const checks: Array<{ key: string; label: string; action: string }> = [
    { key: "root", label: "Trạng thái dịch vụ Apps Script", action: API_ACTIONS.PING },
    { key: "schools", label: "Danh sách Trường THPT", action: API_ACTIONS.SCHOOLS },
    { key: "schoolCombos", label: "Tổ hợp môn lớp 10 các trường", action: API_ACTIONS.SCHOOL_COMBOS },
    { key: "provinces", label: "Danh sách Tỉnh / Thành phố", action: API_ACTIONS.PROVINCES },
    { key: "universities", label: "Danh sách Trường Đại học", action: API_ACTIONS.UNIVERSITIES },
    { key: "programs", label: "Danh mục Ngành / CTĐT Đại học", action: API_ACTIONS.PROGRAMS },
    { key: "admissions", label: "Tổ hợp môn xét tuyển Đại học", action: API_ACTIONS.ADMISSIONS },
    { key: "hollandQuestions", label: "Bộ câu hỏi khảo sát Holland (108 câu)", action: API_ACTIONS.HOLLAND_QUESTIONS },
    { key: "hollandGroups", label: "Nhóm sở thích & ngành Holland RIASEC", action: API_ACTIONS.HOLLAND_GROUPS },
  ];

  const results: EndpointHealthStatus[] = await Promise.all(
    checks.map(async (item) => {
      const res = await fetchAppsScriptRaw<Record<string, unknown>>(item.action, undefined, false);
      if (!res.ok) {
        return {
          key: item.key,
          label: item.label,
          action: item.action || "(mặc định)",
          status: "error",
          httpStatus: res.httpStatus,
          latencyMs: res.latencyMs,
          error: res.error,
        };
      }

      if (item.key === "root") {
        return {
          key: item.key,
          label: item.label,
          action: "(mặc định)",
          status: "ok",
          httpStatus: res.httpStatus,
          latencyMs: res.latencyMs,
          note: `Ứng dụng: ${res.payload?.app || "EduGuide AI"} · Trạng thái: ${res.payload?.status || "ready"}`,
        };
      }

      const arr = Array.isArray(res.payload?.data) ? res.payload!.data : [];
      const sampleKeys = arr.length > 0 ? Object.keys(arr[0]) : [];
      const count = typeof res.payload?.count === "number" ? res.payload.count : arr.length;

      let note: string | undefined;
      if (["schoolCombos", "universities", "programs", "admissions"].includes(item.key)) {
        note = "API trả toàn bộ bảng; bộ lọc chi tiết được xử lý an toàn ở tầng client.";
      }

      return {
        key: item.key,
        label: item.label,
        action: item.action,
        status: count === 0 ? "empty" : "ok",
        httpStatus: res.httpStatus,
        count,
        latencyMs: res.latencyMs,
        note,
        sampleKeys,
      };
    })
  );

  return {
    checkedAt: new Date().toLocaleString("vi-VN"),
    appStatus: results[0]?.status === "ok" ? "Sẵn sàng" : "Gặp sự cố kết nối",
    endpoints: results,
  };
}
