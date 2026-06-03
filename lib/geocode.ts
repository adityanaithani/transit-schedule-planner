export async function geocode(
  query: string,
): Promise<{ lat: number; lon: number; name: string } | null> {
  
  async function fetchNom(q: string) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.append("q", q);
    url.searchParams.append("format", "json");
    url.searchParams.append("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "TransitSchedulePlanner/1.0 (Contact: aditya.naith@protonmail.com)",
      },
    });

    if (!response.ok) return null;
    return await response.json();
  }

  try {
    // 1. Try the raw query (scoped if it doesn't already contain Toronto)
    const isToronto = query.toLowerCase().includes("toronto") || query.toLowerCase().includes("ontario");
    let data = await fetchNom(isToronto ? query : `${query}, Toronto, ON`);

    // 2. Fallback for complex addresses (e.g. from calendar events)
    if ((!data || data.length === 0) && query.includes(",")) {
      const parts = query.split(",").map(p => p.trim());
      
      // Try just the building name / first segment
      data = await fetchNom(`${parts[0]}, Toronto, ON`);
      
      // Try just the street address / second segment
      if ((!data || data.length === 0) && parts.length > 1) {
        data = await fetchNom(`${parts[1]}, Toronto, ON`);
      }
    }

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
