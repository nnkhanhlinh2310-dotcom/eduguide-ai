import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import type { HighSchool, SchoolCombo } from "../types/eduguide";

interface SchoolSelectionStepProps {
  studentName: string;
  schools: HighSchool[];
  loading: boolean;
  error: string | null;
  selectedSchoolId: string;
  onSelectSchool: (schoolId: string) => void;
  schoolCombos: SchoolCombo[];
  combosLoading: boolean;
  combosError: string | null;
  onRetryLoad: () => void;
  onBack: () => void;
  onNext: () => void;
  onOpenApiStatus: () => void;
}

const SCHOOL_PALETTES = [
  "from-[#1E3A8A] to-[#2563EB]",
  "from-[#0F4C81] to-[#0284C7]",
  "from-[#1E40AF] to-[#3B82F6]",
  "from-[#0C4A6E] to-[#0369A1]",
  "from-[#172554] to-[#1D4ED8]",
  "from-[#164E63] to-[#0891B2]",
];

function getSchoolInitials(schoolName: string): string {
  const cleaned = schoolName
    .replace(/trường\s+thpt/gi, "")
    .replace(/chuyên/gi, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "THPT";
  return words
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function getPaletteForSchool(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) {
    hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  }
  return SCHOOL_PALETTES[hash % SCHOOL_PALETTES.length];
}

const SchoolLogoAvatar: React.FC<{ school: HighSchool }> = ({ school }) => {
  const logoSrc = school.LogoTruong.trim();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [school.MaTruongTHPT, logoSrc]);

  const initials = getSchoolInitials(school.TenTruong);
  const showImage = Boolean(logoSrc) && !errored;

  return (
    <div className="w-11 h-11 rounded-full bg-white p-1 border border-[#E2E8F0] shadow-sm shrink-0 relative flex items-center justify-center overflow-hidden">
      {(!showImage || !loaded) && (
        <span
          className="font-display font-bold text-xs text-[#1D4ED8] select-none"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
      {showImage && (
        <img
          src={logoSrc}
          alt={loaded ? `Logo ${school.TenTruong}` : ""}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setErrored(true);
          }}
          className={`w-full h-full object-contain text-transparent transition-opacity duration-200 ${
            loaded ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 p-1 pointer-events-none"
          }`}
        />
      )}
    </div>
  );
};

const SchoolBannerMedia: React.FC<{ school: HighSchool }> = ({ school }) => {
  const bannerSrc = school.AnhTruong.trim();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [school.MaTruongTHPT, bannerSrc]);

  const showImage = Boolean(bannerSrc) && !errored;
  const palette = getPaletteForSchool(school.MaTruongTHPT || school.TenTruong);

  return (
    <div
      className={`relative h-36 w-full bg-gradient-to-br ${palette} border-b border-[#E2E8F0] overflow-hidden`}
    >
      {showImage && (
        <img
          src={bannerSrc}
          alt={loaded ? `Ảnh ${school.TenTruong}` : ""}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setErrored(true);
          }}
          className={`w-full h-full object-cover text-transparent transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent pointer-events-none" />

      {/* Ô logo góc trên bên trái: hiển thị trực tiếp LogoTruong từ API */}
      <div className="absolute top-2.5 left-3 z-10">
        <SchoolLogoAvatar school={school} />
      </div>

      {/* Nhãn thông tin dưới cùng thẻ bìa */}
      <div className="absolute bottom-2.5 left-3 right-3 z-10 space-y-0.5 pointer-events-none">
        {(!showImage || !loaded) && (
          <div className="font-display text-sm font-bold text-white line-clamp-1 leading-snug">
            {school.TenTruong}
          </div>
        )}
        <div className="font-mono-tabular text-[11px] font-semibold text-white/95 truncate">
          {school.MaTruongTHPT} · {school.LoaiHinh || "THPT"}
        </div>
      </div>
    </div>
  );
};

export const SchoolSelectionStep: React.FC<SchoolSelectionStepProps> = ({
  studentName,
  schools,
  loading,
  error,
  selectedSchoolId,
  onSelectSchool,
  schoolCombos,
  combosLoading,
  combosError,
  onRetryLoad,
  onBack,
  onNext,
  onOpenApiStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Ưu tiên hiển thị các trường THPT tại Đà Nẵng từ DM_TRUONG_THPT
  const danangSchools = useMemo(() => {
    const filtered = schools.filter((s) =>
      s.TinhThanh.toLowerCase().includes("đà nẵng")
    );
    return filtered.length > 0 ? filtered : schools;
  }, [schools]);

  const displayedSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return danangSchools;
    return danangSchools.filter(
      (s) =>
        s.TenTruong.toLowerCase().includes(q) ||
        s.DiaChi.toLowerCase().includes(q) ||
        s.MaTruongTHPT.toLowerCase().includes(q)
    );
  }, [danangSchools, searchQuery]);

  const selectedSchool = danangSchools.find(
    (s) => s.MaTruongTHPT === selectedSchoolId
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">
              Bước 1 · Chọn trường THPT đã trúng tuyển
            </h1>
            <p className="text-sm text-[#475569]">
              Chào <strong>{studentName}</strong>, hãy tìm và chọn trường THPT bạn đã trúng tuyển
              tại Đà Nẵng từ danh sách <span className="font-mono">DM_TRUONG_THPT</span> để tải đúng
              các tổ hợp môn lớp 10 của trường.
            </p>
          </div>
          <div className="font-mono-tabular text-xs sm:text-sm font-semibold text-[#1D4ED8]">
            {displayedSchools.length}/{danangSchools.length} trường
          </div>
        </div>

        {/* Thanh tìm kiếm tên trường */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên trường THPT, địa chỉ hoặc mã trường (ví dụ: Phan Châu Trinh, Hòa Vang)..."
            aria-label="Tìm kiếm trường THPT"
            className="w-full h-11 pl-10 pr-4 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white"
          />
        </div>

        {/* Trạng thái tải / lỗi / rỗng */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 bg-[#F1F5F9] animate-pulse rounded-xl border border-[#E2E8F0]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-3">
            <div className="flex items-start gap-2.5 text-sm text-[#991B1B]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRetryLoad}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Thử tải lại danh sách trường
              </button>
              <button
                type="button"
                onClick={onOpenApiStatus}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Kiểm tra trạng thái kết nối API
              </button>
            </div>
          </div>
        ) : displayedSchools.length === 0 ? (
          <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl space-y-2">
            <p className="text-sm font-medium text-[#334155]">
              Không tìm thấy trường THPT nào khớp với từ khóa “{searchQuery}”.
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedSchools.map((school) => {
              const isSelected = school.MaTruongTHPT === selectedSchoolId;

              return (
                <button
                  key={school.MaTruongTHPT}
                  type="button"
                  onClick={() => onSelectSchool(school.MaTruongTHPT)}
                  aria-pressed={isSelected}
                  className={`text-left rounded-xl border overflow-hidden transition-colors flex flex-col cursor-pointer relative ${
                    isSelected
                      ? "bg-[#EFF6FF] border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20"
                      : "bg-white border-[#E2E8F0] hover:border-[#93C5FD]"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#1D4ED8] px-2.5 py-1 rounded shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã chọn
                    </span>
                  )}

                  <SchoolBannerMedia school={school} />

                  <div className="p-4 flex-1 flex flex-col justify-between gap-2.5">
                    <div className="space-y-1">
                      <h2 className="font-display text-sm sm:text-base font-bold text-[#0F172A] leading-snug">
                        {school.TenTruong}
                      </h2>
                      <p className="text-xs text-[#475569] flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" />
                        <span>{school.DiaChi || school.TinhThanh}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0]/80 text-[11px] text-[#64748B] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{school.Nguon || "Sở GD&ĐT"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#B45309] font-medium">
                        {school.TrangThaiDuLieu || "Đang rà soát"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Khung tóm tắt trường đã chọn & số tổ hợp lớp 10 tải được */}
      {selectedSchool && (
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SchoolLogoAvatar school={selectedSchool} />
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[#1D4ED8]">
                Trường THPT bạn đang chọn
              </div>
              <div className="font-display text-base sm:text-lg font-bold text-[#0F172A]">
                {selectedSchool.TenTruong}
              </div>
              <div className="text-xs text-[#475569]">
                {combosLoading
                  ? "Đang kiểm tra danh sách tổ hợp môn lớp 10 của trường..."
                  : combosError
                  ? `Lỗi tải tổ hợp: ${combosError}`
                  : `Đã tìm thấy ${schoolCombos.length} tổ hợp môn lớp 10 trên Google Sheets.`}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Điều hướng bước */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Trang chủ
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!selectedSchool}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#94A3B8] disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Tiếp tục và khám phá Holland</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
