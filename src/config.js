// API konfiguratsiyasi
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://api.tikoncha.uz";
export const WS_TOKEN_URL =
    import.meta.env.VITE_WS_TOKEN_URL || `${API_BASE_URL}/chat/ws-token`;
export const WS_URL_TEMPLATE =
    import.meta.env.VITE_WS_URL_TEMPLATE ||
    "wss://api.tikoncha.uz/chat/ws?token={TOKEN}";

// WebSocket URL yaratish (session token bilan)
export const getWebSocketUrl = (sessionToken) => {
    if (!sessionToken) {
        return null;
    }

    return WS_URL_TEMPLATE.replace("{TOKEN}", sessionToken);
};

// Ping interval (30 soniya)
export const PING_INTERVAL = parseInt(
    import.meta.env.VITE_PING_INTERVAL || "30000",
);

// Reconnect settings
export const RECONNECT_DELAY = parseInt(
    import.meta.env.VITE_RECONNECT_DELAY || "3000",
);
export const MAX_RECONNECT_ATTEMPTS = parseInt(
    import.meta.env.VITE_MAX_RECONNECT_ATTEMPTS || "5",
);

// Token refresh buffer (seconds before expiry)
export const TOKEN_REFRESH_BUFFER = parseInt(
    import.meta.env.VITE_TOKEN_REFRESH_BUFFER || "300",
);
