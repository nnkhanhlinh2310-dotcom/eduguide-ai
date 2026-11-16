import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Info,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  getAdmissions,
  getPrograms,
  getProvinces,
  getUniversities,
} from "../services/eduguideApi";
import type {
  Program,
  Province,
  StudentAspiration,
  University,
} from "../types/eduguide";

interface IndependentSlotProps {
  priority: 1 | 2 | 3;
  totalSlots: number;
  provinces: Province[];
  currentValue: StudentAspiration | null;
  canRemove: boolean;
  onSaveSlot: (item: StudentAspiration | null) => void;
  onMoveSlot: (direction: -1 | 1) => void;
  onRemoveSlot: () => void;
}

const IndependentAspirationSlot: React.FC<IndependentSlotProps> = ({
  priority,
  totalSlots,
  provinces,
  currentValue,
  canRemove,
  onSaveSlot,
  onMoveSlot,
  onRemoveSlot,
}) => {
  const [provinceId, setProvinceId] = useState(
    currentValue?.provinceId || provinces[0]?.MaTinh || ""
  );
  const [universities, setUniversities] = useState<University[]>([]);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniError, setUniError] = useState<string | null>(null);
  const [uniSearch, setUniSearch] = useState("");

  const [universityId, setUniversityId] = useState(currentValue?.universityId || "");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [progLoading, setProgLoading] = useState(false);
  const [progError, setProgError] = useState<string | null>(null);
  const [progNotice, setProgNotice] = useState<string | undefined>(undefined);
  const [progSearch, setProgSearch] = useState("");

  const [programId, setProgramId] = useState(currentValue?.programId || "");
  const [admLoading, setAdmLoading] = useState(false);

  // Đồng bộ khi thứ tự ưu tiên thay đổi từ ngoài (lên/xuống)
  useEffect(() => {
    if (currentValue) {
      if (currentValue.provinceId && currentValue.provinceId !== provinceId) {
        setProvinceId(currentValue.provinceId);
      }
      if (currentValue.universityId && currentValue.universityId !== universityId) {
        setUniversityId(currentValue.universityId);
      }
      if (currentValue.programId && currentValue.programId !== programId) {
        setProgramId(currentValue.programId);
      }
    }
  }, [currentValue?.id]);

  useEffect(() => {
    if (!provinceId && provinces.length > 0) {
      setProvinceId(provinces[0].MaTinh);
    }
  }, [provinces, provinceId]);

  useEffect(() => {
    if (!provinceId) return;
    let cancelled = false;
    const run = async () => {
      setUniLoading(true);
      setUniError(null);
      const res = await getUniversities(provinceId);
      if (cancelled) return;
      setUniLoading(false);
      if (!res.ok) {
        setUniError(res.error || "Không thể tải danh sách trường đại học.");
        setUniversities([]);
        return;
      }
      setUniversities(res.data);
      const keepExisting =
        currentValue &&
        currentValue.provinceId === provinceId &&
        res.data.some((u) => u.MaTruongTuyenSinh === currentValue.universityId);
      if (keepExisting) {
        setUniversityId(currentValue.universityId);
      } else if (res.data.length > 0) {
        setUniversityId(res.data[0].MaTruongTuyenSinh);
      } else {
        setUniversityId("");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [provinceId]);

  useEffect(() => {
    if (!universityId) {
      setPrograms([]);
      setProgramId("");
      return;
    }
    const currentUni = universities.find((u) => u.MaTruongTuyenSinh === universityId);
    let cancelled = false;
    const run = async () => {
      setProgLoading(true);
      setProgError(null);
      setProgNotice(undefined);
      const res = await getPrograms(universityId, currentUni?.TenTruong);
      if (cancelled) return;
      setProgLoading(false);
      if (!res.ok) {
        setProgError(res.error || "Không thể tải danh sách ngành học.");
        setPrograms([]);
        return;
      }
      setPrograms(res.data);
      setProgNotice(res.backendNotice);

      const keepExisting =
        currentValue &&
        currentValue.universityId === universityId &&
        res.data.some((p) => p.MaCTDT === currentValue.programId);
      if (keepExisting) {
        setProgramId(currentValue.programId);
      } else if (res.data.length > 0) {
        setProgramId(res.data[0].MaCTDT);
      } else {
        setProgramId("");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [universityId, universities]);

  const filteredUnis = useMemo(() => {
    const q = uniSearch.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(
      (u) =>
        u.TenTruong.toLowerCase().includes(q) ||
        u.MaTruongTuyenSinh.toLowerCase().includes(q)
    );
  }, [universities, uniSearch]);

  const filteredProgs = useMemo(() => {
    const q = progSearch.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter(
      (p) =>
        p.TenNganh.toLowerCase().includes(q) || p.MaNganh.toLowerCase().includes(q)
    );
  }, [programs, progSearch]);

  const selectedProv = provinces.find((p) => p.MaTinh === provinceId);
  const selectedUni = universities.find((u) => u.MaTruongTuyenSinh === universityId);
  const selectedProg = programs.find((p) => p.MaCTDT === programId);

  useEffect(() => {
    if (!selectedProv || !selectedUni || !selectedProg) {
      return;
    }
    if (
      currentValue &&
      currentValue.provinceId === selectedProv.MaTinh &&
      currentValue.universityId === selectedUni.MaTruongTuyenSinh &&
      currentValue.programId === selectedProg.MaCTDT &&
      currentValue.priority === priority
    ) {
      return;
    }

    let cancelled = false;
    const syncAdmissions = async () => {
      setAdmLoading(true);
      const admRes = await getAdmissions(
        selectedProg.MaCTDT,
        selectedUni.MaTruongTuyenSinh,
        selectedProg.TenNganh,
        selectedProg.MaNganh,
        selectedUni.TenTruong
      );
      if (cancelled) return;
      setAdmLoading(false);

      onSaveSlot({
        id: `NV${priority}_${selectedUni.MaTruongTuyenSinh}_${selectedProg.MaCTDT}`,
        priority,
        provinceId: selectedProv.MaTinh,
        provinceName: selectedProv.TenTinh,
        universityId: selectedUni.MaTruongTuyenSinh,
        universityName: selectedUni.TenTruong,
        universityVerifyNote: selectedUni.GhiChuKiemChung,
        programId: selectedProg.MaCTDT,
        majorCode: selectedProg.MaNganh,
        majorName: selectedProg.TenNganh,
        programYear: selectedProg.NamTuyenSinh,
        programVerifyStatus: selectedProg.TrangThaiXacMinh,
        derivedFromAdmissions: selectedProg.derivedFromAdmissions,
        admissions: admRes.ok ? admRes.data : [],
        admissionsError: admRes.ok ? undefined : admRes.error,
      });
    };

    void syncAdmissions();
    return () => {
      cancelled = true;
    };
  }, [
    priority,
    selectedProv?.MaTinh,
    selectedUni?.MaTruongTuyenSinh,
    selectedProg?.MaCTDT,
  ]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <span className="font-mono-tabular text-xs font-bold text-[#1D4ED8]">
            Nguyện vọng độc lập #{priority}
          </span>
          <h2 className="font-display text-base sm:text-lg font-bold text-[#0F172A]">
            {currentValue
              ? `${currentValue.majorName} — ${currentValue.universityName}`
              : "Chọn tỉnh/thành, trường đại học và ngành đào tạo"}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {totalSlots > 1 && (
            <>
              <button
                type="button"
                onClick={() => onMoveSlot(-1)}
                disabled={priority === 1}
                title="Tăng mức ưu tiên"
                aria-label={`Đưa nguyện vọng ${priority} lên`}
                className="p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2E8F0] rounded-lg cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onMoveSlot(1)}
                disabled={priority === totalSlots}
                title="Giảm mức ưu tiên"
                aria-label={`Đưa nguyện vọng ${priority} xuống`}
                className="p-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E2E8F0] rounded-lg cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </>
          )}

          {canRemove && (
            <button
              type="button"
              onClick={onRemoveSlot}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bỏ NV{priority}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. Tỉnh / Thành */}
        <div className="lg:col-span-3 space-y-1.5">
          <label
            htmlFor={`slot-${priority}-prov`}
            className="block text-xs font-semibold text-[#334155]"
          >
            Tỉnh / Thành phố
          </label>
          <select
            id={`slot-${priority}-prov`}
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value);
              setUniSearch("");
              setProgSearch("");
              onSaveSlot(null);
            }}
            className="w-full h-10 px-3 text-sm text-[#0F172A] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          >
            {provinces.map((p) => (
              <option key={p.MaTinh} value={p.MaTinh}>
                {p.TenTinh} ({p.KhuVuc})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Trường đại học */}
        <div className="lg:col-span-4 space-y-1.5">
          <label
            htmlFor={`slot-${priority}-uni`}
            className="block text-xs font-semibold text-[#334155]"
          >
            Trường đại học ({universities.length})
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              value={uniSearch}
              onChange={(e) => setUniSearch(e.target.value)}
              placeholder="Lọc tên hoặc mã trường..."
              className="w-full h-9 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          {uniLoading ? (
            <div className="h-10 bg-[#F1F5F9] animate-pulse rounded-lg border border-[#E2E8F0]" />
          ) : uniError ? (
            <p className="text-xs text-[#991B1B]">{uniError}</p>
          ) : filteredUnis.length === 0 ? (
            <p className="text-xs text-[#92400E]">Không có trường khớp bộ lọc.</p>
          ) : (
            <select
              id={`slot-${priority}-uni`}
              value={universityId}
              onChange={(e) => {
                setUniversityId(e.target.value);
                setProgSearch("");
                onSaveSlot(null);
              }}
              className="w-full h-10 px-3 text-sm text-[#0F172A] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              {filteredUnis.map((u) => (
                <option key={u.MaTruongTuyenSinh} value={u.MaTruongTuyenSinh}>
                  [{u.MaTruongTuyenSinh}] {u.TenTruong}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 3. Ngành đào tạo */}
        <div className="lg:col-span-5 space-y-1.5">
          <label
            htmlFor={`slot-${priority}-prog`}
            className="block text-xs font-semibold text-[#334155]"
          >
            Ngành đào tạo ({programs.length})
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              value={progSearch}
              onChange={(e) => setProgSearch(e.target.value)}
              placeholder="Lọc tên ngành hoặc mã ngành..."
              className="w-full h-9 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          {progLoading ? (
            <div className="h-10 bg-[#F1F5F9] animate-pulse rounded-lg border border-[#E2E8F0]" />
          ) : progError ? (
            <p className="text-xs text-[#991B1B]">{progError}</p>
          ) : filteredProgs.length === 0 ? (
            <p className="text-xs text-[#92400E] bg-[#FFFBEB] p-2.5 rounded-lg border border-[#FDE68A]">
              Chưa có dữ liệu ngành học cho trường {selectedUni?.TenTruong} trên Google Sheets.
            </p>
          ) : (
            <select
              id={`slot-${priority}-prog`}
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full h-10 px-3 text-sm text-[#0F172A] bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              {filteredProgs.map((p) => (
                <option key={p.MaCTDT} value={p.MaCTDT}>
                  {p.TenNganh} {p.MaNganh ? `(Mã: ${p.MaNganh})` : ""}
                </option>
              ))}
            </select>
          )}
          {progNotice && (
            <p className="text-[11px] text-[#475569] flex items-start gap-1">
              <Info className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0 mt-0.5" />
              <span>{progNotice}</span>
            </p>
          )}
        </div>
      </div>

      {/* Tổ hợp xét tuyển của nguyện vọng này */}
      {admLoading ? (
        <div className="flex items-center gap-2 text-xs text-[#1D4ED8]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Đang truy xuất tổ hợp môn xét tuyển của ngành...</span>
        </div>
      ) : currentValue ? (
        <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
          {currentValue.admissionsError ? (
            <p className="text-xs text-[#991B1B]">
              Lỗi tải tổ hợp xét tuyển: {currentValue.admissionsError}
            </p>
          ) : currentValue.admissions.length === 0 ? (
            <p className="text-xs text-[#92400E] bg-[#FFFBEB] px-3 py-2 rounded-lg border border-[#FDE68A]">
              Cần xác minh: Google Sheets chưa có dòng tổ hợp xét tuyển cụ thể cho ngành này.
            </p>
          ) : (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#334155]">
                Tổ hợp xét tuyển ghi nhận trên Google Sheets ({currentValue.admissions.length}):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {currentValue.admissions.map((adm) => (
                  <div
                    key={adm.ID}
                    className="text-xs p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md"
                  >
                    <div className="font-semibold text-[#0F172A]">
                      <span className="font-mono-tabular text-[#1D4ED8] mr-1">
                        {adm.MaToHop || "Tổ hợp"}
                      </span>
                      · {adm.PhuongThucXetTuyen}
                    </div>
                    <div className="text-[#475569] mt-0.5">
                      {[adm.Mon1, adm.Mon2, adm.Mon3, adm.Mon4NeuCo].filter(Boolean).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

interface AspirationsStepProps {
  studentName: string;
  aspirations: StudentAspiration[];
  onChangeAspirations: (next: StudentAspiration[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export const AspirationsStep: React.FC<AspirationsStepProps> = ({
  studentName,
  aspirations,
  onChangeAspirations,
  onBack,
  onNext,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provLoading, setProvLoading] = useState(true);
  const [provError, setProvError] = useState<string | null>(null);
  const [slotCount, setSlotCount] = useState<number>(() =>
    Math.max(1, Math.min(3, aspirations.length || 1))
  );

  const loadProvinces = async () => {
    setProvLoading(true);
    setProvError(null);
    const res = await getProvinces();
    setProvLoading(false);
    if (!res.ok) {
      setProvError(res.error || "Không thể tải danh sách tỉnh/thành.");
      return;
    }
    setProvinces(res.data);
  };

  useEffect(() => {
    void loadProvinces();
  }, []);

  const handleSaveSlot = (priority: 1 | 2 | 3, item: StudentAspiration | null) => {
    const others = aspirations.filter((a) => a.priority !== priority);
    const next = item ? [...others, item] : others;
    next.sort((a, b) => a.priority - b.priority);
    onChangeAspirations(next);
  };

  const handleMoveSlot = (priority: 1 | 2 | 3, direction: -1 | 1) => {
    const targetPriority = (priority + direction) as 1 | 2 | 3;
    if (targetPriority < 1 || targetPriority > slotCount) return;

    const currentItem = aspirations.find((a) => a.priority === priority);
    const targetItem = aspirations.find((a) => a.priority === targetPriority);

    const others = aspirations.filter(
      (a) => a.priority !== priority && a.priority !== targetPriority
    );
    const next = [...others];
    if (currentItem) next.push({ ...currentItem, priority: targetPriority });
    if (targetItem) next.push({ ...targetItem, priority });
    next.sort((a, b) => a.priority - b.priority);
    onChangeAspirations(next);
  };

  const handleRemoveSlot = (priority: 1 | 2 | 3) => {
    const remaining = aspirations
      .filter((a) => a.priority !== priority)
      .map((a, idx) => ({ ...a, priority: (idx + 1) as 1 | 2 | 3 }));
    onChangeAspirations(remaining);
    setSlotCount((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề bước chọn nguyện vọng đại học */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="font-display text-2xl font-bold text-[#0F172A]">
              Bước 4 · Chọn nguyện vọng đại học (tối đa 3 nguyện vọng)
            </h1>
            <p className="text-sm text-[#475569]">
              <strong>{studentName}</strong> hãy đăng ký tối đa 3 nguyện vọng độc lập (Tỉnh/Thành
              phố → Trường Đại học → Ngành đào tạo) và dùng nút mũi tên lên/xuống để sắp xếp thứ tự
              ưu tiên.
            </p>
          </div>
          <div className="font-mono-tabular text-sm font-semibold text-[#1D4ED8]">
            {slotCount}/3 nguyện vọng
          </div>
        </div>
      </section>

      {provLoading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 flex items-center justify-center gap-3 text-sm font-medium text-[#1D4ED8]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Đang tải danh sách tỉnh/thành từ Google Sheets...</span>
        </div>
      ) : provError ? (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-2 text-sm text-[#991B1B]">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{provError}</span>
          </div>
          <button
            type="button"
            onClick={loadProvinces}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {([1, 2, 3] as const).slice(0, slotCount).map((priority) => (
            <IndependentAspirationSlot
              key={`slot-${priority}`}
              priority={priority}
              totalSlots={slotCount}
              provinces={provinces}
              currentValue={aspirations.find((a) => a.priority === priority) || null}
              canRemove={slotCount > 1}
              onSaveSlot={(item) => handleSaveSlot(priority, item)}
              onMoveSlot={(dir) => handleMoveSlot(priority, dir)}
              onRemoveSlot={() => handleRemoveSlot(priority)}
            />
          ))}

          {slotCount < 3 && (
            <button
              type="button"
              onClick={() => setSlotCount((prev) => Math.min(3, prev + 1))}
              className="w-full py-3.5 px-4 bg-white border border-dashed border-[#93C5FD] hover:border-[#1D4ED8] hover:bg-[#EFF6FF]/60 rounded-xl text-sm font-semibold text-[#1D4ED8] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nguyện vọng đại học #{slotCount + 1} (tối đa 3)</span>
            </button>
          )}
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
          Quay lại: Môn học yêu thích
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Xem kết quả tư vấn</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
