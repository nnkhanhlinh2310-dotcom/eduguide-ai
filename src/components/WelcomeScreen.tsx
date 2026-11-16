import React, { useState } from "react";
import {
  ArrowRight,
  Building2,
  Compass,
  FileCheck2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface WelcomeScreenProps {
  studentName: string;
  onChangeStudentName: (name: string) => void;
  onStart: () => void;
  onOpenApiStatus: () => void;
}

const ADVISORY_STUDY_IMAGE = "/src/assets/images/career_orientation_study_1794678294059.jpg";

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  studentName,
  onChangeStudentName,
  onStart,
  onOpenApiStatus,
}) => {
  const [touched, setTouched] = useState(false);
  const trimmedName = studentName.trim();
  const isNameValid = trimmedName.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isNameValid) return;
    onStart();
  };

  return (
    <div className="space-y-10">
      {/* Khối Hero chính: Slogan cỡ lớn trung tâm, lời chào phụ đề cỡ vừa và ô nhập Tên của bạn bắt buộc */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-[#F1F5F9] flex items-center justify-between gap-4 flex-wrap">
          <BrandLogo />
          <span className="text-xs font-medium text-[#475569]">
            Chương trình GDPT 2018 · Lớp 10
          </span>
        </div>

        <div className="p-6 sm:p-10 lg:p-12 space-y-8">
          {/* Tiêu đề Slogan cỡ rất lớn, nổi bật ở trung tâm */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.14] bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#0284C7] bg-clip-text text-transparent [text-wrap:balance]">
              Chọn đúng tổ hợp, chuẩn bước tương lai
            </h1>
            <p className="text-base sm:text-xl font-normal text-[#334155] leading-relaxed max-w-2xl mx-auto">
              Chào bạn, bạn tên gì để EduGuide AI cùng đồng hành và tư vấn nhé?
            </p>
          </div>

          {/* Form nhập tên bắt buộc ngay dưới dòng phụ đề */}
          <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="student-name-input"
                className="block text-sm font-semibold text-[#0F172A]"
              >
                Tên của bạn <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <UserRound className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => onChangeStudentName(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Nhập tên hoặc biệt danh của bạn (ví dụ: Minh Anh)"
                  autoComplete="given-name"
                  required
                  className={`w-full h-11 pl-10 pr-4 text-sm font-medium text-[#0F172A] bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                    touched && !isNameValid
                      ? "border-[#DC2626] focus:ring-[#DC2626]"
                      : "border-[#CBD5E1] focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
                  }`}
                />
              </div>
              {touched && !isNameValid ? (
                <p className="text-xs font-medium text-[#DC2626]">
                  Vui lòng nhập tên của bạn trước khi bắt đầu tư vấn.
                </p>
              ) : (
                <p className="text-xs text-[#64748B]">
                  Chỉ dùng tên để xưng hô trong hồ sơ tư vấn; không thu thập họ tên đầy đủ, số điện
                  thoại hay địa chỉ.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={!isNameValid}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm sm:text-base font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#94A3B8] disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Bắt đầu tư vấn</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenApiStatus}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium text-[#334155] hover:text-[#1D4ED8] border border-[#CBD5E1] hover:border-[#93C5FD] bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Kiểm tra kết nối API
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Khối giới thiệu 4 bước đồng hành */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-xl font-bold text-[#0F172A]">
              Lộ trình tư vấn 4 bước rõ ràng
            </h2>
            <p className="text-sm text-[#475569]">
              Mọi lựa chọn của bạn được giữ nguyên khi chuyển qua lại giữa các bước để dễ dàng điều
              chỉnh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#E2E8F0]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
                <Building2 className="w-4 h-4" />
                <span>Bước 1 · Chọn trường THPT</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Tìm và chọn đúng trường THPT bạn đã trúng tuyển để tải các tổ hợp môn thực tế của
                trường.
              </p>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
                <Compass className="w-4 h-4" />
                <span>Bước 2 · Khảo sát Holland</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Khám phá 6 nhóm sở thích RIASEC qua 108 phát biểu theo 3 góc nhìn: Tôi là người,
                Tôi có thể, Tôi thích.
              </p>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
                <FileCheck2 className="w-4 h-4" />
                <span>Bước 3 &amp; 4 · Môn yêu thích &amp; Nguyện vọng</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Chọn các môn học THPT em yêu thích và đăng ký tối đa 3 nguyện vọng đại học độc lập.
              </p>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
                <ShieldCheck className="w-4 h-4" />
                <span>Bước 4 · Hồ sơ tư vấn tổ hợp</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Nhận gợi ý tối đa 3 tổ hợp lớp 10 phù hợp nhất kèm lý do, mức xác minh và xuất PDF.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col">
          <div className="relative h-48 sm:h-52 bg-[#EFF6FF]">
            <img
              src={ADVISORY_STUDY_IMAGE}
              alt="Học sinh THPT trao đổi định hướng môn học lớp 10"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center space-y-1.5">
            <h3 className="font-display text-base font-bold text-[#0F172A]">
              An toàn dữ liệu &amp; minh bạch nguồn tin
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Không lưu dữ liệu cá nhân lên máy chủ. Mọi thông tin chưa xác minh đều được cảnh báo rõ
              để bạn kiểm chứng cùng nhà trường.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
