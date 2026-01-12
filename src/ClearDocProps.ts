function clearDocumentProperties() {
  const docProps = PropertiesService.getDocumentProperties();
  const docCache = CacheService.getDocumentCache() as GoogleAppsScript.Cache.Cache;
  docProps.deleteAllProperties();
  docCache.removeAll(['0','1','Yla1cMhh','45CnUWvZ'])
  console.log("All document properties have been cleared.");
}
