import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { APPS_SCRIPT_URL } from "../config/api";
import { checkAllApiHealth, clearApiCache } from "../services/eduguideApi";
import type { ApiHealthReport } from "../types/eduguide";

interface ApiStatusScreenProps {
  onBack: () => void;
}

export const ApiStatusScreen: React.FC<ApiStatusScreenProps> = ({ onBack }) => {
  const [report, setReport] = useState<ApiHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  const runCheck = async (forceRefresh = false) => {
    if (forceRefresh) {
      clearApiCache();
    }
    setLoading(true);
    const res = await checkAllApiHealth();
    setReport(res);
    setLoading(false);
  };

  useEffect(() => {
    void runCheck(false);
  }, []);

  const okCount = report?.endpoints.filter((e) => e.status === "ok").length ?? 0;
  const errCount = report?.endpoints.filter((e) => e.status === "error").length ?? 0;

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">
              Kiểm tra trạng thái kết nối Google Apps Script API
            </h1>
            <p className="text-sm text-[#475569]">
              Kiểm tra trực tiếp toàn bộ 8 đầu mối truy vấn Google Sheets và phát hiện trang tính còn
              thiếu hoặc bộ lọc chưa hỗ trợ ở backend.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => runCheck(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#94A3B8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Đang kiểm tra..." : "Kiểm tra lại"}
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
            <Database className="w-4 h-4 text-[#1D4ED8]" />
            <span>Địa chỉ APPS_SCRIPT_URL</span>
          </div>
          <div className="font-mono-tabular text-xs text-[#475569] break-all">
            {APPS_SCRIPT_URL}
          </div>
          {report && (
            <div className="pt-1 text-xs text-[#475569] flex flex-wrap gap-x-4 gap-y-1 font-mono-tabular">
              <span>Thời điểm kiểm tra: {report.checkedAt}</span>
              <span>Hợp lệ: {okCount}/{report.endpoints.length}</span>
              <span>Lỗi / thiếu sheet: {errCount}</span>
            </div>
          )}
        </div>

        {loading && !report ? (
          <div className="py-12 flex items-center justify-center gap-3 text-sm font-medium text-[#1D4ED8]">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Đang gửi yêu cầu kiểm tra tới từng endpoint Google Apps Script...</span>
          </div>
        ) : report ? (
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#334155]">
                  <th className="py-3 px-4 font-semibold">Đầu mối dữ liệu</th>
                  <th className="py-3 px-4 font-semibold">Tham số action</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-right">Số dòng</th>
                  <th className="py-3 px-4 font-semibold text-right">Độ trễ</th>
                  <th className="py-3 px-4 font-semibold">Ghi chú kỹ thuật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {report.endpoints.map((ep) => (
                  <tr key={ep.key} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-medium text-[#0F172A]">{ep.label}</td>
                    <td className="py-3 px-4 font-mono-tabular text-xs text-[#475569]">
                      {ep.action}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {ep.status === "ok" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Kết nối tốt</span>
                        </span>
                      ) : ep.status === "empty" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309]">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Dữ liệu rỗng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
                          <XCircle className="w-4 h-4" />
                          <span>Lỗi / Thiếu sheet</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#0F172A]">
                      {typeof ep.count === "number" ? ep.count.toLocaleString("vi-VN") : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#475569]">
                      {ep.latencyMs} ms
                    </td>
                    <td className="py-3 px-4 text-xs text-[#475569]">
                      {ep.error ? (
                        <span className="text-[#991B1B] font-medium">{ep.error}</span>
                      ) : (
                        ep.note || "Phản hồi JSON hợp lệ."
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {/* Khuyến nghị cho quản trị viên backend */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-3">
        <h2 className="font-display text-base font-bold text-[#0F172A]">
          Khuyến nghị bảo trì Google Apps Script &amp; Google Sheets
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
          <li>
            Nếu <code className="font-mono">hollandQuestions</code> hoặc{" "}
            <code className="font-mono">hollandGroups</code> báo thiếu trang tính, quản trị viên cần
            bổ sung tab <strong>HOLLAND_CAU_HOI</strong> (108 câu thuộc 6 nhóm R, I, A, S, E, C) và{" "}
            <strong>HOLLAND_NHOM_NGANH</strong> vào Google Sheets nguồn.
          </li>
          <li>
            Các endpoint <code className="font-mono">schoolCombos</code>,{" "}
            <code className="font-mono">universities</code>,{" "}
            <code className="font-mono">programs</code>, <code className="font-mono">admissions</code>{" "}
            hiện trả toàn bộ bảng thay vì lọc theo tham số trên máy chủ. Ứng dụng frontend đã xử lý
            lọc cục bộ an toàn; về lâu dài nên bổ sung lọc phía Apps Script để giảm dung lượng tải{" "}
            <code className="font-mono">programs</code> và <code className="font-mono">admissions</code>.
          </li>
          <li>
            Cột <code className="font-mono">AnhTruong</code> của bảng trường THPT cần chứa URL ảnh
            trực tiếp (hoặc link chia sẻ Google Drive công khai) để hiển thị ảnh thực tế của từng trường.
          </li>
        </ul>
      </section>
    </div>
  );
};
