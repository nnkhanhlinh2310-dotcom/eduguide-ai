import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Compass,
  Edit3,
  FileWarning,
  GraduationCap,
  Info,
  Printer,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { RIASEC_META } from "../engine/advisoryEngine";
import type {
  AdvisoryReport,
  ComboRecommendation,
  VerificationLabel,
} from "../types/eduguide";
import { BrandLogo } from "./BrandLogo";
import { RiasecChart } from "./RiasecChart";

interface ResultsStepProps {
  report: AdvisoryReport | null;
  combosLoading: boolean;
  combosError: string | null;
  onRetryCombos: () => void;
  onEditSchool: () => void;
  onEditHolland: () => void;
  onEditFavorites: () => void;
  onEditAspirations: () => void;
  onOpenApiStatus: () => void;
}

function VerificationText({ status }: { status: VerificationLabel }) {
  if (status === "Phù hợp với điều kiện môn học đã xác minh") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857]">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>{status}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309]">
      <FileWarning className="w-4 h-4 shrink-0" />
      <span>{status}</span>
    </span>
  );
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
  report,
  combosLoading,
  combosError,
  onRetryCombos,
  onEditSchool,
  onEditHolland,
  onEditFavorites,
  onEditAspirations,
  onOpenApiStatus,
}) => {
  const [selectedComboCode, setSelectedComboCode] = useState<string>("");

  useEffect(() => {
    if (report && report.recommendations.length > 0) {
      const stillExists = report.recommendations.some(
        (r) => r.combo.MaToHopTHPT === selectedComboCode
      );
      if (!stillExists) {
        setSelectedComboCode(report.recommendations[0].combo.MaToHopTHPT);
      }
    }
  }, [report, selectedComboCode]);

  const handlePrintPdf = () => {
    window.print();
  };

  if (combosLoading) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-10 flex items-center justify-center gap-3 text-sm font-medium text-[#1D4ED8]">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Đang tải tổ hợp môn của trường THPT và lập hồ sơ tư vấn...</span>
      </div>
    );
  }

  if (combosError) {
    return (
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-6 space-y-3">
        <p className="text-sm font-semibold text-[#991B1B]">{combosError}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetryCombos}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử tải lại
          </button>
          <button
            type="button"
            onClick={onEditSchool}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#334155] bg-white border border-[#CBD5E1] rounded-lg cursor-pointer"
          >
            Chọn trường THPT khác
          </button>
        </div>
      </div>
    );
  }

  if (!report || report.recommendations.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center space-y-4">
        <p className="text-sm text-[#475569]">
          Chưa đủ dữ liệu tổ hợp lớp 10 của trường THPT đã chọn để lập hồ sơ tư vấn.
        </p>
        <button
          type="button"
          onClick={onEditSchool}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại chọn trường THPT
        </button>
      </div>
    );
  }

  const activeRec: ComboRecommendation =
    report.recommendations.find((r) => r.combo.MaToHopTHPT === selectedComboCode) ||
    report.recommendations[0];

  const dominantHolland =
    report.hollandAvailable && report.hollandAnsweredCount > 0
      ? report.topThreeRiasec[0]
      : null;

  const favSet = new Set(report.preferences.favoriteSubjects);

  return (
    <div className="space-y-6">
      {/* Tiêu đề chỉ hiển thị khi in PDF */}
      <div className="hidden print-only border-b border-[#CBD5E1] pb-4 mb-4">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <div className="text-right text-xs text-[#475569]">
            <div>Hồ sơ tư vấn tổ hợp môn lớp 10</div>
            <div className="font-mono-tabular">Ngày xuất: {report.generatedAt}</div>
          </div>
        </div>
      </div>

      {/* KHỐI 1 (Banner đầu trang): Tên học sinh, tên trường THPT, huy hiệu NHÓM HOLLAND và NGUYỆN VỌNG ĐẠI HỌC */}
      <section className="print-break-inside-avoid bg-gradient-to-r from-[#1E3A8A] to-[#1D4ED8] text-white rounded-xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#BFDBFE]">
              Hồ sơ tư vấn định hướng tổ hợp môn lớp 10 · {report.generatedAt}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Học sinh: {report.studentName || "Chưa nhập tên"}
            </h1>
            <p className="text-sm sm:text-base text-[#DBEAFE] font-medium">
              Trường THPT trúng tuyển: <strong>{report.school.TenTruong}</strong> (
              {report.school.TinhThanh})
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onEditAspirations}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#0F172A] bg-white hover:bg-[#EFF6FF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              Đổi nguyện vọng
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0F172A]/35 hover:bg-[#0F172A]/55 border border-white/25 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              In / Lưu PDF
            </button>
          </div>
        </div>

        {/* Hai huy hiệu tổng quan theo thiết kế khối 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <div className="text-[11px] font-semibold tracking-wider text-[#BFDBFE] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>NHÓM HOLLAND</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white truncate">
                {dominantHolland
                  ? `${dominantHolland.nameVi}`
                  : "Chưa thực hiện khảo sát"}
              </div>
              {report.hollandAvailable && report.hollandAnsweredCount > 0 && (
                <div className="text-xs text-[#DBEAFE] font-mono-tabular">
                  3 nhóm nổi trội: {report.topThreeRiasec.map((g) => g.code).join(" – ")}
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-lg bg-white text-[#1D4ED8] font-display text-2xl font-extrabold flex items-center justify-center shrink-0">
              {dominantHolland ? dominantHolland.code : "—"}
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <div className="text-[11px] font-semibold tracking-wider text-[#BFDBFE] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>NGUYỆN VỌNG ĐẠI HỌC</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white truncate">
                {report.aspirations.length > 0
                  ? `${report.aspirations.length} nguyện vọng đã đăng ký`
                  : "Chưa đăng ký nguyện vọng"}
              </div>
              <div className="text-xs text-[#DBEAFE] truncate">
                {report.preferences.favoriteSubjects.length > 0
                  ? `Môn yêu thích: ${report.preferences.favoriteSubjects.join(", ")}`
                  : "Chưa chọn môn yêu thích"}
              </div>
            </div>
            <div className="px-3 h-12 rounded-lg bg-white text-[#1D4ED8] font-mono-tabular text-xl font-extrabold flex items-center justify-center shrink-0">
              {report.aspirations.length}NV
            </div>
          </div>
        </div>
      </section>

      {/* KHỐI 2: Tổ hợp môn học tại trường [Tên trường THPT đã chọn] — TOP 3 tổ hợp */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#E2E8F0] pb-4 space-y-1">
          <h2 className="font-display text-xl font-bold text-[#0F172A]">
            Tổ hợp môn học tại trường {report.school.TenTruong}
          </h2>
          <p className="text-xs sm:text-sm text-[#475569]">
            TOP {report.recommendations.length} tổ hợp đề xuất từ {report.allSchoolCombosCount} tổ
            hợp của trường (dựa trên nhóm Holland, môn yêu thích và nguyện vọng đại học). Nhấn{" "}
            <strong>“Chọn tổ hợp này”</strong> để xem cơ cấu môn và đối chiếu xét tuyển tương ứng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {report.recommendations.map((rec) => {
            const isBest = rec.rank === 1;
            const isSelected = rec.combo.MaToHopTHPT === activeRec.combo.MaToHopTHPT;

            return (
              <div
                key={rec.combo.MaToHopTHPT}
                className={`rounded-xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isSelected
                    ? "bg-[#EFF6FF] border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20"
                    : "bg-white border-[#E2E8F0] hover:border-[#93C5FD]"
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${
                        isBest
                          ? "bg-[#1D4ED8] text-white"
                          : "bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]"
                      }`}
                    >
                      {isBest ? (
                        <Award className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>{isBest ? "Đề xuất nên chọn" : "Dự phòng"}</span>
                    </span>
                    <span className="font-mono-tabular text-xs font-semibold text-[#475569]">
                      #{rec.rank} · {rec.combo.MaToHopTHPT}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[#475569] mb-1">
                      4 môn lựa chọn
                    </div>
                    <ul className="space-y-1 text-sm font-semibold text-[#0F172A]">
                      {rec.electiveSubjects.map((sub, i) => (
                        <li key={i} className="flex items-center justify-between gap-2">
                          <span>• {sub}</span>
                          {favSet.has(sub) && (
                            <span className="text-[11px] font-medium text-[#1D4ED8]">
                              Yêu thích
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.studyTopics.length > 0 && (
                    <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#475569]">
                      <span className="font-semibold text-[#334155]">Chuyên đề:</span>{" "}
                      {rec.studyTopics.join(", ")}
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E2E8F0] text-xs text-[#334155] space-y-1">
                    {rec.reasons.slice(0, 2).map((reason, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {reason}
                      </p>
                    ))}
                  </div>

                  <div>
                    <VerificationText status={rec.verificationStatus} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedComboCode(rec.combo.MaToHopTHPT)}
                  className={`w-full py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-white text-[#1D4ED8] border border-[#93C5FD] hover:bg-[#EFF6FF]"
                  }`}
                >
                  {isSelected ? "Đang xem tổ hợp này" : "Chọn tổ hợp này"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* KHỐI 3: Tổng hợp cơ cấu môn học THPT & 02 môn thi tốt nghiệp dự kiến (3 cột) */}
      <section className="print-break-inside-avoid bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#E2E8F0] pb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0F172A]">
              Tổng hợp cơ cấu môn học THPT &amp; 02 môn thi tốt nghiệp dự kiến
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              Cấu trúc chương trình áp dụng cho tổ hợp đang chọn:{" "}
              <strong className="font-mono-tabular text-[#1D4ED8]">
                {activeRec.combo.MaToHopTHPT}
              </strong>
            </p>
          </div>
          <span className="text-xs text-[#64748B] font-mono-tabular">
            Năm học {activeRec.combo.NamHoc || "Cần xác minh"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Cột 1: 4 môn bắt buộc */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
            <div className="pb-2.5 border-b border-[#E2E8F0]">
              <div className="text-xs font-mono-tabular font-bold text-[#475569]">
                CỘT 1 · MÔN HỌC CHUNG
              </div>
              <h3 className="font-display text-base font-bold text-[#0F172A]">
                4 môn bắt buộc
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-[#0F172A]">
              {activeRec.compulsorySubjects.map((sub) => (
                <li
                  key={sub}
                  className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-between gap-2"
                >
                  <span className="font-semibold">{sub}</span>
                  <span className="text-[11px] text-[#64748B]">
                    {sub === "Toán" || sub === "Ngữ văn"
                      ? "Thi TN bắt buộc"
                      : "Bắt buộc GDPT"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 2: 4 môn lựa chọn của tổ hợp đang chọn */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5 space-y-3">
            <div className="pb-2.5 border-b border-[#BFDBFE]">
              <div className="text-xs font-mono-tabular font-bold text-[#1D4ED8]">
                CỘT 2 · TỔ HỢP {activeRec.combo.MaToHopTHPT}
              </div>
              <h3 className="font-display text-base font-bold text-[#0F172A]">
                4 môn lựa chọn
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-[#0F172A]">
              {activeRec.electiveSubjects.map((sub) => (
                <li
                  key={sub}
                  className="px-3 py-2 bg-white border border-[#BFDBFE] rounded-lg flex items-center justify-between gap-2"
                >
                  <span className="font-semibold">{sub}</span>
                  {favSet.has(sub) && (
                    <span className="text-[11px] font-semibold text-[#1D4ED8]">
                      Yêu thích
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: 02 môn thi tốt nghiệp dự kiến tự chọn phù hợp nhất */}
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-5 space-y-3">
            <div className="pb-2.5 border-b border-[#A7F3D0]">
              <div className="text-xs font-mono-tabular font-bold text-[#047857]">
                CỘT 3 · ĐỊNH HƯỚNG THI TN THPT
              </div>
              <h3 className="font-display text-base font-bold text-[#0F172A]">
                02 môn thi tốt nghiệp dự kiến tự chọn
              </h3>
            </div>
            <ul className="space-y-2.5">
              {activeRec.recommendedGradExamElectives.map((item, idx) => (
                <li
                  key={item.subject}
                  className="p-3 bg-white border border-[#A7F3D0] rounded-lg space-y-1"
                >
                  <div className="text-sm font-bold text-[#047857]">
                    {idx + 1}. {item.subject}
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed">
                    {item.reason}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[#065F46] leading-relaxed">
              Kết hợp cùng 2 môn thi bắt buộc (Toán, Ngữ văn) tạo thành 4 môn thi tốt nghiệp THPT
              theo quy chế hiện hành.
            </p>
          </div>
        </div>
      </section>

      {/* KHỐI 4: Bảng đối chiếu tổ hợp xét tuyển theo từng nguyện vọng đại học */}
      <section className="print-break-inside-avoid bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#E2E8F0] pb-4 space-y-1">
          <h2 className="font-display text-xl font-bold text-[#0F172A]">
            Bảng đối chiếu tổ hợp xét tuyển theo từng nguyện vọng đại học
          </h2>
          <p className="text-xs sm:text-sm text-[#475569]">
            Đối chiếu các môn của tổ hợp THPT{" "}
            <strong className="font-mono-tabular text-[#1D4ED8]">
              {activeRec.combo.MaToHopTHPT}
            </strong>{" "}
            với tổ hợp xét tuyển đại học từ dữ liệu <span className="font-mono">TRA_CUU_NGANH_NGHE</span> /{" "}
            <span className="font-mono">TO_HOP_XET_TUYEN</span>.
          </p>
        </div>

        {activeRec.matchedAspirations.length === 0 ? (
          <div className="p-6 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl text-sm text-[#475569]">
            Bạn chưa đăng ký nguyện vọng đại học nào. Hãy bấm nút{" "}
            <button
              type="button"
              onClick={onEditAspirations}
              className="font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Đổi nguyện vọng
            </button>{" "}
            để đối chiếu tổ hợp xét tuyển chi tiết.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#334155]">
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Nguyện vọng</th>
                  <th className="py-3 px-4 font-semibold">Ngành &amp; Trường Đại học</th>
                  <th className="py-3 px-4 font-semibold">Tổ hợp đáp ứng đầy đủ 100%</th>
                  <th className="py-3 px-4 font-semibold">Môn còn thiếu theo từng tổ hợp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {activeRec.matchedAspirations.map((asp) => (
                  <tr key={asp.aspirationPriority} className="align-top">
                    <td className="py-4 px-4 whitespace-nowrap font-mono-tabular font-bold text-[#1D4ED8]">
                      NV{asp.aspirationPriority}
                      <div className="text-[11px] font-normal text-[#64748B] mt-0.5">
                        Năm {asp.dataYear}
                      </div>
                    </td>

                    <td className="py-4 px-4 space-y-1 min-w-[220px]">
                      <div className="font-bold text-[#0F172A]">
                        {asp.majorName}{" "}
                        {asp.majorCode ? (
                          <span className="font-mono-tabular text-xs font-normal text-[#64748B]">
                            ({asp.majorCode})
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-[#475569]">{asp.universityName}</div>
                      {asp.verificationNotes.length > 0 && (
                        <div className="text-[11px] text-[#B45309] pt-1">
                          {asp.verificationNotes[0]}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 min-w-[230px]">
                      {asp.matchedCombos.length > 0 ? (
                        <ul className="space-y-2">
                          {asp.matchedCombos.map((c, idx) => (
                            <li
                              key={`${c.maToHop}-${idx}`}
                              className="p-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs space-y-0.5"
                            >
                              <div className="font-bold text-[#047857] flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-mono-tabular">{c.maToHop}</span>
                                <span className="font-normal text-[#065F46]">
                                  · {c.phuongThuc}
                                </span>
                              </div>
                              <div className="text-[#065F46]">
                                Môn: {c.requiredSubjects.join(", ")}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B45309]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Chưa có tổ hợp đáp ứng 100%</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 min-w-[240px]">
                      {asp.matchedCombos.length === 0 && asp.unmatchedCombos.length === 0 ? (
                        <span className="text-xs text-[#B45309]">
                          Chưa có dữ liệu tổ hợp xét tuyển trên Google Sheets (Cần xác minh).
                        </span>
                      ) : asp.unmatchedCombos.length === 0 ? (
                        <span className="text-xs text-[#047857] font-medium">
                          Không có tổ hợp nào bị thiếu môn.
                        </span>
                      ) : (
                        <ul className="space-y-2">
                          {asp.unmatchedCombos.map((u, idx) => (
                            <li
                              key={`${u.maToHop}-${idx}`}
                              className="p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-xs space-y-0.5"
                            >
                              <div className="font-semibold text-[#92400E]">
                                <span className="font-mono-tabular mr-1">{u.maToHop}</span>(
                                {u.requiredSubjects.join(", ")})
                              </div>
                              {u.missingSubjects.length > 0 && (
                                <div className="text-[#B45309] font-medium">
                                  Thiếu: {u.missingSubjects.join(", ")}
                                </div>
                              )}
                              {u.specialSubjects.length > 0 && (
                                <div className="text-[#92400E]">
                                  Cần xác minh môn đặc thù: {u.specialSubjects.join(", ")}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Biểu đồ Holland RIASEC đầy đủ & Cảnh báo xác minh */}
      {report.hollandAvailable && report.hollandAnsweredCount > 0 && (
        <section className="print-break-inside-avoid bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Chi tiết biểu đồ sở thích Holland RIASEC
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              Kết quả khám phá xu hướng sở thích ({report.hollandAnsweredCount}/
              {report.hollandTotalQuestions} phát biểu đã chọn).
            </p>
          </div>
          <RiasecChart scores={report.riasecRanking} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#E2E8F0]">
            {report.topThreeRiasec.map((grp, idx) => (
              <div
                key={grp.code}
                className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1"
              >
                <div className="text-xs font-mono-tabular font-bold text-[#1D4ED8]">
                  Nổi trội #{idx + 1} · {grp.code} ({grp.score} điểm)
                </div>
                <div className="text-sm font-bold text-[#0F172A]">{grp.nameVi}</div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {RIASEC_META[grp.code].summary}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cảnh báo dữ liệu chưa xác minh & lưu ý nguồn */}
      {report.globalWarnings.length > 0 && (
        <section className="print-break-inside-avoid bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#92400E]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Thông tin nguồn dữ liệu &amp; mục cần xác minh</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#92400E]">
            {report.globalWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
          <p className="text-xs text-[#78350F] pt-1">
            Nguồn tổ hợp THPT ({activeRec.combo.MaToHopTHPT}):{" "}
            {activeRec.combo.NguonXacNhan || "Chưa ghi nhận"} · Trạng thái:{" "}
            {activeRec.combo.TrangThai || "Chưa cập nhật"}
          </p>
          <div className="no-print">
            <button
              type="button"
              onClick={onOpenApiStatus}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Kiểm tra trạng thái kết nối Google Sheets API
            </button>
          </div>
        </section>
      )}

      {/* Tuyên bố miễn trừ trách nhiệm học thuật */}
      <section className="print-break-inside-avoid bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5 sm:p-6 space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1E3A8A]">
          <Info className="w-4 h-4 shrink-0" />
          <span>Lưu ý học thuật và an toàn dữ liệu</span>
        </div>
        <p className="text-xs sm:text-sm text-[#1E3A8A] leading-relaxed">{report.disclaimer}</p>
      </section>

      {/* Thanh nút điều chỉnh cuối trang */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onEditAspirations}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại: Nguyện vọng ĐH
          </button>
          <button
            type="button"
            onClick={onEditFavorites}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Đổi môn yêu thích
          </button>
          <button
            type="button"
            onClick={onEditHolland}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Làm lại Holland
          </button>
          <button
            type="button"
            onClick={onEditSchool}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Đổi trường THPT
          </button>
        </div>

        <button
          type="button"
          onClick={handlePrintPdf}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          In / Lưu kết quả PDF
        </button>
      </div>
    </div>
  );
};
