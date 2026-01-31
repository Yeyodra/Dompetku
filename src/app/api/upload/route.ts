import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

// POST /api/upload - Upload image to R2
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext({ async: true });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max size: 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `receipts/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await env.STORAGE_R2.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return the URL (you'll need to configure R2 public access or use signed URLs)
    const url = `/api/images/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
