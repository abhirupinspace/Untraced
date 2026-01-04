import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Upload to Pinata (public network)
    const uploadData = await pinata.upload.public.file(file);

    // Construct the public gateway URL
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud";
    const url = `https://${gatewayUrl}/ipfs/${uploadData.cid}`;

    return NextResponse.json({
      success: true,
      cid: uploadData.cid,
      url,
    });
  } catch (error) {
    console.error("Profile photo upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload profile photo: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get("cid");

    if (!cid) {
      return NextResponse.json(
        { error: "No CID provided" },
        { status: 400 }
      );
    }

    await pinata.unpin([cid]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile photo delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile photo" },
      { status: 500 }
    );
  }
}
