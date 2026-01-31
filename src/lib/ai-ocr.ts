import OpenAI from "openai";
import { ReceiptData, ReceiptItem, OCRResult } from "@/types/receipt";

const client = new OpenAI({
  baseURL: process.env.ANTIGRAVITY_BASE_URL || "http://127.0.0.1:8045",
  apiKey: process.env.ANTIGRAVITY_API_KEY || "",
});

const SYSTEM_PROMPT = `Kamu adalah AI yang ahli membaca struk belanja Indonesia.
Ekstrak informasi dari gambar struk dengan format JSON berikut:

{
  "storeName": "nama toko",
  "date": "YYYY-MM-DD",
  "total": 12345,
  "items": [
    {"name": "nama item", "quantity": 1, "price": 1000}
  ]
}

Aturan:
- storeName: Nama toko/merchant (biasanya di bagian atas struk)
- date: Tanggal transaksi dalam format YYYY-MM-DD
- total: Total pembayaran dalam angka (tanpa Rp, titik, atau koma)
- items: Array item yang dibeli dengan quantity dan harga satuan
- Jika tidak bisa membaca, isi dengan null
- HANYA output JSON, tanpa penjelasan tambahan`;

export async function extractTextWithAI(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<OCRResult> {
  try {
    const response = await client.chat.completions.create({
      model: "gemini-2.5-flash",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "No response from AI" };
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Invalid JSON response" };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      storeName?: string | null;
      date?: string | null;
      total?: number | null;
      items?: Array<{ name: string; quantity: number; price: number }>;
    };

    const receiptData: ReceiptData = {
      storeName: parsed.storeName || null,
      date: parsed.date || null,
      total: parsed.total || null,
      items: (parsed.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
      })),
      rawText: content,
      confidence: 95, // AI typically has high confidence
    };

    return { success: true, data: receiptData };
  } catch (error) {
    console.error("AI OCR error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI OCR failed",
    };
  }
}

// Convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
