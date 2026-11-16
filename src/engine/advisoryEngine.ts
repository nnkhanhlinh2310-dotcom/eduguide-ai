import type {
  AdvisoryReport,
  ComboRecommendation,
  HighSchool,
  HollandGroup,
  HollandQuestion,
  ProgramMatchDetail,
  RiasecCode,
  RiasecScore,
  SchoolCombo,
  StudentAspiration,
  StudentPreferences,
  VerificationLabel,
} from "../types/eduguide";

/**
 * Các môn học bắt buộc theo Chương trình GDPT 2018 bậc THPT (lớp 10)
 * Ngoại ngữ 1 phổ biến trong xét tuyển đại học là Tiếng Anh (các ngoại ngữ khác cần kiểm tra tại trường).
 */
export const COMPULSORY_GRADE10_SUBJECTS = [
  "Toán",
  "Ngữ văn",
  "Lịch sử",
  "Tiếng Anh",
] as const;

export const SELECTABLE_STUDENT_SUBJECTS = [
  "Toán",
  "Ngữ văn",
  "Tiếng Anh",
  "Lịch sử",
  "Vật lí",
  "Hóa học",
  "Sinh học",
  "Địa lí",
  "Giáo dục kinh tế và pháp luật",
  "Tin học",
  "Công nghệ",
  "Âm nhạc",
  "Mĩ thuật",
] as const;

/**
 * Thông tin giải thích chuẩn hóa cho 6 nhóm RIASEC (chỉ dùng cho giải thích khung tham chiếu tâm lý học nghề nghiệp,
 * không thay thế bộ câu hỏi từ Google Sheets).
 */
export const RIASEC_META: Record<
  RiasecCode,
  { nameVi: string; nameEn: string; summary: string; subjectAffinity: string[] }
> = {
  R: {
    nameVi: "Kỹ thuật – Thực hành (Realistic)",
    nameEn: "Realistic",
    summary: "Hứng thú với thao tác thực tế, máy móc, công cụ, vận hành kỹ thuật và hoạt động ngoài trời.",
    subjectAffinity: ["Vật lí", "Công nghệ", "Tin học", "Toán"],
  },
  I: {
    nameVi: "Nghiên cứu – Phân tích (Investigative)",
    nameEn: "Investigative",
    summary: "Thích quan sát, tìm hiểu bản chất vấn đề, phân tích logic, thí nghiệm khoa học và giải quyết bài toán phức tạp.",
    subjectAffinity: ["Toán", "Vật lí", "Hóa học", "Sinh học", "Tin học"],
  },
  A: {
    nameVi: "Nghệ thuật – Sáng tạo (Artistic)",
    nameEn: "Artistic",
    summary: "Có hứng thú với biểu đạt ý tưởng, ngôn ngữ, thiết kế, thẩm mỹ, âm nhạc và tư duy sáng tạo tự do.",
    subjectAffinity: ["Ngữ văn", "Mĩ thuật", "Âm nhạc", "Tiếng Anh", "Lịch sử"],
  },
  S: {
    nameVi: "Xã hội – Giáo dục (Social)",
    nameEn: "Social",
    summary: "Quan tâm đến con người, thích giao tiếp, hỗ trợ, giảng dạy, tư vấn và làm việc cộng đồng.",
    subjectAffinity: ["Ngữ văn", "Lịch sử", "Địa lí", "Giáo dục kinh tế và pháp luật", "Sinh học", "Tiếng Anh"],
  },
  E: {
    nameVi: "Quản lý – Kinh doanh (Enterprising)",
    nameEn: "Enterprising",
    summary: "Hứng thú với tổ chức hoạt động, thuyết phục, lãnh đạo nhóm, khởi nghiệp và kinh tế.",
    subjectAffinity: ["Toán", "Tiếng Anh", "Giáo dục kinh tế và pháp luật", "Ngữ văn", "Địa lí"],
  },
  C: {
    nameVi: "Nghiệp vụ – Hệ thống (Conventional)",
    nameEn: "Conventional",
    summary: "Thích sự rõ ràng, ngăn nắp, làm việc với số liệu, quy trình, tài chính, kế toán và lưu trữ thông tin.",
    subjectAffinity: ["Toán", "Tin học", "Giáo dục kinh tế và pháp luật", "Tiếng Anh"],
  },
};

const SPECIAL_NON_GRADE10_SUBJECTS = new Set([
  "toán học - logic",
  "khoa học",
  "ngôn ngữ",
  "vẽ mỹ thuật",
  "vẽ năng khiếu 1",
  "vẽ năng khiếu 2",
  "năng khiếu tdtt",
  "năng khiếu mầm non",
]);

/**
 * Chuẩn hóa tên môn học trước khi so sánh giữa tổ hợp lớp 10 và tổ hợp xét tuyển đại học.
 */
export function normalizeSubjectName(rawName: string): {
  canonical: string;
  original: string;
  isSpecialAdmissionSubject: boolean;
} {
  const original = rawName.trim();
  const lower = original.toLowerCase().replace(/\s+/g, " ");

  if (!lower) {
    return { canonical: "", original, isSpecialAdmissionSubject: false };
  }

  if (SPECIAL_NON_GRADE10_SUBJECTS.has(lower)) {
    return { canonical: original, original, isSpecialAdmissionSubject: true };
  }

  if (lower === "toán" || lower === "toán học") {
    return { canonical: "Toán", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "ngữ văn" || lower === "văn") {
    return { canonical: "Ngữ văn", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "lịch sử" || lower === "sử") {
    return { canonical: "Lịch sử", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "địa lí" || lower === "địa lý" || lower === "địa") {
    return { canonical: "Địa lí", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "vật lí" || lower === "vật lý" || lower === "lí" || lower === "lý") {
    return { canonical: "Vật lí", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "hóa học" || lower === "hoá học" || lower === "hóa" || lower === "hoá") {
    return { canonical: "Hóa học", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "sinh học" || lower === "sinh") {
    return { canonical: "Sinh học", original, isSpecialAdmissionSubject: false };
  }
  if (
    lower === "gdcd" ||
    lower === "giáo dục công dân" ||
    lower === "giáo dục kinh tế và pháp luật" ||
    lower === "gdkt&pl" ||
    lower === "ktpl"
  ) {
    return {
      canonical: "Giáo dục kinh tế và pháp luật",
      original,
      isSpecialAdmissionSubject: false,
    };
  }
  if (lower.startsWith("tin học")) {
    return { canonical: "Tin học", original, isSpecialAdmissionSubject: false };
  }
  if (lower.startsWith("công nghệ")) {
    return { canonical: "Công nghệ", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "mĩ thuật" || lower === "mỹ thuật") {
    return { canonical: "Mĩ thuật", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "âm nhạc") {
    return { canonical: "Âm nhạc", original, isSpecialAdmissionSubject: false };
  }
  if (lower === "tiếng anh" || lower === "anh văn" || lower === "ngoại ngữ 1") {
    return { canonical: "Tiếng Anh", original, isSpecialAdmissionSubject: false };
  }
  if (lower.startsWith("tiếng ")) {
    // Ngoại ngữ khác Tiếng Anh (Tiếng Nhật, Tiếng Pháp, Tiếng Trung...) cần xác minh trường THPT có giảng dạy không
    return { canonical: original, original, isSpecialAdmissionSubject: true };
  }

  return { canonical: original, original, isSpecialAdmissionSubject: false };
}

export function computeRiasecScores(
  questions: HollandQuestion[],
  selectedQuestionIds: Set<string>,
  groupsMetadata?: HollandGroup[]
): {
  ranking: RiasecScore[];
  topThree: RiasecScore[];
} {
  const codes: RiasecCode[] = ["R", "I", "A", "S", "E", "C"];
  const counts: Record<RiasecCode, { score: number; total: number }> = {
    R: { score: 0, total: 0 },
    I: { score: 0, total: 0 },
    A: { score: 0, total: 0 },
    S: { score: 0, total: 0 },
    E: { score: 0, total: 0 },
    C: { score: 0, total: 0 },
  };

  for (const q of questions) {
    const pts = q.scoreValue || 1;
    counts[q.group].total += pts;
    if (selectedQuestionIds.has(q.id)) {
      counts[q.group].score += pts;
    }
  }

  const ranking: RiasecScore[] = codes.map((code) => {
    const customGroup = groupsMetadata?.find((g) => g.code === code);
    const sheetGroupName = questions.find((q) => q.group === code && q.groupName)?.groupName;
    const maxScore = counts[code].total > 0 ? counts[code].total : 18;
    const score = counts[code].score;
    return {
      code,
      nameVi: customGroup?.nameVi || sheetGroupName || RIASEC_META[code].nameVi,
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    };
  });

  ranking.sort((a, b) => b.score - a.score);
  return {
    ranking,
    topThree: ranking.slice(0, 3),
  };
}

function isSchoolComboVerified(combo: SchoolCombo): boolean {
  const status = combo.TrangThai.toLowerCase();
  const hasSource = combo.NguonXacNhan.trim().length > 0;
  return status.includes("theo văn bản") && hasSource;
}

function isUniversityDataVerified(aspiration: StudentAspiration): boolean {
  const uniNote = aspiration.universityVerifyNote.toLowerCase();
  const progStatus = aspiration.programVerifyStatus.toLowerCase();
  if (aspiration.derivedFromAdmissions) return false;
  if (!aspiration.admissions || aspiration.admissions.length === 0) return false;
  if (uniNote.includes("xác minh") || uniNote.includes("tham khảo")) return false;
  if (!progStatus || progStatus.includes("rà soát") || progStatus.includes("chưa")) return false;
  return true;
}

export function generateAdvisoryReport(params: {
  studentName: string;
  school: HighSchool;
  schoolCombos: SchoolCombo[];
  hollandQuestions: HollandQuestion[];
  hollandGroups: HollandGroup[];
  selectedHollandIds: Set<string>;
  hollandAvailable: boolean;
  preferences: StudentPreferences;
  aspirations: StudentAspiration[];
}): AdvisoryReport {
  const {
    studentName,
    school,
    schoolCombos,
    hollandQuestions,
    hollandGroups,
    selectedHollandIds,
    hollandAvailable,
    preferences,
    aspirations,
  } = params;

  const { ranking: riasecRanking, topThree: topThreeRiasec } = computeRiasecScores(
    hollandQuestions,
    selectedHollandIds,
    hollandGroups
  );

  const hasHollandAnswers = hollandAvailable && selectedHollandIds.size > 0;
  const globalWarnings: string[] = [];

  if (!hollandAvailable) {
    globalWarnings.push(
      "Bộ câu hỏi khảo sát Holland (HOLLAND_CAU_HOI) chưa có sẵn trên Google Sheets API nên điểm sở thích RIASEC chưa được tính; hệ thống đang đối chiếu dựa trên sở thích môn học và nguyện vọng đại học bạn đã chọn."
    );
  } else if (selectedHollandIds.size === 0) {
    globalWarnings.push(
      "Bạn chưa chọn phát biểu nào trong khảo sát Holland, nên phần gợi ý theo 3 nhóm RIASEC nổi trội chưa được kích hoạt."
    );
  }

  if (
    school.TrangThaiDuLieu &&
    !school.TrangThaiDuLieu.toLowerCase().includes("đã xác minh")
  ) {
    globalWarnings.push(
      `Dữ liệu trường ${school.TenTruong} hiện ở trạng thái "${school.TrangThaiDuLieu}" (Nguồn: ${school.Nguon || "chưa rõ"}). Cần đối chiếu lại thông báo chính thức của trường.`
    );
  }

  if (aspirations.length === 0) {
    globalWarnings.push(
      "Bạn chưa chọn nguyện vọng đại học nào, nên kết quả chủ yếu đối chiếu theo sở thích và sở trường môn học."
    );
  }

  const favSet = new Set(preferences.favoriteSubjects.map((s) => normalizeSubjectName(s).canonical));
  const strongSet = new Set(preferences.strongSubjects.map((s) => normalizeSubjectName(s).canonical));
  const supportSet = new Set(
    preferences.supportNeededSubjects.map((s) => normalizeSubjectName(s).canonical)
  );

  // Tập môn ưu tiên từ 3 nhóm RIASEC nổi trội (nếu có dữ liệu Holland)
  const riasecAffinitySet = new Set<string>();
  if (hasHollandAnswers) {
    topThreeRiasec.forEach((g) => {
      RIASEC_META[g.code].subjectAffinity.forEach((subj) => riasecAffinitySet.add(subj));
    });
  }

  const scoredCombos: ComboRecommendation[] = schoolCombos.map((combo) => {
    const rawElectives = [
      combo.MonLuaChon1,
      combo.MonLuaChon2,
      combo.MonLuaChon3,
      combo.MonLuaChon4,
      combo.MonKhacNeuCo,
    ].filter(Boolean);

    const studyTopics = [combo.ChuyenDe1, combo.ChuyenDe2, combo.ChuyenDe3].filter(Boolean);

    const normalizedElectives = rawElectives.map((s) => normalizeSubjectName(s).canonical);
    const availableCanonicals = new Set<string>([
      ...COMPULSORY_GRADE10_SUBJECTS,
      ...normalizedElectives,
    ]);

    let score = 0;
    const reasons: string[] = [];
    const conditionsToVerify: string[] = [];

    const comboVerified = isSchoolComboVerified(combo);
    if (!comboVerified) {
      conditionsToVerify.push(
        `Tổ hợp ${combo.MaToHopTHPT} (${combo.NamHoc || "chưa rõ năm học"}) có trạng thái "${combo.TrangThai || "Chưa cập nhật"}" và nguồn "${combo.NguonXacNhan || "Chưa ghi nhận"}"; cần xác nhận trực tiếp với ${school.TenTruong}.`
      );
    }

    // 1. Đối chiếu với từng nguyện vọng đại học
    const matchedAspirations: ProgramMatchDetail[] = [];
    let anyVerifiedUniversityMatch = false;
    let totalMatchedAdmissionCombos = 0;

    for (const asp of aspirations) {
      const uniVerified = isUniversityDataVerified(asp);
      const aspNotes: string[] = [];

      if (asp.admissionsError) {
        aspNotes.push(`Lỗi tải tổ hợp xét tuyển: ${asp.admissionsError}`);
      } else if (asp.admissions.length === 0) {
        aspNotes.push(
          `Chưa có dữ liệu tổ hợp xét tuyển cho ngành "${asp.majorName}" tại ${asp.universityName} trên Google Sheets (Cần xác minh đề án tuyển sinh chính thức).`
        );
      }

      if (asp.universityVerifyNote) {
        aspNotes.push(`Ghi chú kiểm chứng trường ĐH: ${asp.universityVerifyNote}.`);
      }
      if (asp.derivedFromAdmissions) {
        aspNotes.push(
          "Ngành được trích xuất từ bảng tổ hợp xét tuyển (chưa có dòng xác nhận trong bảng Chương trình đào tạo)."
        );
      }

      const matchedAdmCombos: ProgramMatchDetail["matchedCombos"] = [];
      const unmatchedAdmCombos: ProgramMatchDetail["unmatchedCombos"] = [];
      let unmatchedOrUnverified = 0;

      for (const adm of asp.admissions) {
        const reqRaw = [adm.Mon1, adm.Mon2, adm.Mon3, adm.Mon4NeuCo].filter(Boolean);
        const reqNorm = reqRaw.map((r) => normalizeSubjectName(r));

        const specialSubs = reqNorm
          .filter((x) => x.isSpecialAdmissionSubject)
          .map((x) => x.original);

        const standardSubs = reqNorm.filter((x) => !x.isSpecialAdmissionSubject);
        const matchedSubs = standardSubs
          .filter((x) => availableCanonicals.has(x.canonical))
          .map((x) => x.canonical);
        const missingSubs = standardSubs
          .filter((x) => !availableCanonicals.has(x.canonical))
          .map((x) => x.canonical);

        // Tổ hợp xét tuyển khớp hoàn toàn khi mọi môn chuẩn đều có trong tổ hợp lớp 10 và không có môn năng khiếu/ngoại ngữ đặc thù chưa xác minh
        if (
          standardSubs.length > 0 &&
          matchedSubs.length === standardSubs.length &&
          specialSubs.length === 0
        ) {
          matchedAdmCombos.push({
            maToHop: adm.MaToHop || "Chưa rõ mã",
            phuongThuc: adm.PhuongThucXetTuyen || "Chưa rõ phương thức",
            requiredSubjects: reqNorm.map((x) => x.canonical),
            matchedSubjects: matchedSubs,
            specialSubjects: specialSubs,
            isVerifiedData: uniVerified,
            note: adm.DieuKienGhiChu,
          });
          totalMatchedAdmissionCombos += 1;
          if (uniVerified) {
            anyVerifiedUniversityMatch = true;
          }
        } else {
          unmatchedOrUnverified += 1;
          unmatchedAdmCombos.push({
            maToHop: adm.MaToHop || "Chưa rõ mã",
            phuongThuc: adm.PhuongThucXetTuyen || "Chưa rõ phương thức",
            requiredSubjects: reqNorm.map((x) => x.canonical),
            missingSubjects: missingSubs,
            specialSubjects: specialSubs,
            note: adm.DieuKienGhiChu,
          });
          if (specialSubs.length > 0 && matchedSubs.length === standardSubs.length) {
            aspNotes.push(
              `Tổ hợp ${adm.MaToHop} yêu cầu thêm môn đặc thù (${specialSubs.join(", ")}) — cần kiểm tra khả năng đáp ứng ngoài danh mục môn cơ bản.`
            );
          }
        }
      }

      if (matchedAdmCombos.length > 0) {
        // Ưu tiên cao hơn cho nguyện vọng 1 > 2 > 3
        const weight = asp.priority === 1 ? 30 : asp.priority === 2 ? 22 : 16;
        score += weight + Math.min(matchedAdmCombos.length, 3) * 4;
      }

      matchedAspirations.push({
        aspirationPriority: asp.priority,
        universityName: asp.universityName,
        majorName: asp.majorName,
        majorCode: asp.majorCode,
        matchedCombos: matchedAdmCombos,
        unmatchedCombos: unmatchedAdmCombos,
        unmatchedOrUnverifiedCount: unmatchedOrUnverified,
        dataYear: asp.programYear || asp.admissions[0]?.NamTuyenSinh || "Chưa rõ năm",
        verificationNotes: aspNotes,
      });

      aspNotes.forEach((n) => {
        if (!conditionsToVerify.includes(n)) conditionsToVerify.push(n);
      });
    }

    if (totalMatchedAdmissionCombos > 0) {
      const fittedPriorities = matchedAspirations
        .filter((m) => m.matchedCombos.length > 0)
        .map((m) => `NV${m.aspirationPriority} (${m.majorName})`);
      reasons.push(
        `Đáp ứng tổ hợp môn xét tuyển cho ${fittedPriorities.join(", ")} dựa trên dữ liệu đã truy xuất.`
      );
    } else if (aspirations.length > 0) {
      reasons.push(
        "Chưa ghi nhận tổ hợp xét tuyển đại học khớp hoàn toàn từ dữ liệu hiện có (hoặc thiếu dữ liệu tuyển sinh của trường đại học đã chọn); cần đối chiếu thêm."
      );
    }

    // 2. Đối chiếu sở thích, sở trường, môn cần hỗ trợ
    const matchedFav = normalizedElectives.filter((s) => favSet.has(s));
    const matchedStrong = normalizedElectives.filter((s) => strongSet.has(s));
    const matchedSupport = normalizedElectives.filter((s) => supportSet.has(s));

    score += matchedFav.length * 8;
    score += matchedStrong.length * 8;
    score -= matchedSupport.length * 5;

    if (matchedStrong.length > 0) {
      reasons.push(`Có môn sở trường của bạn trong nhóm môn lựa chọn: ${matchedStrong.join(", ")}.`);
    }
    if (matchedFav.length > 0) {
      reasons.push(`Phù hợp với môn học yêu thích của bạn: ${matchedFav.join(", ")}.`);
    }
    if (matchedSupport.length > 0) {
      reasons.push(
        `Lưu ý học tập: tổ hợp có ${matchedSupport.join(", ")} là môn bạn đánh dấu cần hỗ trợ thêm — nên cân nhắc lộ trình củng cố kiến thức nếu chọn.`
      );
    }

    // 3. Đối chiếu Holland RIASEC (nếu có dữ liệu)
    if (hasHollandAnswers) {
      const riasecHits = normalizedElectives.filter((s) => riasecAffinitySet.has(s));
      score += riasecHits.length * 4;
      if (riasecHits.length > 0) {
        reasons.push(
          `Gắn kết với nhóm sở thích nổi trội (${topThreeRiasec
            .map((g) => g.code)
            .join("-")}) qua các môn: ${riasecHits.join(", ")}.`
        );
      }
    }

    // 4. Tính 02 môn thi tốt nghiệp dự kiến tự chọn phù hợp nhất (ngoài Toán & Ngữ văn bắt buộc)
    const gradCandidates = Array.from(
      new Set<string>([...normalizedElectives, "Tiếng Anh", "Lịch sử"])
    );
    const examSubjectScores = gradCandidates.map((sub) => {
      let sScore = 0;
      const reasonParts: string[] = [];

      let aspHitCount = 0;
      matchedAspirations.forEach((ma) => {
        const hitsInAsp = ma.matchedCombos.filter((c) => c.requiredSubjects.includes(sub)).length;
        if (hitsInAsp > 0) {
          aspHitCount += 1;
          sScore += (ma.aspirationPriority === 1 ? 15 : ma.aspirationPriority === 2 ? 11 : 8) + hitsInAsp * 2;
        }
      });
      if (aspHitCount > 0) {
        reasonParts.push(`Xuất hiện trong tổ hợp xét tuyển của ${aspHitCount} nguyện vọng ĐH`);
      }
      if (favSet.has(sub)) {
        sScore += 6;
        reasonParts.push("Thuộc môn học yêu thích");
      }
      if (strongSet.has(sub)) {
        sScore += 6;
        reasonParts.push("Thuộc môn sở trường");
      }
      if (hasHollandAnswers && riasecAffinitySet.has(sub)) {
        sScore += 3;
        reasonParts.push("Phù hợp nhóm sở thích RIASEC");
      }
      if (normalizedElectives.includes(sub)) {
        sScore += 1;
      }

      return {
        subject: sub,
        score: sScore,
        reason:
          reasonParts.length > 0
            ? reasonParts.join(" · ")
            : "Môn phổ biến trong kỳ thi tốt nghiệp THPT của tổ hợp này.",
      };
    });

    examSubjectScores.sort((a, b) => b.score - a.score);
    const recommendedGradExamElectives = examSubjectScores.slice(0, 2).map((item) => ({
      subject: item.subject,
      reason: item.reason,
    }));

    // Xếp hạng mức xác minh theo quy tắc chặt chẽ: chỉ xếp loại "đã xác minh" khi cả tổ hợp THPT và dữ liệu ĐH đều xác minh đủ căn cứ
    let verificationStatus: VerificationLabel = "Cần xác minh";
    if (
      comboVerified &&
      anyVerifiedUniversityMatch &&
      totalMatchedAdmissionCombos > 0
    ) {
      verificationStatus = "Phù hợp với điều kiện môn học đã xác minh";
    } else if (totalMatchedAdmissionCombos > 0) {
      verificationStatus = "Phù hợp tham khảo – Cần xác minh";
    } else {
      verificationStatus = "Cần xác minh";
    }

    if (comboVerified) score += 3;

    const relatedSubjects: ComboRecommendation["relatedSubjects"] = [
      ...COMPULSORY_GRADE10_SUBJECTS.map((sub) => ({
        subject: sub,
        role: "Bắt buộc" as const,
        studentTag: strongSet.has(sub)
          ? ("Sở trường" as const)
          : favSet.has(sub)
          ? ("Yêu thích" as const)
          : supportSet.has(sub)
          ? ("Cần hỗ trợ" as const)
          : undefined,
      })),
      ...rawElectives.map((raw) => {
        const canon = normalizeSubjectName(raw).canonical;
        return {
          subject: raw,
          role: "Lựa chọn" as const,
          studentTag: strongSet.has(canon)
            ? ("Sở trường" as const)
            : favSet.has(canon)
            ? ("Yêu thích" as const)
            : supportSet.has(canon)
            ? ("Cần hỗ trợ" as const)
            : undefined,
        };
      }),
      ...studyTopics.map((topic) => ({
        subject: `Chuyên đề ${topic}`,
        role: "Chuyên đề" as const,
      })),
    ];

    return {
      rank: 1,
      combo,
      compulsorySubjects: [...COMPULSORY_GRADE10_SUBJECTS],
      electiveSubjects: rawElectives,
      studyTopics,
      recommendedGradExamElectives,
      verificationStatus,
      reasons:
        reasons.length > 0
          ? reasons
          : ["Tổ hợp hiện có trong danh mục của trường; cần đối chiếu thêm định hướng ngành học."],
      matchedAspirations,
      relatedSubjects,
      conditionsToVerify:
        conditionsToVerify.length > 0
          ? conditionsToVerify
          : ["Kiểm tra lại chỉ tiêu lớp học và lịch mở tổ hợp thực tế tại trường đầu năm học."],
      alternativeNote: "",
      score,
    };
  });

  scoredCombos.sort((a, b) => b.score - a.score);
  const topThree = scoredCombos.slice(0, 3);

  topThree.forEach((rec, idx) => {
    rec.rank = (idx + 1) as 1 | 2 | 3;
    const otherCombos = scoredCombos
      .filter((c) => c.combo.MaToHopTHPT !== rec.combo.MaToHopTHPT)
      .slice(0, 2)
      .map((c) => `${c.combo.MaToHopTHPT} (${c.electiveSubjects.join(", ")})`);

    rec.alternativeNote =
      otherCombos.length > 0
        ? `Nếu trường đủ chỉ tiêu cho tổ hợp này hoặc bạn muốn điều chỉnh tải học tập, có thể cân nhắc phương án thay thế: ${otherCombos.join(" hoặc ")}.`
        : "Trường hiện chỉ ghi nhận 1 tổ hợp khả dụng trong dữ liệu; hãy trao đổi thêm với giáo viên chủ nhiệm hoặc ban tư vấn tuyển sinh trường.";
  });

  return {
    generatedAt: new Date().toLocaleString("vi-VN"),
    studentName: studentName.trim(),
    school,
    riasecRanking,
    topThreeRiasec,
    hollandAvailable,
    hollandAnsweredCount: selectedHollandIds.size,
    hollandTotalQuestions: hollandQuestions.length,
    aspirations,
    preferences,
    recommendations: topThree,
    allSchoolCombosCount: schoolCombos.length,
    globalWarnings,
    disclaimer:
      "Kết quả tư vấn mang tính chất tham khảo, hỗ trợ học sinh đối chiếu môn học lớp 10 với định hướng nghề nghiệp và dữ liệu tuyển sinh hiện có. Ứng dụng không khẳng định chắc chắn khả năng trúng tuyển đại học; quy định tuyển sinh chính thức có thể thay đổi theo đề án từng năm của Bộ GD&ĐT và các trường đại học.",
  };
}
