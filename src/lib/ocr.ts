import Tesseract from "tesseract.js";
import { ReceiptData, ReceiptItem, OCRResult } from "@/types/receipt";

export async function extractTextFromImage(
  imageFile: File | string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(imageFile, "ind+eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const rawText = result.data.text;
    const confidence = result.data.confidence;

    const receiptData = parseReceiptText(rawText, confidence);

    return {
      success: true,
      data: receiptData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "OCR failed",
    };
  }
}

function parseReceiptText(text: string, confidence: number): ReceiptData {
  const lines = text.split("\n").filter((line) => line.trim());

  // Extract store name (usually first non-empty line)
  const storeName = lines[0]?.trim() || null;

  // Extract date (look for date patterns)
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/, // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/, // YYYY/MM/DD or YYYY-MM-DD
    /(\d{1,2}\s+(?:jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+\d{2,4})/i, // DD Month YYYY
  ];

  let date: string | null = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      date = match[1];
      break;
    }
  }

  // Extract total (look for "total", "jumlah", "grand total", "subtotal")
  const totalPatterns = [
    /(?:grand\s*total|total\s*belanja|total\s*bayar)[:\s]*(?:rp\.?\s*)?([\d\.,]+)/i,
    /(?:total|jumlah)[:\s]*(?:rp\.?\s*)?([\d\.,]+)/i,
    /(?:rp\.?\s*)([\d\.,]+)(?:\s*$)/im, // Rp at end of line (likely total)
  ];

  let total: number | null = null;
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      total = parseNumber(match[1]);
      if (total > 0) break;
    }
  }

  // Extract items (lines with quantity and price patterns)
  const items: ReceiptItem[] = [];
  
  // Pattern: name quantity x price or name @ price x quantity
  const itemPatterns = [
    /(.+?)\s+(\d+)\s*[xX@]\s*(?:rp\.?\s*)?([\d\.,]+)/gi,
    /(.+?)\s+(?:rp\.?\s*)?([\d\.,]+)\s*[xX]\s*(\d+)/gi,
  ];

  for (const pattern of itemPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      // Skip if name looks like a total line
      if (/total|jumlah|subtotal|pajak|tax|diskon/i.test(name)) continue;
      
      items.push({
        name,
        quantity: parseInt(match[2]) || 1,
        price: parseNumber(match[3]),
      });
    }
  }

  return {
    storeName,
    date,
    total,
    items,
    rawText: text,
    confidence,
  };
}

function parseNumber(str: string): number {
  // Remove thousand separators (. or ,) and parse
  const cleaned = str.replace(/\./g, "").replace(/,/g, "");
  return parseFloat(cleaned) || 0;
}

// Utility to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Utility to parse Indonesian date string to ISO format
export function parseIndonesianDate(dateStr: string): string | null {
  if (!dateStr) return null;

  const months: Record<string, string> = {
    jan: "01", januari: "01",
    feb: "02", februari: "02",
    mar: "03", maret: "03",
    apr: "04", april: "04",
    mei: "05",
    jun: "06", juni: "06",
    jul: "07", juli: "07",
    agu: "08", agustus: "08",
    sep: "09", september: "09",
    okt: "10", oktober: "10",
    nov: "11", november: "11",
    des: "12", desember: "12",
  };

  // Try DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, "0");
    const month = slashMatch[2].padStart(2, "0");
    let year = slashMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Try DD Month YYYY
  const textMatch = dateStr.match(/(\d{1,2})\s+([a-z]+)\s+(\d{2,4})/i);
  if (textMatch) {
    const day = textMatch[1].padStart(2, "0");
    const monthName = textMatch[2].toLowerCase().slice(0, 3);
    const month = months[monthName] || "01";
    let year = textMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  return null;
}
