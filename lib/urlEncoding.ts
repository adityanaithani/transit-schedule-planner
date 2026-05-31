import { SearchParams } from "../components/SearchForm";

/**
 * Encodes the search parameters into a URL query string.
 */
export function encodeTripParams(params: SearchParams): string {
  if (!params.origin || !params.destination) return "";

  const urlParams = new URLSearchParams();
  
  // Origin
  urlParams.set("o_name", params.origin.name);
  urlParams.set("o_lat", params.origin.lat.toString());
  urlParams.set("o_lon", params.origin.lon.toString());
  
  // Destination
  urlParams.set("d_name", params.destination.name);
  urlParams.set("d_lat", params.destination.lat.toString());
  urlParams.set("d_lon", params.destination.lon.toString());
  
  // Date and Time
  urlParams.set("date", params.date);
  urlParams.set("time", params.time);

  return urlParams.toString();
}

/**
 * Decodes the URL query string back into a SearchParams object.
 * Returns null if the required parameters are missing or invalid.
 */
export function decodeTripParams(searchParams: URLSearchParams): SearchParams | null {
  const oName = searchParams.get("o_name");
  const oLat = searchParams.get("o_lat");
  const oLon = searchParams.get("o_lon");
  
  const dName = searchParams.get("d_name");
  const dLat = searchParams.get("d_lat");
  const dLon = searchParams.get("d_lon");
  
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (!oName || !oLat || !oLon || !dName || !dLat || !dLon || !date || !time) {
    return null;
  }

  const parsedOLat = parseFloat(oLat);
  const parsedOLon = parseFloat(oLon);
  const parsedDLat = parseFloat(dLat);
  const parsedDLon = parseFloat(dLon);

  if (isNaN(parsedOLat) || isNaN(parsedOLon) || isNaN(parsedDLat) || isNaN(parsedDLon)) {
    return null;
  }

  return {
    origin: {
      id: `address-${parsedOLat}-${parsedOLon}`,
      name: oName,
      lat: parsedOLat,
      lon: parsedOLon,
      type: "address",
    },
    destination: {
      id: `address-${parsedDLat}-${parsedDLon}`,
      name: dName,
      lat: parsedDLat,
      lon: parsedDLon,
      type: "address",
    },
    date,
    time,
  };
}
