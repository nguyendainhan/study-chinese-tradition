/**
 * Tiện ích chuẩn hóa và so khớp nghĩa tiếng Việt cho các bài kiểm tra gõ từ vựng.
 * Hỗ trợ:
 * - So khớp có dấu và không dấu (tiện lợi cho cả bàn phím tiếng Việt lẫn khi gõ nhanh không dấu)
 * - Tách các nghĩa đồng nghĩa cách nhau bằng dấu chấm phẩy (;), dấu phẩy (,), gạch chéo (/), hoặc từ 'hoặc', 'hay'
 * - Bỏ qua các chú thích trong dấu ngoặc đơn: (trợ từ), (danh từ), (công cộng)...
 * - Bỏ qua dấu câu, khoảng trắng thừa, không phân biệt hoa thường
 */

export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function cleanPunctuation(str: string): string {
  return str
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>\[\]\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tách một chuỗi nghĩa tiếng Việt thô thành danh sách các nghĩa hợp lệ có thể chấp nhận.
 * Ví dụ: "năm ngoái; năm trước" => ["năm ngoái", "năm trước"]
 * "xe buýt (công cộng)" => ["xe buýt (công cộng)", "xe buýt", "xe buýt công cộng"]
 */
const VIETNAMESE_CLASSIFIERS = [
  'cái',
  'con',
  'chiếc',
  'quả',
  'trái',
  'viên',
  'tờ',
  'bức',
  'quyển',
  'cuốn',
  'người',
  'cây',
  'sự',
  'việc',
  'căn',
  'ngôi',
  'bộ',
];

function stripLeadingClassifier(str: string): string {
  const words = str.trim().split(/\s+/);
  if (words.length > 1 && VIETNAMESE_CLASSIFIERS.includes(words[0].toLowerCase())) {
    return words.slice(1).join(' ');
  }
  return str;
}

export function extractMeaningCandidates(rawMeaning: string): string[] {
  if (!rawMeaning) return [];

  const candidates = new Set<string>();

  // Thêm nghĩa đầy đủ
  const trimmedFull = rawMeaning.trim();
  if (trimmedFull) {
    candidates.add(trimmedFull);
    const stripped = stripLeadingClassifier(trimmedFull);
    if (stripped) candidates.add(stripped);
  }

  // Nghĩa khi loại bỏ các chú giải trong ngoặc đơn ()
  const withoutParens = rawMeaning.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (withoutParens) {
    candidates.add(withoutParens);
    const stripped = stripLeadingClassifier(withoutParens);
    if (stripped) candidates.add(stripped);
  }

  // Tách theo các dấu ngăn cách phổ biến: ;, ,, /, |
  const splitTokens = rawMeaning.split(/[;,\/|\n]+/);
  for (const token of splitTokens) {
    const t = token.trim();
    if (t) {
      candidates.add(t);
      const strippedT = stripLeadingClassifier(t);
      if (strippedT) candidates.add(strippedT);

      const tWithoutParens = t.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
      if (tWithoutParens) {
        candidates.add(tWithoutParens);
        const strippedNoParens = stripLeadingClassifier(tWithoutParens);
        if (strippedNoParens) candidates.add(strippedNoParens);
      }
    }
  }

  // Nếu trong token có " hoặc " hoặc " hay "
  for (const c of Array.from(candidates)) {
    if (/\s+(?:hoặc|hay)\s+/i.test(c)) {
      const parts = c.split(/\s+(?:hoặc|hay)\s+/i);
      for (const p of parts) {
        const cleanP = p.trim();
        if (cleanP) {
          candidates.add(cleanP);
          const stripped = stripLeadingClassifier(cleanP);
          if (stripped) candidates.add(stripped);
        }
      }
    }
  }

  return Array.from(candidates);
}

/**
 * Kiểm tra xem câu trả lời của người dùng có khớp với nghĩa tiếng Việt của từ không.
 */
export function isVietnameseMeaningMatch(userInput: string, rawMeaning: string): {
  isMatch: boolean;
  matchedCandidate?: string;
} {
  if (!userInput || !rawMeaning) {
    return { isMatch: false };
  }

  const userClean = userInput.trim().toLowerCase();
  const userStripped = stripLeadingClassifier(userClean);
  const userUnaccented = removeVietnameseAccents(userClean);
  const userTokensClean = cleanPunctuation(userClean);
  const userTokensUnaccented = cleanPunctuation(userUnaccented);
  const userStrippedTokensClean = cleanPunctuation(userStripped);

  if (!userTokensClean) {
    return { isMatch: false };
  }

  const candidates = extractMeaningCandidates(rawMeaning);

  for (const cand of candidates) {
    const candClean = cand.toLowerCase().trim();
    const candUnaccented = removeVietnameseAccents(candClean);
    const candTokensClean = cleanPunctuation(candClean);
    const candTokensUnaccented = cleanPunctuation(candUnaccented);

    // 1. So khớp chính xác sau khi chuẩn hóa dấu câu
    if (
      userTokensClean === candTokensClean ||
      userTokensUnaccented === candTokensUnaccented ||
      userStrippedTokensClean === candTokensClean
    ) {
      return { isMatch: true, matchedCandidate: cand };
    }

    // 2. So khớp chuỗi thô (lower case)
    if (
      userClean === candClean ||
      userUnaccented === candUnaccented ||
      userStripped === candClean
    ) {
      return { isMatch: true, matchedCandidate: cand };
    }

    // 3a. Nếu ứng viên chứa từ khóa của người dùng (ví dụ: ứng viên: "xe buýt công cộng", người dùng nhập: "xe buýt")
    if (userTokensClean.length >= 2 && candTokensClean.includes(userTokensClean)) {
      const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegExp(userTokensClean)}(\\s|$)`, 'i');
      if (wordBoundaryRegex.test(candTokensClean)) {
        return { isMatch: true, matchedCandidate: cand };
      }
    }
    if (userTokensUnaccented.length >= 2 && candTokensUnaccented.includes(userTokensUnaccented)) {
      const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegExp(userTokensUnaccented)}(\\s|$)`, 'i');
      if (wordBoundaryRegex.test(candTokensUnaccented)) {
        return { isMatch: true, matchedCandidate: cand };
      }
    }

    // 3b. Hai chiều: Nếu người dùng nhập có thêm lượng từ (ví dụ: ứng viên: "bàn", người dùng nhập: "cái bàn" / "chiếc bàn")
    if (candTokensClean.length >= 2 && userTokensClean.includes(candTokensClean)) {
      const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegExp(candTokensClean)}(\\s|$)`, 'i');
      if (wordBoundaryRegex.test(userTokensClean)) {
        return { isMatch: true, matchedCandidate: cand };
      }
    }
    if (candTokensUnaccented.length >= 2 && userTokensUnaccented.includes(candTokensUnaccented)) {
      const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegExp(candTokensUnaccented)}(\\s|$)`, 'i');
      if (wordBoundaryRegex.test(userTokensUnaccented)) {
        return { isMatch: true, matchedCandidate: cand };
      }
    }
  }

  return { isMatch: false };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

