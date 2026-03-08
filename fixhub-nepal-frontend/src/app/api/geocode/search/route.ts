import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const limit = searchParams.get("limit") || "5";

    if (!q) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}&countrycodes=np`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "FixHubNepal/1.0 (fixhubnepal@gmail.com)",
                "Accept-Language": "en",
            },
        });
        clearTimeout(timeout);

        const text = await response.text();
        console.log("[geocode/search] Nominatim status:", response.status, "body:", text?.slice(0, 200));

        if (!text || !response.ok) {
            return NextResponse.json([]);
        }

        const data = JSON.parse(text);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[geocode/search] fetch failed:", err?.message);
        return NextResponse.json([]);
    }
}
