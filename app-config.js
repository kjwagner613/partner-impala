window.KW_PLAYER_CONFIG = window.KW_PLAYER_CONFIG || {
  apiBaseUrl: "https://partner-impala-110e6d1eb701.herokuapp.com",
  liveStreamApiBaseUrl: "https://partner-livestream-7ed6270d41f8.herokuapp.com",
  localLiveStreamApiBaseUrl: "https://partner-livestream-7ed6270d41f8.herokuapp.com",
  authStorageKey: "impalaStreamer.authSession",
  playlistStoragePrefix: "impalaStreamer",
  instanceStorageId: "india1111",
  brandName: "Impala Streamer",
  appVersion: "1.0.0",
  appBuildDate: "2026.06.29",
  localHelperDownloadUrl: ""
};

window.ImpalaConfig = window.ImpalaConfig || (() => {
  const config = window.KW_PLAYER_CONFIG || {};

  function cleanStorageSegment(value) {
    return String(value || "").trim().replace(/[^a-z0-9._:-]/gi, "-").replace(/^-+|-+$/g, "");
  }

  function getStoragePrefix() {
    const basePrefix = cleanStorageSegment(config.playlistStoragePrefix) || "impalaStreamer";
    const instanceStorageId = cleanStorageSegment(config.instanceStorageId);
    return instanceStorageId ? `${basePrefix}.${instanceStorageId}` : basePrefix;
  }

  function getAuthStorageKey() {
    if (config.authStorageKey && !config.instanceStorageId) {
      return String(config.authStorageKey);
    }

    return `${getStoragePrefix()}.authSession`;
  }

  const preferencesKey = `${getStoragePrefix()}.uiPreferences`;

  function readPreferences() {
    try {
      const rawPreferences = localStorage.getItem(preferencesKey);
      return rawPreferences ? JSON.parse(rawPreferences) : {};
    } catch (error) {
      console.error("Unable to read Impala runtime preferences:", error);
      return {};
    }
  }

  function cleanUrl(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function getCloudApiBaseUrl() {
    const preferences = readPreferences();
    return cleanUrl(preferences.cloudApiBaseUrl || config.apiBaseUrl || "");
  }

  function getLiveStreamApiBaseUrl() {
    const hostname = window.location?.hostname || "";
    const isLocalPreview = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    const configuredUrl = config.liveStreamApiBaseUrl || (isLocalPreview ? config.localLiveStreamApiBaseUrl : "");
    return cleanUrl(configuredUrl);
  }

  function getInstanceId() {
    const preferences = readPreferences();
    return String(preferences.instanceId || "").trim();
  }

  return {
    preferencesKey,
    getStoragePrefix,
    getAuthStorageKey,
    getCloudApiBaseUrl,
    getLiveStreamApiBaseUrl,
    getInstanceId
  };
})();
