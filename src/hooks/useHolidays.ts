import { useQuery } from '@tanstack/react-query';

export interface Holiday {
  date: string; // "YYYY-MM-DD"
  name: string;
  country: string;
  countryCode: string;
  type: string;
}

const API_KEY = import.meta.env.VITE_ABSTRACTAPI_HOLIDAYS_KEY as string;
const BASE_URL = 'https://holidays.abstractapi.com/v1/';

// 1 credit = 1 day query. Per month: 1 country = ~30 credits.
// With localStorage cache keyed by country+year+month+fetchDate,
// each country+month is fetched AT MOST ONCE PER DAY.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const COUNTRY_MAP: Record<string, string> = {
  USA: 'US',
  UK: 'GB',
  India: 'IN',
  Canada: 'CA',
  Australia: 'AU',
  Ireland: 'IE',
  France: 'FR',
  Germany: 'DE',
  Netherlands: 'NL',
  Singapore: 'SG',
};

interface AbstractHoliday {
  name: string;
  type: string;
  date: string; // "MM/DD/YYYY"
}

interface CacheEntry {
  fetchedAt: number;
  holidays: Holiday[];
}

// ─── localStorage helpers ────────────────────────────────────────────────────

function cacheKey(code: string, year: number, month: number) {
  return `holidays_v3_${code}_${year}_${String(month).padStart(2, '0')}`;
}

function readCache(key: string): Holiday[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.holidays;
  } catch {
    return null;
  }
}

function writeCache(key: string, holidays: Holiday[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ fetchedAt: Date.now(), holidays }));
  } catch {
    // localStorage full — skip
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function toISODate(d: string): string {
  const [mm, dd, yyyy] = d.split('/');
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Core fetch: one country, one month ──────────────────────────────────────
// Returns cached result immediately if available (zero API calls).
// On cache miss: fetches each day sequentially, writes to localStorage.

async function fetchCountryMonth(
  displayName: string,
  code: string,
  year: number,
  month: number
): Promise<Holiday[]> {
  const key = cacheKey(code, year, month);

  // ✅ Cache hit → zero API calls
  const cached = readCache(key);
  if (cached) return cached;

  // Cache miss → fetch day by day (free plan limitation)
  const days = daysInMonth(year, month);
  const holidays: Holiday[] = [];

  for (let day = 1; day <= days; day++) {
    try {
      const url = `${BASE_URL}?api_key=${API_KEY}&country=${code}&year=${year}&month=${month}&day=${day}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          for (const h of json as AbstractHoliday[]) {
            holidays.push({
              date: toISODate(h.date),
              name: h.name,
              country: displayName,
              countryCode: code,
              type: h.type ?? 'National',
            });
          }
        }
      }
    } catch {
      // skip failed day
    }
    // 200ms between calls — safe rate limit
    await sleep(200);
  }

  writeCache(key, holidays);
  return holidays;
}

// ─── Fetch all countries for a month ─────────────────────────────────────────
// Countries are fetched sequentially so cache hits return instantly
// and cache misses don't hammer the API in parallel.

async function fetchAllForMonth(year: number, month: number): Promise<Holiday[]> {
  const all: Holiday[] = [];

  for (const [name, code] of Object.entries(COUNTRY_MAP)) {
    const result = await fetchCountryMonth(name, code, year, month);
    all.push(...result);
  }

  // Deduplicate
  const seen = new Set<string>();
  return all.filter((h) => {
    const k = `${h.date}|${h.name}|${h.countryCode}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ─── Check if a full month is already cached (all 10 countries) ──────────────
function isMonthFullyCached(year: number, month: number): boolean {
  return Object.values(COUNTRY_MAP).every((code) => {
    return readCache(cacheKey(code, year, month)) !== null;
  });
}

// ─── React Query hooks ────────────────────────────────────────────────────────

export function useHolidaysForMonth(year: number, month: number) {
  return useQuery<Holiday[]>({
    queryKey: ['holidays-v3', year, month],
    queryFn: () => fetchAllForMonth(year, month),
    // staleTime = Infinity: localStorage is the sole freshness gate.
    // React Query never re-fetches on its own — only on cache miss in localStorage.
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
    // Don't even start the query if everything is already cached —
    // just read from localStorage via initialData instead.
    initialData: isMonthFullyCached(year, month)
      ? (() => {
          const all: Holiday[] = [];
          for (const [name, code] of Object.entries(COUNTRY_MAP)) {
            const cached = readCache(cacheKey(code, year, month));
            if (cached) all.push(...cached);
          }
          const seen = new Set<string>();
          return all.filter((h) => {
            const k = `${h.date}|${h.name}|${h.countryCode}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        })()
      : undefined,
  });
}

export function useHolidays(year: number) {
  const now = new Date();
  return useHolidaysForMonth(year, now.getMonth() + 1);
}
