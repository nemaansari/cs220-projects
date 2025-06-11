import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import "dotenv/config"; // Load API key from .env

const DATA_FOLDER = path.resolve(process.cwd(), "include", "data");
if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

export interface BusinessAttributes {
  Ambience?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface Business {
  business_id: string;
  name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  stars?: number;
  review_count?: number;
  attributes?: BusinessAttributes;
  categories?: string[];
  hours?: Record<string, string>;
}

// ------------------- REAL YELP DATA FETCH -------------------

const YELP_API_KEY = process.env.YELP_API_KEY!;
const YELP_BASE_URL = "https://api.yelp.com/v3/businesses/search";

export async function fetchYelpBusinesses(location: string, category?: string): Promise<Business[]> {
  const params = new URLSearchParams({
    location,
    term: category || "food",
    limit: "50"
  });

  const res = await fetch(`${YELP_BASE_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${YELP_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Yelp API Error: ${res.statusText}`);
  }

  const data = await res.json() as { businesses: any[] };
  return data.businesses.map((b: any): Business => ({
    business_id: b.id,
    name: b.name,
    city: b.location.city,
    state: b.location.state,
    postal_code: b.location.zip_code,
    latitude: b.coordinates.latitude,
    longitude: b.coordinates.longitude,
    stars: b.rating,
    review_count: b.review_count,
    categories: b.categories?.map((c: any) => c.title),
  }));
}

export async function fetchAndCacheYelpData(location: string, category?: string): Promise<Business[]> {
  const fileName = `real-yelp-${location.replace(/\s+/g, "_").toLowerCase()}-${(category || "all").toLowerCase()}.json`;
  const filePath = path.join(DATA_FOLDER, fileName);

  if (fs.existsSync(filePath)) {
    return loadBusinesses(filePath);
  }

  const businesses = await fetchYelpBusinesses(location, category);
  fs.writeFileSync(filePath, JSON.stringify(businesses, null, 2), "utf-8");

  return businesses;
}

// ------------------- LOAD / GENERATE LOCAL DATA -------------------

export function loadYelpData(part?: number): Business[] {
  if (part !== undefined && Number.isInteger(part) && 0 <= part && part <= 9) {
    const p = path.join(DATA_FOLDER, `yelp${part}.json`);
    return loadBusinesses(p);
  }

  return loadOrCreate("yelpMerged", () => {
    const businesses: Business[] = [];

    for (let i = 1; i < 10; i++) {
      const p = path.join(DATA_FOLDER, `yelp${i}.json`);
      businesses.push(...loadBusinesses(p));
    }

    return businesses;
  });
}

export function loadOrCreate(fileName: string, f: () => Business[]): Business[] {
  const p = path.join(DATA_FOLDER, `${fileName}.json`);
  if (fs.existsSync(p)) {
    return loadBusinesses(p);
  }

  const data = f();
  fs.writeFileSync(p, JSON.stringify(data, null, 2), { encoding: "utf-8" });

  return data;
}

function loadBusinesses(filePath: string): Business[] {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as Business[];
}

