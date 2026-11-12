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
export function extractMeaningCandidates(rawMeaning: string): string[] {
  if (!rawMeaning) return [];

  const candidates = new Set<string>();

  // Thêm nghĩa đầy đủ
  const trimmedFull = rawMeaning.trim();
  if (trimmedFull) candidates.add(trimmedFull);

  // Nghĩa khi loại bỏ các chú giải trong ngoặc đơn ()
  const withoutParens = rawMeaning.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (withoutParens) candidates.add(withoutParens);

  // Tách theo các dấu ngăn cách phổ biến: ;, ,, /, |
  const splitTokens = rawMeaning.split(/[;,\/|\n]+/);
  for (const token of splitTokens) {
    const t = token.trim();
    if (t) {
      candidates.add(t);
      const tWithoutParens = t.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
      if (tWithoutParens) candidates.add(tWithoutParens);
    }
  }

  // Nếu trong token có " hoặc " hoặc " hay "
  for (const c of Array.from(candidates)) {
    if (/\s+(?:hoặc|hay)\s+/i.test(c)) {
      const parts = c.split(/\s+(?:hoặc|hay)\s+/i);
      for (const p of parts) {
        const cleanP = p.trim();
        if (cleanP) candidates.add(cleanP);
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
  const userUnaccented = removeVietnameseAccents(userClean);
  const userTokensClean = cleanPunctuation(userClean);
  const userTokensUnaccented = cleanPunctuation(userUnaccented);

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
    if (userTokensClean === candTokensClean || userTokensUnaccented === candTokensUnaccented) {
      return { isMatch: true, matchedCandidate: cand };
    }

    // 2. So khớp chuỗi thô (lower case)
    if (userClean === candClean || userUnaccented === candUnaccented) {
      return { isMatch: true, matchedCandidate: cand };
    }

    // 3. Nếu ứng viên có nhiều từ (ví dụ: "buổi sáng sớm"), và người dùng nhập "buổi sáng"
    // hoặc ứng viên là "xe buýt công cộng" và người dùng nhập "xe buýt"
    if (userTokensClean.length >= 3 && candTokensClean.includes(userTokensClean)) {
      const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegExp(userTokensClean)}(\\s|$)`, 'i');
      if (wordBoundaryRegex.test(candTokensClean)) {
        return { isMatch: true, matchedCandidate: cand };
      }
    }
    if (userTokensUnaccented.length >= 3 && candTokensUnaccented.includes(userTokensUnaccented)) {
      const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegExp(userTokensUnaccented)}(\\s|$)`, 'i');
      if (wordBoundaryRegex.test(candTokensUnaccented)) {
        return { isMatch: true, matchedCandidate: cand };
      }
    }
  }

  return { isMatch: false };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

