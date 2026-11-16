import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Leaf,
  Music,
  Palette,
  Scale,
  Wrench,
} from "lucide-react";
import type { StudentPreferences } from "../types/eduguide";

interface FavoriteSubjectsStepProps {
  studentName: string;
  preferences: StudentPreferences;
  onChangePreferences: (next: StudentPreferences) => void;
  onBack: () => void;
  onNext: () => void;
}

const SUBJECT_CARDS: Array<{
  name: string;
  category: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    name: "Vật lí",
    category: "Khoa học tự nhiên",
    description: "Cơ học, điện từ, quang học và nguyên lý tự nhiên",
    icon: Atom,
  },
  {
    name: "Hóa học",
    category: "Khoa học tự nhiên",
    description: "Phản ứng hóa học, vật liệu, hóa sinh và thực nghiệm",
    icon: FlaskConical,
  },
  {
    name: "Sinh học",
    category: "Khoa học tự nhiên",
    description: "Sinh học tế bào, di truyền, sinh thái và y sinh",
    icon: Leaf,
  },
  {
    name: "Địa lí",
    category: "Khoa học xã hội",
    description: "Địa lí tự nhiên, kinh tế – xã hội và bản đồ học",
    icon: Globe2,
  },
  {
    name: "Giáo dục kinh tế và pháp luật",
    category: "Khoa học xã hội",
    description: "Kinh tế học cơ bản, tài chính cá nhân và pháp luật",
    icon: Scale,
  },
  {
    name: "Tin học",
    category: "Công nghệ – Kỹ thuật",
    description: "Tư duy thuật toán, lập trình và khoa học dữ liệu",
    icon: Cpu,
  },
  {
    name: "Công nghệ",
    category: "Công nghệ – Kỹ thuật",
    description: "Thiết kế kỹ thuật, công nghệ công nghiệp và nông nghiệp",
    icon: Wrench,
  },
  {
    name: "Âm nhạc",
    category: "Nghệ thuật",
    description: "Cảm thụ âm nhạc, nhạc lí, hòa âm và biểu diễn",
    icon: Music,
  },
  {
    name: "Mĩ thuật",
    category: "Nghệ thuật",
    description: "Hội họa, đồ họa, thiết kế tạo hình và thẩm mỹ",
    icon: Palette,
  },
  {
    name: "Toán",
    category: "Môn bắt buộc",
    description: "Đại số, hình học, giải tích và tư duy logic",
    icon: Calculator,
  },
  {
    name: "Ngữ văn",
    category: "Môn bắt buộc",
    description: "Đọc hiểu văn học, nghị luận và diễn đạt ngôn ngữ",
    icon: BookOpen,
  },
  {
    name: "Tiếng Anh",
    category: "Môn bắt buộc",
    description: "Giao tiếp học thuật, đọc hiểu và ngoại ngữ hội nhập",
    icon: Languages,
  },
  {
    name: "Lịch sử",
    category: "Môn bắt buộc",
    description: "Tiến trình lịch sử dân tộc, thế giới và tư duy phản biện",
    icon: Landmark,
  },
];

export const FavoriteSubjectsStep: React.FC<FavoriteSubjectsStepProps> = ({
  studentName,
  preferences,
  onChangePreferences,
  onBack,
  onNext,
}) => {
  const selectedSet = new Set(preferences.favoriteSubjects);

  const toggleFavorite = (subjectName: string) => {
    const next = new Set(preferences.favoriteSubjects);
    if (next.has(subjectName)) {
      next.delete(subjectName);
    } else {
      next.add(subjectName);
    }
    onChangePreferences({
      ...preferences,
      favoriteSubjects: Array.from(next),
    });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] pb-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-semibold text-[#1D4ED8]">
              Bước 3 · Định hướng môn học lớp 10
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">
              Những môn học em yêu thích
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              <strong>{studentName}</strong> hãy tích chọn bao nhiêu môn tùy thích (không giới hạn số
              lượng). Các môn học yêu thích sẽ được ưu tiên cộng điểm khi xếp hạng TOP 3 tổ hợp môn
              lớp 10 ở bước cuối cùng.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right font-mono-tabular">
              <div className="text-xs text-[#64748B]">Đã chọn</div>
              <div className="text-xl font-bold text-[#1D4ED8]">
                {preferences.favoriteSubjects.length} môn
              </div>
            </div>
            {preferences.favoriteSubjects.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onChangePreferences({
                    ...preferences,
                    favoriteSubjects: [],
                  })
                }
                className="px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] border border-[#CBD5E1] rounded-lg cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>
        </div>

        {/* Lưới thẻ môn học bấm chọn đẹp mắt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SUBJECT_CARDS.map((item) => {
            const Icon = item.icon;
            const active = selectedSet.has(item.name);

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => toggleFavorite(item.name)}
                aria-pressed={active}
                className={`text-left p-4 rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer ${
                  active
                    ? "bg-[#EFF6FF] border-[#1D4ED8] ring-2 ring-[#1D4ED8]/15"
                    : "bg-white border-[#E2E8F0] hover:border-[#93C5FD] hover:bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    active
                      ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                      : "bg-[#F8FAFC] text-[#1D4ED8] border-[#E2E8F0]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm sm:text-base font-bold text-[#0F172A] truncate">
                      {item.name}
                    </span>
                    {active && (
                      <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-[#64748B]">
                    {item.category}
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Điều hướng bước */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại: Khảo sát Holland
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Tiếp tục chọn nguyện vọng đại học</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
