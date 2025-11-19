// Cache for lotus animation JSON to enable instant loading
let cachedAnimationData: any = null;
let loadingPromise: Promise<any> | null = null;

/**
 * Preload the lotus animation JSON file
 * Call this on homepage to ensure animation is ready when user navigates to timer
 */
export function preloadLotusAnimation(): Promise<any> {
  // If already cached, return immediately
  if (cachedAnimationData) {
    return Promise.resolve(cachedAnimationData);
  }

  // If already loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = fetch('/real_lotus.json')
    .then(response => response.json())
    .then(data => {
      console.log('Lotus animation data preloaded:', data);
      
      // Process the data (same as LotusAnimation component)
      if (data.layers) {
        data.layers.forEach((layer: any) => {
          if (layer.hd === true) {
            layer.hd = false;
          }
        });
      }
      
      cachedAnimationData = data;
      return data;
    })
    .catch(error => {
      console.error('Error preloading lotus animation:', error);
      loadingPromise = null; // Reset on error so we can retry
      throw error;
    });

  return loadingPromise;
}

/**
 * Get cached animation data if available
 * Returns null if not yet loaded
 */
export function getCachedAnimationData(): any {
  return cachedAnimationData;
}

/**
 * Clear the cache (useful for testing or forced refresh)
 */
export function clearAnimationCache(): void {
  cachedAnimationData = null;
  loadingPromise = null;
}

