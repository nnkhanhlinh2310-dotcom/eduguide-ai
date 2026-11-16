import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { ApiStatusScreen } from "./components/ApiStatusScreen";
import { AspirationsStep } from "./components/AspirationsStep";
import { BrandLogo } from "./components/BrandLogo";
import { FavoriteSubjectsStep } from "./components/FavoriteSubjectsStep";
import { HollandSurveyStep } from "./components/HollandSurveyStep";
import { ResultsStep } from "./components/ResultsStep";
import { SchoolSelectionStep } from "./components/SchoolSelectionStep";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { generateAdvisoryReport } from "./engine/advisoryEngine";
import {
  getHollandGroups,
  getHollandQuestions,
  getSchoolCombos,
  getSchools,
} from "./services/eduguideApi";
import type {
  HighSchool,
  HollandGroup,
  HollandQuestion,
  SchoolCombo,
  StudentAspiration,
  StudentPreferences,
  WizardStep,
} from "./types/eduguide";

const PROGRESS_STEPS: Array<{ id: WizardStep; shortLabel: string; label: string }> = [
  { id: "school", shortLabel: "1. Trường THPT", label: "1. Chọn trường THPT" },
  { id: "holland", shortLabel: "2. Holland", label: "2. Khám phá Holland" },
  { id: "favorites", shortLabel: "3. Môn yêu thích", label: "3. Những môn học em yêu thích" },
  { id: "aspirations", shortLabel: "4. Nguyện vọng", label: "4. Nguyện vọng đại học" },
  { id: "results", shortLabel: "5. Kết quả", label: "5. Hồ sơ tư vấn" },
];

export default function App() {
  const [step, setStep] = useState<WizardStep>("welcome");
  const [previousStepBeforeStatus, setPreviousStepBeforeStatus] =
    useState<WizardStep>("welcome");

  // Tên học sinh bắt buộc ở Trang chủ
  const [studentName, setStudentName] = useState("");
  const isNameReady = studentName.trim().length > 0;

  // Dữ liệu trường THPT
  const [schools, setSchools] = useState<HighSchool[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  // Tổ hợp lớp 10 của trường đã chọn
  const [schoolCombos, setSchoolCombos] = useState<SchoolCombo[]>([]);
  const [combosLoading, setCombosLoading] = useState(false);
  const [combosError, setCombosError] = useState<string | null>(null);

  // Dữ liệu khảo sát Holland (108 câu)
  const [hollandStarted, setHollandStarted] = useState(false);
  const [hollandQuestions, setHollandQuestions] = useState<HollandQuestion[]>([]);
  const [hollandGroups, setHollandGroups] = useState<HollandGroup[]>([]);
  const [hollandLoading, setHollandLoading] = useState(false);
  const [hollandError, setHollandError] = useState<string | null>(null);
  const [selectedHollandIds, setSelectedHollandIds] = useState<Set<string>>(
    () => new Set()
  );

  // Môn học yêu thích & Nguyện vọng đại học độc lập
  const [preferences, setPreferences] = useState<StudentPreferences>({
    favoriteSubjects: [],
    strongSubjects: [],
    supportNeededSubjects: [],
  });
  const [aspirations, setAspirations] = useState<StudentAspiration[]>([]);

  const loadSchoolsData = useCallback(async () => {
    setSchoolsLoading(true);
    setSchoolsError(null);
    const res = await getSchools();
    setSchoolsLoading(false);
    if (!res.ok) {
      setSchoolsError(res.error || "Không thể tải danh sách trường THPT.");
      return;
    }
    setSchools(res.data);
    if (res.data.length > 0) {
      setSelectedSchoolId((prev) => prev || res.data[0].MaTruongTHPT);
    }
  }, []);

  const loadCombosForSchool = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    setCombosLoading(true);
    setCombosError(null);
    const res = await getSchoolCombos(schoolId);
    setCombosLoading(false);
    if (!res.ok) {
      setCombosError(res.error || "Không thể tải tổ hợp môn của trường THPT.");
      setSchoolCombos([]);
      return;
    }
    setSchoolCombos(res.data);
  }, []);

  const loadHollandData = useCallback(async () => {
    setHollandLoading(true);
    setHollandError(null);
    const [qRes, gRes] = await Promise.all([
      getHollandQuestions(),
      getHollandGroups(),
    ]);
    setHollandLoading(false);

    if (!qRes.ok) {
      setHollandError(qRes.error || "Không thể tải bộ câu hỏi Holland.");
      setHollandQuestions([]);
    } else {
      setHollandQuestions(qRes.data);
    }

    if (gRes.ok) {
      setHollandGroups(gRes.data);
    }
  }, []);

  useEffect(() => {
    void loadSchoolsData();
    void loadHollandData();
  }, [loadSchoolsData, loadHollandData]);

  useEffect(() => {
    if (selectedSchoolId) {
      void loadCombosForSchool(selectedSchoolId);
    }
  }, [selectedSchoolId, loadCombosForSchool]);

  const toggleHollandQuestion = (questionId: string) => {
    setSelectedHollandIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const selectedSchool = useMemo(
    () => schools.find((s) => s.MaTruongTHPT === selectedSchoolId) || null,
    [schools, selectedSchoolId]
  );

  const advisoryReport = useMemo(() => {
    if (!selectedSchool || schoolCombos.length === 0) return null;
    return generateAdvisoryReport({
      studentName,
      school: selectedSchool,
      schoolCombos,
      hollandQuestions,
      hollandGroups,
      selectedHollandIds,
      hollandAvailable: !hollandError && hollandQuestions.length > 0,
      preferences,
      aspirations,
    });
  }, [
    studentName,
    selectedSchool,
    schoolCombos,
    hollandQuestions,
    hollandGroups,
    selectedHollandIds,
    hollandError,
    preferences,
    aspirations,
  ]);

  const navigateIfNamed = (target: WizardStep) => {
    if (target === "welcome" || target === "api-status") {
      setStep(target);
      return;
    }
    if (!isNameReady) {
      setStep("welcome");
      return;
    }
    setStep(target);
  };

  const openApiStatus = () => {
    if (step !== "api-status") {
      setPreviousStepBeforeStatus(step);
    }
    setStep("api-status");
  };

  const activeProgressIndex = PROGRESS_STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Thanh điều hướng 3 vùng (ẩn khi in PDF) */}
      <header className="no-print bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setStep("welcome")}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-md cursor-pointer shrink-0"
          >
            <BrandLogo compact />
          </button>

          <nav
            aria-label="Điều hướng chính"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#475569]"
          >
            <button
              type="button"
              onClick={() => setStep("welcome")}
              className={`hover:text-[#0F172A] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer ${
                step === "welcome" ? "text-[#1D4ED8] font-semibold" : ""
              }`}
            >
              Trang chủ
            </button>
            <button
              type="button"
              onClick={() => navigateIfNamed("school")}
              disabled={!isNameReady}
              className={`hover:text-[#0F172A] hover:underline underline-offset-4 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer ${
                step === "school" ? "text-[#1D4ED8] font-semibold" : ""
              }`}
            >
              Chọn trường THPT
            </button>
            <button
              type="button"
              onClick={() => navigateIfNamed("favorites")}
              disabled={!isNameReady}
              className={`hover:text-[#0F172A] hover:underline underline-offset-4 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer ${
                step === "favorites" ? "text-[#1D4ED8] font-semibold" : ""
              }`}
            >
              Môn yêu thích
            </button>
            <button
              type="button"
              onClick={openApiStatus}
              className={`hover:text-[#0F172A] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer ${
                step === "api-status" ? "text-[#1D4ED8] font-semibold" : ""
              }`}
            >
              Kiểm tra API
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() =>
                navigateIfNamed(step === "welcome" ? "school" : "results")
              }
              disabled={!isNameReady}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#94A3B8] disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {step === "welcome" ? "Bắt đầu tư vấn" : "Hồ sơ tư vấn"}
            </button>
          </div>
        </div>
      </header>

      {/* Thanh tiến trình các bước */}
      {step !== "welcome" && step !== "api-status" && (
        <div className="no-print bg-white border-b border-[#E2E8F0]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3">
            <ol className="flex items-center justify-between gap-2 overflow-x-auto">
              {PROGRESS_STEPS.map((item, idx) => {
                const isCurrent = item.id === step;
                const isPassed = activeProgressIndex > idx;
                return (
                  <li key={item.id} className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigateIfNamed(item.id)}
                      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        isCurrent
                          ? "bg-[#EFF6FF] text-[#1D4ED8] font-semibold border border-[#BFDBFE]"
                          : isPassed
                          ? "text-[#0F172A] hover:bg-[#F1F5F9]"
                          : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-mono-tabular font-bold shrink-0 ${
                          isCurrent
                            ? "bg-[#1D4ED8] text-white"
                            : isPassed
                            ? "bg-[#059669] text-white"
                            : "bg-[#E2E8F0] text-[#475569]"
                        }`}
                      >
                        {isPassed ? <Check className="w-3 h-3" /> : idx + 1}
                      </span>
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">{item.shortLabel}</span>
                    </button>
                    {idx < PROGRESS_STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="hidden lg:inline-block w-5 h-px bg-[#CBD5E1]"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === "welcome" && (
          <WelcomeScreen
            studentName={studentName}
            onChangeStudentName={setStudentName}
            onStart={() => navigateIfNamed("school")}
            onOpenApiStatus={openApiStatus}
          />
        )}

        {step === "school" && (
          <SchoolSelectionStep
            studentName={studentName.trim()}
            schools={schools}
            loading={schoolsLoading}
            error={schoolsError}
            selectedSchoolId={selectedSchoolId}
            onSelectSchool={setSelectedSchoolId}
            schoolCombos={schoolCombos}
            combosLoading={combosLoading}
            combosError={combosError}
            onRetryLoad={loadSchoolsData}
            onBack={() => setStep("welcome")}
            onNext={() => navigateIfNamed("holland")}
            onOpenApiStatus={openApiStatus}
          />
        )}

        {step === "holland" && (
          <HollandSurveyStep
            studentName={studentName.trim()}
            questions={hollandQuestions}
            groups={hollandGroups}
            loading={hollandLoading}
            error={hollandError}
            selectedIds={selectedHollandIds}
            hasStartedSurvey={hollandStarted}
            onStartSurvey={() => setHollandStarted(true)}
            onShowGuide={() => setHollandStarted(false)}
            onToggleQuestion={toggleHollandQuestion}
            onRetryLoad={loadHollandData}
            onBack={() => navigateIfNamed("school")}
            onNext={() => navigateIfNamed("favorites")}
            onOpenApiStatus={openApiStatus}
          />
        )}

        {step === "favorites" && (
          <FavoriteSubjectsStep
            studentName={studentName.trim()}
            preferences={preferences}
            onChangePreferences={setPreferences}
            onBack={() => navigateIfNamed("holland")}
            onNext={() => navigateIfNamed("aspirations")}
          />
        )}

        {step === "aspirations" && (
          <AspirationsStep
            studentName={studentName.trim()}
            aspirations={aspirations}
            onChangeAspirations={setAspirations}
            onBack={() => navigateIfNamed("favorites")}
            onNext={() => navigateIfNamed("results")}
          />
        )}

        {step === "results" && (
          <ResultsStep
            report={advisoryReport}
            combosLoading={combosLoading}
            combosError={combosError}
            onRetryCombos={() => loadCombosForSchool(selectedSchoolId)}
            onEditSchool={() => navigateIfNamed("school")}
            onEditHolland={() => navigateIfNamed("holland")}
            onEditFavorites={() => navigateIfNamed("favorites")}
            onEditAspirations={() => navigateIfNamed("aspirations")}
            onOpenApiStatus={openApiStatus}
          />
        )}

        {step === "api-status" && (
          <ApiStatusScreen onBack={() => setStep(previousStepBeforeStatus)} />
        )}
      </main>

      {/* Chân trang gọn gàng */}
      <footer className="no-print bg-white border-t border-[#E2E8F0] mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            EduGuide AI · Chọn đúng tổ hợp – Chuẩn bước tương lai · Không lưu thông tin cá nhân lên
            máy chủ
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openApiStatus}
              className="hover:text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Trạng thái kết nối API
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
