const documentCache = CacheService.getDocumentCache() as GoogleAppsScript.Cache.Cache;

if (!documentCache) {
  throw new Error('Failed to get document cache');
}

const CACHE_TTL_SECONDS = 6*60*60; // 6 hours
