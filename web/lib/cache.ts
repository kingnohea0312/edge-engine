/**
 * TTL cache behind a driver interface — server-side port of the app's two-tier
 * cache. Default driver is an in-memory LRU; a Redis adapter can be enabled with
 * CACHE_DRIVER=redis (lazy-loaded so it never breaks the build when absent).
 *
 * Behaviour ported from the original `jget`:
 *   - fresh cache hit within TTL is returned directly
 *   - concurrent identical requests are de-duplicated (inflight map)
 *   - on fetch error, the last cached value is served instead (stale-on-error)
 */

export type CacheEntry = { t: number; d: unknown };

export interface CacheDriver {
  get(key: string): Promise<CacheEntry | null>;
  set(key: string, entry: CacheEntry): Promise<void>;
  del(key: string): Promise<void>;
}

/** In-memory LRU. Parse-free eviction: oldest inserted keys drop first. */
class MemoryDriver implements CacheDriver {
  private map = new Map<string, CacheEntry>();
  constructor(private cap = 3000) {}
  async get(key: string) {
    const e = this.map.get(key);
    if (e) {
      // mark as recently used
      this.map.delete(key);
      this.map.set(key, e);
    }
    return e ?? null;
  }
  async set(key: string, entry: CacheEntry) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, entry);
    while (this.map.size > this.cap) {
      const oldest = this.map.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }
  async del(key: string) {
    this.map.delete(key);
  }
}

/**
 * Optional Redis driver. Only loaded when CACHE_DRIVER=redis AND `ioredis` is
 * installed; otherwise we transparently fall back to memory. Kept behind the
 * interface so the rest of the app is storage-agnostic.
 */
async function makeDriver(): Promise<CacheDriver> {
  if (process.env.CACHE_DRIVER === "redis" && process.env.REDIS_URL) {
    try {
      // Non-literal specifier keeps the optional dependency out of type-checking
      // and bundling; if `ioredis` isn't installed we fall back to memory.
      const spec = ["io", "redis"].join("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import(/* webpackIgnore: true */ spec).catch(() => null);
      if (mod) {
        const Redis = (mod as { default: new (url: string) => unknown }).default;
        const client = new Redis(process.env.REDIS_URL) as {
          get(k: string): Promise<string | null>;
          set(k: string, v: string): Promise<unknown>;
          del(k: string): Promise<unknown>;
        };
        return {
          async get(key) {
            const raw = await client.get("ee:" + key);
            return raw ? (JSON.parse(raw) as CacheEntry) : null;
          },
          async set(key, entry) {
            await client.set("ee:" + key, JSON.stringify(entry));
          },
          async del(key) {
            await client.del("ee:" + key);
          },
        };
      }
    } catch {
      /* fall through to memory */
    }
  }
  return new MemoryDriver();
}

// Reuse one driver + inflight map across hot-reloads / lambda invocations.
const g = globalThis as unknown as {
  __eeDriver?: Promise<CacheDriver>;
  __eeInflight?: Map<string, Promise<unknown>>;
};
const driverP: Promise<CacheDriver> = (g.__eeDriver ??= makeDriver());
const inflight: Map<string, Promise<unknown>> = (g.__eeInflight ??= new Map());

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  opts: { force?: boolean } = {},
): Promise<T> {
  const driver = await driverP;
  const hit = await driver.get(key);
  if (!opts.force && hit && Date.now() - hit.t < ttlMs) return hit.d as T;
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const p = (async () => {
    try {
      const d = await fetcher();
      await driver.set(key, { t: Date.now(), d });
      return d;
    } catch (err) {
      if (hit) return hit.d as T; // stale-on-error fallback
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p as Promise<T>;
}

/** TTL constants — mirror the original app exactly. */
export const MIN = 60_000;
export const HOUR = 3_600_000;
export const DAY = 86_400_000;
export const TTL = {
  scoreboard: 5 * MIN,
  odds: 15 * MIN,
  rankings: 6 * HOUR,
  bio: 24 * HOUR,
  records: 12 * HOUR,
  search: 12 * HOUR,
  history: 30 * DAY,
  event: 30 * DAY,
  pastScoreboard: 7 * DAY,
} as const;
