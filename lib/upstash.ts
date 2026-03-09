import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export interface CacheClient {
  get<TValue extends CacheableValue>(
    key: string
  ): Promise<TValue | null>;
  set<TValue extends CacheableValue>(
    key: string,
    value: TValue,
    ttlSeconds?: number
  ): Promise<void>;
}

export interface DistributedRateLimiter {
  limit(key: string): Promise<{ success: boolean }>;
}

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
});

type CacheablePrimitive = string | number | boolean | null;
type CacheableValue =
  | CacheablePrimitive
  | CacheablePrimitive[]
  | Record<string, unknown>;

type CacheOptions = {
  ttlSeconds?: number;
  prefix?: string;
};

const buildCacheKey = (key: string, prefix?: string): string => {
  if (prefix) {
    return `${prefix}:${key}`;
  }

  return key;
};

export const createCacheClient = ():
  | {
      client: CacheClient;
      getCachedValue: <TValue extends CacheableValue>(
        key: string,
        options?: CacheOptions
      ) => Promise<TValue | null>;
      setCachedValue: <TValue extends CacheableValue>(
        key: string,
        value: TValue,
        options?: CacheOptions
      ) => Promise<void>;
      getOrSetCachedValue: <TValue extends CacheableValue>(
        key: string,
        fetchValue: () => Promise<TValue>,
        options?: CacheOptions
      ) => Promise<TValue>;
    }
  | never => {
  const client: CacheClient = {
    async get<TValue extends CacheableValue>(
      key: string
    ): Promise<TValue | null> {
      const cached = await redis.get<TValue | null>(key);

      return cached ?? null;
    },
    async set<TValue extends CacheableValue>(
      key: string,
      value: TValue,
      ttlSeconds?: number
    ): Promise<void> {
      const effectiveTtl = ttlSeconds ?? 60;

      await redis.set(key, value, { ex: effectiveTtl });
    },
  };

  const getCachedValue = async <TValue extends CacheableValue>(
    key: string,
    options?: CacheOptions
  ): Promise<TValue | null> => {
    const cacheKey = buildCacheKey(key, options?.prefix);

    return client.get<TValue>(cacheKey);
  };

  const setCachedValue = async <TValue extends CacheableValue>(
    key: string,
    value: TValue,
    options?: CacheOptions
  ): Promise<void> => {
    const cacheKey = buildCacheKey(key, options?.prefix);
    const ttlSeconds = options?.ttlSeconds ?? 60;

    await client.set<TValue>(cacheKey, value, ttlSeconds);
  };

  const getOrSetCachedValue = async <TValue extends CacheableValue>(
    key: string,
    fetchValue: () => Promise<TValue>,
    options?: CacheOptions
  ): Promise<TValue> => {
    const cached = await getCachedValue<TValue>(key, options);

    if (cached !== null) {
      return cached;
    }

    const freshValue = await fetchValue();

    await setCachedValue<TValue>(key, freshValue, options);

    return freshValue;
  };

  return {
    client,
    getCachedValue,
    setCachedValue,
    getOrSetCachedValue,
  };
};

export const {
  client: cacheClient,
  getCachedValue,
  setCachedValue,
  getOrSetCachedValue,
} = createCacheClient();

