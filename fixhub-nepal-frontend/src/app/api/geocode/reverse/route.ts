import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
        return NextResponse.json({ error: "Missing lat or lon" }, { status: 400 });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`,
            {
                signal: controller.signal,
                headers: {
                    "User-Agent": "FixHubNepal/1.0 (contact@fixhubnepal.com)",
                    "Accept-Language": "en",
                    "Accept": "application/json",
                },
            }
        );
        clearTimeout(timeout);

        const text = await response.text();
        if (!text || !response.ok) {
            return NextResponse.json({ display_name: `${lat}, ${lon}` });
        }

        const data = JSON.parse(text);
        const a = data.address || {};

        // neighbourhood -> suburb -> city_district -> city -> state -> postcode -> country
        const parts = [
            a.neighbourhood || a.hamlet || a.quarter || a.suburb,
            a.city_district,
            a.city || a.town || a.village,
            a.state_district,
            a.state,
            a.postcode,
            a.country,
        ].filter(Boolean);

        const display_name = [...new Set(parts)].join(", ") || data.display_name || `${lat}, ${lon}`;
        return NextResponse.json({ display_name });
    } catch (err: any) {
        console.error("[geocode/reverse] failed:", err?.message);
        return NextResponse.json({ display_name: `${lat}, ${lon}` });
    }
}
