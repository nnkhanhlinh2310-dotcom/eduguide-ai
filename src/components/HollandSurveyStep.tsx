import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckSquare,
  Compass,
  Info,
  RefreshCw,
  Square,
  Wrench,
} from "lucide-react";
import { computeRiasecScores, RIASEC_META } from "../engine/advisoryEngine";
import type { HollandGroup, HollandQuestion, RiasecCode } from "../types/eduguide";
import { RiasecChart } from "./RiasecChart";

interface HollandSurveyStepProps {
  studentName: string;
  questions: HollandQuestion[];
  groups: HollandGroup[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  hasStartedSurvey: boolean;
  onStartSurvey: () => void;
  onShowGuide?: () => void;
  onToggleQuestion: (questionId: string) => void;
  onRetryLoad: () => void;
  onBack: () => void;
  onNext: () => void;
  onOpenApiStatus: () => void;
}

const RIASEC_ORDER: RiasecCode[] = ["R", "I", "A", "S", "E", "C"];
const HOLLAND_COLUMNS = ["Tôi là người", "Tôi có thể", "Tôi thích"] as const;

export const HollandSurveyStep: React.FC<HollandSurveyStepProps> = ({
  studentName,
  questions,
  groups,
  loading,
  error,
  selectedIds,
  hasStartedSurvey,
  onStartSurvey,
  onShowGuide,
  onToggleQuestion,
  onRetryLoad,
  onBack,
  onNext,
  onOpenApiStatus,
}) => {
  const [activeTab, setActiveTab] = useState<RiasecCode>("R");

  const questionsByGroup = useMemo(() => {
    const grouped: Record<RiasecCode, HollandQuestion[]> = {
      R: [],
      I: [],
      A: [],
      S: [],
      E: [],
      C: [],
    };
    questions.forEach((q) => {
      if (grouped[q.group]) {
        grouped[q.group].push(q);
      }
    });
    return grouped;
  }, [questions]);

  const activeGroupQuestionsByColumn = useMemo(() => {
    const current = questionsByGroup[activeTab] || [];
    const cols: Record<(typeof HOLLAND_COLUMNS)[number], HollandQuestion[]> = {
      "Tôi là người": [],
      "Tôi có thể": [],
      "Tôi thích": [],
    };

    current.forEach((q) => {
      const cat = q.category.trim().toLowerCase();
      if (cat.includes("là người")) {
        cols["Tôi là người"].push(q);
      } else if (cat.includes("có thể")) {
        cols["Tôi có thể"].push(q);
      } else {
        cols["Tôi thích"].push(q);
      }
    });
    return cols;
  }, [questionsByGroup, activeTab]);

  const { ranking, topThree } = useMemo(
    () => computeRiasecScores(questions, selectedIds, groups),
    [questions, selectedIds, groups]
  );

  const activeSheetGroupName = questionsByGroup[activeTab]?.find((q) => q.groupName)?.groupName;
  const activeGroupMeta = groups.find((g) => g.code === activeTab);
  const activeGroupTitle =
    activeGroupMeta?.nameVi || activeSheetGroupName || RIASEC_META[activeTab].nameVi;
  const activeGroupDesc = activeGroupMeta?.description || RIASEC_META[activeTab].summary;
  const dataSourceNote = questions.find((q) => q.source)?.source;

  if (!hasStartedSurvey) {
    return (
      <div className="space-y-6">
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-10 space-y-7 max-w-4xl mx-auto">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1D4ED8]">
              <Compass className="w-4 h-4" />
              <span>Bước 2 · Khám phá sở thích nghề nghiệp Holland (108 câu hỏi)</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight">
              Hướng dẫn làm bài trắc nghiệm sở thích nghề nghiệp Holland
            </h1>
            <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto">
              Chào <strong>{studentName}</strong>, trước khi bắt đầu tích chọn, hãy xem qua 3 bước
              thực hiện nhanh dưới đây để có kết quả sát với bản thân nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="font-mono-tabular text-xs font-bold text-[#1D4ED8]">BƯỚC 1</div>
              <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                Bước 1: Đọc lướt 3 cột (&quot;Tôi là người&quot;, &quot;Tôi có thể&quot;, &quot;Tôi
                thích&quot;) trong từng nhóm.
              </p>
            </div>

            <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="font-mono-tabular text-xs font-bold text-[#1D4ED8]">BƯỚC 2</div>
              <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                Bước 2: Tích chọn các câu trả lời phù hợp với bản thân.
              </p>
            </div>

            <div className="p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="font-mono-tabular text-xs font-bold text-[#1D4ED8]">BƯỚC 3</div>
              <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                Bước 3: Xem kết quả và mã Holland nổi trội.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[#1E3A8A] leading-relaxed">
              Không có đáp án đúng hay sai. Hãy chọn tự nhiên theo cảm nhận thật của bạn (có thể chuyển
              đổi qua lại giữa 6 nhóm R – I – A – S – E – C bất cứ lúc nào).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại: Chọn trường THPT
            </button>

            <button
              type="button"
              onClick={onStartSurvey}
              className="inline-flex items-center gap-2 px-7 py-3 text-sm sm:text-base font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>Bắt đầu tích chọn sở thích</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">
              Bước 2 · Khảo sát sở thích nghề nghiệp Holland (108 câu hỏi)
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              <strong>{studentName}</strong> hãy chọn những phát biểu đúng với bản thân trong 6 nhóm
              RIASEC. Mỗi nhóm được chia theo 3 cột:{" "}
              <strong>Tôi là người · Tôi có thể · Tôi thích</strong> (mỗi phát biểu chọn tính 1
              điểm).
            </p>
          </div>

          <div className="flex items-center gap-4">
            {onShowGuide && (
              <button
                type="button"
                onClick={onShowGuide}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline whitespace-nowrap cursor-pointer"
              >
                Xem lại hướng dẫn
              </button>
            )}
            {questions.length > 0 && (
              <div className="text-right font-mono-tabular">
                <div className="text-xs text-[#64748B]">Đã chọn</div>
                <div className="text-xl font-bold text-[#1D4ED8]">
                  {selectedIds.size}/{questions.length}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ghi chú giải thích đúng bản chất công cụ Holland */}
        <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-[#1E3A8A] leading-relaxed">
            <strong>Lưu ý khoa học hướng nghiệp:</strong> Kết quả Holland RIASEC là công cụ khám phá
            xu hướng sở thích hiện tại, <strong>không phải</strong> kết luận cố định về năng lực hay
            nghề nghiệp tương lai.
            {dataSourceNote ? ` (Nguồn bộ câu hỏi: ${dataSourceNote})` : ""}
          </p>
        </div>

        {/* Trạng thái đang tải */}
        {loading && (
          <div className="py-12 space-y-4">
            <div className="flex items-center justify-center gap-3 text-sm font-medium text-[#1D4ED8]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang tải 108 câu hỏi Holland từ Google Sheets...</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-[#F1F5F9] rounded-lg animate-pulse border border-[#E2E8F0]"
                />
              ))}
            </div>
          </div>
        )}

        {/* Trạng thái lỗi */}
        {!loading && error && (
          <div className="p-6 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h2 className="font-display text-base font-bold text-[#991B1B]">
                  Chưa thể tải bộ câu hỏi Holland từ Google Sheets API
                </h2>
                <p className="text-sm text-[#7F1D1D]">
                  Phản hồi từ máy chủ: <span className="font-mono-tabular font-semibold">{error}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRetryLoad}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Thử tải lại
              </button>
              <button
                type="button"
                onClick={onOpenApiStatus}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1D4ED8] bg-white border border-[#BFDBFE] hover:bg-[#EFF6FF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                Kiểm tra trạng thái API
              </button>
            </div>
          </div>
        )}

        {/* Trạng thái rỗng */}
        {!loading && !error && questions.length === 0 && (
          <div className="p-6 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl space-y-3">
            <p className="text-sm font-semibold text-[#92400E]">
              API đã phản hồi nhưng chưa có câu hỏi nào trong sheet HOLLAND_CAU_HOI.
            </p>
            <button
              type="button"
              onClick={onRetryLoad}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#92400E] bg-white border border-[#FCD34D] rounded-lg hover:bg-[#FEF3C7] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Kiểm tra lại
            </button>
          </div>
        )}

        {/* Giao diện 6 nhóm RIASEC, mỗi nhóm hiển thị đúng 3 cột tích chọn */}
        {!loading && !error && questions.length > 0 && (
          <div className="space-y-6 pt-2">
            {/* Thanh 6 nhóm RIASEC */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
              {RIASEC_ORDER.map((code) => {
                const groupQs = questionsByGroup[code];
                const checkedCount = groupQs.filter((q) => selectedIds.has(q.id)).length;
                const isActive = activeTab === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setActiveTab(code)}
                    className={`px-3 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                      isActive
                        ? "bg-white text-[#1D4ED8] border border-[#BFDBFE]"
                        : "text-[#475569] hover:text-[#0F172A]"
                    }`}
                  >
                    <span>Nhóm {code}</span>
                    <span className="font-mono-tabular text-xs opacity-80">
                      ({checkedCount}/{groupQs.length})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tiêu đề & mô tả nhóm đang chọn */}
            <div className="pb-4 border-b border-[#E2E8F0] space-y-1">
              <h2 className="font-display text-lg font-bold text-[#0F172A]">
                {activeTab} · {activeGroupTitle}
              </h2>
              <p className="text-sm text-[#475569]">{activeGroupDesc}</p>
            </div>

            {/* 3 cột: Tôi là người | Tôi có thể | Tôi thích */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {HOLLAND_COLUMNS.map((colTitle) => {
                const colQuestions = activeGroupQuestionsByColumn[colTitle];
                const colSelectedCount = colQuestions.filter((q) =>
                  selectedIds.has(q.id)
                ).length;
                return (
                  <div
                    key={colTitle}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]">
                      <h3 className="font-display text-sm font-bold text-[#0F172A]">
                        {colTitle}
                      </h3>
                      <span className="font-mono-tabular text-xs font-semibold text-[#1D4ED8]">
                        {colSelectedCount}/{colQuestions.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {colQuestions.map((q) => {
                        const checked = selectedIds.has(q.id);
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => onToggleQuestion(q.id)}
                            aria-pressed={checked}
                            className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-2.5 cursor-pointer ${
                              checked
                                ? "bg-[#EFF6FF] border-[#2563EB] text-[#0F172A]"
                                : "bg-white border-[#E2E8F0] hover:border-[#94A3B8] text-[#334155]"
                            }`}
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-[#94A3B8] shrink-0 mt-0.5" />
                            )}
                            <span className="text-xs sm:text-sm leading-snug">
                              <span className="font-mono-tabular text-[11px] text-[#64748B] mr-1.5">
                                {q.stt}.
                              </span>
                              {q.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Biểu đồ tổng hợp 6 nhóm RIASEC */}
      {!loading && !error && questions.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F172A]">
                Kết quả xếp hạng 6 nhóm sở thích RIASEC
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
                Cập nhật trực tiếp theo các phát biểu bạn đã tích chọn.
              </p>
            </div>
            <div className="text-sm font-semibold text-[#1D4ED8] font-mono-tabular">
              3 nhóm nổi trội: {topThree.map((t) => t.code).join(" – ")}
            </div>
          </div>

          <RiasecChart scores={ranking} />
        </div>
      )}

      {/* Điều hướng bước */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại: Chọn trường THPT
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Tiếp tục chọn môn học yêu thích</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
