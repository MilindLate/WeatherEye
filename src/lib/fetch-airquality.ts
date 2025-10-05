export async function fetchAirQuality(city: string) {
  const res = await fetch(`/api/airquality?city=${city}`);
  if (!res.ok) throw new Error("Failed to fetch air quality data");
  return res.json();
}
