const fallbackConfig = {
  loaded: false,
  errorMessage: "Failed to load runtime-env.js"
};

export function getRuntimeConfig() {
  if (typeof window === "undefined") {
    return fallbackConfig;
  }

  return {
    ...fallbackConfig,
    ...(window.__HELLO_WORLD_CONFIG__ ?? {})
  };
}
