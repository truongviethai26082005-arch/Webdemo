// Cody (Gemini) luôn trả lời dạng Markdown (**đậm**, #### tiêu đề, - bullet).
// File này dùng chung cho khung chat (analytics-chat-mascot.tsx) và trang in
// báo cáo (analytics-print-report.tsx) để: (1) render đúng định dạng thay vì
// hiện literal dấu *, và (2) tách nội dung báo cáo AI theo đúng 4 mục I/II/III/IV
// mà prompt trong lib/actions/ai-analytics.ts đã quy định, để chèn nhận
// xét/nguyên nhân/giải pháp ngay dưới từng mục dữ liệu tương ứng.

export function renderFormattedContent(content: string) {
  return content.split("\n").map((line, i) => {
    let text = line;

    const headingMatch = text.match(/^#{1,4}\s+(.*)$/);
    if (headingMatch) text = headingMatch[1];

    const bulletMatch = text.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) text = bulletMatch[1];

    const parts = text
      .split(/(\*\*[^*]+\*\*)/g)
      .filter((part) => part.length > 0)
      .map((part, j) => {
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
        return boldMatch ? (
          <strong key={j} className="font-semibold">
            {boldMatch[1]}
          </strong>
        ) : (
          <span key={j}>{part}</span>
        );
      });

    return (
      <div key={i} className={headingMatch ? "font-bold mt-1.5 first:mt-0" : ""}>
        {bulletMatch && <span className="mr-1">•</span>}
        {parts}
      </div>
    );
  });
}

export interface AiReportSections {
  financial: string;
  debt: string;
  classes: string;
  actionPlan: string;
}

/**
 * Tách báo cáo AI (dạng "### I. ...", "### II. ...", "### III. ...", "### IV. ...")
 * thành 4 đoạn riêng để chèn vào đúng mục 1/2/3/4 trong trang in báo cáo.
 * Bỏ luôn dòng tiêu đề "### I. ..." gốc vì mỗi mục đã có tiêu đề riêng của UI.
 */
export function splitAiReportSections(text: string): AiReportSections {
  const headerRegex = /^###\s+([IVX]+)\.\s*.*$/gm;
  const matches: { index: number; roman: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(text)) !== null) {
    matches.push({ index: m.index, roman: m[1] });
  }

  const result: AiReportSections = { financial: "", debt: "", classes: "", actionPlan: "" };

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const chunk = text
      .slice(start, end)
      .replace(/^###\s+[IVX]+\.[^\n]*\n?/, "")
      .trim();

    switch (matches[i].roman) {
      case "I":
        result.financial = chunk;
        break;
      case "II":
        result.debt = chunk;
        break;
      case "III":
        result.classes = chunk;
        break;
      case "IV":
        result.actionPlan = chunk;
        break;
    }
  }

  return result;
}
