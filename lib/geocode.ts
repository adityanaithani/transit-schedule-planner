export async function geocode(
  query: string,
): Promise<{ lat: number; lon: number; name: string } | null> {
  // pre-scope to toronto
  const scopedQuery = `${query}, Toronto, ON, Canada`;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.append("q", scopedQuery);
  url.searchParams.append("format", "json");
  url.searchParams.append("limit", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "TransitSchedulePlanner/1.0 (Contact: aditya.naith@protonmail.com)",
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const firstResult = data[0];

    return {
      lat: parseFloat(firstResult.lat),
      lon: parseFloat(firstResult.lon),
      name: firstResult.display_name,
    };
  } catch (error) {
    console.error("Geocode failed:", error);
    return null;
  }
}
